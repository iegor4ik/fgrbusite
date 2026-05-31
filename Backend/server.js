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
fs.mkdirSync(NEWS_UPLOAD_ROOT, { recursive: true });
fs.mkdirSync(GALLERY_COVERS_ROOT, { recursive: true });
fs.mkdirSync(GALLERY_PHOTOS_ROOT, { recursive: true });
fs.mkdirSync(DOCUMENTS_ROOT, { recursive: true });
fs.mkdirSync(COMPETITIONS_ROOT, { recursive: true });

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'root',
  password: process.env.PGPASSWORD || 'rootpassword',
  database: process.env.PGDATABASE || 'fgrbu_db',
});

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

  await pool.query(`CREATE TABLE IF NOT EXISTS competition_weight_categories (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    weight_name TEXT NOT NULL,
    bracket_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`);
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

function sanitizeText(value) {
  return sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} });
}

function resolveUploadPath(urlPath) {
  return path.join(__dirname, '..', String(urlPath).replace(/^\/+/, ''));
}

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
    const current = await pool.query('SELECT cover_image FROM news WHERE id = $1', [id]);
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
    res.json(buildNewsRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося оновити новину.' });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT cover_image FROM news WHERE id = $1', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Новину не знайдено.' });
    }
    const coverPath = result.rows[0].cover_image;
    await pool.query('DELETE FROM news WHERE id = $1', [id]);
    if (coverPath) {
      fs.unlink(resolveUploadPath(coverPath), () => {});
    }
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
    if (coverFile && current.cover_image) {
      fs.unlink(resolveUploadPath(current.cover_image), () => {});
    }
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
    const coverPath = albumResult.rows[0].cover_image;
    if (coverPath) {
      fs.unlink(resolveUploadPath(coverPath), () => {});
    }
    photosResult.rows.forEach((photo) => {
      if (photo.image_path) {
        fs.unlink(resolveUploadPath(photo.image_path), () => {});
      }
    });
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
      delRows.rows.forEach((r) => { if (r.file_path) fs.unlink(resolveUploadPath(r.file_path), () => {}); });
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
    filesResult.rows.forEach((r) => { if (r.file_path) fs.unlink(resolveUploadPath(r.file_path), () => {}); });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити документ.' });
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
    fs.unlink(resolveUploadPath(result.rows[0].image_path), () => {});
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
    if (req.file && current.rows[0].cover_image) {
      fs.unlink(resolveUploadPath(current.rows[0].cover_image), () => {});
    }

    const safeDescription = sanitizeContent(description || '');
    const eventDateObj = event_date ? new Date(event_date) : null;

    const result = await pool.query(
      'UPDATE competitions SET title = $1, cover_image = $2, city = $3, category = $4, event_date = $5, status = $6, description = $7, updated_at = now() WHERE id = $8 RETURNING id, title, cover_image, city, category, event_date, status, description, created_at, updated_at',
      [sanitizeText(title), coverImage, sanitizeText(city), category, eventDateObj, status, safeDescription, id]
    );

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

    if (coverPath) {
      fs.unlink(resolveUploadPath(coverPath), () => {});
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося видалити змагання.' });
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
