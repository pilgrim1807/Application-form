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
    grid.querySelectorAll('.modern-card').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    input.value = btn.dataset.name || btn.dataset.value;
    if (error) error.style.display = 'none';
  }
}
cardRadioGrid('nameGrid', 'nameInput', 'nameError');
cardRadioGrid('personalityGrid', 'personalityInput', 'personalityError');
cardRadioGrid('logicGrid', 'logicInput', 'logicError');

// ====== Only show hints if tried submit ======
const form = document.forms.bandForm;
const result = document.getElementById('result');
const main = document.querySelector('main');
let triedSubmit = false;

form.onsubmit = e => {
  e.preventDefault();
  triedSubmit = true;
  let hasError = false;

  // Проверка обычных required input
  form.querySelectorAll('[required]').forEach(field => {
    const hint = document.getElementById(field.id + 'Hint');
    if (!field.value.trim()) {
      field.classList.add('input-error');
      if (hint) hint.style.display = 'block';
      hasError = true;
    } else {
      field.classList.remove('input-error');
      if (hint) hint.style.display = 'none';
    }
  });

  // Проверка radio-групп
  [
    { grid: 'nameGrid', input: 'nameInput', error: 'nameError', hint: 'Пожалуйста, заполните это поле' },
    { grid: 'personalityGrid', input: 'personalityInput', error: 'personalityError', hint: 'Пожалуйста, заполните это поле' },
    { grid: 'logicGrid', input: 'logicInput', error: 'logicError', hint: 'Пожалуйста, заполните это поле' }
  ].forEach(({ grid, input, error, hint }) => {
    const val = document.getElementById(input).value;
    const cards = document.querySelectorAll(`#${grid} .modern-card`);
    const errorDiv = document.getElementById(error);
    if (!val) {
      cards.forEach(card => card.classList.add('card-error'));
      if (errorDiv) {
        errorDiv.textContent = hint;
        errorDiv.style.display = 'block';
      }
      hasError = true;
    } else {
      cards.forEach(card => card.classList.remove('card-error'));
      if (errorDiv) errorDiv.style.display = 'none';
    }
  });

  // Если есть ошибки — просто подсветить, не отправлять
  if (hasError) {
    result.innerHTML = '';
    return false;
  }

  // Очищаем main и показываем только сообщение
  const mainContent = main.innerHTML;
  main.innerHTML = `
    <div id="thankyou" class="flex flex-col items-center justify-center min-h-[350px]">
      <div class="bg-green-100 border border-green-300 rounded-xl p-6 text-green-700 text-center text-xl font-bold animate-popIn" style="max-width:450px;margin:auto;">
        Спасибо за участие!
      </div>
    </div>
  `;

  // Через 2 секунды возвращаем форму очищенной
  setTimeout(() => {
    main.innerHTML = mainContent;
    // Сброс всех выделений карточек
    document.querySelectorAll('.modern-card.selected').forEach(el => el.classList.remove('selected'));
    ['nameInput','personalityInput','logicInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    form.reset();
    triedSubmit = false;
    // Перезапускаем события (для вновь вставленного main содержимого)
    cardRadioGrid('nameGrid', 'nameInput', 'nameError');
    cardRadioGrid('personalityGrid', 'personalityInput', 'personalityError');
    cardRadioGrid('logicGrid', 'logicInput', 'logicError');
  }, 2000);

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ====== Убрать ошибку после исправления (input) ======
form.querySelectorAll('[required]').forEach(field => {
  field.addEventListener('input', () => {
    if (!triedSubmit) return;
    if (field.value.trim()) {
      field.classList.remove('input-error');
      const hint = document.getElementById(field.id + 'Hint');
      if (hint) hint.style.display = 'none';
    }
  });
});

// ====== Убрать ошибку после выбора карточки ======
['nameGrid','personalityGrid','logicGrid'].forEach((gridId, i) => {
  document.getElementById(gridId).addEventListener('click', () => {
    if (!triedSubmit) return;
    document.querySelectorAll(`#${gridId} .modern-card`).forEach(card => card.classList.remove('card-error'));
    let errDiv = document.getElementById(['nameError','personalityError','logicError'][i]);
    if (errDiv) errDiv.style.display = 'none';
  });
});
