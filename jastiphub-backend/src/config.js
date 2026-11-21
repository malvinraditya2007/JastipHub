import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function configuration(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const url = env.DATABASE_URL ? new URL(env.DATABASE_URL) : null;
  if (url && url.protocol !== 'mysql:') throw new Error('DATABASE_URL harus memakai mysql://.');
  const database = url ? decodeURIComponent(url.pathname.slice(1)) : env.DB_NAME || 'jastiphub';
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(database))
    throw new Error('DB_NAME harus 1–64 huruf, angka, atau underscore.');
  const ssl =
    env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: true,
          ...(env.DB_SSL_CA
            ? { ca: readFileSync(resolve(projectRoot, env.DB_SSL_CA), 'utf8') }
            : {}),
        }
      : undefined;
  const origin = new URL(env.APP_ORIGIN || 'http://127.0.0.1:5173').origin;
  if (production && !origin.startsWith('https://'))
    throw new Error('APP_ORIGIN production wajib HTTPS.');
  const cookieSameSite = env.COOKIE_SAME_SITE || 'lax';
  if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
    throw new Error('COOKIE_SAME_SITE harus lax, strict, atau none.');
  }
  if (cookieSameSite === 'none' && !production) {
    throw new Error('COOKIE_SAME_SITE=none memerlukan HTTPS dan NODE_ENV=production.');
  }
  return {
    production,
    port: Number(env.PORT || 3001),
    host: env.HOST || (production ? '0.0.0.0' : '127.0.0.1'),
    origin,
    cookieSameSite,
    demo: !production && env.ENABLE_DEMO === 'true',
    trustProxy: Number(env.TRUST_PROXY || 0),
    uploadDir: resolve(projectRoot, env.UPLOAD_DIR || '.data/uploads'),
    database: {
      host: url?.hostname || env.DB_HOST || '127.0.0.1',
      port: Number(url?.port || env.DB_PORT || 3306),
      user: url ? decodeURIComponent(url.username) : env.DB_USER || 'root',
      password: url ? decodeURIComponent(url.password) : env.DB_PASSWORD || '',
      database,
      ssl,
      charset: 'utf8mb4',
      timezone: 'Z',
      dateStrings: true,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 100,
      connectTimeout: 10000,
      multipleStatements: false,
    },
  };
}
