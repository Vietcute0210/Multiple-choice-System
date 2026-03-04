import '../app-init.js';
import { requireAdmin } from '../core/guards.js';
import { logoutAdmin } from '../core/auth.js';
import { getExams, setExams, nextId } from '../core/storage.js';
import { showToast } from '../core/ui.js';

const admin = requireAdmin();
if (!admin) {
  throw new Error('Unauthorized');
}

const params = new URLSearchParams(window.location.search);
const editId = Number(params.get('id'));

const exams = getExams();
const currentExam = exams.find((exam) => Number(exam.id) === editId) || null;

const titleEl = document.getElementById('editor-title');
const qList = document.getElementById('q-editor-list');
const qCount = document.getElementById('q-count');

let questions = currentExam
  ? JSON.parse(JSON.stringify(currentExam.questions || []))
  : [
      {
        id: 1,
        text: '',
        opts: ['', '', '', ''],
        ans: 0,
        explain: ''
      }
    ];

function makeEmptyQuestion() {
  return {
    id: questions.length + 1,
    text: '',
    opts: ['', '', '', ''],
    ans: 0,
    explain: ''
  };
}

function renderQuestions() {
  qCount.textContent = String(questions.length);
  qList.innerHTML = questions
    .map((question, qIdx) => {
      const optionRows = question.opts
        .map(
          (opt, optIdx) => `
          <div class="option-row">
            <input type="radio" name="q-${qIdx}-ans" data-q-ans="${qIdx}:${optIdx}" ${Number(question.ans) === optIdx ? 'checked' : ''} />
            <span style="font-size:.8rem; font-weight:700; width: 18px;">${String.fromCharCode(65 + optIdx)}.</span>
            <input class="form-control" type="text" data-q-opt="${qIdx}:${optIdx}" value="${opt.replace(/"/g, '&quot;')}" placeholder="Lựa chọn ${String.fromCharCode(65 + optIdx)}" />
          </div>`
        )
        .join('');

      return `
      <article class="q-editor-item">
        <div class="q-editor-head">
          <span>Câu ${qIdx + 1}</span>
          <button class="btn btn-danger btn-sm" type="button" data-remove-q="${qIdx}">Xóa</button>
        </div>
        <input class="form-control" data-q-text="${qIdx}" value="${(question.text || '').replace(/"/g, '&quot;')}" placeholder="Nội dung câu hỏi..." style="margin-bottom:8px;" />
        ${optionRows}
        <input class="form-control" data-q-explain="${qIdx}" value="${(question.explain || '').replace(/"/g, '&quot;')}" placeholder="Giải thích (tùy chọn)" style="margin-top:8px;" />
      </article>`;
    })
    .join('');
}

function fillExamForm() {
  if (!currentExam) return;
  titleEl.textContent = 'Chỉnh sửa kỳ thi';
  document.getElementById('ef-name').value = currentExam.name || '';
  document.getElementById('ef-subject').value = currentExam.subject || '';
  document.getElementById('ef-type').value = currentExam.type || 'Luyện tập';
  document.getElementById('ef-duration').value = currentExam.duration || 30;
  document.getElementById('ef-status').value = currentExam.status || 'free';
  document.getElementById('ef-desc').value = currentExam.desc || '';
}

function normalizeQuestionIds() {
  questions = questions.map((question, idx) => ({ ...question, id: idx + 1 }));
}

function addQuestion() {
  questions.push(makeEmptyQuestion());
  normalizeQuestionIds();
  renderQuestions();
}

function removeQuestion(qIdx) {
  if (questions.length <= 1) {
    showToast('Bài thi phải có ít nhất 1 câu hỏi.', 'error');
    return;
  }
  questions.splice(qIdx, 1);
  normalizeQuestionIds();
  renderQuestions();
}

