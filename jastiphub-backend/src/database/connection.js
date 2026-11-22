import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function database(path) {
  mkdirSync(dirname(path), { recursive: true });
  const connection = new DatabaseSync(path, { timeout: 5000 });
  connection.function('fold_text', { deterministic: true }, (text) =>
    text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase(),
  );
  const query = (sql, values = []) => connection.prepare(sql).all(...values);

  // Keep other requests out of the connection while a transaction awaits its own work.
  let pending = Promise.resolve();
  function enqueue(work) {
    const result = pending.then(work);
    pending = result.catch(() => {});
    return result;
  }

  return {
    query: (sql, values) => enqueue(() => query(sql, values)),
    transaction(work) {
      return enqueue(async () => {
        connection.exec('BEGIN IMMEDIATE');
        try {
          const result = await work(query, (sql) => connection.exec(sql));
          connection.exec('COMMIT');
          return result;
        } catch (error) {
          if (connection.isTransaction) connection.exec('ROLLBACK');
          throw error;
        }
      });
    },
    close: () => enqueue(() => connection.close()),
  };
}
