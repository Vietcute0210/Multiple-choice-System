import '../app-init.js';

import { requireAdmin } from '../core/guards.js';

import { logoutAdmin } from '../core/auth.js';

import { getExams, getResults, setExams } from '../core/storage.js';

import { showToast, statusBadge, showConfirm } from '../core/ui.js';



const admin = requireAdmin();

if (!admin) {

  throw new Error('Unauthorized');

}



const searchInput = document.getElementById('exam-search');

const tbody = document.getElementById('exams-tbody');



// Ham renderRows: thuc hien render rows.

function renderRows(filterText = '') {

  const exams = getExams();

  const results = getResults();

  const keyword = filterText.trim().toLowerCase();



  const filtered = exams.filter(

    (exam) => exam.name.toLowerCase().includes(keyword) || exam.subject.toLowerCase().includes(keyword)

  );



  tbody.innerHTML = filtered

    .map((exam) => {

      const badge = statusBadge(exam.status);

      const takes = results.filter((result) => Number(result.examId) === Number(exam.id)).length;



      return `

      <tr>

        <td><strong>${exam.name}</strong></td>

        <td>${exam.subject}</td>

        <td>${exam.type}</td>

        <td>${exam.total}</td>

        <td>${exam.duration} phút</td>

        <td><span class="badge ${badge.className}">${badge.label}</span></td>

        <td>${takes}</td>

        <td>

          <div style="display:flex; gap:6px;">

            <a class="btn btn-outline btn-sm" href="./exam-edit.html?id=${exam.id}">Sửa</a>

            <button class="btn btn-danger btn-sm" type="button" data-delete="${exam.id}">Xóa</button>

          </div>

        </td>

      </tr>`;

    })

    .join('');



  if (!filtered.length) {

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:22px; color:var(--text-muted);">Không có dữ liệu.</td></tr>';

  }

}



// Ham deleteExam: thuc hien delete exam.

function deleteExam(examId) {

  showConfirm('Xác nhận x?a k? thi n?y?', {

    title: 'Xác nhận x?a',

    okLabel: 'X?a',

    onConfirm: () => {

      const exams = getExams().filter((exam) => Number(exam.id) !== Number(examId));

      setExams(exams);

      showToast('?? x?a k? thi.', 'success');

      renderRows(searchInput.value);

    }

  });

}



// Ham init: thuc hien init.

(function init() {

  document.getElementById('btn-admin-logout').addEventListener('click', () => {

    logoutAdmin();

    window.location.href = './login.html';

  });



  searchInput.addEventListener('input', () => renderRows(searchInput.value));

  tbody.addEventListener('click', (event) => {

    const button = event.target.closest('[data-delete]');

    if (!button) return;

    deleteExam(button.getAttribute('data-delete'));

  });



  renderRows('');

})();

