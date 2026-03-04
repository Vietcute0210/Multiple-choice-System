import '../app-init.js';
import { requireAdmin } from '../core/guards.js';
import { logoutAdmin } from '../core/auth.js';
import { getUsers, setUsers, getResults, setResults, nextId } from '../core/storage.js';
import { openModal, closeModal, showToast } from '../core/ui.js';

const admin = requireAdmin();
if (!admin) {
  throw new Error('Unauthorized');
}

const searchInput = document.getElementById('user-search');
const tbody = document.getElementById('users-tbody');

function calcUserStats(userId) {
  const records = getResults().filter((result) => Number(result.userId) === Number(userId));
  const avg = records.length
    ? (records.reduce((sum, item) => sum + Number(item.score || 0), 0) / records.length).toFixed(1)
    : '-';
  return { attempts: records.length, avg };
}

function renderRows(filter = '') {
  const users = getUsers();
  const keyword = filter.trim().toLowerCase();

  const filtered = users.filter((user) => {
    return user.role === 'student' && (user.name.toLowerCase().includes(keyword) || user.msv.includes(keyword));
  });

  tbody.innerHTML = filtered
    .map((user) => {
      const stats = calcUserStats(user.id);
      return `
      <tr>
        <td><strong>${user.name}</strong></td>
        <td>${user.msv || '-'}</td>
        <td>${user.email || '-'}</td>
        <td>${user.class || '-'}</td>
        <td>${stats.attempts}</td>
        <td>${stats.avg}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" type="button" data-edit="${user.id}">Sửa</button>
            <button class="btn btn-danger btn-sm" type="button" data-delete="${user.id}">Xóa</button>
          </div>
        </td>
      </tr>`;
    })
    .join('');

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:22px; color:var(--text-muted);">Không có sinh viên phù hợp.</td></tr>';
  }
}

function openUserModal(mode, user = null) {
  const isCreate = mode === 'create';
  openModal({
    title: isCreate ? 'Thêm sinh viên mới' : 'Cập nhật sinh viên',
    bodyHtml: `
      <div style="display:grid; gap:10px; grid-template-columns:1fr 1fr;">
        <div><label class="form-label">Họ và tên</label><input id="mu-name" class="form-control" value="${user?.name || ''}" /></div>
        <div><label class="form-label">MSSV</label><input id="mu-msv" class="form-control" value="${user?.msv || ''}" /></div>
        <div><label class="form-label">Email</label><input id="mu-email" class="form-control" value="${user?.email || ''}" /></div>
        <div><label class="form-label">Lớp</label><input id="mu-class" class="form-control" value="${user?.class || ''}" /></div>
        ${
          isCreate
            ? '<div><label class="form-label">Tên đăng nhập</label><input id="mu-username" class="form-control" /></div><div><label class="form-label">Mật khẩu</label><input id="mu-password" class="form-control" type="password" /></div>'
            : ''
        }
      </div>
    `,
    actions: [
      {
        label: 'Hủy',
        className: 'btn-outline',
        onClick: () => closeModal()
      },
      {
        label: isCreate ? 'Thêm sinh viên' : 'Lưu thay đổi',
        className: 'btn-primary',
        onClick: () => saveUser(mode, user?.id)
      }
    ]
  });
}

function saveUser(mode, userId) {
  const payload = {
    name: document.getElementById('mu-name').value.trim(),
    msv: document.getElementById('mu-msv').value.trim(),
    email: document.getElementById('mu-email').value.trim(),
    class: document.getElementById('mu-class').value.trim()
  };

  if (!payload.name || !payload.msv) {
    showToast('Tên và MSSV là bắt buộc.', 'error');
    return;
  }

  const users = getUsers();

  if (mode === 'create') {
    const username = document.getElementById('mu-username').value.trim();
    const password = document.getElementById('mu-password').value.trim();

    if (!username || !password) {
      showToast('Tài khoản và mật khẩu là bắt buộc.', 'error');
      return;
    }

    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      showToast('Tên đăng nhập đã tồn tại.', 'error');
      return;
    }

    users.push({
      id: nextId(users),
      role: 'student',
      username,
      password,
      ...payload
    });

    setUsers(users);
    closeModal();
    showToast('Đã thêm sinh viên.', 'success');
    renderRows(searchInput.value);
    return;
  }

  const idx = users.findIndex((user) => Number(user.id) === Number(userId));
  if (idx < 0) return;
  users[idx] = { ...users[idx], ...payload };
  setUsers(users);
  closeModal();
  showToast('Đã cập nhật sinh viên.', 'success');
  renderRows(searchInput.value);
}

function deleteUser(userId) {
  if (!window.confirm('Xác nhận xóa sinh viên này?')) return;

  const users = getUsers().filter((user) => Number(user.id) !== Number(userId));
  const results = getResults().filter((result) => Number(result.userId) !== Number(userId));

  setUsers(users);
  setResults(results);
  showToast('Đã xóa sinh viên và dữ liệu liên quan.', 'success');
  renderRows(searchInput.value);
}

(function init() {
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    logoutAdmin();
    window.location.href = './login.html';
  });

  document.getElementById('btn-add-user').addEventListener('click', () => openUserModal('create'));
  searchInput.addEventListener('input', () => renderRows(searchInput.value));

  tbody.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit]');
    if (editBtn) {
      const user = getUsers().find((item) => Number(item.id) === Number(editBtn.getAttribute('data-edit')));
      if (user) openUserModal('edit', user);
      return;
    }

    const deleteBtn = event.target.closest('[data-delete]');
    if (deleteBtn) {
      deleteUser(Number(deleteBtn.getAttribute('data-delete')));
    }
  });

  renderRows('');
})();
