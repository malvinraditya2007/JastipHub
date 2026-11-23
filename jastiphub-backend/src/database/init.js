import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { configuration } from '../config.js';
import { database } from './connection.js';

export async function initDatabase(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(255) NOT NULL PRIMARY KEY,
    checksum CHAR(64) NOT NULL,
    applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  const directory = new URL('./migrations/', import.meta.url);
  const names = (await readdir(directory)).filter((name) => /\.(sql|js)$/.test(name)).sort();
  for (const name of names) {
    const source = (await readFile(new URL(name, directory), 'utf8')).replace(/\r\n/g, '\n');
    const checksum = createHash('sha256').update(source).digest('hex');
    const [previous] = await db.query('SELECT checksum FROM schema_migrations WHERE name = ?', [
      name,
    ]);
    if (previous) {
      if (previous.checksum !== checksum)
        throw new Error(`Migration ${name} sudah berubah setelah diterapkan.`);
      continue;
    }
    if (name.endsWith('.js')) {
      const { up } = await import(new URL(name, directory).href);
      await up(db);
    } else {
      // MySQL/TiDB DDL commits implicitly. Keep statements repeatable after a failed init.
      for (const statement of source
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)) {
        await db.query(statement);
      }
    }
    await db.query(
      'INSERT INTO schema_migrations (name, checksum) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name',
      [name, checksum],
    );
  }
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('/src/database/init.js')) {
  let db;
  try {
    db = database(configuration().database);
    await initDatabase(db);
    console.log('Inisialisasi database MySQL/TiDB selesai.');
  } catch (error) {
    console.error(`Inisialisasi database gagal: ${error.code || error.message}`);
    process.exitCode = 1;
  } finally {
    await db?.close();
  }
}
