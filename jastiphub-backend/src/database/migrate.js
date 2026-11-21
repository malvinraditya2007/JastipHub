import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export async function migrate(db) {
  // A named lock prevents two startup processes from applying migrations together.
  const connection = await db.pool.getConnection();
  let lockName;
  try {
    const [[{ databaseName }]] = await connection.query('SELECT DATABASE() AS databaseName');
    lockName = createHash('sha256')
      .update(databaseName + ':jastiphub:migrate')
      .digest('hex');
    const [[{ acquired }]] = await connection.execute('SELECT GET_LOCK(?, 30) AS acquired', [
      lockName,
    ]);
    if (acquired !== 1) throw new Error('Migration sedang berjalan. Coba lagi.');
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(100) PRIMARY KEY, checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);
    const directory = fileURLToPath(new URL('./migrations/', import.meta.url));
    for (const name of (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort()) {
      const sql = await readFile(`${directory}/${name}`, 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const [previous] = await connection.execute(
        'SELECT checksum FROM schema_migrations WHERE name = ?',
        [name],
      );
      if (previous.length) {
        if (previous[0].checksum !== checksum)
          throw new Error(`Migration ${name} sudah berubah setelah diterapkan.`);
        continue;
      }
      // MySQL DDL commits implicitly. Each statement is restart-safe (IF NOT EXISTS).
      for (const statement of sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean))
        await connection.query(statement);
      await connection.execute('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)', [
        name,
        checksum,
      ]);
    }
  } finally {
    if (lockName) await connection.execute('SELECT RELEASE_LOCK(?)', [lockName]).catch(() => {});
    connection.release();
  }
}
