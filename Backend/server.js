const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const NEWS_UPLOAD_ROOT = path.join(UPLOAD_ROOT, 'news');
const GALLERY_COVERS_ROOT = path.join(UPLOAD_ROOT, 'gallery', 'covers');
const GALLERY_PHOTOS_ROOT = path.join(UPLOAD_ROOT, 'gallery', 'photos');
const DOCUMENTS_ROOT = path.join(UPLOAD_ROOT, 'documents');
const COMPETITIONS_ROOT = path.join(UPLOAD_ROOT, 'competitions');
const CALENDAR_ROOT = path.join(UPLOAD_ROOT, 'calendar');
const CALENDAR_YEAR_PDFS_ROOT = path.join(CALENDAR_ROOT, 'years');
const CALENDAR_EVENT_PDFS_ROOT = path.join(CALENDAR_ROOT, 'events');
const REGIONS_ROOT = path.join(UPLOAD_ROOT, 'regions');
const CLUBS_ROOT = path.join(UPLOAD_ROOT, 'clubs');
const CALENDAR_DATA_ROOT = path.join(__dirname);
fs.mkdirSync(NEWS_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(GALLERY_COVERS_ROOT, { recursive: true });
fs.mkdirSync(GALLERY_PHOTOS_ROOT, { recursive: true });
fs.mkdirSync(DOCUMENTS_ROOT, { recursive: true });
fs.mkdirSync(COMPETITIONS_ROOT, { recursive: true });
fs.mkdirSync(CALENDAR_YEAR_PDFS_ROOT, { recursive: true });
fs.mkdirSync(CALENDAR_EVENT_PDFS_ROOT, { recursive: true });
fs.mkdirSync(REGIONS_ROOT, { recursive: true });
fs.mkdirSync(CLUBS_ROOT, { recursive: true });

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'root',
  password: process.env.PGPASSWORD || 'rootpassword',
  database: process.env.PGDATABASE || 'fgrbu_db',
});

const ACTIVE_VISITOR_TTL_MS = 60_000;
const activeVisitors = new Map();

function getClientIdentifier(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.socket?.remoteAddress || req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return `${ip}:${userAgent}`;
}

function trackVisitor(req, res, next) {
  activeVisitors.set(getClientIdentifier(req), Date.now());
  next();
}

function getOnlineUsersCount() {
  const cutoff = Date.now() - ACTIVE_VISITOR_TTL_MS;
  for (const [id, seenAt] of activeVisitors.entries()) {
    if (seenAt < cutoff) {
      activeVisitors.delete(id);
    }
  }
  return activeVisitors.size;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destination = NEWS_UPLOAD_ROOT;
    if (req.path.includes('/gallery/albums') && file.fieldname === 'cover_image') {
      destination = GALLERY_COVERS_ROOT;
    } else if (req.path.includes('/gallery/albums') && (file.fieldname === 'photos' || file.fieldname === 'photo')) {
      destination = GALLERY_PHOTOS_ROOT;
    } else if (req.path.includes('/competitions')) {
      destination = COMPETITIONS_ROOT;
    } else if (req.path.includes('/news')) {
      destination = NEWS_UPLOAD_ROOT;
    } else if (req.path.includes('/documents')) {
      destination = DOCUMENTS_ROOT;
    } else if (req.path.includes('/calendar/year') || req.path.includes('/calendar/years')) {
      destination = CALENDAR_YEAR_PDFS_ROOT;
    } else if (req.path.includes('/calendar/events') || req.path.includes('/calendar/event')) {
      destination = CALENDAR_EVENT_PDFS_ROOT;
    } else if (req.path.includes('/regions')) {
      destination = REGIONS_ROOT;
    } else if (req.path.includes('/clubs')) {
      destination = CLUBS_ROOT;
    }
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-.]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({ storage });

// Multer instance for documents (PDF only)
const uploadDocs = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Тільки PDF файли дозволені.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

const uploadPdf = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Тільки PDF файли дозволені.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 12 * 1024 * 1024 },
});

const uploadNationalTeamPhotos = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Для фото дозволені лише JPG, PNG та WebP.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024, files: 30 },
});

function buildDocumentRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    created_at: row.created_at,
    updated_at: row.updated_at,
    files: row.files || [],
  };
}

function buildCompetitionRow(row) {
  return {
    id: row.id,
    title: row.title,
    cover_image: row.cover_image,
    city: row.city,
    category: row.category,
    event_date: row.event_date,
    status: row.status,
    description: row.description,
    weight_categories: row.weight_categories || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(trackVisitor);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

function sanitizeContent(html) {
  return sanitizeHtml(html, {
    allowedTags: ['b', 'u', 'strong', 'em', 'i', 'a', 'img', 'p', 'br', 'div', 'span', 'ul', 'ol', 'li'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noreferrer noopener',
        },
      }),
    },
  });
}

