import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { ApiError } from './errors.js';

const scrypt = promisify(scryptCallback);
const parameters = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
export const token = () => randomBytes(32).toString('hex');
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const recoveryCode = () =>
  randomBytes(16).toString('hex').toUpperCase().match(/.{4}/g).join('-');
export const recoveryHash = (code) => sha256(code.replace(/[-\s]/g, '').toUpperCase());
export function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64, parameters);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [scheme, salt, hash] = encoded.split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const derived = await scrypt(password, salt, 64, parameters);
  return equal(derived.toString('hex'), hash);
}
export function requireUser(req, res, next) {
  if (!req.user) throw new ApiError(401, 'UNAUTHENTICATED', 'Silakan masuk terlebih dahulu.');
  next();
}
export function allowedAppOrigins(config) {
  const allowed = new Set([config.origin]);
  if (!config.production) {
    allowed.add('http://127.0.0.1:5173');
    allowed.add('http://localhost:5173');
  }
  return allowed;
}

export function browserProtection(config) {
  const allowed = allowedAppOrigins(config);
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (!allowed.has(req.get('origin')) || req.get('x-requested-with') !== 'JastipHub') {
      throw new ApiError(403, 'INVALID_ORIGIN', 'Request harus berasal dari aplikasi JastipHub.');
    }
    if (req.session && !equal(req.get('x-csrf-token'), req.session.csrf_token)) {
      throw new ApiError(403, 'CSRF_EXPIRED', 'Sesi berubah. Muat ulang halaman lalu coba lagi.');
    }
    next();
  };
}
