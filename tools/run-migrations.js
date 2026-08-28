const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const projectRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, 'Backend', '.env') });

const requestedMigrations = process.argv.slice(2);

if (!requestedMigrations.length || requestedMigrations.includes('--help') || requestedMigrations.includes('-h')) {
  console.log('Использование: npm run migrate -- 006 007');
  console.log('Также можно указывать полные имена SQL-файлов из папки migrations.');
  process.exit(requestedMigrations.length ? 0 : 1);
}

function resolveMigrationPath(value) {
  const fileName = /^\d{3}$/.test(value) ? fs.readdirSync(path.join(projectRoot, 'migrations')).find((file) => file.startsWith(`${value}_`) && file.endsWith('.sql')) : value;
  if (!fileName) {
    throw new Error(`Миграция не найдена: ${value}`);
  }
  const migrationPath = path.resolve(projectRoot, 'migrations', fileName);
  const migrationsRoot = path.resolve(projectRoot, 'migrations');
  if (!migrationPath.startsWith(`${migrationsRoot}${path.sep}`)) {
    throw new Error(`Недопустимый путь миграции: ${value}`);
  }
  return migrationPath;
}

async function run() {
  const migrationPaths = requestedMigrations.map(resolveMigrationPath);
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
    for (const migrationPath of migrationPaths) {
      console.log(`Запуск ${path.basename(migrationPath)}`);
      await client.query(fs.readFileSync(migrationPath, 'utf8'));
    }
    await client.query('COMMIT');
    console.log('Миграции успешно выполнены.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Миграции отменены:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('Не удалось подключиться к базе данных:', error.message);
  process.exitCode = 1;
});
