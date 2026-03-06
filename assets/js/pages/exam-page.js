import '../app-init.js';

import { requireStudent } from '../core/guards.js';

import { getExams, getExamState, setExamState, clearExamState, getResults, setResults, nextId } from '../core/storage.js';

import { showToast, showConfirm } from '../core/ui.js';



const user = requireStudent();

if (!user) {

  throw new Error('Unauthorized');

}



const examState = getExamState();

const exams = getExams();

const exam = exams.find((item) => Number(item.id) === Number(examState?.examId));



if (!examState || !exam) {

  window.location.href = './home.html';

  throw new Error('Exam state missing');

}



let state = {

  examId: examState.examId,

  currentQuestion: Number(examState.currentQuestion) || 0,

  answers: examState.answers || {},

  timeLeft: Number(examState.timeLeft) || Number(exam.duration) * 60,

  startedAt: Number(examState.startedAt) || Date.now()

};



let timerId = null;



const timerChip = document.getElementById('timer-chip');

const titleEl = document.getElementById('exam-title');

const pageTitleEl = document.getElementById('exam-page-title');

const subjectEl = document.getElementById('exam-subject');

const area = document.getElementById('question-area');

const navGrid = document.getElementById('q-nav-grid');

const progressBar = document.getElementById('progress-bar');

const progressText = document.getElementById('progress-text');

const btnPrev = document.getElementById('btn-prev');

const btnNext = document.getElementById('btn-next');

const btnSubmit = document.getElementById('btn-submit');



// Ham persist: thuc hien persist.

function persist() {

  setExamState(state);

}



// Ham formatClock: thuc hien format clock.

function formatClock(totalSec) {

  const mm = Math.floor(totalSec / 60).toString().padStart(2, '0');

  const ss = (totalSec % 60).toString().padStart(2, '0');

  return `${mm}:${ss}`;

}



// Ham updateProgress: thuc hien update progress.

function updateProgress() {

  const done = Object.keys(state.answers).length;

  const total = exam.questions.length;

  const percent = total ? Math.round((done / total) * 100) : 0;

  progressBar.style.width = `${percent}%`;

  progressText.textContent = `${done} / ${total} câu`;

}



// Ham renderQuestionNav: thuc hien render question nav.

function renderQuestionNav() {

  navGrid.innerHTML = exam.questions

    .map((_, idx) => {

      const answered = state.answers[idx] !== undefined;

      const current = idx === state.currentQuestion;

      return `<button class="q-nav-btn ${answered ? 'answered' : ''} ${current ? 'current' : ''}" data-jump="${idx}" type="button">${idx + 1}</button>`;

    })

    .join('');

}



// Ham renderQuestion: thuc hien render question.

function renderQuestion() {

  const question = exam.questions[state.currentQuestion];

  const selected = state.answers[state.currentQuestion];



  area.innerHTML = `

    <div class="question-label">Câu ${state.currentQuestion + 1} / ${exam.questions.length}</div>

    <h3 class="question-text">${question.text}</h3>

    <div class="options-list">

      ${question.opts

        .map(

          (opt, idx) => `

          <button class="option-item ${selected === idx ? 'selected' : ''}" data-answer="${idx}" type="button">

            <span class="option-dot">${String.fromCharCode(65 + idx)}</span>

            <span>${opt}</span>

          </button>`

        )

        .join('')}

    </div>

  `;



  btnPrev.disabled = state.currentQuestion === 0;

  btnNext.style.display = state.currentQuestion === exam.questions.length - 1 ? 'none' : 'inline-flex';



  updateProgress();

  renderQuestionNav();

}



// Ham moveQuestion: thuc hien move question.

function moveQuestion(delta) {

  const next = state.currentQuestion + delta;

  if (next < 0 || next >= exam.questions.length) return;

  state.currentQuestion = next;

  persist();

  renderQuestion();

}



// Ham submitExam: thuc hien submit exam.

function submitExam(auto = false) {

  clearInterval(timerId);



  const questions = exam.questions;

  let correct = 0;

  questions.forEach((question, idx) => {

    if (state.answers[idx] === question.ans) correct += 1;

  });



  const total = questions.length;

  const score = Math.round((correct / total) * 100) / 10;

  const usedMin = Math.max(1, Math.round((Number(exam.duration) * 60 - state.timeLeft) / 60));



  const results = getResults();

  const result = {

    id: nextId(results),

    userId: user.id,

    examId: exam.id,

    score,

    correct,

    total,

    timeUsed: usedMin,

    date: new Date().toISOString().slice(0, 10),

    answers: questions.map((_, idx) => (state.answers[idx] === undefined ? -1 : state.answers[idx]))

  };



  results.push(result);

  setResults(results);

  clearExamState();



  if (auto) showToast('Hết giờ, hệ thống đã tự nộp bài.', 'error');

  window.location.href = `./results.html?resultId=${result.id}`;

}



// Ham confirmSubmit: thuc hien confirm submit.

function confirmSubmit() {

  const total = exam.questions.length;

  const done = Object.keys(state.answers).length;

  const remain = total - done;



  if (remain > 0) {

    showConfirm(`C?n ${remain} c?u ch?a tr? l?i. B?n v?n mu?n n?p b?i?`, {

      title: 'Xác nhận n?p b?i',

      okLabel: 'Nộp bài',

      onConfirm: () => submitExam()

    });

    return;

  }

  submitExam();

}



// Ham tickTimer: thuc hien tick timer.

function tickTimer() {

  state.timeLeft -= 1;

  if (state.timeLeft <= 0) {

    state.timeLeft = 0;

    timerChip.textContent = '00:00';

    submitExam(true);

    return;

  }



  timerChip.textContent = formatClock(state.timeLeft);

  timerChip.classList.toggle('warn', state.timeLeft <= 300);

  persist();

}



// Ham bindEvents: thuc hien bind events.

function bindEvents() {

  area.addEventListener('click', (event) => {

    const button = event.target.closest('[data-answer]');

    if (!button) return;

    const answerIdx = Number(button.getAttribute('data-answer'));

    state.answers[state.currentQuestion] = answerIdx;

    persist();

    renderQuestion();

  });



  navGrid.addEventListener('click', (event) => {

    const jump = event.target.closest('[data-jump]');

    if (!jump) return;

    state.currentQuestion = Number(jump.getAttribute('data-jump'));

    persist();

    renderQuestion();

  });



  btnPrev.addEventListener('click', () => moveQuestion(-1));

  btnNext.addEventListener('click', () => moveQuestion(1));

  btnSubmit.addEventListener('click', confirmSubmit);

}



// Ham init: thuc hien init.

(function init() {

  pageTitleEl.textContent = exam.name;

  titleEl.textContent = exam.name;

  subjectEl.textContent = `${exam.subject} • ${exam.duration} phút • ${exam.total} câu`;



  bindEvents();

  renderQuestion();

  timerChip.textContent = formatClock(state.timeLeft);

  timerId = window.setInterval(tickTimer, 1000);

  persist();

})();

