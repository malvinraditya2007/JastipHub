import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export async function migrate(db) {
  const directory = new URL('./migrations/', import.meta.url);
  const names = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
  const migrations = await Promise.all(
    names.map(async (name) => {
      const sql = (await readFile(new URL(name, directory), 'utf8')).replace(/\r\n/g, '\n');
      const checksum = createHash('sha256').update(sql).digest('hex');
      return { name, sql, checksum };
    }),
  );

  await db.transaction((query, exec) => {
    exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT NOT NULL PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT`);

    for (const { name, sql, checksum } of migrations) {
      const [previous] = query('SELECT checksum FROM schema_migrations WHERE name = ?', [name]);
      if (previous) {
        if (previous.checksum !== checksum)
          throw new Error(`Migration ${name} sudah berubah setelah diterapkan.`);
        continue;
      }
      exec(sql);
      query('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)', [name, checksum]);
    }
  });
}
