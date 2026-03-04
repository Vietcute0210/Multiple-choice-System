import { USERS, EXAMS, RESULTS_DATA } from '../../../data/mock-data.js';

export const STORAGE_KEYS = {
  currentUser: 'ptit_current_user',
  examState: 'ptit_exam_state',
  exams: 'ptit_admin_exams',
  users: 'ptit_admin_users',
  results: 'ptit_admin_results'
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function read(key, fallback = null) {
  return safeParse(localStorage.getItem(key), fallback);
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureSeedData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    write(STORAGE_KEYS.users, clone(USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.exams)) {
    write(STORAGE_KEYS.exams, clone(EXAMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.results)) {
    write(STORAGE_KEYS.results, clone(RESULTS_DATA));
  }
}

export function getUsers() {
  return read(STORAGE_KEYS.users, []);
}

export function setUsers(users) {
  write(STORAGE_KEYS.users, users);
}

export function getExams() {
  return read(STORAGE_KEYS.exams, []);
}

export function setExams(exams) {
  write(STORAGE_KEYS.exams, exams);
}

export function getResults() {
  return read(STORAGE_KEYS.results, []);
}

export function setResults(results) {
  write(STORAGE_KEYS.results, results);
}

export function getCurrentUser() {
  return read(STORAGE_KEYS.currentUser, null);
}

export function setCurrentUser(user) {
  write(STORAGE_KEYS.currentUser, user);
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export function getExamState() {
  return read(STORAGE_KEYS.examState, null);
}

export function setExamState(state) {
  write(STORAGE_KEYS.examState, state);
}

export function clearExamState() {
  localStorage.removeItem(STORAGE_KEYS.examState);
}

export function nextId(items) {
  if (!Array.isArray(items) || items.length === 0) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

export function resetSeedData() {
  write(STORAGE_KEYS.users, clone(USERS));
  write(STORAGE_KEYS.exams, clone(EXAMS));
  write(STORAGE_KEYS.results, clone(RESULTS_DATA));
  clearCurrentUser();
  clearExamState();
}
