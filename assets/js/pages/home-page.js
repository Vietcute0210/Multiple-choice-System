import '../app-init.js';
import { requireStudent } from '../core/guards.js';
import { logoutStudent } from '../core/auth.js';
import { getExams, getResults, setExamState, clearExamState } from '../core/storage.js';
import { initialsFromName, statusBadge } from '../core/ui.js';

const user = requireStudent();
if (!user) {
  throw new Error('Unauthorized');
}

const featuredRoot = document.getElementById('featured-exam');
const examsGrid = document.getElementById('exams-grid');
const summaryRoot = document.getElementById('my-summary');
const searchInput = document.getElementById('exam-search');
const typeFilter = document.getElementById('exam-filter');
const statusFilter = document.getElementById('status-filter');
const tabsRoot = document.getElementById('type-tabs');

function startExam(examId) {
  const exams = getExams();
  const exam = exams.find((item) => Number(item.id) === Number(examId));
  if (!exam) return;
  if (exam.status === 'closed') {
    window.alert('Kỳ thi đã đóng.');
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
  const exams = getExams();
  const results = getResults().filter((item) => Number(item.userId) === Number(user.id));
  const totalTaken = results.length;
  const completion = exams.length ? Math.round((totalTaken / exams.length) * 100) : 0;
  const avg = totalTaken ? (results.reduce((sum, item) => sum + Number(item.score || 0), 0) / totalTaken).toFixed(1) : '0.0';

  summaryRoot.innerHTML = `
    <article class="summary-box"><span>Tỷ lệ hoàn thành</span><strong>${completion}%</strong></article>
    <article class="summary-box"><span>Điểm trung bình</span><strong>${avg}</strong></article>
    <article class="summary-box"><span>Đã tham gia</span><strong>${totalTaken} kỳ thi</strong></article>
  `;
}

function renderFeatured() {
  const exams = getExams();
  const featured = exams.find((item) => item.status !== 'closed') || exams[0];
  if (!featured) {
    featuredRoot.innerHTML = '';
    return;
  }

  featuredRoot.innerHTML = `
    <div>
      <div class="hero-kicker">Kỳ thi nổi bật nhất</div>
      <h2 class="hero-title">${featured.name}</h2>
      <p class="hero-desc">${featured.desc || 'Chuẩn bị sẵn sàng cho kỳ thi quan trọng nhất của học kỳ này.'}</p>
      <div class="hero-meta">
        <span>${featured.duration} phút</span>
        <span>${featured.total} câu hỏi</span>
        <span>${featured.subject}</span>
      </div>
      <button class="btn btn-primary hero-action" type="button" data-start-highlight="${featured.id}">Bắt đầu ngay</button>
    </div>
    <div class="hero-right">Hãy tỏa sáng!</div>
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
    examsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Không tìm thấy kỳ thi phù hợp.</p>';
    return;
  }

  examsGrid.innerHTML = filtered
    .map((exam) => {
      const badge = statusBadge(exam.status);
      return `
      <article class="exam-card">
        <div class="exam-card-top">
          <span class="exam-type">${exam.type}</span>
          <span class="exam-status ${exam.status}">${badge.label}</span>
        </div>
        <h3>${exam.name}</h3>
        <p class="exam-desc">${exam.desc || ''}</p>
        <div class="exam-meta">
          <span>${exam.duration} phút</span>
          <span>${exam.total} câu</span>
          <span>${exam.subject}</span>
        </div>
        <button class="btn ${exam.status === 'closed' ? 'btn-outline' : 'btn-primary'} btn-sm" data-start-exam="${exam.id}" ${exam.status === 'closed' ? 'disabled' : ''}>
          ${exam.status === 'closed' ? 'Kỳ thi đã đóng' : 'Bắt đầu ngay'}
        </button>
      </article>`;
    })
    .join('');
}

function syncTabs() {
  if (!tabsRoot) return;
  const currentType = typeFilter.value;
  tabsRoot.querySelectorAll('.tab-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.type === currentType);
  });
}

function bindEvents() {
  searchInput.addEventListener('input', renderExams);
  typeFilter.addEventListener('change', () => {
    syncTabs();
    renderExams();
  });
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

  featuredRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-start-highlight]');
    if (!button) return;
    startExam(button.getAttribute('data-start-highlight'));
  });

  tabsRoot.addEventListener('click', (event) => {
    const button = event.target.closest('.tab-btn');
    if (!button) return;
    typeFilter.value = button.dataset.type || '';
    syncTabs();
    renderExams();
  });
}

(function init() {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-avatar').textContent = initialsFromName(user.name);
  const userCode = document.getElementById('user-msv');
  if (userCode) userCode.textContent = user.msv || user.email || '';

  bindEvents();
  renderFeatured();
  renderSummary();
  syncTabs();
  renderExams();
})();
