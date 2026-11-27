export async function up(db) {
  const columns = await db.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'recovery_hash'`,
  );
  if (columns.length) await db.query('ALTER TABLE users DROP COLUMN recovery_hash');
}
