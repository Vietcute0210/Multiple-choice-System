import '../app-init.js';
import { loginStudent, getLoggedInUser } from '../core/auth.js';
import { showToast } from '../core/ui.js';

const form = document.getElementById('login-form');
const demoButton = document.getElementById('btn-demo-student');

function setFieldError(id, invalid) {
  const field = document.getElementById(id);
  if (field) field.classList.toggle('error', Boolean(invalid));
}

function clearErrors() {
  form.querySelectorAll('.field').forEach((field) => field.classList.remove('error'));
}

function goHome() {
  window.location.href = './home.html';
}

function goAdmin() {
  window.location.href = './admin/dashboard.html';
}

function submitLogin(event) {
  event.preventDefault();
  clearErrors();

  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();

  if (!username) setFieldError('field-login-user', true);
  if (!password) setFieldError('field-login-pass', true);
  if (!username || !password) return;

  const user = loginStudent(username, password);
  if (!user) {
    showToast('Sai tên đăng nhập hoặc mật khẩu.', 'error');
    return;
  }

  showToast(`Chào mừng ${user.name}!`, 'success');
  setTimeout(goHome, 260);
}

function loginDemoStudent() {
  const user = loginStudent('sinhvien', '123456');
  if (!user) {
    showToast('Không thể đăng nhập demo.', 'error');
    return;
  }

  showToast('Đăng nhập demo thành công.', 'success');
  setTimeout(goHome, 220);
}

(function init() {
  const current = getLoggedInUser();
  if (current?.role === 'student') {
    goHome();
    return;
  }
  if (current?.role === 'admin') {
    goAdmin();
    return;
  }

  form.addEventListener('submit', submitLogin);
  demoButton.addEventListener('click', loginDemoStudent);
})();
