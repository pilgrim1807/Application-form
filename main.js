// ====== Light/Dark Theme Toggle через data-theme ======
const btnTheme = document.getElementById('toggleTheme');
btnTheme.onclick = () => {
  // Анимация кнопки
  btnTheme.classList.add('clicked');
  setTimeout(() => btnTheme.classList.remove('clicked'), 440);

  // Переключаем тему и сохраняем в localStorage
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  document.body.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);
};
// При загрузке — выставляем сохранённую тему
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
    grid.querySelectorAll('.modern-card').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    input.value = btn.dataset.name || btn.dataset.value;
    if (error) error.classList.add('hidden');
  }
}
cardRadioGrid('nameGrid', 'nameInput', 'nameError');
cardRadioGrid('personalityGrid', 'personalityInput', 'personalityError');
cardRadioGrid('logicGrid', 'logicInput', 'logicError');

// ====== Submit, проверка, pop-in message ======
const form = document.forms.bandForm;
const result = document.getElementById('result');
let canSubmit = false;
setTimeout(() => canSubmit = true, 1800);

form.onsubmit = e => {
  e.preventDefault();
  if (!document.getElementById('nameInput').value) {
    document.getElementById('nameError').classList.remove('hidden');
    document.getElementById('nameGrid').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (!document.getElementById('personalityInput').value) {
    document.getElementById('personalityError').classList.remove('hidden');
    document.getElementById('personalityGrid').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (form.email && form.email.value) return alert('Spam detected!');
  if (!canSubmit) return alert('Подожди пару секунд перед отправкой!');
  form.reset();
  document.querySelectorAll('.modern-card.selected').forEach(el => el.classList.remove('selected'));
  document.getElementById('nameInput').value = "";
  document.getElementById('personalityInput').value = "";
  canSubmit = false; setTimeout(() => canSubmit = true, 1500);
  result.innerHTML = `<div class="bg-green-100 border border-green-300 rounded-xl p-4 text-green-700" style="max-width:450px;margin:auto;animation:popIn .5s;">
    Спасибо за ответы!<br/>
  </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ====== Disable submit if not all fields are filled ======
const submitBtn = document.getElementById('submitBtn');
const requiredFields = form.querySelectorAll('[required]');
function checkFormValidity() {
  let valid = true;
  requiredFields.forEach(field => {
    if (!field.value.trim()) valid = false;
  });
  // Для карточных радио — проверяем hidden inputs
  if (!document.getElementById('nameInput').value) valid = false;
  if (!document.getElementById('personalityInput').value) valid = false;
  if (!document.getElementById('logicInput').value) valid = false;

  submitBtn.disabled = !valid;
  submitBtn.classList.toggle('opacity-60', !valid);
  submitBtn.classList.toggle('cursor-not-allowed', !valid);
}
// следим за изменениями во всех полях
requiredFields.forEach(field => {
  field.addEventListener('input', checkFormValidity);
  field.addEventListener('paste', checkFormValidity);
});
// следим за изменениями radio-групп
['nameInput','personalityInput','logicInput'].forEach(id => {
  document.getElementById(id).addEventListener('change', checkFormValidity);
});
// сразу проверка при загрузке
window.addEventListener('DOMContentLoaded', checkFormValidity);
