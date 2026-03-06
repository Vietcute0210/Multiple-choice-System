import '../app-init.js';
import { getLoggedInUser } from '../core/auth.js';
import { getUsers, setUsers, nextId } from '../core/storage.js';
import { showToast } from '../core/ui.js';

const form = document.getElementById('register-form');

// Ham goHome: thuc hien go home.
function goHome() {
  window.location.href = './home.html';
}

// Ham goAdmin: thuc hien go admin.
function goAdmin() {
  window.location.href = './admin/dashboard.html';
}

// Ham setFieldError: thuc hien set field error.
function setFieldError(id, invalid) {
  const field = document.getElementById(id);
  if (field) field.classList.toggle('error', Boolean(invalid));
}

// Ham clearErrors: thuc hien clear errors.
function clearErrors() {
  form.querySelectorAll('.field').forEach((field) => field.classList.remove('error'));
}

// Ham validate: thuc hien validate.
function validate(payload) {
  const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const checks = {
    name: payload.name.length >= 2,
    email: emailRule.test(payload.email),
    username: payload.username.length >= 4,
    password: payload.password.length >= 6,
    confirmPassword: payload.confirmPassword === payload.password
  };

  setFieldError('field-reg-name', !checks.name);
  setFieldError('field-reg-email', !checks.email);
  setFieldError('field-reg-user', !checks.username);
  setFieldError('field-reg-pass', !checks.password);
  setFieldError('field-reg-cpass', !checks.confirmPassword);

  return Object.values(checks).every(Boolean);
}

// Ham submitRegister: thuc hien submit register.
function submitRegister(event) {
  event.preventDefault();
  clearErrors();

  const payload = {
    name: document.getElementById('reg-name').value.trim(),
    email: document.getElementById('reg-email').value.trim(),
    username: document.getElementById('reg-user').value.trim(),
    password: document.getElementById('reg-pass').value.trim(),
    confirmPassword: document.getElementById('reg-cpass').value.trim()
  };

  if (!validate(payload)) return;

  const users = getUsers();
  if (users.some((user) => user.username.toLowerCase() === payload.username.toLowerCase())) {
    setFieldError('field-reg-user', true);
    showToast('Tên đăng nhập đã tồn tại.', 'error');
    return;
  }

  users.push({
    id: nextId(users),
    username: payload.username,
    password: payload.password,
    name: payload.name,
    email: payload.email,
    msv: `B${Math.floor(10000000 + Math.random() * 89999999)}`,
    class: 'DxxCQCN',
    role: 'student'
  });

  setUsers(users);
  showToast('Đăng ký thành công. Chuyển về trang đăng nhập...', 'success');
  form.reset();

  setTimeout(() => {
    window.location.href = './index.html';
  }, 550);
}

// Ham init: thuc hien init.
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

  form.addEventListener('submit', submitRegister);
})();
