const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const regions = [
  ['АР Крим ФГРБ', '/assets/flags/Oblast/Flag_of_Crimea.svg.webp'],
  ['Дніпропетровська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Dnipropetrovsk_Oblast.svg.webp'],
  ['Донецька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Donetsk_Oblast.svg.webp'],
  ['Івано-Франківська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Ivano-Frankivsk_Oblast.svg.webp'],
  ['Харківська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kharkiv_Oblast.svg.webp'],
  ['Херсонська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kherson_Oblast.svg.webp'],
  ['Хмельницька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Khmelnytskyi_Oblast.svg.webp'],
  ['Кіровоградська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kirovohrad_Oblast.svg.webp'],
  ['Київська ФГРБ', '/assets/flags/Oblast/Flag_of_Kyiv_Kurovskyi.svg.webp'],
  ['Київська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kyiv_Oblast.svg.webp'],
  ['Луганська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Luhansk_Oblast.svg.webp'],
  ['Миколаївська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Mykolaiv_Oblast_(2026).svg.webp'],
  ['Одеська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Odesa_Oblast.svg.webp'],
  ['Полтавська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Poltava_Oblast.svg.webp'],
  ['Рівненська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Rivne_Oblast.svg.webp'],
  ['Сумська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Sumy_Oblast.svg.webp'],
  ['Тернопільська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Ternopil_Oblast.svg.webp'],
  ['Закарпатська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Transcarpathian_Oblast.svg.webp'],
  ['Вінницька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Vinnytsia_Oblast.svg.webp'],
  ['Волинська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Volhynian_Oblast.svg.webp'],
  ['Запорізька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Zaporizhia_Oblast.svg.webp'],
  ['Житомирська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Zhytomyr_Oblast.svg.webp'],
  ['Черкаська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Cherkasy_Oblast.svg.webp'],
];

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'root',
  password: process.env.PGPASSWORD || 'rootpassword',
  database: process.env.PGDATABASE || 'fgrbu_db',
});

async function seedRegions() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        photo TEXT NOT NULL,
        president TEXT,
        president_photo TEXT,
        clubs_dyussh JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    let inserted = 0;
    for (const [name, photo] of regions) {
      const result = await client.query(
        `INSERT INTO regions (name, photo)
         SELECT $1, $2
         WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = $1)
         RETURNING id`,
        [name, photo]
      );
      inserted += result.rowCount;
    }

    await client.query('COMMIT');
    console.log(`Regions checked: ${regions.length}; inserted: ${inserted}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedRegions().catch((error) => {
  console.error('Failed to seed regions:', error.message);
  process.exitCode = 1;
});
