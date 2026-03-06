import { USERS, EXAMS, RESULTS_DATA } from '../../../data/mock-data.js';





export const STORAGE_KEYS = {


  currentUser: 'ptit_current_user',


  examState: 'ptit_exam_state',


  exams: 'ptit_admin_exams',


  users: 'ptit_admin_users',


  results: 'ptit_admin_results'


};

// Ham containsMojibake: thuc hien contains mojibake.
function containsMojibake(value) {
  if (value == null) return false;
  if (typeof value === 'string') {
    return /[????]/.test(value);
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsMojibake(item));
  }
  if (typeof value === 'object') {
    return Object.values(value).some((item) => containsMojibake(item));
  }
  return false;
}





// Ham clone: thuc hien clone.


function clone(data) {


  return JSON.parse(JSON.stringify(data));


}





// Ham safeParse: thuc hien safe parse.


function safeParse(raw, fallback) {


  if (!raw) return fallback;


  try {


    return JSON.parse(raw);


  } catch {


    return fallback;


  }


}





// Ham read: thuc hien read.


function read(key, fallback = null) {


  return safeParse(localStorage.getItem(key), fallback);


}





// Ham write: thuc hien write.


function write(key, value) {


  localStorage.setItem(key, JSON.stringify(value));


}





// Ham ensureSeedData: thuc hien ensure seed data.


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





// Ham getUsers: thuc hien get users.


export function getUsers() {


  return read(STORAGE_KEYS.users, []);


}





// Ham setUsers: thuc hien set users.


export function setUsers(users) {


  write(STORAGE_KEYS.users, users);


}





// Ham getExams: thuc hien get exams.


export function getExams() {


  return read(STORAGE_KEYS.exams, []);


}





// Ham setExams: thuc hien set exams.


export function setExams(exams) {


  write(STORAGE_KEYS.exams, exams);


}





// Ham getResults: thuc hien get results.


export function getResults() {


  return read(STORAGE_KEYS.results, []);


}





// Ham setResults: thuc hien set results.


export function setResults(results) {


  write(STORAGE_KEYS.results, results);


}





// Ham getCurrentUser: thuc hien get current user.


export function getCurrentUser() {


  return read(STORAGE_KEYS.currentUser, null);


}





// Ham setCurrentUser: thuc hien set current user.


export function setCurrentUser(user) {


  write(STORAGE_KEYS.currentUser, user);


}





// Ham clearCurrentUser: thuc hien clear current user.


export function clearCurrentUser() {


  localStorage.removeItem(STORAGE_KEYS.currentUser);


}





// Ham getExamState: thuc hien get exam state.


export function getExamState() {


  return read(STORAGE_KEYS.examState, null);


}





// Ham setExamState: thuc hien set exam state.


export function setExamState(state) {


  write(STORAGE_KEYS.examState, state);


}





// Ham clearExamState: thuc hien clear exam state.


export function clearExamState() {


  localStorage.removeItem(STORAGE_KEYS.examState);


}





// Ham nextId: thuc hien next id.


export function nextId(items) {


  if (!Array.isArray(items) || items.length === 0) return 1;


  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;


}





// Ham resetSeedData: thuc hien reset seed data.


export function resetSeedData() {


  write(STORAGE_KEYS.users, clone(USERS));


  write(STORAGE_KEYS.exams, clone(EXAMS));


  write(STORAGE_KEYS.results, clone(RESULTS_DATA));


  clearCurrentUser();


  clearExamState();


}


