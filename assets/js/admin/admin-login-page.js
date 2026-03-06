import '../app-init.js';
import { getLoggedInUser, loginAdmin } from '../core/auth.js';
import { showToast } from '../core/ui.js';

const form = document.getElementById('admin-login-form');
const demoButton = document.getElementById('btn-admin-demo');

// Ham setError: thuc hien set error.
function setError(fieldId, status) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.toggle('error', status);
}

// Ham gotoDashboard: thuc hien goto dashboard.
function gotoDashboard() {
  window.location.href = './dashboard.html';
}

// Ham submitLogin: thuc hien submit login.
function submitLogin(event) {
  event.preventDefault();
  setError('field-admin-user', false);
  setError('field-admin-pass', false);

  const username = document.getElementById('admin-user').value.trim();
  const password = document.getElementById('admin-pass').value.trim();

  if (!username) setError('field-admin-user', true);
  if (!password) setError('field-admin-pass', true);
  if (!username || !password) return;

  const admin = loginAdmin(username, password);
  if (!admin) {
    showToast('Sai tài khoản hoặc mật khẩu admin.', 'error');
    return;
  }

  showToast('Đăng nhập admin thành công.', 'success');
  setTimeout(gotoDashboard, 250);
}

// Ham init: thuc hien init.
(function init() {
  const current = getLoggedInUser();
  if (current?.role === 'admin') {
    gotoDashboard();
    return;
  }

  form.addEventListener('submit', submitLogin);
  if (demoButton) {
    demoButton.addEventListener('click', () => {
      const admin = loginAdmin('admin', 'admin123');
      if (!admin) return;
      showToast('Đăng nhập demo admin thành công.', 'success');
      setTimeout(gotoDashboard, 250);
    });
  }
})();
