const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/img', express.static('img')); // чтобы работали картинки favicon и др.
app.use(express.static('.')); // отдаёт index.html, main.js, style.css

// Гарантируем, что папка uploads есть
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, Date.now() + '-' + base + ext);
  }
});
const upload = multer({ storage: storage });

app.post('/submit', upload.single('catchphraseImage'), (req, res) => {
  const fields = req.body;
  const file = req.file;
  const answers = [
    fields.name,
    fields.traits,
    fields.superpower,
    fields.personality,
    fields.annoyedBy,
    fields.inspiredBy,
    fields.logicType,
    fields.priority,
    fields.admire,
    fields.movieHero,
    fields.catchphrase,
    file ? file.filename : '',
    fields.weirdFact,
    fields.habit,
    fields.musicGenre,
    fields.ritual,
    fields.onTour,
    fields.nickname,
    fields.testResult,
    fields.finishPhrase,
    fields.testFeeling,
    fields.meme,
    fields.energyWord,
    fields.weekDay,
    (new Date()).toISOString()
  ];
  const csvRow = answers.map(v => `"${(v||'').replace(/"/g, '""')}"`).join(',') + '\n';
  fs.appendFileSync('answers.csv', csvRow);
  res.json({ status: 'ok', message: 'Спасибо!', image: file ? '/uploads/' + file.filename : null });
});

// === ДОБАВЛЕНО: скачивание файла answers.csv через браузер ===
app.get('/download-answers', (req, res) => {
  res.download(path.join(__dirname, 'answers.csv'));
});

// === ДОБАВЛЕНО: просмотр списка загруженных файлов (картинок) ===
app.get('/uploads-list', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) return res.status(500).send('Ошибка!');
    const list = files
      .map(file => `<a href="/uploads/${file}" target="_blank">${file}</a>`)
      .join('<br>');
    res.send(`<h2>Загруженные картинки:</h2>${list}`);
  });
});

// Самое важное — отдаём index.html на корень
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
