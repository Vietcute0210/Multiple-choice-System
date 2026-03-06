import '../app-init.js';
import { requireStudent } from '../core/guards.js';
import { logoutStudent } from '../core/auth.js';
import { getResults, getExams } from '../core/storage.js';
import { formatDate, showToast } from '../core/ui.js';

const user = requireStudent();
if (!user) {
  throw new Error('Unauthorized');
}

const params = new URLSearchParams(window.location.search);
const selectedResultId = Number(params.get('resultId'));

const scoreEl = document.getElementById('result-score');
const titleEl = document.getElementById('result-title');
const subtitleEl = document.getElementById('result-subtitle');
const statsEl = document.getElementById('result-stats');
const reviewArea = document.getElementById('review-area');
const historyBody = document.getElementById('history-tbody');

// Ham loadMyResults: thuc hien load my results.
function loadMyResults() {
  return getResults()
    .filter((item) => Number(item.userId) === Number(user.id))
    .sort((a, b) => Number(b.id) - Number(a.id));
}

// Ham renderResultDetail: thuc hien render result detail.
function renderResultDetail(result, exam) {
  if (!result || !exam) {
    titleEl.textContent = 'Chưa có dữ liệu kết quả';
    subtitleEl.textContent = 'Hãy làm bài thi để xem chi tiết.';
    scoreEl.textContent = '0.0';
    statsEl.innerHTML = '';
    reviewArea.innerHTML = '<p style="color:var(--text-muted);">Không có dữ liệu chi tiết.</p>';
    return;
  }

  const pass = Number(result.score) >= 5;
  const percent = Math.round((Number(result.correct) / Number(result.total || 1)) * 100);

  scoreEl.textContent = Number(result.score).toFixed(1);
  titleEl.textContent = exam.name;
  subtitleEl.textContent = pass ? 'Chúc mừng, bạn đã đạt bài thi.' : 'Bạn chưa đạt, hãy luyện tập thêm.';

  statsEl.innerHTML = `
    <article class="card"><div class="card-body"><strong>${result.correct}</strong><span>Câu đúng</span></div></article>
    <article class="card"><div class="card-body"><strong>${Number(result.total) - Number(result.correct)}</strong><span>Câu sai</span></div></article>
    <article class="card"><div class="card-body"><strong>${result.timeUsed}</strong><span>Thời gian (phút)</span></div></article>
    <article class="card"><div class="card-body"><strong>${percent}%</strong><span>Tỷ lệ đúng</span></div></article>
  `;

  reviewArea.innerHTML = exam.questions
    .map((question, idx) => {
      const studentAnswer = result.answers[idx];
      const isCorrect = studentAnswer === question.ans;
      return `
      <article class="review-item ${isCorrect ? 'correct' : 'wrong'}">
        <div class="review-title">${isCorrect ? 'Đúng' : 'Sai'} • Câu ${idx + 1}</div>
        <p style="margin-top:6px;">${question.text}</p>
        <span class="answer-pill student">Bạn chọn: ${studentAnswer >= 0 ? `${String.fromCharCode(65 + studentAnswer)}. ${question.opts[studentAnswer]}` : 'Chưa trả lời'}</span>
        ${isCorrect ? '' : `<span class="answer-pill correct">Đáp án đúng: ${String.fromCharCode(65 + question.ans)}. ${question.opts[question.ans]}</span>`}
        <p style="margin-top:8px; font-size:.78rem; color:var(--text-muted);">${question.explain || ''}</p>
      </article>`;
    })
    .join('');
}

// Ham renderHistory: thuc hien render history.
function renderHistory(results, exams) {
  historyBody.innerHTML = results
    .map((result) => {
      const exam = exams.find((item) => Number(item.id) === Number(result.examId));
      const passed = Number(result.score) >= 5;
      return `
      <tr>
        <td><strong>${exam?.name || 'N/A'}</strong></td>
        <td>${exam?.type || '-'}</td>
        <td><strong style="color:${passed ? 'var(--success)' : 'var(--danger)'}">${Number(result.score).toFixed(1)}</strong></td>
        <td>${result.correct}/${result.total}</td>
        <td>${result.timeUsed} phút</td>
        <td>${formatDate(result.date)}</td>
        <td><a class="btn btn-outline btn-sm" href="./results.html?resultId=${result.id}">Chi tiết</a></td>
      </tr>`;
    })
    .join('');

  if (!results.length) {
    historyBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:22px;">Bạn chưa có kết quả nào.</td></tr>';
  }
}

// Ham init: thuc hien init.
(function init() {
  document.getElementById('btn-logout').addEventListener('click', () => {
    logoutStudent();
    window.location.href = './index.html';
  });

  const exams = getExams();
  const myResults = loadMyResults();

  const selected = myResults.find((item) => Number(item.id) === selectedResultId) || myResults[0];
  const selectedExam = exams.find((item) => Number(item.id) === Number(selected?.examId));

  renderResultDetail(selected, selectedExam);
  renderHistory(myResults, exams);
  showToast('Đã tải dữ liệu kết quả.', 'success');
})();
