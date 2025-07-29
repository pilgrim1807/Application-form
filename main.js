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

// ====== Preview for картинка (инициализация слушателя) ======
function initImageUpload() {
  const fileInput = document.getElementById('catchphraseImage');
  const previewDiv = document.getElementById('catchphraseImagePreview');
  const hintSpan = document.getElementById('catchphraseImageHint');
  if (!fileInput || !previewDiv || !hintSpan) return;

  fileInput.addEventListener('change', function() {
    previewDiv.innerHTML = '';
    hintSpan.style.display = 'none';
    const file = fileInput.files[0];
    if (!file) return;

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      hintSpan.textContent = 'Можно выбрать только изображение!';
      hintSpan.style.display = 'block';
      fileInput.value = '';
      return;
    }
    // Проверка размера
    if (file.size > 4 * 1024 * 1024) {
      hintSpan.textContent = 'Слишком большой файл (до 4 МБ).';
      hintSpan.style.display = 'block';
      fileInput.value = '';
      return;
    }

    // Показать превью
    const img = document.createElement('img');
    img.className = "rounded-xl border border-gray-200 mt-1 mb-2 max-h-40";
    img.style.maxWidth = "100%";
    img.src = URL.createObjectURL(file);
    previewDiv.appendChild(img);

    // Кнопка удалить
    const delBtn = document.createElement('button');
    delBtn.textContent = "Удалить";
    delBtn.type = "button";
    delBtn.className = "ml-2 px-2 py-1 rounded bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-medium";
    delBtn.onclick = () => {
      fileInput.value = '';
      previewDiv.innerHTML = '';
      hintSpan.style.display = 'none';
    };
    previewDiv.appendChild(delBtn);
  });
}

// ====== Инициализация логики анкеты ======
function initFormLogic() {
  cardRadioGrid('nameGrid', 'nameInput', 'nameError');
  cardRadioGrid('personalityGrid', 'personalityInput', 'personalityError');
  cardRadioGrid('logicGrid', 'logicInput', 'logicError');
  initImageUpload();

  const form = document.forms.bandForm;
  const result = document.getElementById('result');
  const main = document.querySelector('main');
  let triedSubmit = false;

  // Глобально запомним исходный html main для сброса
  const mainContent = main.innerHTML;

  form.onsubmit = async e => {
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

    // === ОТПРАВКА НА NODE.JS BACKEND ===
    const formData = new FormData(form);
    const fileInput = document.getElementById('catchphraseImage');
    if (fileInput && fileInput.files[0]) {
      formData.set('catchphraseImage', fileInput.files[0]);
    }

    // Показываем "Спасибо" и отключаем форму до ответа сервера
    main.innerHTML = `
      <div id="thankyou" class="flex flex-col items-center justify-center min-h-[350px]">
        <div class="bg-green-100 border border-green-300 rounded-xl p-6 text-green-700 text-center text-xl font-bold animate-popIn" style="max-width:450px;margin:auto;">
          Отправляем... <span class="animate-pulse">⏳</span>
        </div>
      </div>
    `;

    try {
      const response = await fetch('https://application-form-cug4.onrender.com/submit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        main.innerHTML = `
          <div id="thankyou" class="flex flex-col items-center justify-center min-h-[350px]">
            <div class="bg-green-100 border border-green-300 rounded-xl p-6 text-green-700 text-center text-xl font-bold animate-popIn" style="max-width:450px;margin:auto;">
              Спасибо за участие!
            </div>
          </div>
        `;
        setTimeout(() => {
          main.innerHTML = mainContent;
          document.querySelectorAll('.modern-card.selected').forEach(el => el.classList.remove('selected'));
          ['nameInput','personalityInput','logicInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
          });
          if (fileInput) fileInput.value = '';
          const previewDiv = document.getElementById('catchphraseImagePreview');
          if (previewDiv) previewDiv.innerHTML = '';
          form.reset();
          triedSubmit = false;
          initFormLogic();
        }, 2000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        main.innerHTML = `<div class="bg-red-100 p-6 text-red-700 rounded-xl text-xl font-bold">Ошибка отправки :( Попробуйте еще раз!</div>`;
      }
    } catch (error) {
      main.innerHTML = `<div class="bg-red-100 p-6 text-red-700 rounded-xl text-xl font-bold">Ошибка соединения с сервером :(</div>`;
    }
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
}

// === Запуск всей логики ===
window.addEventListener('DOMContentLoaded', () => {
  initFormLogic();
});
