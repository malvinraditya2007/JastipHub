import mysql from 'mysql2/promise';

export function database(config) {
  const pool = mysql.createPool(config);
  const run = async (sql, values = [], connection = pool) =>
    (await connection.execute(sql, values))[0];
  return {
    pool,
    query: run,
    async transaction(fn) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const result = await fn((sql, values = []) => run(sql, values, connection));
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
    close: () => pool.end(),
  };
}
