import { getCurrentUser } from './storage.js';

// Ham toUrl: thuc hien to url.
function toUrl(target) {
  return new URL(target, window.location.href).href;
}

// Ham requireStudent: thuc hien require student.
export function requireStudent() {
  const current = getCurrentUser();
  if (current && current.role === 'student') return current;
  window.location.href = toUrl('./index.html');
  return null;
}

// Ham requireAdmin: thuc hien require admin.
export function requireAdmin() {
  const current = getCurrentUser();
  if (current && current.role === 'admin') return current;
  window.location.href = toUrl('./login.html');
  return null;
}

// Ham redirectIfLoggedIn: thuc hien redirect if logged in.
export function redirectIfLoggedIn() {
  const current = getCurrentUser();
  if (!current) return;
  if (current.role === 'admin') {
    window.location.href = toUrl('./admin/dashboard.html');
    return;
  }
  window.location.href = toUrl('./home.html');
}
