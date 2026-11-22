import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function configuration(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const host = env.HOST || (production ? '0.0.0.0' : '127.0.0.1');
  const port = Number(env.PORT || 5173);
  const origin = new URL(env.APP_ORIGIN || `http://127.0.0.1:${port}`).origin;
  const localPasswordReset =
    !production && host === '127.0.0.1' && origin === `http://127.0.0.1:${port}`;
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
    port,
    host,
    origin,
    cookieSameSite,
    demo: !production && (env.ENABLE_DEMO ?? String(host === '127.0.0.1')) === 'true',
    localPasswordReset,
    trustProxy: Number(env.TRUST_PROXY || 0),
    uploadDir: resolve(projectRoot, env.UPLOAD_DIR || '.data/uploads'),
    databasePath: resolve(projectRoot, env.DB_PATH || '.data/jastiphub.sqlite'),
  };
}
