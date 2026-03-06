import { ADMIN_CREDENTIAL } from '../../../data/mock-data.js';
import {
  clearCurrentUser,
  getCurrentUser,
  getUsers,
  setCurrentUser,
  clearExamState
} from './storage.js';

// Ham normalize: thuc hien normalize.
function normalize(value) {
  return String(value || '').trim();
}

// Ham loginStudent: thuc hien login student.
export function loginStudent(username, password) {
  const userName = normalize(username);
  const pass = normalize(password);
  const user = getUsers().find(
    (item) => item.role === 'student' && item.username === userName && item.password === pass
  );
  if (!user) return null;
  setCurrentUser({
    id: user.id,
    role: 'student',
    name: user.name,
    username: user.username,
    email: user.email,
    msv: user.msv,
    class: user.class
  });
  return user;
}

// Ham loginAdmin: thuc hien login admin.
export function loginAdmin(username, password) {
  const userName = normalize(username);
  const pass = normalize(password);
  if (userName !== ADMIN_CREDENTIAL.username || pass !== ADMIN_CREDENTIAL.password) {
    return null;
  }
  const admin = {
    id: 0,
    role: 'admin',
    name: ADMIN_CREDENTIAL.name,
    username: ADMIN_CREDENTIAL.username
  };
  setCurrentUser(admin);
  return admin;
}

// Ham logoutStudent: thuc hien logout student.
export function logoutStudent() {
  clearCurrentUser();
  clearExamState();
}

// Ham logoutAdmin: thuc hien logout admin.
export function logoutAdmin() {
  clearCurrentUser();
}

// Ham getLoggedInUser: thuc hien get logged in user.
export function getLoggedInUser() {
  return getCurrentUser();
}
