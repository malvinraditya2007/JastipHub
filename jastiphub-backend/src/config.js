import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function configuration(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const host = env.HOST || (production ? '0.0.0.0' : '127.0.0.1');
  const port = Number(env.PORT || 5173);
  const origin = new URL(env.APP_ORIGIN || `http://127.0.0.1:${port}`).origin;
  const databaseHost = env.DB_HOST?.trim();
  const databaseUser = env.DB_USER?.trim();
  const databaseName = env.DB_NAME?.trim();
  if (!databaseHost || !databaseUser || !databaseName)
    throw new Error('Isi DB_HOST, DB_USER, DB_PASSWORD, dan DB_NAME di jastiphub-backend/.env.');
  const databasePort = Number(env.DB_PORT || 4000);
  if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535)
    throw new Error('DB_PORT harus nomor port antara 1 dan 65535.');
  const databaseSsl = env.DB_SSL ?? 'true';
  if (!['true', 'false'].includes(databaseSsl)) throw new Error('DB_SSL harus true atau false.');
  if (production && !origin.startsWith('https://'))
    throw new Error('APP_ORIGIN production wajib HTTPS.');
  const cookieSameSite = env.COOKIE_SAME_SITE || 'lax';
  if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
    throw new Error('COOKIE_SAME_SITE harus lax, strict, atau none.');
  }
  if (cookieSameSite === 'none' && !production) {
    throw new Error('COOKIE_SAME_SITE=none memerlukan HTTPS dan NODE_ENV=production.');
  }
  const cloudinary = {
    cloud_name: env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: env.CLOUDINARY_API_KEY?.trim(),
    api_secret: env.CLOUDINARY_API_SECRET?.trim(),
  };
  const cloudinaryValues = Object.values(cloudinary);
  if (cloudinaryValues.some(Boolean) && !cloudinaryValues.every(Boolean)) {
    throw new Error(
      'Lengkapi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di .env.',
    );
  }
  return {
    production,
    port,
    host,
    origin,
    cookieSameSite,
    trustProxy: Number(env.TRUST_PROXY || 0),
    uploadDir: resolve(projectRoot, env.UPLOAD_DIR || 'storage/uploads'),
    cloudinary: cloudinaryValues.every(Boolean) ? cloudinary : null,
    database: {
      host: databaseHost,
      port: databasePort,
      user: databaseUser,
      password: env.DB_PASSWORD || '',
      database: databaseName,
      ssl: databaseSsl === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
    },
  };
}
