import { getCurrentUser } from './storage.js';

function toUrl(target) {
  return new URL(target, window.location.href).href;
}

export function requireStudent() {
  const current = getCurrentUser();
  if (current && current.role === 'student') return current;
  window.location.href = toUrl('./index.html');
  return null;
}

export function requireAdmin() {
  const current = getCurrentUser();
  if (current && current.role === 'admin') return current;
  window.location.href = toUrl('./login.html');
  return null;
}

export function redirectIfLoggedIn() {
  const current = getCurrentUser();
  if (!current) return;
  if (current.role === 'admin') {
    window.location.href = toUrl('./admin/dashboard.html');
    return;
  }
  window.location.href = toUrl('./home.html');
}
