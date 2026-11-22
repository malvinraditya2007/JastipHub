import { ApiError } from '../errors.js';

export function passwordChangeInput(body, minLength = 1) {
  const { handle, password } = body ?? {};
  const username = typeof handle === 'string' ? handle.trim().replace(/^@/, '').toLowerCase() : '';
  if (!username || username.length > 30) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Masukkan username yang valid.');
  }
  if (typeof password !== 'string' || password.length < minLength || password.length > 128) {
    throw new ApiError(422, 'VALIDATION_ERROR', `Password baru harus ${minLength}–128 karakter.`);
  }
  return { handle: username, password };
}
