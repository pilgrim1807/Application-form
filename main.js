// ====== Тема (light/dark) через data-theme ======
const btnTheme = document.getElementById('toggleTheme');
btnTheme.onclick = () => {
  let theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};
// При загрузке — выставляем сохранённую тему
if (localStorage.getItem('theme') === 'dark') {
  document.body.setAttribute('data-theme', 'dark');
} else {
  document.body.setAttribute('data-theme', 'light');
}

// ====== Card radio group с ripple, sound ======
function cardRadioGrid(gridId, inputId, errorId, sound = true) {
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
    setTimeout(() => ripple.remove(), 500);
    // Sound
    if (sound) { clickSound.currentTime = 0; clickSound.play(); }
    // Select visual
    grid.querySelectorAll('.modern-card').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    input.value = btn.dataset.name || btn.dataset.value;
    if (error) error.classList.add('hidden');
    updateGridAlignment(); // после выбора центрируем снова
  }
}
// ====== Центрирование сетки с карточками (смарт!) ======
function updateGridAlignment() {
  document.querySelectorAll('.modern-cards-grid').forEach(grid => {
    const items = grid.querySelectorAll('.modern-card');
    let cols = 3;
    if (window.innerWidth < 420) cols = 1;
    else if (window.innerWidth < 640) cols = 2;
    const lastRowCount = items.length % cols || cols;
    if (items.length < cols || lastRowCount < cols) {
      grid.classList.add('center-grid');
    } else {
      grid.classList.remove('center-grid');
    }
  });
}
window.addEventListener('resize', updateGridAlignment);
window.addEventListener('DOMContentLoaded', updateGridAlignment);

// ====== Init для всех radio-блоков ======
cardRadioGrid('nameGrid', 'nameInput', 'nameError');
cardRadioGrid('personalityGrid', 'personalityInput', 'personalityError');

// ====== Submit с проверкой и анти-спам ======
const form = document.getElementById('bandForm');
const result = document.getElementById('result');
let canSubmit = false;
setTimeout(()=>canSubmit=true, 1800);

form.onsubmit = (e) => {
  e.preventDefault();
  // Проверка карточных radio-блоков
  if (!document.getElementById('nameInput').value) {
    document.getElementById('nameError').classList.remove('hidden');
    document.getElementById('nameGrid').scrollIntoView({behavior:'smooth'});
    return;
  }
  if (!document.getElementById('personalityInput').value) {
    document.getElementById('personalityError').classList.remove('hidden');
    document.getElementById('personalityGrid').scrollIntoView({behavior:'smooth'});
    return;
  }
  if(form.email.value) return alert('Spam detected!');
  if(!canSubmit) return alert('Подожди пару секунд перед отправкой!');
  if(form.captcha.value.trim() !== "5") {
    alert("Ошибка в капче: реши 2 + 3 правильно!");
    return;
  }
  form.reset();
  // Сброс выделения
  document.querySelectorAll('.modern-card.selected').forEach(el => el.classList.remove('selected'));
  document.getElementById('nameInput').value = "";
  document.getElementById('personalityInput').value = "";
  canSubmit = false; setTimeout(()=>canSubmit=true, 1500);
  result.innerHTML = `
    <div class="bg-green-100 border border-green-300 rounded-xl p-4 text-green-700 dark:bg-green-900 dark:border-green-600">
      Спасибо за ответы!<br/>
    </div>
  `;
  updateGridAlignment();
}
