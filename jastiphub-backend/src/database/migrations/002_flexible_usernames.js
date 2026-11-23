import { usernameKey } from '../../utils/username.js';

export async function up(db) {
  const columns = await db.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
  );
  if (!columns.some((column) => column.name === 'handle_key')) {
    await db.query(
      'ALTER TABLE users ADD COLUMN handle_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL',
    );
  }

  const users = await db.query('SELECT id, handle FROM users WHERE handle_key IS NULL');
  for (const user of users) {
    await db.query('UPDATE users SET handle_key = ? WHERE id = ?', [
      usernameKey(user.handle),
      user.id,
    ]);
  }

  const indexes = await db.query(
    `SELECT DISTINCT INDEX_NAME AS name FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
  );
  if (!indexes.some((index) => index.name === 'users_handle_key_unique')) {
    await db.query('ALTER TABLE users ADD UNIQUE INDEX users_handle_key_unique (handle_key)');
  }
  if (indexes.some((index) => index.name === 'handle')) {
    await db.query('ALTER TABLE users DROP INDEX handle');
  }
  await db.query('ALTER TABLE users MODIFY COLUMN handle MEDIUMTEXT NOT NULL');
  await db.query(
    'ALTER TABLE users MODIFY COLUMN handle_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL',
  );
}
