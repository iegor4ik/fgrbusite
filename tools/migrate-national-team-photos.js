const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const projectRoot = path.join(__dirname, '..');
const frontendRoot = path.join(projectRoot, 'Frontend');
const assetsRoot = path.resolve(frontendRoot, 'assets');
const dryRun = process.argv.includes('--dry-run');

dotenv.config({ path: path.join(projectRoot, 'Backend', '.env') });

function resolveAssetPath(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.startsWith('assets/')) {
    throw new Error(`Недопустимий шлях фото збірної: ${imagePath}`);
  }
  const resolvedPath = path.resolve(frontendRoot, imagePath);
  if (!resolvedPath.toLowerCase().startsWith(`${assetsRoot}${path.sep}`.toLowerCase())) {
    throw new Error(`Шлях фото виходить за межі каталогу assets: ${imagePath}`);
  }
  return resolvedPath;
}

function canonicalizeImagePath(imagePath) {
  if (typeof imagePath !== 'string') {
    throw new Error(`Недопустимий шлях фото збірної: ${imagePath}`);
  }
  return imagePath.replace(/["']+$/, '');
}

function getImageMimeType(buffer, imagePath) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  throw new Error(`Файл не є підтримуваним зображенням: ${imagePath}`);
}

async function run() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'root',
    password: process.env.PGPASSWORD || 'rootpassword',
    database: process.env.PGDATABASE || 'fgrbu_db',
  });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT id, image, photo_id
       FROM national_team_entries
       WHERE image LIKE 'assets/%'
       ORDER BY image, id
       FOR UPDATE`
    );
    const rawPathsByCanonical = new Map();
    for (const row of result.rows) {
      const canonicalPath = canonicalizeImagePath(row.image);
      if (!rawPathsByCanonical.has(canonicalPath)) rawPathsByCanonical.set(canonicalPath, new Set());
      rawPathsByCanonical.get(canonicalPath).add(row.image);
    }
    const imagePaths = [...rawPathsByCanonical.keys()];
    const photoIds = new Map();
    const images = new Map();
    const sourcePaths = new Map();

    for (const imagePath of imagePaths) {
      const sourcePath = resolveAssetPath(imagePath);
      if (fs.existsSync(sourcePath)) sourcePaths.set(imagePath, sourcePath);
      const existingPhoto = result.rows.find((row) =>
        canonicalizeImagePath(row.image) === imagePath && row.photo_id
      );
      if (existingPhoto) {
        photoIds.set(imagePath, existingPhoto.photo_id);
        continue;
      }

      if (!sourcePaths.has(imagePath)) {
        throw new Error(`Не знайдено файл фото для перенесення: ${imagePath}`);
      }
      const imageData = fs.readFileSync(sourcePath);
      const mimeType = getImageMimeType(imageData, imagePath);
      images.set(imagePath, { sourcePath, imageData, mimeType });
    }

    if (dryRun) {
      await client.query('ROLLBACK');
      console.log(`Перевірка пройдена: записів ${result.rows.length}, файлів для імпорту ${images.size}, на диску ${sourcePaths.size}.`);
      return;
    }

    for (const [imagePath, image] of images) {
      const photoResult = await client.query(
        'INSERT INTO national_team_photos (image_data, mime_type) VALUES ($1, $2) RETURNING id',
        [image.imageData, image.mimeType]
      );
      photoIds.set(imagePath, photoResult.rows[0].id);
    }

    for (const [imagePath, photoId] of photoIds) {
      await client.query(
        `UPDATE national_team_entries
         SET photo_id = $1
         WHERE image = ANY($2::text[]) AND photo_id IS DISTINCT FROM $1`,
        [photoId, [...rawPathsByCanonical.get(imagePath)]]
      );
    }
    await client.query('COMMIT');

    let deletedFiles = 0;
    for (const imagePath of imagePaths) {
      const sourcePath = sourcePaths.get(imagePath);
      if (sourcePath) {
        try {
          await fs.promises.unlink(sourcePath);
        } catch (error) {
          if (error.code !== 'ENOENT') {
            console.error(`Фото збережено в БД, але файл не вдалося видалити (${imagePath}):`, error);
            continue;
          }
        }
        deletedFiles++;
      }
      await pool.query(
        'UPDATE national_team_entries SET image = $1 WHERE image = ANY($2::text[]) AND photo_id = $3',
        ['', [...rawPathsByCanonical.get(imagePath)], photoIds.get(imagePath)]
      );
    }

    console.log(`Перенесено фото в БД: ${images.size}; видалено вихідних файлів: ${deletedFiles}.`);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Не вдалося відкотити транзакцію перенесення фото:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('Не вдалося перенести фото збірної:', error.message);
  process.exitCode = 1;
});
