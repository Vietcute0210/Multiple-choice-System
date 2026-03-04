import '../app-init.js';
import { requireAdmin } from '../core/guards.js';
import { logoutAdmin } from '../core/auth.js';
import { getUsers, getExams, getResults } from '../core/storage.js';
import { statusBadge } from '../core/ui.js';

const admin = requireAdmin();
if (!admin) {
  throw new Error('Unauthorized');
}

let scoreChart;
let examChart;

function renderKpis(users, exams, results) {
  const averageScore = results.length
    ? (results.reduce((sum, item) => sum + Number(item.score || 0), 0) / results.length).toFixed(1)
    : '0.0';

  document.getElementById('kpi-grid').innerHTML = `
    <article class="kpi-box"><strong>${users.length}</strong><span>Sinh viên</span></article>
    <article class="kpi-box"><strong>${exams.length}</strong><span>Kỳ thi</span></article>
    <article class="kpi-box"><strong>${results.length}</strong><span>Lượt thi</span></article>
    <article class="kpi-box"><strong>${averageScore}</strong><span>Điểm trung bình</span></article>
  `;
}

function renderRecentExams(exams, results) {
  const tbody = document.getElementById('recent-exams-tbody');
  tbody.innerHTML = exams
    .slice(0, 6)
    .map((exam) => {
      const badge = statusBadge(exam.status);
      const takes = results.filter((result) => Number(result.examId) === Number(exam.id)).length;
      return `
      <tr>
        <td><strong>${exam.name}</strong></td>
        <td>${exam.subject}</td>
        <td>${exam.type}</td>
        <td>${takes}</td>
        <td><span class="badge ${badge.className}">${badge.label}</span></td>
      </tr>`;
    })
    .join('');
}

function renderCharts(exams, results) {
  if (typeof Chart === 'undefined') return;

  if (scoreChart) scoreChart.destroy();
  if (examChart) examChart.destroy();

  const ranges = [0, 0, 0, 0, 0];
  results.forEach((result) => {
    const score = Number(result.score);
    if (score < 4) ranges[0] += 1;
    else if (score < 5) ranges[1] += 1;
    else if (score < 7) ranges[2] += 1;
    else if (score < 9) ranges[3] += 1;
    else ranges[4] += 1;
  });

  scoreChart = new Chart(document.getElementById('chart-score-dist'), {
    type: 'doughnut',
    data: {
      labels: ['<4', '4-5', '5-7', '7-9', '9-10'],
      datasets: [
        {
          data: ranges,
          backgroundColor: ['#dc2626', '#d97706', '#2f59cc', '#16a34a', '#d50f2f'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right' } }
    }
  });

  const labels = exams.map((exam) => exam.name.split('-')[0].trim());
  const values = exams.map((exam) => results.filter((result) => Number(result.examId) === Number(exam.id)).length);

  examChart = new Chart(document.getElementById('chart-exam-bar'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Lượt thi',
          data: values,
          borderRadius: 6,
          backgroundColor: 'rgba(213,15,47,.78)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

(function init() {
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    logoutAdmin();
    window.location.href = './login.html';
  });

  const users = getUsers();
  const exams = getExams();
  const results = getResults();

  renderKpis(users, exams, results);
  renderRecentExams(exams, results);
  renderCharts(exams, results);
})();