function buildCalendarYearRow(row) {
  return {
    id: row.id,
    year: row.year,
    pdf_file: row.pdf_file,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildCalendarEventRow(row) {
  const startDate = row.start_date ? new Date(row.start_date) : null;
  const endDate = row.end_date ? new Date(row.end_date) : null;
  let dates = '';

  if (startDate && endDate) {
    const startDateString = startDate.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const endDateString = endDate.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    dates = startDate.toDateString() === endDate.toDateString()
      ? startDateString
      : `${startDateString} — ${endDateString}`;
  } else if (startDate) {
    dates = startDate.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } else if (endDate) {
    dates = endDate.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  return {
    id: row.id,
    calendar_year_id: row.calendar_year_id,
    title: row.title,
    event_type: row.event_type,
    start_date: row.start_date,
    end_date: row.end_date,
    location: row.location,
    regulation_pdf: row.regulation_pdf,
    results_url: row.results_url,
    description: row.description,
    cancelled: Boolean(row.cancelled),
    dates,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function getMonthName(dateString) {
  if (!dateString) return 'Інші';
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', { month: 'long' }).toUpperCase();
}

async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    short_description TEXT NOT NULL,
    content TEXT NOT NULL,
    news_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS gallery_albums (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    short_description TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS gallery_photos (
    id SERIAL PRIMARY KEY,
    album_id INTEGER NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    sort_order INTEGER NOT NULL DEFAULT 0
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS document_files (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    city TEXT NOT NULL,
    category TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
  await pool.query('ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS cancelled BOOLEAN NOT NULL DEFAULT false;');

  await pool.query(`CREATE TABLE IF NOT EXISTS competition_weight_categories (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    weight_name TEXT NOT NULL,
    bracket_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS calendar_years (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    pdf_file TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    calendar_year_id INTEGER NOT NULL REFERENCES calendar_years(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('міжнародне', 'національне', 'чемпіонат')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    location TEXT,
    regulation_pdf TEXT,
    results_url TEXT,
    description TEXT,
    cancelled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);

  await pool.query(`CREATE TABLE IF NOT EXISTS national_team_years (
    year INTEGER PRIMARY KEY CHECK (year BETWEEN 1900 AND 2200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
  await pool.query(`CREATE TABLE IF NOT EXISTS national_team_entries (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL REFERENCES national_team_years(year) ON DELETE CASCADE,
    age_category TEXT NOT NULL CHECK (age_category IN ('adult', 'u23', 'u20', 'u17', 'u15')),
    championship TEXT NOT NULL CHECK (championship IN ('europe', 'world')),
    member_type TEXT NOT NULL CHECK (member_type IN ('athlete', 'coach')),
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    birth_date DATE,
    city TEXT NOT NULL DEFAULT '',
    weight TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
  await pool.query(`CREATE TABLE IF NOT EXISTS national_team_photos (
    id SERIAL PRIMARY KEY,
    image_data BYTEA NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
  await pool.query(`ALTER TABLE national_team_entries
    ADD COLUMN IF NOT EXISTS photo_id INTEGER REFERENCES national_team_photos(id) ON DELETE SET NULL;`);
  await pool.query(`CREATE INDEX IF NOT EXISTS national_team_entries_lookup
    ON national_team_entries (year, age_category, championship, member_type, sort_order, id);`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS national_team_entries_position_unique
    ON national_team_entries (year, age_category, championship, member_type, sort_order);`);
  await pool.query(`CREATE TABLE IF NOT EXISTS national_team_display_settings (
    age_category TEXT PRIMARY KEY CHECK (age_category IN ('adult', 'u23', 'u20', 'u17', 'u15')),
    year INTEGER NOT NULL REFERENCES national_team_years(year) ON DELETE RESTRICT,
    championship TEXT NOT NULL CHECK (championship IN ('europe', 'world')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
  await pool.query("INSERT INTO national_team_years (year) VALUES (2026) ON CONFLICT (year) DO NOTHING;");
  await pool.query(`INSERT INTO national_team_display_settings (age_category, year, championship)
    VALUES ('adult', 2026, 'europe'), ('u23', 2026, 'europe'), ('u20', 2026, 'europe'),
      ('u17', 2026, 'europe'), ('u15', 2026, 'europe')
    ON CONFLICT (age_category) DO NOTHING;`);
  const initialRosterMigration = fs.readFileSync(
    path.join(__dirname, '..', 'migrations', '011_seed_national_team_2026.sql'),
    'utf8'
  );
  await pool.query(initialRosterMigration);
  await pool.query("DELETE FROM national_team_entries WHERE age_category = 'u15' AND championship = 'world';");
  await pool.query("UPDATE national_team_display_settings SET championship = 'europe' WHERE age_category = 'u15' AND championship <> 'europe';");
  await pool.query(`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'national_team_entries_u15_europe_only') THEN
        ALTER TABLE national_team_entries ADD CONSTRAINT national_team_entries_u15_europe_only
          CHECK (age_category <> 'u15' OR championship = 'europe');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'national_team_display_u15_europe_only') THEN
        ALTER TABLE national_team_display_settings ADD CONSTRAINT national_team_display_u15_europe_only
          CHECK (age_category <> 'u15' OR championship = 'europe');
      END IF;
    END $$;`);

  await pool.query(`CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    photo TEXT NOT NULL,
    banner TEXT,
    president TEXT,
    president_photo TEXT,
    website TEXT,
    clubs_dyussh JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
  await pool.query('ALTER TABLE regions ADD COLUMN IF NOT EXISTS banner TEXT;');
  await pool.query('ALTER TABLE regions ADD COLUMN IF NOT EXISTS website TEXT;');

  await pool.query(`CREATE TABLE IF NOT EXISTS clubs_dyussh (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    photo TEXT NOT NULL,
    city TEXT,
    gym_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
    trainers JSONB NOT NULL DEFAULT '[]'::jsonb,
    contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
    region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
  await pool.query(`ALTER TABLE clubs_dyussh ADD COLUMN IF NOT EXISTS contacts JSONB NOT NULL DEFAULT '[]'::jsonb;`);
}

function buildNewsRow(row) {
  return {
    ...row,
    cover_image: row.cover_image,
  };
}

function buildGalleryAlbumRow(row) {
  return {
    ...row,
    cover_image: row.cover_image,
    short_description: row.short_description,
    category: row.category,
    photo_count: Number(row.photo_count || 0),
  };
}

function buildGalleryPhotoRow(row) {
  return {
    ...row,
    image_path: row.image_path,
    upload_date: row.upload_date,
    sort_order: row.sort_order,
  };
}

function buildRegionRow(row) {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo,
    banner: row.banner,
    president: row.president,
    president_photo: row.president_photo,
    website: row.website,
    clubs_dyussh: row.clubs_dyussh || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildClubRow(row) {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo,
    city: row.city,
    gym_addresses: row.gym_addresses || [],
    trainers: row.trainers || [],
    contacts: row.contacts || [],
    region_id: row.region_id,
    region_name: row.region_name || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sanitizeText(value) {
  return sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} });
}

function resolveUploadPath(urlPath) {
  return path.join(__dirname, '..', String(urlPath).replace(/^\/+/, ''));
}

function getNewsInlineImagePaths(content) {
  const paths = [];
  const imageSource = /<img\b[^>]*\bsrc=["'](\/uploads\/news\/[^"']+)["']/gi;
  for (const match of String(content || '').matchAll(imageSource)) {
    paths.push(match[1]);
  }
  return paths;
}

async function cleanupUploadedFiles(filePaths) {
  const uniquePaths = [...new Set((filePaths || []).filter((filePath) => typeof filePath === 'string' && filePath.startsWith('/uploads/')))];
  const uploadsRoot = path.resolve(UPLOAD_ROOT) + path.sep;

  for (const filePath of uniquePaths) {
    const resolvedPath = path.resolve(resolveUploadPath(filePath));
    if (!resolvedPath.toLowerCase().startsWith(uploadsRoot.toLowerCase())) {
      throw new Error(`Відмова від видалення файлу поза каталогом завантажень: ${filePath}`);
    }

    const references = await pool.query(
      `SELECT
        EXISTS (SELECT 1 FROM news WHERE cover_image = $1 OR position($1 in content) > 0)
        OR EXISTS (SELECT 1 FROM gallery_albums WHERE cover_image = $1)
        OR EXISTS (SELECT 1 FROM gallery_photos WHERE image_path = $1)
        OR EXISTS (SELECT 1 FROM document_files WHERE file_path = $1)
        OR EXISTS (SELECT 1 FROM regions WHERE photo = $1 OR banner = $1 OR president_photo = $1)
        OR EXISTS (
          SELECT 1 FROM clubs_dyussh club,
            jsonb_array_elements(
              CASE WHEN jsonb_typeof(club.trainers) = 'array' THEN club.trainers ELSE '[]'::jsonb END
            ) trainer
          WHERE club.photo = $1 OR trainer->>'photo' = $1
        )
        OR EXISTS (SELECT 1 FROM competitions WHERE cover_image = $1)
        OR EXISTS (SELECT 1 FROM calendar_years WHERE pdf_file = $1)
        OR EXISTS (SELECT 1 FROM calendar_events WHERE regulation_pdf = $1)
        OR EXISTS (SELECT 1 FROM national_team_entries WHERE image = $1)
        AS is_referenced`,
      [filePath]
    );
    if (references.rows[0].is_referenced) continue;

    try {
      await fs.promises.unlink(resolvedPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Не вдалося видалити завантажений файл ${filePath}:`, error);
        throw error;
      }
    }
  }
}

app.use((req, res, next) => {
  res.once('finish', () => {
    if (res.statusCode < 400) return;
    const requestFiles = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files || {}).flat();
    const uploadedPaths = [req.file, ...requestFiles]
      .filter((file) => file?.path)
      .map((file) => {
        const relativePath = path.relative(UPLOAD_ROOT, file.path);
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) return null;
        return `/uploads/${relativePath.split(path.sep).join('/')}`;
      });
    cleanupUploadedFiles(uploadedPaths).catch((error) => {
      console.error('Не вдалося очистити файли невдалої операції завантаження:', error);
    });
  });
  next();
});

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [newsResult, galleryResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM news'),
      pool.query('SELECT COUNT(*)::int AS count FROM gallery_photos'),
    ]);

    res.json({
      news_count: newsResult.rows[0]?.count ?? 0,
      gallery_photo_count: galleryResult.rows[0]?.count ?? 0,
      online_users: getOnlineUsersCount(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні статистики.' });
  }
});

const NATIONAL_TEAM_AGES = ['adult', 'u23', 'u20', 'u17', 'u15'];
const NATIONAL_TEAM_CHAMPIONSHIPS = ['europe', 'world'];

app.get('/api/national-team/settings', async (req, res) => {
  try {
    const [yearsResult, settingsResult] = await Promise.all([
      pool.query('SELECT year FROM national_team_years ORDER BY year DESC'),
      pool.query('SELECT age_category, year, championship FROM national_team_display_settings'),
    ]);
    res.json({
      years: yearsResult.rows.map((row) => row.year),
      settings: Object.fromEntries(settingsResult.rows.map((row) => [row.age_category, {
        year: row.year,
        championship: row.championship,
      }])),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося завантажити роки та налаштування збірної.' });
  }
});

app.get('/api/national-team/photos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT image_data, mime_type FROM national_team_photos WHERE id = $1',
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Фото не знайдено.' });
    }
    res.set('Content-Type', result.rows[0].mime_type);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(result.rows[0].image_data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося завантажити фото.' });
  }
});

app.get('/api/national-team/roster/:year/:age', async (req, res) => {
  try {
    const year = Number(req.params.year);
    const age = req.params.age;
    if (!Number.isInteger(year) || !NATIONAL_TEAM_AGES.includes(age)) {
      return res.status(400).json({ message: 'Невірний рік або вікова категорія.' });
    }

    const result = await pool.query(
      `SELECT id, year, age_category, championship, member_type, name, role, image, photo_id, birth_date,
        city, weight, title, description, achievements, sort_order
       FROM national_team_entries
       WHERE year = $1 AND age_category = $2
       ORDER BY championship, member_type, sort_order, id`,
      [year, age]
    );
    if (!result.rows.length) {
      const yearResult = await pool.query('SELECT year FROM national_team_years WHERE year = $1', [year]);
      if (!yearResult.rows.length) {
        return res.status(404).json({ message: 'Рік збірної не знайдено.' });
      }
    }

    const roster = {
      europe: { athletes: [], coaches: [] },
      world: { athletes: [], coaches: [] },
    };
    result.rows.forEach((row) => {
      roster[row.championship][row.member_type === 'athlete' ? 'athletes' : 'coaches'].push({
        ...row,
        id: String(row.id),
        photo_url: row.photo_id ? `/api/national-team/photos/${row.photo_id}` : '',
        birth_date: row.birth_date ? String(row.birth_date).slice(0, 10) : '',
      });
    });
    res.json({ year, age_category: age, roster });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося завантажити склад збірної.' });
  }
});

app.get('/api/national-team/roster/:year/:age/:championship/previous-athletes', async (req, res) => {
  try {
    const year = Number(req.params.year);
    const { age, championship } = req.params;
    if (!Number.isInteger(year) || !NATIONAL_TEAM_AGES.includes(age)
      || !NATIONAL_TEAM_CHAMPIONSHIPS.includes(championship)
      || (age === 'u15' && championship === 'world')) {
      return res.status(400).json({ message: 'Невірний рік, вікова категорія або чемпіонат.' });
    }

    const result = await pool.query(
      `WITH previous_year AS (
         SELECT MAX(year) AS year
         FROM national_team_entries
         WHERE year < $1 AND age_category = $2 AND championship = $3 AND member_type = 'athlete'
       )
       SELECT entry.id, entry.year, entry.name, entry.role, entry.image, entry.photo_id,
         entry.birth_date, entry.city, entry.weight, entry.title, entry.description, entry.achievements
       FROM national_team_entries entry
       JOIN previous_year ON previous_year.year = entry.year
       WHERE entry.age_category = $2 AND entry.championship = $3 AND entry.member_type = 'athlete'
       ORDER BY entry.sort_order, entry.id`,
      [year, age, championship]
    );
    res.json({
      year: result.rows[0]?.year ?? null,
      athletes: result.rows.map((row) => ({
        ...row,
        id: String(row.id),
        photo_url: row.photo_id ? `/api/national-team/photos/${row.photo_id}` : '',
        birth_date: row.birth_date ? String(row.birth_date).slice(0, 10) : '',
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося завантажити спортсменів попереднього року.' });
  }
});

app.post('/api/admin/national-team/years', async (req, res) => {
  try {
    const year = Number(req.body.year);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      return res.status(400).json({ message: 'Вкажіть коректний рік від 1900 до 2200.' });
    }
    const result = await pool.query(
      'INSERT INTO national_team_years (year) VALUES ($1) ON CONFLICT DO NOTHING RETURNING year',
      [year]
    );
    if (!result.rows.length) {
      return res.status(409).json({ message: 'Такий рік збірної вже існує.' });
    }
    await pool.query(
      `INSERT INTO national_team_display_settings (age_category, year, championship)
       VALUES ${NATIONAL_TEAM_AGES.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2}, 'europe')`).join(', ')}
       ON CONFLICT (age_category) DO NOTHING`,
      NATIONAL_TEAM_AGES.flatMap((age) => [age, year])
    );
    res.status(201).json({ year: result.rows[0].year });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити рік збірної.' });
  }
});

app.put('/api/admin/national-team/display/:age', async (req, res) => {
  try {
    const age = req.params.age;
    const year = Number(req.body.year);
    const championship = req.body.championship;
    if (!NATIONAL_TEAM_AGES.includes(age) || !Number.isInteger(year) || !NATIONAL_TEAM_CHAMPIONSHIPS.includes(championship)
      || (age === 'u15' && championship === 'world')) {
      return res.status(400).json({ message: 'Невірна вікова категорія, рік або чемпіонат.' });
    }
    const yearResult = await pool.query('SELECT year FROM national_team_years WHERE year = $1', [year]);
    if (!yearResult.rows.length) {
      return res.status(404).json({ message: 'Рік збірної не знайдено.' });
    }
    await pool.query(
      `UPDATE national_team_display_settings
       SET year = $1,
           championship = CASE WHEN age_category = $2 THEN $3 ELSE championship END,
           updated_at = now()`,
      [year, age, championship]
    );
    const settingsResult = await pool.query(
      'SELECT age_category, year, championship FROM national_team_display_settings'
    );
    res.json({
      year,
      settings: Object.fromEntries(settingsResult.rows.map((row) => [row.age_category, {
        year: row.year,
        championship: row.championship,
      }])),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося зберегти налаштування відображення збірної.' });
  }
});

app.put(
  '/api/admin/national-team/roster/:year/:age/:championship',
  (req, res, next) => uploadNationalTeamPhotos.any()(req, res, (error) => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT' ? 413 : 400;
      return res.status(status).json({ message: error.message || 'Не вдалося завантажити фото.' });
    }
    next();
  }),
  async (req, res) => {
  let client;
  let transactionStarted = false;
  try {
    client = await pool.connect();
    const year = Number(req.params.year);
    const age = req.params.age;
    const championship = req.params.championship;
    if (!Number.isInteger(year) || !NATIONAL_TEAM_AGES.includes(age) || !NATIONAL_TEAM_CHAMPIONSHIPS.includes(championship)
      || (age === 'u15' && championship === 'world')) {
      return res.status(400).json({ message: 'Невірний рік, вікова категорія або чемпіонат.' });
    }
    let rosterPayload;
    try {
      rosterPayload = JSON.parse(req.body.roster || '');
    } catch (error) {
      return res.status(400).json({ message: 'Некоректні дані складу збірної.' });
    }
    if (!Array.isArray(rosterPayload.athletes) || !Array.isArray(rosterPayload.coaches)) {
      return res.status(400).json({ message: 'Передайте списки спортсменів і тренерів.' });
    }
    const athletes = rosterPayload.athletes;
    const coaches = rosterPayload.coaches;
    if (athletes.length > 10 || coaches.length > 20) {
      return res.status(400).json({ message: 'Ліміт: 10 спортсменів і 20 тренерів на чемпіонат.' });
    }

    const photoFiles = new Map();
    for (const file of req.files || []) {
      const match = file.fieldname.match(/^(athlete|coach)_photo_(\d+)$/);
      if (!match) {
        return res.status(400).json({ message: 'Некоректне поле завантаження фото.' });
      }
      const memberIndex = Number(match[2]);
      const collection = match[1] === 'athlete' ? athletes : coaches;
      if (memberIndex >= collection.length) {
        return res.status(400).json({ message: 'Фото не відповідає картці складу.' });
      }

      const header = file.buffer.subarray(0, 12);
      const validSignature = file.mimetype === 'image/jpeg'
        ? header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
        : file.mimetype === 'image/png'
          ? header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
          : header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';
      if (!validSignature) {
        return res.status(400).json({ message: 'Файл не відповідає формату зображення.' });
      }
      photoFiles.set(file.fieldname, file);
    }

    function normalizeEntry(entry, memberType, uploadedPhoto) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error('Некоректна картка учасника.');
      }
      const values = entry;
      const name = sanitizeText(values.name).trim();
      const hasData = uploadedPhoto || Object.entries(values).some(
        ([key, value]) => !['id', 'photo_id'].includes(key) && String(value || '').trim()
      ) || Number(values.photo_id) > 0;
      if (!hasData) return null;
      if (!name) throw new Error('Вкажіть ім’я для кожної заповненої картки.');
      const image = sanitizeText(values.image).trim();
      if (image && !/^(\/?assets\/)/i.test(image)) {
        throw new Error('Зображення має бути завантажене з пристрою.');
      }
      const birthDate = sanitizeText(values.birth_date).trim();
      if (birthDate) {
        const parsedDate = new Date(`${birthDate}T00:00:00Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== birthDate) {
          throw new Error('Невірний формат дати народження.');
        }
      }
      const achievements = Array.isArray(values.achievements)
        ? values.achievements.map(sanitizeText).filter(Boolean)
        : [];
      return {
        memberType,
        name,
        role: sanitizeText(values.role).trim(),
        image,
        photoId: values.remove_photo === 'true' || values.remove_photo === true
          ? null
          : (Number.isInteger(Number(values.photo_id)) && Number(values.photo_id) > 0 ? Number(values.photo_id) : null),
        removePhoto: values.remove_photo === 'true' || values.remove_photo === true,
        uploadedPhoto,
        birthDate: birthDate || null,
        city: sanitizeText(values.city).trim(),
        weight: sanitizeText(values.weight).trim(),
        title: sanitizeText(values.title).trim(),
        description: sanitizeText(values.description).trim(),
        achievements,
      };
    }

    let normalizedEntries;
    try {
      normalizedEntries = [
        ...athletes.map((entry, index) => normalizeEntry(entry, 'athlete', photoFiles.get(`athlete_photo_${index}`))),
        ...coaches.map((entry, index) => normalizeEntry(entry, 'coach', photoFiles.get(`coach_photo_${index}`))),
      ].filter(Boolean);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    await client.query('BEGIN');
    transactionStarted = true;
    const yearResult = await client.query('SELECT year FROM national_team_years WHERE year = $1', [year]);
    if (!yearResult.rows.length) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ message: 'Рік збірної не знайдено.' });
    }
    const currentEntries = await client.query(
      `SELECT id, photo_id FROM national_team_entries
       WHERE year = $1 AND age_category = $2 AND championship = $3`,
      [year, age, championship]
    );
    const oldPhotoIds = currentEntries.rows.map((row) => row.photo_id).filter(Boolean);
    await client.query(
      'DELETE FROM national_team_entries WHERE year = $1 AND age_category = $2 AND championship = $3',
      [year, age, championship]
    );
    for (const [index, entry] of normalizedEntries.entries()) {
      let photoId = entry.photoId;
      if (entry.uploadedPhoto) {
        const photoResult = await client.query(
          'INSERT INTO national_team_photos (image_data, mime_type) VALUES ($1, $2) RETURNING id',
          [entry.uploadedPhoto.buffer, entry.uploadedPhoto.mimetype]
        );
        photoId = photoResult.rows[0].id;
      }
      await client.query(
        `INSERT INTO national_team_entries
          (year, age_category, championship, member_type, name, role, image, photo_id, birth_date, city,
           weight, title, description, achievements, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [year, age, championship, entry.memberType, entry.name, entry.role, entry.removePhoto ? '' : entry.image,
          photoId, entry.birthDate, entry.city, entry.weight, entry.title, entry.description,
          JSON.stringify(entry.achievements), index]
      );
    }
    if (oldPhotoIds.length) {
      await client.query(
        `DELETE FROM national_team_photos photo
         WHERE photo.id = ANY($1::int[])
           AND NOT EXISTS (SELECT 1 FROM national_team_entries WHERE photo_id = photo.id)`,
        [oldPhotoIds]
      );
    }
    await client.query('COMMIT');
    transactionStarted = false;
    res.json({ saved: normalizedEntries.length });
  } catch (error) {
    if (client && transactionStarted) {
      await client.query('ROLLBACK');
    }
    console.error(error);
    res.status(500).json({ message: 'Не вдалося зберегти склад збірної.' });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, category, cover_image, short_description, content, news_date, created_at, updated_at FROM news ORDER BY news_date DESC, id DESC'
    );
    res.json(result.rows.map(buildNewsRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні новин.' });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, title, category, cover_image, short_description, content, news_date, created_at, updated_at FROM news WHERE id = $1',
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Новину не знайдено.' });
    }
    res.json(buildNewsRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні новини.' });
  }
});

app.post('/api/news/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не завантажено.' });
  }
  const url = `/uploads/news/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/news', upload.single('cover_image'), async (req, res) => {
  try {
    const { title, category, short_description, content, news_date } = req.body;
    if (!title || !category || !short_description || !content || !req.file) {
      return res.status(400).json({ message: 'Заповніть всі поля та додайте обкладинку.' });
    }
    const coverImage = `/uploads/news/${req.file.filename}`;
    const safeContent = sanitizeContent(content);
    const published = news_date ? new Date(news_date) : new Date();
    const result = await pool.query(
      'INSERT INTO news (title, category, cover_image, short_description, content, news_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, category, cover_image, short_description, content, news_date, created_at, updated_at',
      [title, category, coverImage, short_description, safeContent, published]
    );
    res.status(201).json(buildNewsRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити новину.' });
  }
});

app.put('/api/news/:id', upload.single('cover_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, short_description, content, news_date } = req.body;
    const current = await pool.query('SELECT cover_image, content FROM news WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ message: 'Новину не знайдено.' });
    }
    const coverImage = req.file ? `/uploads/news/${req.file.filename}` : current.rows[0].cover_image;
    const safeContent = sanitizeContent(content || '');
    const published = news_date ? new Date(news_date) : new Date();
    const result = await pool.query(
      'UPDATE news SET title = $1, category = $2, short_description = $3, content = $4, cover_image = $5, news_date = $6, updated_at = now() WHERE id = $7 RETURNING id, title, category, cover_image, short_description, content, news_date, created_at, updated_at',
      [title, category, short_description, safeContent, coverImage, published, id]
    );
    const removedImages = [
      req.file ? current.rows[0].cover_image : null,
      ...getNewsInlineImagePaths(current.rows[0].content).filter((imagePath) => !getNewsInlineImagePaths(safeContent).includes(imagePath)),
    ];
    await cleanupUploadedFiles(removedImages);
    res.json(buildNewsRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити новину.' });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT cover_image, content FROM news WHERE id = $1', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Новину не знайдено.' });
    }
    const oldFiles = [result.rows[0].cover_image, ...getNewsInlineImagePaths(result.rows[0].content)];
    await pool.query('DELETE FROM news WHERE id = $1', [id]);
    await cleanupUploadedFiles(oldFiles);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити новину.' });
  }
});

app.get('/api/gallery/albums', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gallery_albums.*, COALESCE(count(gallery_photos.id), 0) AS photo_count
       FROM gallery_albums
       LEFT JOIN gallery_photos ON gallery_photos.album_id = gallery_albums.id
       GROUP BY gallery_albums.id
       ORDER BY gallery_albums.created_at DESC`
    );
    res.json(result.rows.map(buildGalleryAlbumRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні альбомів.' });
  }
});

app.get('/api/gallery/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const albumResult = await pool.query(
      'SELECT id, title, cover_image, short_description, category, created_at, updated_at FROM gallery_albums WHERE id = $1',
      [id]
    );
    if (!albumResult.rows.length) {
      return res.status(404).json({ message: 'Альбом не знайдено.' });
    }
    const photoResult = await pool.query(
      'SELECT id, album_id, image_path, upload_date, sort_order FROM gallery_photos WHERE album_id = $1 ORDER BY sort_order ASC, id ASC',
      [id]
    );
    res.json({
      ...buildGalleryAlbumRow(albumResult.rows[0]),
      photos: photoResult.rows.map(buildGalleryPhotoRow),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні альбому.' });
  }
});

app.post('/api/gallery/albums', upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'photos', maxCount: 50 }]), async (req, res) => {
  try {
    const { title, category, short_description } = req.body;
    const coverFile = req.files?.cover_image?.[0];
    if (!title || !category || !short_description || !coverFile) {
      return res.status(400).json({ message: 'Заповніть усі поля та додайте обкладинку.' });
    }
    const coverImage = `/uploads/gallery/covers/${coverFile.filename}`;
    const result = await pool.query(
      'INSERT INTO gallery_albums (title, cover_image, short_description, category) VALUES ($1, $2, $3, $4) RETURNING id, title, cover_image, short_description, category, created_at, updated_at',
      [sanitizeText(title), coverImage, sanitizeText(short_description), sanitizeText(category)]
    );
    const album = result.rows[0];
    const photos = req.files?.photos || [];
    if (photos.length) {
      const insertPromises = photos.map((file, index) => {
        const imagePath = `/uploads/gallery/photos/${file.filename}`;
        return pool.query(
          'INSERT INTO gallery_photos (album_id, image_path, sort_order) VALUES ($1, $2, $3)',
          [album.id, imagePath, index]
        );
      });
      await Promise.all(insertPromises);
    }
    res.status(201).json(buildGalleryAlbumRow(album));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити альбом.' });
  }
});

app.put('/api/gallery/albums/:id', upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'photos', maxCount: 50 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, short_description } = req.body;
    const currentResult = await pool.query('SELECT title, cover_image, short_description, category FROM gallery_albums WHERE id = $1', [id]);
    if (!currentResult.rows.length) {
      return res.status(404).json({ message: 'Альбом не знайдено.' });
    }
    const current = currentResult.rows[0];
    const safeTitle = title?.trim() ? sanitizeText(title) : current.title;
    const safeCategory = category?.trim() ? sanitizeText(category) : current.category;
    const safeDescription = short_description?.trim() ? sanitizeText(short_description) : current.short_description;
    const coverFile = req.files?.cover_image?.[0];
    const coverImage = coverFile ? `/uploads/gallery/covers/${coverFile.filename}` : current.cover_image;
    const result = await pool.query(
      'UPDATE gallery_albums SET title = $1, cover_image = $2, short_description = $3, category = $4, updated_at = now() WHERE id = $5 RETURNING id, title, cover_image, short_description, category, created_at, updated_at',
      [safeTitle, coverImage, safeDescription, safeCategory, id]
    );
    const album = result.rows[0];
    const photos = req.files?.photos || [];
    if (photos.length) {
      const insertPromises = photos.map((file, index) => {
        const imagePath = `/uploads/gallery/photos/${file.filename}`;
        return pool.query(
          'INSERT INTO gallery_photos (album_id, image_path, sort_order) VALUES ($1, $2, $3)',
          [album.id, imagePath, index]
        );
      });
      await Promise.all(insertPromises);
    }
    if (coverFile) await cleanupUploadedFiles([current.cover_image]);
    res.json(buildGalleryAlbumRow(album));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити альбом.' });
  }
});

app.delete('/api/gallery/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const albumResult = await pool.query('SELECT cover_image FROM gallery_albums WHERE id = $1', [id]);
    if (!albumResult.rows.length) {
      return res.status(404).json({ message: 'Альбом не знайдено.' });
    }
    const photosResult = await pool.query('SELECT image_path FROM gallery_photos WHERE album_id = $1', [id]);
    await pool.query('DELETE FROM gallery_albums WHERE id = $1', [id]);
    await cleanupUploadedFiles([
      albumResult.rows[0].cover_image,
      ...photosResult.rows.map((photo) => photo.image_path),
    ]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити альбом.' });
  }
});

app.post('/api/gallery/albums/:id/photos', upload.array('photos', 50), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'Завантажте принаймні одне фото.' });
    }
    const albumResult = await pool.query('SELECT id FROM gallery_albums WHERE id = $1', [id]);
    if (!albumResult.rows.length) {
      return res.status(404).json({ message: 'Альбом не знайдено.' });
    }
    const insertPromises = req.files.map((file, index) => {
      const imagePath = `/uploads/gallery/photos/${file.filename}`;
      return pool.query(
        'INSERT INTO gallery_photos (album_id, image_path, sort_order) VALUES ($1, $2, $3) RETURNING id, album_id, image_path, upload_date, sort_order',
        [id, imagePath, index]
      );
    });
    const rows = await Promise.all(insertPromises);
    res.status(201).json({ photos: rows.map((result) => buildGalleryPhotoRow(result.rows[0])) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося завантажити фото.' });
  }
});

// Documents API
const DOCUMENT_CATEGORIES = new Set(['федерація', 'міністерство', 'інше']);

app.get('/api/documents', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.title, d.category, d.created_at, d.updated_at,
        COALESCE(json_agg(json_build_object('id', f.id, 'file_path', f.file_path, 'original_name', f.original_name) ORDER BY f.id) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
       FROM documents d
       LEFT JOIN document_files f ON f.document_id = d.id
       GROUP BY d.id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows.map(buildDocumentRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні документів.' });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT d.id, d.title, d.category, d.created_at, d.updated_at,
        COALESCE(json_agg(json_build_object('id', f.id, 'file_path', f.file_path, 'original_name', f.original_name) ORDER BY f.id) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
       FROM documents d
       LEFT JOIN document_files f ON f.document_id = d.id
       WHERE d.id = $1
       GROUP BY d.id`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Документ не знайдено.' });
    res.json(buildDocumentRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні документу.' });
  }
});

app.post('/api/documents', uploadDocs.array('files', 20), async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) return res.status(400).json({ message: 'Заповніть заголовок та категорію.' });
    if (!DOCUMENT_CATEGORIES.has(category)) return res.status(400).json({ message: 'Оберіть коректну категорію документа.' });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: 'Додайте хоча б один PDF файл.' });

    const insertDoc = await pool.query(
      'INSERT INTO documents (title, category) VALUES ($1, $2) RETURNING id, title, category, created_at, updated_at',
      [sanitizeText(title), sanitizeText(category)]
    );
    const doc = insertDoc.rows[0];
    const insertPromises = files.map((file) => {
      const filePath = `/uploads/documents/${file.filename}`;
      return pool.query('INSERT INTO document_files (document_id, file_path, original_name) VALUES ($1, $2, $3) RETURNING id, file_path, original_name', [doc.id, filePath, file.originalname]);
    });
    const inserted = await Promise.all(insertPromises);
    doc.files = inserted.map((r) => r.rows[0]);
    res.status(201).json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити документ.' });
  }
});

app.put('/api/documents/:id', uploadDocs.array('files', 20), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, deleteFileIds } = req.body;
    const current = await pool.query('SELECT id, title, category FROM documents WHERE id = $1', [id]);
    if (!current.rows.length) return res.status(404).json({ message: 'Документ не знайдено.' });

    const safeTitle = title?.trim() ? sanitizeText(title) : current.rows[0].title;
    const safeCategory = category?.trim() ? sanitizeText(category) : current.rows[0].category;
    if (!DOCUMENT_CATEGORIES.has(safeCategory)) return res.status(400).json({ message: 'Оберіть коректну категорію документа.' });
    await pool.query('UPDATE documents SET title = $1, category = $2, updated_at = now() WHERE id = $3', [safeTitle, safeCategory, id]);

    // Handle deletion of individual files (expects JSON array or comma-separated ids)
    let toDelete = [];
    if (deleteFileIds) {
      try {
        toDelete = typeof deleteFileIds === 'string' ? JSON.parse(deleteFileIds) : deleteFileIds;
      } catch (e) {
        toDelete = String(deleteFileIds).split(',').map((v) => Number(v)).filter(Boolean);
      }
    }
    if (Array.isArray(toDelete) && toDelete.length) {
      const delRows = await pool.query('SELECT id, file_path FROM document_files WHERE id = ANY($1::int[])', [toDelete]);
      await pool.query('DELETE FROM document_files WHERE id = ANY($1::int[])', [toDelete]);
      await cleanupUploadedFiles(delRows.rows.map((row) => row.file_path));
    }

    // Add new uploaded files
    const files = req.files || [];
    if (files.length) {
      const insertPromises = files.map((file) => {
        const filePath = `/uploads/documents/${file.filename}`;
        return pool.query('INSERT INTO document_files (document_id, file_path, original_name) VALUES ($1, $2, $3) RETURNING id, file_path, original_name', [id, filePath, file.originalname]);
      });
      await Promise.all(insertPromises);
    }

    // Return updated document
    const updated = await pool.query(
      `SELECT d.id, d.title, d.category, d.created_at, d.updated_at,
        COALESCE(json_agg(json_build_object('id', f.id, 'file_path', f.file_path, 'original_name', f.original_name) ORDER BY f.id) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
       FROM documents d
       LEFT JOIN document_files f ON f.document_id = d.id
       WHERE d.id = $1
       GROUP BY d.id`, [id]
    );
    res.json(buildDocumentRow(updated.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити документ.' });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filesResult = await pool.query('SELECT file_path FROM document_files WHERE document_id = $1', [id]);
    await pool.query('DELETE FROM document_files WHERE document_id = $1', [id]);
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
    await cleanupUploadedFiles(filesResult.rows.map((row) => row.file_path));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити документ.' });
  }
});

app.get('/api/regions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.name, r.photo, r.banner, r.president, r.president_photo, r.website,
        COALESCE(
          json_agg(json_build_object(
            'id', c.id,
            'name', c.name,
            'photo', c.photo,
            'city', c.city,
            'gym_addresses', c.gym_addresses,
            'trainers', c.trainers,
            'contacts', c.contacts
          ) ORDER BY c.name, c.id)
          FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS clubs_dyussh,
        r.created_at, r.updated_at
       FROM regions r
       LEFT JOIN clubs_dyussh c ON c.region_id = r.id
       GROUP BY r.id
       ORDER BY r.name ASC, r.id ASC`
    );
    res.json(result.rows.map(buildRegionRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні регіонів.' });
  }
});

app.get('/api/regions/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.name, r.photo, r.banner, r.president, r.president_photo, r.website,
        COALESCE(
          json_agg(json_build_object(
            'id', c.id,
            'name', c.name,
            'photo', c.photo,
            'city', c.city,
            'gym_addresses', c.gym_addresses,
            'trainers', c.trainers,
            'contacts', c.contacts
          ) ORDER BY c.name, c.id)
          FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS clubs_dyussh,
        r.created_at, r.updated_at
       FROM regions r
       LEFT JOIN clubs_dyussh c ON c.region_id = r.id
       WHERE r.id = $1
       GROUP BY r.id`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Регіон не знайдено.' });
    res.json(buildRegionRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні регіону.' });
  }
});

app.post('/api/regions', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'banner', maxCount: 1 }, { name: 'president_photo', maxCount: 1 }]), async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const photoFile = req.files?.photo?.[0];
    if (!name || !photoFile) return res.status(400).json({ message: 'Вкажіть назву регіону та додайте фото.' });
    const photo = `/uploads/regions/${photoFile.filename}`;
    const banner = req.files?.banner?.[0]
      ? `/uploads/regions/${req.files.banner[0].filename}`
      : null;
    const presidentPhoto = req.files?.president_photo?.[0]
      ? `/uploads/regions/${req.files.president_photo[0].filename}`
      : null;
    const website = req.body.website?.trim() || null;
    if (website && !/^https?:\/\//i.test(website)) {
      return res.status(400).json({ message: 'Посилання на сайт має починатися з http:// або https://.' });
    }
    const result = await pool.query(
      'INSERT INTO regions (name, photo, banner, president, president_photo, website) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, photo, banner, president, president_photo, website, clubs_dyussh, created_at, updated_at',
      [sanitizeText(name), photo, banner, req.body.president?.trim() ? sanitizeText(req.body.president) : null, presidentPhoto, website]
    );
    res.status(201).json(buildRegionRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити регіон.' });
  }
});

app.put('/api/regions/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'banner', maxCount: 1 }, { name: 'president_photo', maxCount: 1 }]), async (req, res) => {
  try {
    const currentResult = await pool.query('SELECT * FROM regions WHERE id = $1', [req.params.id]);
    if (!currentResult.rows.length) return res.status(404).json({ message: 'Регіон не знайдено.' });
    const current = currentResult.rows[0];
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: 'Вкажіть назву регіону.' });
    const newPhoto = req.files?.photo?.[0];
    const newBanner = req.files?.banner?.[0];
    const newPresidentPhoto = req.files?.president_photo?.[0];
    const photo = newPhoto ? `/uploads/regions/${newPhoto.filename}` : current.photo;
    let banner = newBanner ? `/uploads/regions/${newBanner.filename}` : current.banner;
    let presidentPhoto = newPresidentPhoto ? `/uploads/regions/${newPresidentPhoto.filename}` : current.president_photo;
    const website = req.body.website?.trim() || null;
    if (website && !/^https?:\/\//i.test(website)) {
      return res.status(400).json({ message: 'Посилання на сайт має починатися з http:// або https://.' });
    }
    if (req.body.remove_president_photo === 'true') presidentPhoto = null;
    if (req.body.remove_banner === 'true') banner = null;
    const result = await pool.query(
      'UPDATE regions SET name = $1, photo = $2, banner = $3, president = $4, president_photo = $5, website = $6, updated_at = now() WHERE id = $7 RETURNING id, name, photo, banner, president, president_photo, website, clubs_dyussh, created_at, updated_at',
      [sanitizeText(name), photo, banner, req.body.president?.trim() ? sanitizeText(req.body.president) : null, presidentPhoto, website, req.params.id]
    );
    await cleanupUploadedFiles([
      newPhoto ? current.photo : null,
      newBanner || req.body.remove_banner === 'true' ? current.banner : null,
      newPresidentPhoto || req.body.remove_president_photo === 'true' ? current.president_photo : null,
      newBanner ? `/uploads/regions/${newBanner.filename}` : null,
      newPresidentPhoto ? `/uploads/regions/${newPresidentPhoto.filename}` : null,
    ]);
    res.json(buildRegionRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити регіон.' });
  }
});

app.delete('/api/regions/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT photo, banner, president_photo FROM regions WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Регіон не знайдено.' });
    await pool.query('DELETE FROM regions WHERE id = $1', [req.params.id]);
    await cleanupUploadedFiles([result.rows[0].photo, result.rows[0].banner, result.rows[0].president_photo]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити регіон.' });
  }
});

app.get('/api/clubs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.photo, c.city, c.gym_addresses, c.trainers, c.contacts, c.region_id,
        r.name AS region_name, c.created_at, c.updated_at
       FROM clubs_dyussh c
       LEFT JOIN regions r ON r.id = c.region_id
       ORDER BY c.name ASC, c.id ASC`
    );
    res.json(result.rows.map(buildClubRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні клубів.' });
  }
});

app.get('/api/clubs/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.photo, c.city, c.gym_addresses, c.trainers, c.contacts, c.region_id,
        r.name AS region_name, c.created_at, c.updated_at
       FROM clubs_dyussh c
       LEFT JOIN regions r ON r.id = c.region_id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Клуб не знайдено.' });
    res.json(buildClubRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні клубу.' });
  }
});

function parseClubArray(value, fallback = []) {
  if (!value) return fallback;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function getClubFiles(files) {
  return (files || []).reduce((map, file) => {
    map[file.fieldname] = file;
    return map;
  }, {});
}

function buildClubTrainers(value, filesByField) {
  return parseClubArray(value).map((trainer) => {
    const name = sanitizeText(trainer.name || '').trim();
    if (!name) return null;
    const uploadedPhoto = trainer.photo_field ? filesByField[trainer.photo_field] : null;
    return {
      name,
      photo: uploadedPhoto ? `/uploads/clubs/${uploadedPhoto.filename}` : (trainer.photo || null),
    };
  }).filter(Boolean);
}

async function getClubPayload(req, current = null) {
  const filesByField = getClubFiles(req.files);
  const name = req.body.name?.trim();
  const photoFile = filesByField.photo;
  if (!name || (!current && !photoFile)) return { error: 'Вкажіть назву клубу та додайте фото.' };

  const regionId = req.body.region_id ? Number(req.body.region_id) : null;
  if (regionId !== null) {
    const region = await pool.query('SELECT id FROM regions WHERE id = $1', [regionId]);
    if (!region.rows.length) return { error: 'Обрана область не знайдена.' };
  }

  return {
    name: sanitizeText(name),
    photo: photoFile ? `/uploads/clubs/${photoFile.filename}` : current.photo,
    city: req.body.city?.trim() ? sanitizeText(req.body.city) : null,
    gymAddresses: parseClubArray(req.body.gym_addresses).map((address) => sanitizeText(address).trim()).filter(Boolean),
    trainers: buildClubTrainers(req.body.trainers, filesByField),
    contacts: parseClubArray(req.body.contacts).map((contact) => sanitizeText(contact).trim()).filter(Boolean),
    regionId,
    photoFile,
  };
}

app.post('/api/clubs', upload.any(), async (req, res) => {
  try {
    const payload = await getClubPayload(req);
    if (payload.error) return res.status(400).json({ message: payload.error });
    const result = await pool.query(
      `INSERT INTO clubs_dyussh (name, photo, city, gym_addresses, trainers, contacts, region_id)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7)
       RETURNING id, name, photo, city, gym_addresses, trainers, contacts, region_id, created_at, updated_at`,
      [payload.name, payload.photo, payload.city, JSON.stringify(payload.gymAddresses), JSON.stringify(payload.trainers), JSON.stringify(payload.contacts), payload.regionId]
    );
    res.status(201).json(buildClubRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити клуб.' });
  }
});

app.put('/api/clubs/:id', upload.any(), async (req, res) => {
  try {
    const currentResult = await pool.query('SELECT * FROM clubs_dyussh WHERE id = $1', [req.params.id]);
    if (!currentResult.rows.length) return res.status(404).json({ message: 'Клуб не знайдено.' });
    const current = currentResult.rows[0];
    const payload = await getClubPayload(req, current);
    if (payload.error) return res.status(400).json({ message: payload.error });
    const result = await pool.query(
      `UPDATE clubs_dyussh
      SET name = $1, photo = $2, city = $3, gym_addresses = $4::jsonb, trainers = $5::jsonb, contacts = $6::jsonb, region_id = $7, updated_at = now()
      WHERE id = $8
      RETURNING id, name, photo, city, gym_addresses, trainers, contacts, region_id, created_at, updated_at`,
          [payload.name, payload.photo, payload.city, JSON.stringify(payload.gymAddresses), JSON.stringify(payload.trainers), JSON.stringify(payload.contacts), payload.regionId, req.params.id]
    );
    const oldTrainerPhotos = (current.trainers || []).map((trainer) => trainer.photo).filter(Boolean);
    const newTrainerPhotos = payload.trainers.map((trainer) => trainer.photo).filter(Boolean);
    const obsoleteTrainerPhotos = oldTrainerPhotos.filter((photo) => !newTrainerPhotos.includes(photo));
    await cleanupUploadedFiles([payload.photoFile ? current.photo : null, ...obsoleteTrainerPhotos]);
    res.json(buildClubRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити клуб.' });
  }
});

app.delete('/api/clubs/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT photo, trainers FROM clubs_dyussh WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Клуб не знайдено.' });
    await pool.query('DELETE FROM clubs_dyussh WHERE id = $1', [req.params.id]);
    const trainerPhotos = (result.rows[0].trainers || []).map((trainer) => trainer.photo);
    await cleanupUploadedFiles([result.rows[0].photo, ...trainerPhotos]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити клуб.' });
  }
});

app.delete('/api/gallery/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT image_path FROM gallery_photos WHERE id = $1', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Фото не знайдено.' });
    }
    await pool.query('DELETE FROM gallery_photos WHERE id = $1', [id]);
    await cleanupUploadedFiles([result.rows[0].image_path]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити фото.' });
  }
});

// Competitions API
app.get('/api/competitions', async (req, res) => {
  try {
    const limitValue = Number(req.query.limit);
    const hasLimit = Number.isInteger(limitValue) && limitValue > 0;
    const params = [];
    let query = `SELECT c.id, c.title, c.cover_image, c.city, c.category, c.event_date, c.status, c.description, c.created_at, c.updated_at,
        COALESCE(json_agg(json_build_object('id', w.id, 'weight_name', w.weight_name, 'bracket_link', w.bracket_link) ORDER BY w.id) FILTER (WHERE w.id IS NOT NULL), '[]') AS weight_categories
       FROM competitions c
       LEFT JOIN competition_weight_categories w ON w.competition_id = c.id
       GROUP BY c.id`;

    if (hasLimit) {
      query += ' ORDER BY c.created_at DESC, c.id DESC LIMIT $1';
      params.push(limitValue);
    } else {
      query += ' ORDER BY c.event_date DESC, c.id DESC';
    }

    const result = await pool.query(query, params);
    res.json(result.rows.map(buildCompetitionRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні змагань.' });
  }
});

app.get('/api/competitions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.id, c.title, c.cover_image, c.city, c.category, c.event_date, c.status, c.description, c.created_at, c.updated_at,
        COALESCE(json_agg(json_build_object('id', w.id, 'weight_name', w.weight_name, 'bracket_link', w.bracket_link) ORDER BY w.id) FILTER (WHERE w.id IS NOT NULL), '[]') AS weight_categories
       FROM competitions c
       LEFT JOIN competition_weight_categories w ON w.competition_id = c.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Змагання не знайдено.' });
    }
    res.json(buildCompetitionRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні змагання.' });
  }
});

app.post('/api/competitions', upload.single('cover_image'), async (req, res) => {
  try {
    const { title, city, category, event_date, status, description, weight_categories } = req.body;
    
    if (!title || !city || !category || !event_date || !req.file) {
      return res.status(400).json({ message: 'Заповніть усі обов\'язкові поля та додайте обкладинку.' });
    }

    if (!['Ukraine', 'International'].includes(category)) {
      return res.status(400).json({ message: 'Неправильна категорія.' });
    }

    if (!['planned', 'live', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Неправильний статус.' });
    }

    const coverImage = `/uploads/competitions/${req.file.filename}`;
    const safeDescription = sanitizeContent(description || '');
    const eventDateObj = new Date(event_date);

    const result = await pool.query(
      'INSERT INTO competitions (title, cover_image, city, category, event_date, status, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, cover_image, city, category, event_date, status, description, created_at, updated_at',
      [sanitizeText(title), coverImage, sanitizeText(city), category, eventDateObj, status, safeDescription]
    );

    const competition = result.rows[0];
    let weights = [];

    if (weight_categories) {
      try {
        const categories = typeof weight_categories === 'string' ? JSON.parse(weight_categories) : weight_categories;
        if (Array.isArray(categories) && categories.length) {
          const weightResults = await Promise.all(
            categories.map((w) =>
              pool.query(
                'INSERT INTO competition_weight_categories (competition_id, weight_name, bracket_link) VALUES ($1, $2, $3) RETURNING id, weight_name, bracket_link',
                [competition.id, sanitizeText(w.weight_name), w.bracket_link || null]
              )
            )
          );
          weights = weightResults.map((r) => r.rows[0]);
        }
      } catch (e) {
        console.error('Error parsing weight categories:', e);
      }
    }

    competition.weight_categories = weights;
    res.status(201).json(buildCompetitionRow(competition));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити змагання.' });
  }
});

app.put('/api/competitions/:id', upload.single('cover_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, city, category, event_date, status, description, weight_categories, deleted_weight_ids } = req.body;

    const current = await pool.query('SELECT cover_image FROM competitions WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ message: 'Змагання не знайдено.' });
    }

    if (category && !['Ukraine', 'International'].includes(category)) {
      return res.status(400).json({ message: 'Неправильна категорія.' });
    }

    if (status && !['planned', 'live', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Неправильний статус.' });
    }

    const coverImage = req.file ? `/uploads/competitions/${req.file.filename}` : current.rows[0].cover_image;

    const safeDescription = sanitizeContent(description || '');
    const eventDateObj = event_date ? new Date(event_date) : null;

    const result = await pool.query(
      'UPDATE competitions SET title = $1, cover_image = $2, city = $3, category = $4, event_date = $5, status = $6, description = $7, updated_at = now() WHERE id = $8 RETURNING id, title, cover_image, city, category, event_date, status, description, created_at, updated_at',
      [sanitizeText(title), coverImage, sanitizeText(city), category, eventDateObj, status, safeDescription, id]
    );
    if (req.file) await cleanupUploadedFiles([current.rows[0].cover_image]);

    const competition = result.rows[0];

    // Delete removed weight categories
    let toDelete = [];
    if (deleted_weight_ids) {
      try {
        toDelete = typeof deleted_weight_ids === 'string' ? JSON.parse(deleted_weight_ids) : deleted_weight_ids;
      } catch (e) {
        toDelete = String(deleted_weight_ids).split(',').map((v) => Number(v)).filter(Boolean);
      }
    }
    if (Array.isArray(toDelete) && toDelete.length) {
      await pool.query('DELETE FROM competition_weight_categories WHERE id = ANY($1::int[])', [toDelete]);
    }

    // Add/update weight categories
    let weights = [];
    if (weight_categories) {
      try {
        const categories = typeof weight_categories === 'string' ? JSON.parse(weight_categories) : weight_categories;
        if (Array.isArray(categories) && categories.length) {
          const weightResults = await Promise.all(
            categories.map((w) => {
              if (w.id) {
                // Update existing
                return pool.query(
                  'UPDATE competition_weight_categories SET weight_name = $1, bracket_link = $2 WHERE id = $3 RETURNING id, weight_name, bracket_link',
                  [sanitizeText(w.weight_name), w.bracket_link || null, w.id]
                );
              } else {
                // Insert new
                return pool.query(
                  'INSERT INTO competition_weight_categories (competition_id, weight_name, bracket_link) VALUES ($1, $2, $3) RETURNING id, weight_name, bracket_link',
                  [competition.id, sanitizeText(w.weight_name), w.bracket_link || null]
                );
              }
            })
          );
          weights = weightResults.map((r) => r.rows[0]);
        }
      } catch (e) {
        console.error('Error parsing weight categories:', e);
      }
    } else {
      // If no weight_categories sent, fetch existing ones
      const existingWeights = await pool.query(
        'SELECT id, weight_name, bracket_link FROM competition_weight_categories WHERE competition_id = $1 ORDER BY id',
        [id]
      );
      weights = existingWeights.rows;
    }

    competition.weight_categories = weights;
    res.json(buildCompetitionRow(competition));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити змагання.' });
  }
});

app.delete('/api/competitions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT cover_image FROM competitions WHERE id = $1', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Змагання не знайдено.' });
    }

    const coverPath = result.rows[0].cover_image;
    await pool.query('DELETE FROM competitions WHERE id = $1', [id]);

    await cleanupUploadedFiles([coverPath]);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити змагання.' });
  }
});

