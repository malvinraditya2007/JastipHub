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

  async function acquire() {
    const connection = await pool.getConnection();
    try {
      await connection.query("SET time_zone = '+00:00'");
      return connection;
    } catch (error) {
      connection.release();
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
