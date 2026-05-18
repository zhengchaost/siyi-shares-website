import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(__dirname, 'media');
const app = express();

// DB
const db = new Database(path.join(__dirname, 'cms.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Init tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    business_line TEXT DEFAULT 'target_convey',
    city TEXT DEFAULT '',
    tag TEXT DEFAULT 'luxury',
    description TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    content TEXT DEFAULT '',
    slug TEXT UNIQUE,
    sort_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    show_on_home INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    content TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    slug TEXT UNIQUE,
    published_at DATETIME,
    sort_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_line TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_line, value)
  );
`);

function ensureColumn(tableName, columnName, definition) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = cols.some((c) => c.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

ensureColumn('cases', 'show_on_home', 'INTEGER DEFAULT 0');
ensureColumn('cases', 'business_line', "TEXT DEFAULT 'target_convey'");

// Seed admin if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@segxm.com');
if (!adminExists) {
  const hash = crypto.createHash('sha256').update('Segxm@2024!').digest('hex');
  db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('admin@segxm.com', hash);
}

// Seed default categories if empty
const catCount = db.prepare("SELECT COUNT(*) as c FROM categories").get().c;
if (catCount === 0) {
  const seedCats = [
    ["target_convey", "luxury", "千万级豪宅", 1],
    ["target_convey", "premium", "高端项目", 2],
    ["target_convey", "brand", "产品系创作", 3],
    ["target_convey", "video", "新媒体视频", 4],
    ["yiwai", "luxury", "千万级豪宅", 1],
    ["yiwai", "premium", "高端项目", 2],
    ["yiwai", "brand", "产品系创作", 3],
    ["yiwai", "video", "新媒体视频", 4],
    ["chaozan", "luxury", "千万级豪宅", 1],
    ["chaozan", "premium", "高端项目", 2],
    ["chaozan", "brand", "产品系创作", 3],
    ["chaozan", "video", "新媒体视频", 4],
  ];
  const insertCat = db.prepare("INSERT INTO categories (business_line, value, label, sort_order) VALUES (?,?,?,?)");
  for (const [bl, val, lab, so] of seedCats) insertCat.run(bl, val, lab, so);
}

// Middleware
app.use(cors({ origin: ['https://cn.segxm.com', 'http://cn.segxm.com'] }));
app.use(express.json());
app.use('/media', express.static(MEDIA_DIR));

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = session.user_id;
  next();
}

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(MEDIA_DIR, new Date().toISOString().slice(0,7));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images allowed'));
}});

// === AUTH ROUTES ===
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, hash);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(req.headers.authorization.replace('Bearer ', ''));
  res.json({ ok: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});

// === UPLOAD ===
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const filePath = req.file.path;
  const thumbPath = filePath.replace(/(\.[^.]+)$/, '-thumb');
  const cardPath = filePath.replace(/(\.[^.]+)$/, '-card');
  try {
    await sharp(filePath).resize(400, 300, { fit: 'cover' }).toFile(thumbPath);
    await sharp(filePath).resize(800, 600, { fit: 'cover' }).toFile(cardPath);
  } catch(e) { /* skip resize */ }
  const relPath = '/media/' + path.relative(MEDIA_DIR, filePath).replace(/\\/g, '/');
  res.json({ url: relPath, thumbnail: relPath.replace(/(\.[^.]+)$/, '-thumb'), card: relPath.replace(/(\.[^.]+)$/, '-card') });
});

// === CASES API (public) ===
app.get('/api/cases', (req, res) => {
  const { limit, sort, tag, slug, home, business_line } = req.query;
  let sql = 'SELECT * FROM cases WHERE is_published = 1';
  const params = [];
  if (tag && tag !== 'all') { sql += ' AND tag = ?'; params.push(tag); }
  if (slug) { sql += ' AND slug = ?'; params.push(slug); }
  if (business_line) { sql += ' AND business_line = ?'; params.push(business_line); }
  if (home === '1') sql += ' AND show_on_home = 1';
  if (sort === '-order') sql += ' ORDER BY sort_order DESC, id DESC';
  else sql += ' ORDER BY sort_order DESC, id DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

app.get('/api/cases/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM cases WHERE id = ? AND is_published = 1').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// === NEWS API (public) ===
app.get('/api/news', (req, res) => {
  const { limit, slug } = req.query;
  let sql = 'SELECT * FROM news WHERE is_published = 1';
  const params = [];
  if (slug) { sql += ' AND slug = ?'; params.push(slug); }
  sql += ' ORDER BY COALESCE(published_at, created_at) DESC, id DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// === SITE CONFIG API (public) ===
app.get('/api/site-config', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_config').all();
  const config = {};
  for (const row of rows) {
    try {
      config[row.key] = JSON.parse(row.value);
    } catch (e) {
      config[row.key] = row.value;
    }
  }
  res.json(config);
});

// === CASES API (admin) ===
app.get('/api/admin/cases', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM cases ORDER BY sort_order DESC, id DESC').all();
  res.json(rows);
});

app.post('/api/admin/cases', authMiddleware, (req, res) => {
  const { title, business_line, city, tag, description, cover_image, content, slug, sort_order, is_published, show_on_home } = req.body;
  const result = db.prepare(
    'INSERT INTO cases (title, business_line, city, tag, description, cover_image, content, slug, sort_order, is_published, show_on_home) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
  ).run(
    title,
    business_line || 'target_convey',
    city || '',
    tag || 'luxury',
    description || '',
    cover_image || '',
    content || '',
    slug || '',
    sort_order || 0,
    is_published !== undefined ? is_published : 1,
    show_on_home ? 1 : 0
  );
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/cases/:id', authMiddleware, (req, res) => {
  const fields = [];
  const params = [];
  for (const [key, val] of Object.entries(req.body)) {
    if (['title', 'business_line', 'city', 'tag', 'description', 'cover_image', 'content', 'slug', 'sort_order', 'is_published', 'show_on_home'].includes(key)) {
      fields.push(key + ' = ?');
      params.push(val);
    }
  }
  fields.push('updated_at = CURRENT_TIMESTAMP');
  if (!fields.length) return res.status(400).json({ error: 'No fields' });
  params.push(req.params.id);
  db.prepare('UPDATE cases SET ' + fields.join(', ') + ' WHERE id = ?').run(...params);
  res.json({ ok: true });
});

app.delete('/api/admin/cases/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM cases WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// === NEWS API (admin) ===
app.get('/api/admin/news', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM news ORDER BY COALESCE(published_at, created_at) DESC, id DESC').all();
  res.json(rows);
});

app.post('/api/admin/news', authMiddleware, (req, res) => {
  const { title, summary, content, cover_image, slug, published_at, sort_order, is_published } = req.body;
  const result = db.prepare(
    'INSERT INTO news (title, summary, content, cover_image, slug, published_at, sort_order, is_published) VALUES (?,?,?,?,?,?,?,?)'
  ).run(
    title,
    summary || '',
    content || '',
    cover_image || '',
    slug || '',
    published_at || new Date().toISOString(),
    sort_order || 0,
    is_published !== undefined ? is_published : 1
  );
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/admin/news/:id', authMiddleware, (req, res) => {
  const fields = [];
  const params = [];
  for (const [key, val] of Object.entries(req.body)) {
    if (['title', 'summary', 'content', 'cover_image', 'slug', 'published_at', 'sort_order', 'is_published'].includes(key)) {
      fields.push(key + ' = ?');
      params.push(val);
    }
  }
  fields.push('updated_at = CURRENT_TIMESTAMP');
  if (!fields.length) return res.status(400).json({ error: 'No fields' });
  params.push(req.params.id);
  db.prepare('UPDATE news SET ' + fields.join(', ') + ' WHERE id = ?').run(...params);
  res.json({ ok: true });
});

app.delete('/api/admin/news/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// === SITE CONFIG API (admin) ===
app.get('/api/admin/site-config', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_config').all();
  const config = {};
  for (const row of rows) {
    try {
      config[row.key] = JSON.parse(row.value);
    } catch (e) {
      config[row.key] = row.value;
    }
  }
  res.json(config);
});

app.put('/api/admin/site-config', authMiddleware, (req, res) => {
  const payload = req.body || {};
  const stmt = db.prepare(`
    INSERT INTO site_config (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `);

  const trx = db.transaction(() => {
    for (const [key, value] of Object.entries(payload)) {
      stmt.run(key, JSON.stringify(value));
    }
  });
  trx();
  res.json({ ok: true });
});

// === CATEGORIES API (public) ===
app.get("/api/categories", (req, res) => {
  const { business_line } = req.query;
  let sql = "SELECT * FROM categories";
  const params = [];
  if (business_line) { sql += " WHERE business_line = ?"; params.push(business_line); }
  sql += " ORDER BY sort_order ASC, id ASC";
  res.json(db.prepare(sql).all(...params));
});

// === CATEGORIES API (admin) ===
app.get("/api/admin/categories", authMiddleware, (req, res) => {
  res.json(db.prepare("SELECT * FROM categories ORDER BY business_line, sort_order ASC, id ASC").all());
});

app.post("/api/admin/categories", authMiddleware, (req, res) => {
  const { business_line, value, label, sort_order } = req.body;
  if (!business_line || !value || !label) return res.status(400).json({ error: "business_line, value, label required" });
  try {
    const result = db.prepare("INSERT INTO categories (business_line, value, label, sort_order) VALUES (?,?,?,?)").run(business_line, value, label, sort_order || 0);
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    if (e.message.includes("UNIQUE")) return res.status(409).json({ error: "该事业群下已存在相同 value 的分类" });
    throw e;
  }
});

app.put("/api/admin/categories/:id", authMiddleware, (req, res) => {
  const fields = [];
  const params = [];
  for (const [key, val] of Object.entries(req.body)) {
    if (["business_line", "value", "label", "sort_order"].includes(key)) {
      fields.push(key + " = ?");
      params.push(val);
    }
  }
  if (!fields.length) return res.status(400).json({ error: "No fields" });
  params.push(req.params.id);
  try {
    db.prepare("UPDATE categories SET " + fields.join(", ") + " WHERE id = ?").run(...params);
    res.json({ ok: true });
  } catch (e) {
    if (e.message.includes("UNIQUE")) return res.status(409).json({ error: "该事业群下已存在相同 value 的分类" });
    throw e;
  }
});

app.delete("/api/admin/categories/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// === ADMIN HTML ===
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// === START ===
const PORT = 3001;
app.listen(PORT, '127.0.0.1', () => {
  console.log('CMS running on port ' + PORT);
});
