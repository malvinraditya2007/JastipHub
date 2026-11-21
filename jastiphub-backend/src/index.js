import { configuration } from './config.js';
import { database } from './database/connection.js';
import { createRepositories } from './database/repositories/index.js';
import { createApp } from './app.js';

const config = configuration();
const db = database(config.database);
const repositories = createRepositories(db);
let server;
let cleanup;
try {
  await repositories.system.ping();
  if (!(await repositories.system.hasMigrations()))
    throw new Error('Database belum dimigrasi. Jalankan npm run db:migrate.');
  const app = await createApp(db, config);
  server = app.listen(config.port, config.host, () =>
    console.log(
      `JastipHub API: http://${config.host}:${config.port} (${config.production ? 'production' : 'development'})`,
    ),
  );
  server.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
    void stop();
  });
  cleanup = setInterval(
    () =>
      repositories.sessions
        .deleteExpired()
        .catch((error) => console.error('Session cleanup:', error.code)),
    60 * 60000,
  );
  cleanup.unref();
} catch (error) {
  console.error(
    `Backend gagal dimulai: ${error.code || error.message}. Periksa konfigurasi MySQL di .env.`,
  );
  await db.close();
  process.exitCode = 1;
}
async function stop() {
  clearInterval(cleanup);
  if (server) await new Promise((resolve) => server.close(resolve));
  await db.close();
}
process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
