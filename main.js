// ====== Light/Dark Theme Toggle через data-theme ======
const btnTheme = document.getElementById('toggleTheme');
btnTheme.onclick = () => {
  btnTheme.classList.add('clicked');
  setTimeout(() => btnTheme.classList.remove('clicked'), 440);
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  document.body.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);
};
const savedTheme = localStorage.getItem('theme');
document.body.setAttribute('data-theme', savedTheme === 'dark' ? 'dark' : 'light');

// ====== Card radio group: ripple, sound, select ======
function cardRadioGrid(gridId, inputId, errorId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const input = document.getElementById(inputId);
  const error = errorId && document.getElementById(errorId);
  const clickSound = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9d5be7.mp3');
  grid.onclick = e => {
    let btn = e.target.closest('.modern-card');
    if (!btn) return;
    // Ripple
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);
    // Sound
    clickSound.currentTime = 0; clickSound.play();
    // Visual
    grid.querySelectorAll('.modern-card').forEach(el => el.classList.remove('selected', 'card-error'));
    btn.classList.add('selected');
    input.value = btn.dataset.name || btn.dataset.value;
    if (error) error.classList.add('hidden');
  }
}
cardRadioGrid('nameGrid', 'nameInput', 'nameError');
cardRadioGrid('personalityGrid', 'personalityInput', 'personalityError');
cardRadioGrid('logicGrid', 'logicInput', 'logicError');

// ====== Submit, проверки, подсветка незаполненных ======
const form = document.forms.bandForm;
const result = document.getElementById('result');
const submitBtn = document.getElementById('submitBtn');
const requiredFields = form.querySelectorAll('[required]');
let triedSubmit = false;

function highlightErrors() {
  // Для обычных input
  requiredFields.forEach(field => {
    if (triedSubmit && !field.value.trim()) {
      field.classList.add('input-error');
      field.classList.remove('shake-anim');
      // restart shake animation
      void field.offsetWidth;
      field.classList.add('shake-anim');
    } else {
      field.classList.remove('input-error', 'shake-anim');
    }
  });
  // Для карточных radio
  [
    { grid: 'nameGrid', input: 'nameInput' },
    { grid: 'personalityGrid', input: 'personalityInput' },
    { grid: 'logicGrid', input: 'logicInput' }
  ].forEach(({ grid, input }) => {
    const val = document.getElementById(input).value;
    const cards = document.querySelectorAll(`#${grid} .modern-card`);
    if (triedSubmit && !val) {
      cards.forEach(card => {
        card.classList.add('card-error');
        card.classList.remove('shake-anim');
        void card.offsetWidth;
        card.classList.add('shake-anim');
      });
    } else {
      cards.forEach(card => card.classList.remove('card-error', 'shake-anim'));
    }
  });
}
// сброс ошибок на вводе
requiredFields.forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('input-error', 'shake-anim');
    highlightErrors();
  });
});
['nameGrid','personalityGrid','logicGrid'].forEach(gridId => {
  document.getElementById(gridId).addEventListener('click', () => {
    document.querySelectorAll(`#${gridId} .modern-card`).forEach(card => card.classList.remove('card-error', 'shake-anim'));
    highlightErrors();
  });
});

// Проверка валидности для разблокировки кнопки
function checkFormValidity() {
  let valid = true;
  requiredFields.forEach(field => { if (!field.value.trim()) valid = false; });
  if (!document.getElementById('nameInput').value) valid = false;
  if (!document.getElementById('personalityInput').value) valid = false;
  if (!document.getElementById('logicInput').value) valid = false;
  submitBtn.disabled = !valid;
  submitBtn.classList.toggle('opacity-60', !valid);
  submitBtn.classList.toggle('cursor-not-allowed', !valid);
}
requiredFields.forEach(field => {
  field.addEventListener('input', checkFormValidity);
  field.addEventListener('paste', checkFormValidity);
});
['nameInput','personalityInput','logicInput'].forEach(id => {
  document.getElementById(id).addEventListener('change', checkFormValidity);
});
window.addEventListener('DOMContentLoaded', checkFormValidity);

// ====== Обработка отправки ======
form.onsubmit = e => {
  e.preventDefault();
  triedSubmit = true;
  highlightErrors();
  checkFormValidity();
  // Не отправлять если есть хоть одна ошибка
  if (
    form.querySelector('.input-error') ||
    form.querySelector('.card-error')
  ) return;
  // Логика отправки
  if (form.email && form.email.value) return alert('Spam detected!');
  form.reset();
  document.querySelectorAll('.modern-card.selected').forEach(el => el.classList.remove('selected'));
  document.getElementById('nameInput').value = "";
  document.getElementById('personalityInput').value = "";
  document.getElementById('logicInput').value = "";
  triedSubmit = false; // сброс для следующей попытки
  checkFormValidity();
  result.innerHTML = `<div class="bg-green-100 border border-green-300 rounded-xl p-4 text-green-700" style="max-width:450px;margin:auto;animation:popIn .5s;">
    Спасибо за ответы!<br/>
  </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
