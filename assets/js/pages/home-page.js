import '../app-init.js';
import { requireStudent } from '../core/guards.js';
import { logoutStudent } from '../core/auth.js';
import { getExams, getResults, getCurrentUser, setExamState, clearExamState } from '../core/storage.js';
import { initialsFromName, showToast, statusBadge } from '../core/ui.js';

const user = requireStudent();
if (!user) {
  throw new Error('Unauthorized');
}

const examsGrid = document.getElementById('exams-grid');
const summaryRoot = document.getElementById('my-summary');
const searchInput = document.getElementById('exam-search');
const typeFilter = document.getElementById('exam-filter');
const statusFilter = document.getElementById('status-filter');

function startExam(examId) {
  const exams = getExams();
  const exam = exams.find((item) => Number(item.id) === Number(examId));
  if (!exam) return;
  if (exam.status === 'closed') {
    showToast('Kỳ thi đã đóng.', 'error');
    return;
  }

  const accepted = window.confirm(`Bắt đầu bài thi "${exam.name}"?\nThời gian: ${exam.duration} phút | Số câu: ${exam.total}`);
  if (!accepted) return;

  clearExamState();
  setExamState({
    examId: exam.id,
    currentQuestion: 0,
    answers: {},
    timeLeft: Number(exam.duration) * 60,
    startedAt: Date.now()
  });
  window.location.href = './exam.html';
}

function renderSummary() {
  const results = getResults().filter((item) => Number(item.userId) === Number(user.id));
  const total = results.length;
  const avg = total ? (results.reduce((sum, item) => sum + Number(item.score || 0), 0) / total).toFixed(1) : '0.0';
  const best = total ? Math.max(...results.map((item) => Number(item.score || 0))).toFixed(1) : '0.0';
  const passRate = total ? Math.round((results.filter((item) => Number(item.score) >= 5).length / total) * 100) : 0;

  summaryRoot.innerHTML = `
    <article class="summary-box"><strong>${total}</strong><span>Bài đã làm</span></article>
    <article class="summary-box"><strong>${avg}</strong><span>Điểm trung bình</span></article>
    <article class="summary-box"><strong>${best}</strong><span>Điểm cao nhất</span></article>
    <article class="summary-box"><strong>${passRate}%</strong><span>Tỷ lệ đạt</span></article>
  `;
}

function renderExams() {
  const exams = getExams();
  const search = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const status = statusFilter.value;

  const filtered = exams.filter((exam) => {
    const hitSearch = exam.name.toLowerCase().includes(search) || exam.subject.toLowerCase().includes(search);
    const hitType = !type || exam.type === type;
    const hitStatus = !status || exam.status === status;
    return hitSearch && hitType && hitStatus;
  });

  if (!filtered.length) {
    examsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align:center; color: var(--text-muted);">Không tìm thấy kỳ thi phù hợp.</p>';
    return;
  }

  examsGrid.innerHTML = filtered
    .map((exam) => {
      const badge = statusBadge(exam.status);
      return `
      <article class="exam-card">
        <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
          <h3>${exam.name}</h3>
          <span class="badge ${badge.className}">${badge.label}</span>
        </div>
        <p>${exam.desc || ''}</p>
        <div class="exam-meta">
          <span>${exam.subject}</span>
          <span>${exam.duration} phút</span>
          <span>${exam.total} câu</span>
          <span>${exam.type}</span>
        </div>
        <button class="btn ${exam.status === 'closed' ? 'btn-outline' : 'btn-primary'} btn-sm" data-start-exam="${exam.id}" ${exam.status === 'closed' ? 'disabled' : ''}>
          ${exam.status === 'closed' ? 'Đã đóng' : 'Bắt đầu làm bài'}
        </button>
      </article>`;
    })
    .join('');
}

function bindEvents() {
  searchInput.addEventListener('input', renderExams);
  typeFilter.addEventListener('change', renderExams);
  statusFilter.addEventListener('change', renderExams);

  document.getElementById('btn-logout').addEventListener('click', () => {
    logoutStudent();
    window.location.href = './index.html';
  });

  examsGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-start-exam]');
    if (!button) return;
    startExam(button.getAttribute('data-start-exam'));
  });
}

(function init() {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-avatar').textContent = initialsFromName(user.name);
  bindEvents();
  renderExams();
  renderSummary();
  showToast(`Xin chào ${user.name}`, 'success');
})();
