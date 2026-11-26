import { createServer } from 'node:http';
import { configuration } from './config.js';
import { database } from './database/connection.js';
import { initDatabase } from './database/init.js';
import { createRepositories } from './database/repositories/index.js';
import { createApp } from './app.js';
import { errorHandler, missing } from './errors.js';
import { writeLocalResetLauncher } from './local-reset.js';
import { token } from './security.js';
import { mountFrontend } from './web.js';

let db;
let server;
let vite;
let cleanup;
try {
  const settings = configuration();
  const config = { ...settings, localResetKey: settings.localPasswordReset ? token() : null };
  const dev = process.argv.includes('--dev');
  if (dev && config.production)
    throw new Error('Gunakan npm run build lalu npm start untuk production.');
  db = database(config.database);
  await initDatabase(db);
  const repositories = createRepositories(db);
  const app = await createApp(db, config);
  server = createServer(app);
  vite = await mountFrontend(app, server, dev);
  app.use((req, res, next) => next(missing()));
  app.use(errorHandler);

  server.listen(config.port, config.host, async () => {
    if (config.localResetKey) {
      try {
        await writeLocalResetLauncher(config);
      } catch {
        console.error('File pembuka JastipHub lokal gagal dibuat.');
      }
    }
    console.log(`JastipHub: http://${config.host}:${config.port}`);
  });
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
  console.error(`JastipHub gagal dimulai: ${error.message}`);
  await stop();
  process.exitCode = 1;
}
async function stop() {
  if (!db) return;
  const connection = db;
  db = undefined;
  clearInterval(cleanup);
  await vite?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await connection.close();
}
process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