function importDemoQuestion() {
  questions.push({
    id: questions.length + 1,
    text: '[Import demo] Câu hỏi mẫu từ tệp Excel?',
    opts: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
    ans: 0,
    explain: 'Bản demo import nhanh để kiểm thử giao diện.'
  });
  normalizeQuestionIds();
  renderQuestions();
  showToast('Đã thêm câu hỏi demo import.', 'success');
}

function validateQuestions() {
  const valid = questions.every((question) => {
    const hasText = String(question.text || '').trim().length > 0;
    const hasAllOpts = Array.isArray(question.opts) && question.opts.every((opt) => String(opt || '').trim().length > 0);
    const hasAns = Number(question.ans) >= 0 && Number(question.ans) <= 3;
    return hasText && hasAllOpts && hasAns;
  });

  if (!valid) {
    showToast('Mỗi câu hỏi phải có nội dung, đủ 4 lựa chọn và đáp án đúng.', 'error');
  }

  return valid;
}

function saveExam() {
  const name = document.getElementById('ef-name').value.trim();
  const subject = document.getElementById('ef-subject').value.trim();
  const type = document.getElementById('ef-type').value;
  const duration = Number(document.getElementById('ef-duration').value);
  const status = document.getElementById('ef-status').value;
  const desc = document.getElementById('ef-desc').value.trim();

  if (!name || !subject || !duration || duration < 1) {
    showToast('Vui lòng nhập đầy đủ tên môn và thời gian hợp lệ.', 'error');
    return;
  }

  if (!validateQuestions()) return;

  const payload = {
    name,
    subject,
    type,
    duration,
    status,
    desc,
    total: questions.length,
    questions
  };

  const latestExams = getExams();
  if (currentExam) {
    const idx = latestExams.findIndex((exam) => Number(exam.id) === Number(currentExam.id));
    if (idx >= 0) latestExams[idx] = { ...latestExams[idx], ...payload };
    setExams(latestExams);
    showToast('Đã cập nhật kỳ thi.', 'success');
  } else {
    latestExams.push({ id: nextId(latestExams), ...payload });
    setExams(latestExams);
    showToast('Đã tạo kỳ thi mới.', 'success');
  }

  setTimeout(() => {
    window.location.href = './exams.html';
  }, 350);
}

function bindEditorEvents() {
  qList.addEventListener('input', (event) => {
    const textTarget = event.target.closest('[data-q-text]');
    if (textTarget) {
      const qIdx = Number(textTarget.getAttribute('data-q-text'));
      questions[qIdx].text = textTarget.value;
      return;
    }

    const optTarget = event.target.closest('[data-q-opt]');
    if (optTarget) {
      const [qIdx, optIdx] = optTarget
        .getAttribute('data-q-opt')
        .split(':')
        .map((value) => Number(value));
      questions[qIdx].opts[optIdx] = optTarget.value;
      return;
    }

    const expTarget = event.target.closest('[data-q-explain]');
    if (expTarget) {
      const qIdx = Number(expTarget.getAttribute('data-q-explain'));
      questions[qIdx].explain = expTarget.value;
    }
  });

  qList.addEventListener('change', (event) => {
    const ansTarget = event.target.closest('[data-q-ans]');
    if (!ansTarget) return;
    const [qIdx, ansIdx] = ansTarget
      .getAttribute('data-q-ans')
      .split(':')
      .map((value) => Number(value));
    questions[qIdx].ans = ansIdx;
  });

  qList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-q]');
    if (!removeButton) return;
    removeQuestion(Number(removeButton.getAttribute('data-remove-q')));
  });
}

(function init() {
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    logoutAdmin();
    window.location.href = './login.html';
  });

  document.getElementById('btn-add-q').addEventListener('click', addQuestion);
  document.getElementById('btn-import').addEventListener('click', importDemoQuestion);
  document.getElementById('btn-save-exam').addEventListener('click', saveExam);

  fillExamForm();
  bindEditorEvents();
  renderQuestions();
})();
