import { configuration } from './config.js';
import { database } from './database/connection.js';
import { migrate } from './database/migrate.js';
const db = database(configuration().database);
try {
  await migrate(db);
  console.log('Migration MySQL selesai.');
} catch (error) {
  console.error(`Migration gagal: ${error.code || error.message}`);
  process.exitCode = 1;
} finally {
  await db.close();
}
