import '../app-init.js';
import { requireAdmin } from '../core/guards.js';
import { logoutAdmin } from '../core/auth.js';
import { getUsers, getExams, getResults } from '../core/storage.js';
import { showToast, formatDate } from '../core/ui.js';

const admin = requireAdmin();
if (!admin) {
  throw new Error('Unauthorized');
}

let distChart;
let avgChart;

const filterEl = document.getElementById('stats-exam-filter');
const tableBody = document.getElementById('stats-table-body');
const kpiGrid = document.getElementById('stats-kpi-grid');

// Ham renderFilterOptions: thuc hien render filter options.
function renderFilterOptions(exams) {
  filterEl.innerHTML = `<option value="">Tất cả kỳ thi</option>${exams
    .map((exam) => `<option value="${exam.id}">${exam.name}</option>`)
    .join('')}`;
}

// Ham renderKpis: thuc hien render kpis.
function renderKpis(results) {
  const total = results.length;
  const passRate = total ? Math.round((results.filter((item) => Number(item.score) >= 5).length / total) * 100) : 0;
  const avg = total
    ? (results.reduce((sum, item) => sum + Number(item.score || 0), 0) / total).toFixed(1)
    : '0.0';

  kpiGrid.innerHTML = `
    <article class="kpi-box"><strong>${total}</strong><span>Tổng lượt thi</span></article>
    <article class="kpi-box"><strong>${passRate}%</strong><span>Tỷ lệ đạt</span></article>
    <article class="kpi-box"><strong>${avg}</strong><span>Điểm trung bình</span></article>
    <article class="kpi-box"><strong>${100 - passRate}%</strong><span>Tỷ lệ chưa đạt</span></article>
  `;
}

// Ham renderTable: thuc hien render table.
function renderTable(examId = '') {
  const users = getUsers();
  const exams = getExams();
  const allResults = getResults();
  const rows = examId ? allResults.filter((item) => Number(item.examId) === Number(examId)) : allResults;

  tableBody.innerHTML = rows
    .map((result) => {
      const user = users.find((item) => Number(item.id) === Number(result.userId));
      const exam = exams.find((item) => Number(item.id) === Number(result.examId));
      const passed = Number(result.score) >= 5;
      return `
      <tr>
        <td>${user?.name || 'N/A'}</td>
        <td>${user?.msv || '-'}</td>
        <td>${exam?.name || 'N/A'}</td>
        <td><strong style="color:${passed ? 'var(--success)' : 'var(--danger)'}">${Number(result.score).toFixed(1)}</strong></td>
        <td>${result.correct}/${result.total}</td>
        <td>${result.timeUsed} phút</td>
        <td>${formatDate(result.date)}</td>
        <td><span class="badge ${passed ? 'badge-success' : 'badge-error'}">${passed ? 'Đạt' : 'Không đạt'}</span></td>
      </tr>`;
    })
    .join('');

  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:22px; color:var(--text-muted);">Không có dữ liệu thống kê.</td></tr>';
  }
}

// Ham renderCharts: thuc hien render charts.
function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const exams = getExams();
  const results = getResults();

  if (distChart) distChart.destroy();
  if (avgChart) avgChart.destroy();

  const bins = { '0-4': 0, '4-5': 0, '5-6': 0, '6-7': 0, '7-8': 0, '8-9': 0, '9-10': 0 };
  results.forEach((result) => {
    const score = Number(result.score);
    if (score < 4) bins['0-4'] += 1;
    else if (score < 5) bins['4-5'] += 1;
    else if (score < 6) bins['5-6'] += 1;
    else if (score < 7) bins['6-7'] += 1;
    else if (score < 8) bins['7-8'] += 1;
    else if (score < 9) bins['8-9'] += 1;
    else bins['9-10'] += 1;
  });

  distChart = new Chart(document.getElementById('stats-dist-chart'), {
    type: 'bar',
    data: {
      labels: Object.keys(bins),
      datasets: [
        {
          data: Object.values(bins),
          label: 'Số lượng',
          borderRadius: 6,
          backgroundColor: Object.keys(bins).map((label) => (label.startsWith('0') || label.startsWith('4') ? '#dc2626' : '#16a34a'))
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

  const avgPerExam = exams.map((exam) => {
    const list = results.filter((result) => Number(result.examId) === Number(exam.id));
    return list.length ? Number((list.reduce((sum, item) => sum + Number(item.score), 0) / list.length).toFixed(1)) : 0;
  });

  avgChart = new Chart(document.getElementById('stats-avg-chart'), {
    type: 'line',
    data: {
      labels: exams.map((exam) => exam.name.split('-')[0].trim()),
      datasets: [
        {
          label: 'Điểm trung bình',
          data: avgPerExam,
          borderColor: '#d50f2f',
          backgroundColor: 'rgba(213,15,47,.15)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#d50f2f'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 0, max: 10 } }
    }
  });
}

// Ham init: thuc hien init.
(function init() {
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    logoutAdmin();
    window.location.href = './login.html';
  });

  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    showToast('Đang xuất báo cáo PDF (demo).', 'success');
  });

  document.getElementById('btn-export-excel').addEventListener('click', () => {
    showToast('Đang xuất báo cáo Excel (demo).', 'success');
  });

  const exams = getExams();
  const results = getResults();

  renderFilterOptions(exams);
  renderKpis(results);
  renderTable('');
  renderCharts();

  filterEl.addEventListener('change', () => {
    renderTable(filterEl.value);
  });
})();
