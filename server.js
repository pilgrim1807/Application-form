const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// ==== GOOGLE SHEETS ====
const SHEET_ID = 'ТВОЙ_SHEET_ID'; // <-- ВСТАВЬ СВОЙ
const KEY_FILE = 'gcp-key.json'; // сервисный ключ Google Cloud (скачай и положи рядом)

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendRowToSheet(row) {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'A1',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

// ==== EXPRESS SETUP ====
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // картинки по прямой ссылке, но не публикуй список!
app.use(express.static('.')); // отдаём index.html, main.js, style.css и др.

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ==== MULTER (загрузка файлов) ====
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

// ==== ОБРАБОТЧИК ФОРМЫ ====
app.post('/submit', upload.single('catchphraseImage'), async (req, res) => {
  const fields = req.body;
  const file = req.file;
  const imgLink = file ? `${req.protocol}://${req.get('host')}/uploads/${file.filename}` : '';

  // Собираем все данные (добавь или убери нужные поля)
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
    imgLink, // ссылка на картинку
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

  // Сохраняем в CSV (бэкап)
  const csvRow = answers.map(v => `"${(v||'').replace(/"/g, '""')}"`).join(',') + '\n';
  fs.appendFileSync('answers.csv', csvRow);

  // Сохраняем в Google Sheets
  try {
    await appendRowToSheet(answers);
    res.json({ status: 'ok', message: 'Спасибо!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Ошибка Google Sheets', error: e.message });
  }
});

// ==== Только отдаём index.html (без публичных списков) ====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