app.get('/api/calendar/years', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, year, pdf_file, created_at, updated_at FROM calendar_years ORDER BY year ASC');
    res.json(result.rows.map(buildCalendarYearRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні років календаря.' });
  }
});

app.post('/api/calendar/years', uploadPdf.single('pdf_file'), async (req, res) => {
  try {
    const { year } = req.body;
    const yearValue = Number(year);
    if (!Number.isInteger(yearValue) || yearValue < 1900) {
      return res.status(400).json({ message: 'Неправильний рік календаря.' });
    }

    const existing = await pool.query('SELECT year FROM calendar_years ORDER BY year DESC LIMIT 1');
    if (existing.rows.length) {
      const maxYear = existing.rows[0].year;
      if (yearValue !== maxYear + 1) {
        return res.status(400).json({ message: `Допустимий рік лише ${maxYear + 1}.` });
      }
    }

    const pdfFile = req.file ? `/uploads/calendar/years/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO calendar_years (year, pdf_file) VALUES ($1, $2) RETURNING id, year, pdf_file, created_at, updated_at',
      [yearValue, pdfFile]
    );
    res.status(201).json(buildCalendarYearRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити рік календаря.' });
  }
});

app.put('/api/calendar/years/:id', uploadPdf.single('pdf_file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { year, remove_pdf } = req.body;
    const yearValue = Number(year);

    const current = await pool.query('SELECT year, pdf_file FROM calendar_years WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ message: 'Рік календаря не знайдено.' });
    }

    const currentRow = current.rows[0];
    if (!Number.isInteger(yearValue) || yearValue < 1900) {
      return res.status(400).json({ message: 'Неправильний рік календаря.' });
    }

    const duplicateCheck = await pool.query('SELECT id FROM calendar_years WHERE year = $1 AND id <> $2', [yearValue, id]);
    if (duplicateCheck.rows.length) {
      return res.status(400).json({ message: 'Такий рік вже існує.' });
    }

    let pdfFile = currentRow.pdf_file;
    if (req.file) {
      pdfFile = `/uploads/calendar/years/${req.file.filename}`;
    } else if (remove_pdf === 'true') {
      pdfFile = null;
    }

    const result = await pool.query(
      'UPDATE calendar_years SET year = $1, pdf_file = $2, updated_at = now() WHERE id = $3 RETURNING id, year, pdf_file, created_at, updated_at',
      [yearValue, pdfFile, id]
    );
    if (req.file || remove_pdf === 'true') await cleanupUploadedFiles([currentRow.pdf_file]);
    res.json(buildCalendarYearRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити рік календаря.' });
  }
});

app.delete('/api/calendar/years/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await pool.query('SELECT pdf_file FROM calendar_years WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ message: 'Рік календаря не знайдено.' });
    }

    const events = await pool.query('SELECT regulation_pdf FROM calendar_events WHERE calendar_year_id = $1', [id]);
    const files = [current.rows[0].pdf_file, ...events.rows.map((event) => event.regulation_pdf)];
    await pool.query('DELETE FROM calendar_years WHERE id = $1', [id]);
    await cleanupUploadedFiles(files);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити рік календаря.' });
  }
});

app.get('/api/calendar/:year', async (req, res) => {
  try {
    const yearValue = Number(req.params.year);
    if (!Number.isInteger(yearValue)) {
      return res.status(400).json({ message: 'Невірний рік.' });
    }

    const yearResult = await pool.query('SELECT id, year, pdf_file FROM calendar_years WHERE year = $1', [yearValue]);
    if (!yearResult.rows.length) {
      return res.status(404).json({ message: 'Календар не знайдено.' });
    }

    const yearRow = yearResult.rows[0];
    const eventsResult = await pool.query(
      `SELECT id, calendar_year_id, title, event_type, start_date, end_date, location, regulation_pdf, results_url, description, cancelled, created_at, updated_at
       FROM calendar_events
       WHERE calendar_year_id = $1
       ORDER BY COALESCE(start_date, end_date, created_at) ASC`,
      [yearRow.id]
    );

    const monthsMap = new Map();
    eventsResult.rows.forEach((row) => {
      const event = buildCalendarEventRow(row);
      const monthKey = getMonthName(row.start_date) || 'ІНШІ';
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, { month: monthKey, events: [] });
      }
      monthsMap.get(monthKey).events.push(event);
    });

    const months = Array.from(monthsMap.values());

    res.json({
      year: yearRow.year,
      pdf_url: yearRow.pdf_file,
      months,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні календаря.' });
  }
});

app.get('/api/calendar/events/search', async (req, res) => {
  try {
    const { q = '', year } = req.query;
    const filters = [];
    const params = [];
    let query = `SELECT e.id, e.calendar_year_id, e.title, e.event_type, e.start_date, e.end_date, e.location, e.regulation_pdf, e.results_url, e.description, e.cancelled, c.year
      FROM calendar_events e
      JOIN calendar_years c ON e.calendar_year_id = c.id`;

    if (q.trim()) {
      params.push(`%${q.trim()}%`);
      params.push(`%${q.trim()}%`);
      filters.push('(e.title ILIKE $' + params.length + ' OR e.location ILIKE $' + (params.length - 1) + ')');
    }

    if (year) {
      const yearValue = Number(year);
      if (Number.isInteger(yearValue)) {
        params.push(yearValue);
        filters.push('c.year = $' + params.length);
      }
    }

    if (filters.length) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    query += ' ORDER BY c.year DESC, COALESCE(e.start_date, e.end_date, e.created_at) DESC';

    const result = await pool.query(query, params);
    const events = result.rows.map((row) => ({ ...buildCalendarEventRow(row), year: row.year }));
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка пошуку подій.' });
  }
});

app.get('/api/calendar/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.id, e.calendar_year_id, e.title, e.event_type, e.start_date, e.end_date, e.location, e.regulation_pdf, e.results_url, e.description, e.cancelled, c.year
       FROM calendar_events e
       JOIN calendar_years c ON e.calendar_year_id = c.id
       WHERE e.id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Подію не знайдено.' });
    }
    const event = buildCalendarEventRow(result.rows[0]);
    event.year = result.rows[0].year;
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера при завантаженні події.' });
  }
});

app.post('/api/calendar/events', uploadPdf.single('regulation_pdf'), async (req, res) => {
  try {
    const {
      title,
      event_type,
      start_date,
      end_date,
      location,
      results_url,
      description,
      cancelled,
      calendar_year_id,
    } = req.body;

    if (!title || !event_type || !calendar_year_id) {
      return res.status(400).json({ message: 'Назва, тип та рік календаря обов’язкові.' });
    }

    const validTypes = ['міжнародне', 'національне', 'чемпіонат'];
    if (!validTypes.includes(event_type)) {
      return res.status(400).json({ message: 'Неправильний тип події.' });
    }

    const yearResult = await pool.query('SELECT id FROM calendar_years WHERE id = $1', [calendar_year_id]);
    if (!yearResult.rows.length) {
      return res.status(400).json({ message: 'Рік календаря не знайдено.' });
    }

    const regulationPdf = req.file ? `/uploads/calendar/events/${req.file.filename}` : null;
    const startDateObj = start_date ? new Date(start_date) : null;
    const endDateObj = end_date ? new Date(end_date) : null;

    const result = await pool.query(
      `INSERT INTO calendar_events (calendar_year_id, title, event_type, start_date, end_date, location, regulation_pdf, results_url, description, cancelled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, calendar_year_id, title, event_type, start_date, end_date, location, regulation_pdf, results_url, description, cancelled, created_at, updated_at`,
      [calendar_year_id, sanitizeText(title), event_type, startDateObj, endDateObj, sanitizeText(location), regulationPdf, sanitizeText(results_url), sanitizeText(description), cancelled === 'true']
    );

    res.status(201).json(buildCalendarEventRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити подію.' });
  }
});

app.put('/api/calendar/events/:id', uploadPdf.single('regulation_pdf'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      event_type,
      start_date,
      end_date,
      location,
      results_url,
      description,
      cancelled,
      calendar_year_id,
      remove_regulation,
    } = req.body;

    const current = await pool.query('SELECT * FROM calendar_events WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ message: 'Подію не знайдено.' });
    }

    if (!title || !event_type || !calendar_year_id) {
      return res.status(400).json({ message: 'Назва, тип та рік календаря обов’язкові.' });
    }

    const validTypes = ['міжнародне', 'національне', 'чемпіонат'];
    if (!validTypes.includes(event_type)) {
      return res.status(400).json({ message: 'Неправильний тип події.' });
    }

    const yearResult = await pool.query('SELECT id FROM calendar_years WHERE id = $1', [calendar_year_id]);
    if (!yearResult.rows.length) {
      return res.status(400).json({ message: 'Рік календаря не знайдено.' });
    }

    let regulationPdf = current.rows[0].regulation_pdf;
    if (req.file) {
      regulationPdf = `/uploads/calendar/events/${req.file.filename}`;
    } else if (remove_regulation === 'true') {
      regulationPdf = null;
    }

    const startDateObj = start_date ? new Date(start_date) : null;
    const endDateObj = end_date ? new Date(end_date) : null;

    const result = await pool.query(
      `UPDATE calendar_events
       SET calendar_year_id = $1, title = $2, event_type = $3, start_date = $4, end_date = $5,
             location = $6, regulation_pdf = $7, results_url = $8, description = $9, cancelled = $10, updated_at = now()
           WHERE id = $11
           RETURNING id, calendar_year_id, title, event_type, start_date, end_date, location, regulation_pdf, results_url, description, cancelled, created_at, updated_at`,
          [calendar_year_id, sanitizeText(title), event_type, startDateObj, endDateObj, sanitizeText(location), regulationPdf, sanitizeText(results_url), sanitizeText(description), cancelled === 'true', id]
    );

    if (req.file || remove_regulation === 'true') {
      await cleanupUploadedFiles([current.rows[0].regulation_pdf]);
    }
    res.json(buildCalendarEventRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити подію.' });
  }
});

app.delete('/api/calendar/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await pool.query('SELECT regulation_pdf FROM calendar_events WHERE id = $1', [id]);
    if (!current.rows.length) {
      return res.status(404).json({ message: 'Подію не знайдено.' });
    }
    const regulationPdf = current.rows[0].regulation_pdf;
    await pool.query('DELETE FROM calendar_events WHERE id = $1', [id]);
    await cleanupUploadedFiles([regulationPdf]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити подію.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не знайдено.' });
});

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Не вдалося підключитися до бази даних:', error);
    process.exit(1);
  });
