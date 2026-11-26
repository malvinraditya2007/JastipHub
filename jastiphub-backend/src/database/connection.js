import { createPool } from 'mysql2/promise';

export function database(options) {
  const pool = createPool({
    ...options,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    decimalNumbers: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 100,
    connectTimeout: 10000,
    multipleStatements: false,
    typeCast(field, next) {
      if (field.type === 'DATE') return field.string();
      if (['DATETIME', 'TIMESTAMP'].includes(field.type)) {
        const value = field.string();
        return value ? value.replace(' ', 'T') + 'Z' : null;
      }
      return next();
    },
  });

  const initialized = new Set();
  pool.on('connection', (connection) => {
    const id = connection.threadId;
    initialized.delete(id);
    connection.once('end', () => initialized.delete(id));
  });

  async function acquire() {
    const connection = await pool.getConnection();
    if (initialized.has(connection.threadId)) return connection;
    try {
      await connection.query("SET time_zone = '+00:00'");
      initialized.add(connection.threadId);
      return connection;
    } catch (error) {
      connection.destroy();
      throw error;
    }
  }

  return {
    async query(sql, values = []) {
      const connection = await acquire();
      try {
        const [rows] = await connection.execute(sql, values);
        return rows;
      } finally {
        connection.release();
      }
    },
    async transaction(work) {
      const connection = await acquire();
      try {
        await connection.beginTransaction();
        const query = async (sql, values = []) => {
          const [rows] = await connection.execute(sql, values);
          return rows;
        };
        const result = await work(query);
        await connection.commit();
        return result;
      } catch (error) {
        try {
          await connection.rollback();
        } catch {
          connection.destroy();
        }
        throw error;
      } finally {
        connection.release();
      }
    },
    close: () => pool.end(),
  };
}
