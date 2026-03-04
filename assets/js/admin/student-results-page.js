import '../app-init.js';
import { requireAdmin } from '../core/guards.js';
import { logoutAdmin } from '../core/auth.js';
import { getUsers, getResults, getExams } from '../core/storage.js';
import { openModal, closeModal, showToast, formatDate } from '../core/ui.js';

const admin = requireAdmin();
if (!admin) {
  throw new Error('Unauthorized');
}

const area = document.getElementById('student-results-area');
const searchInput = document.getElementById('student-search');

function getStudentUsers() {
  return getUsers().filter((user) => user.role === 'student');
}

function calcMetrics(userId) {
  const records = getResults().filter((result) => Number(result.userId) === Number(userId));
  const avg = records.length
    ? (records.reduce((sum, item) => sum + Number(item.score || 0), 0) / records.length).toFixed(1)
    : '-';
  const best = records.length ? Math.max(...records.map((item) => Number(item.score || 0))).toFixed(1) : '-';
  return { records, avg, best };
}

function renderOverview(filter = '') {
  const keyword = filter.trim().toLowerCase();
  const users = getStudentUsers().filter(
    (user) => !keyword || user.name.toLowerCase().includes(keyword) || user.msv.includes(keyword)
  );

  area.innerHTML = `
    <section class="card">
      <div class="card-head"><h3>${keyword ? 'Kết quả tìm kiếm sinh viên' : 'Tất cả sinh viên'}</h3></div>
      <div class="card-body" style="padding:0;">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>MSSV</th>
                <th>Lớp</th>
                <th>Lượt thi</th>
                <th>Điểm TB</th>
                <th>Điểm cao nhất</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map((user) => {
                  const metrics = calcMetrics(user.id);
                  return `
                  <tr>
                    <td><strong>${user.name}</strong></td>
                    <td>${user.msv}</td>
                    <td>${user.class || '-'}</td>
                    <td>${metrics.records.length}</td>
                    <td>${metrics.avg}</td>
                    <td>${metrics.best}</td>
                    <td><button class="btn btn-primary btn-sm" type="button" data-view-student="${user.id}">Xem chi tiết</button></td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;

  if (!users.length) {
    area.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Không tìm thấy sinh viên.</p>';
  }
}

function renderStudentDetail(userId) {
  const users = getStudentUsers();
  const exams = getExams();
  const user = users.find((item) => Number(item.id) === Number(userId));
  if (!user) return;

  const metrics = calcMetrics(user.id);

  area.innerHTML = `
    <button class="btn btn-outline btn-sm" type="button" id="btn-back-overview">Quay lại danh sách</button>
    <section class="card" style="margin-top:10px;">
      <div class="card-body" style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; align-items:center;">
        <div>
          <h3 style="font-size:1.04rem; color:var(--ptit-navy);">${user.name}</h3>
          <p style="margin-top:5px; color:var(--text-muted);">${user.msv} • ${user.class || '-'} • ${user.email || '-'}</p>
        </div>
        <div style="display:flex; gap:16px;">
          <span><strong>${metrics.records.length}</strong> lượt thi</span>
          <span><strong>${metrics.avg}</strong> điểm TB</span>
          <span><strong>${metrics.best}</strong> điểm cao nhất</span>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top:12px;">
      <div class="card-head"><h3>Lịch sử bài thi</h3></div>
      <div class="card-body" style="padding:0;">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kỳ thi</th>
                <th>Điểm</th>
                <th>Câu đúng</th>
                <th>Thời gian</th>
                <th>Ngày thi</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${metrics.records
                .map((record) => {
                  const exam = exams.find((item) => Number(item.id) === Number(record.examId));
                  const passed = Number(record.score) >= 5;
                  return `
                  <tr>
                    <td><strong>${exam?.name || 'N/A'}</strong></td>
                    <td><strong style="color:${passed ? 'var(--success)' : 'var(--danger)'}">${Number(record.score).toFixed(1)}</strong></td>
                    <td>${record.correct}/${record.total}</td>
                    <td>${record.timeUsed} phút</td>
                    <td>${formatDate(record.date)}</td>
                    <td><span class="badge ${passed ? 'badge-success' : 'badge-error'}">${passed ? 'Đạt' : 'Không đạt'}</span></td>
                    <td><button class="btn btn-outline btn-sm" type="button" data-view-result="${record.id}">Xem</button></td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;

  if (!metrics.records.length) {
    area.innerHTML += '<p style="text-align:center; color:var(--text-muted); margin-top:12px;">Sinh viên chưa có lượt thi.</p>';
  }

  document.getElementById('btn-back-overview').addEventListener('click', () => renderOverview(searchInput.value));
}

function openResultDetail(resultId) {
  const results = getResults();
  const exams = getExams();
  const result = results.find((item) => Number(item.id) === Number(resultId));
  if (!result) return;

  const exam = exams.find((item) => Number(item.id) === Number(result.examId));
  if (!exam) return;

  openModal({
    title: `Chi tiết: ${exam.name}`,
    bodyHtml: exam.questions
      .map((question, idx) => {
        const selected = result.answers[idx];
        const ok = selected === question.ans;
        return `
        <article style="border:1px solid var(--border); border-radius:10px; padding:10px; margin-bottom:8px;">
          <strong style="color:${ok ? 'var(--success)' : 'var(--danger)'}">${ok ? 'Đúng' : 'Sai'} - Câu ${idx + 1}</strong>
          <p style="margin-top:4px;">${question.text}</p>
          <p style="font-size:.82rem; color:var(--text-muted);">SV: ${selected >= 0 ? question.opts[selected] : 'Chưa trả lời'}</p>
          ${ok ? '' : `<p style="font-size:.82rem; color:var(--success);">Đúng: ${question.opts[question.ans]}</p>`}
        </article>`;
      })
      .join(''),
    actions: [
      {
        label: 'Đóng',
        className: 'btn-outline',
        onClick: () => closeModal()
      }
    ]
  });
}

(function init() {
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    logoutAdmin();
    window.location.href = './login.html';
  });

  document.getElementById('btn-search').addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      renderOverview('');
      return;
    }

    const hit = getStudentUsers().find(
      (user) => user.name.toLowerCase().includes(keyword.toLowerCase()) || user.msv.includes(keyword)
    );

    if (!hit) {
      showToast('Không tìm thấy sinh viên phù hợp.', 'error');
      renderOverview(keyword);
      return;
    }

    renderStudentDetail(hit.id);
  });

  area.addEventListener('click', (event) => {
    const studentBtn = event.target.closest('[data-view-student]');
    if (studentBtn) {
      renderStudentDetail(Number(studentBtn.getAttribute('data-view-student')));
      return;
    }

    const resultBtn = event.target.closest('[data-view-result]');
    if (resultBtn) {
      openResultDetail(Number(resultBtn.getAttribute('data-view-result')));
    }
  });

  renderOverview('');
})();
