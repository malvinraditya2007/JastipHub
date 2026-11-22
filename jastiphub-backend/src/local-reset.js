import { createHmac } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ApiError, missing } from './errors.js';
import { equal, token } from './security.js';

const cookie = 'jh_local_reset';
const duration = 30 * 60 * 1000;
const cookieOptions = { httpOnly: true, sameSite: 'strict', path: '/api/v1/auth' };

export async function writeLocalResetLauncher(config) {
  // The launcher stays next to SQLite, outside the frontend's public directory.
  const file = join(dirname(config.databasePath), '.jastiphub-local.html');
  const url = `${config.origin}/login#local-reset=${config.localResetKey}`;
  const html = `<!doctype html>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<title>Buka JastipHub Lokal</title>
<script>window.location.replace(${JSON.stringify(url)})</script>
<a href="${url}">Buka JastipHub</a>
`;
  await writeFile(file, html, { encoding: 'utf8', mode: 0o600 });
}

export function createLocalResetAccess(config) {
  const signingKey = token();
  const sign = (expires) => createHmac('sha256', signingKey).update(expires).digest('hex');

  function available(req) {
    return (
      Boolean(config.localResetKey) &&
      config.localPasswordReset &&
      req.socket.remoteAddress === '127.0.0.1'
    );
  }

  function unlocked(req) {
    const grant = req.cookies[cookie];
    if (!available(req) || typeof grant !== 'string' || !/^\d{13}\.[a-f0-9]{64}$/.test(grant)) {
      return false;
    }
    const [expires, signature] = grant.split('.');
    return Number(expires) > Date.now() && equal(signature, sign(expires));
  }

  function unlock(req, res) {
    if (!available(req)) throw missing();
    const key = req.body?.key;
    if (typeof key !== 'string' || key.length !== 64 || !equal(key, config.localResetKey)) {
      throw new ApiError(401, 'INVALID_LOCAL_LAUNCHER', 'Buka ulang file pembuka JastipHub lokal.');
    }
    const expires = String(Date.now() + duration);
    res.cookie(cookie, expires + '.' + sign(expires), cookieOptions);
  }

  return { unlocked, unlock };
}
