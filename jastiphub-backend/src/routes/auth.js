import { ApiError } from '../errors.js';
import { requireUser } from '../security.js';
import { sendSuccess, rateLimitRequests } from '../http.js';
import * as schema from '../validation.js';
import { createLocalResetAccess } from '../local-reset.js';
import { SESSION_DURATION } from '../services/auth-service.js';
import { passwordChangeInput } from '../utils/password-change.js';

export const SESSION_COOKIE = 'jh_session';

function resetInput(body) {
  const { recoveryCode } = body ?? {};
  if (typeof recoveryCode !== 'string' || !recoveryCode.trim() || recoveryCode.length > 100) {
    throw new ApiError(422, 'INVALID_RECOVERY', 'Masukkan username dan kode pemulihan yang valid.');
  }
  return { ...passwordChangeInput(body), recoveryCode };
}

export function registerAuthRoutes(api, services, config) {
  const cookieOptions = {
    httpOnly: true,
    secure: config.production,
    sameSite: config.cookieSameSite,
    path: '/',
  };
  const authLimit = rateLimitRequests(20, 15 * 60000);
  const localReset = createLocalResetAccess(config);

  function sendLogin(res, result, status = 200) {
    const { sessionToken, ...data } = result;
    res.cookie(SESSION_COOKIE, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION });
    return sendSuccess(res, data, status);
  }

  api.get('/auth/session', async (req, res) =>
    sendSuccess(res, {
      user: req.user ? await services.users.getProfile(req.user.id, true) : null,
      csrfToken: req.session?.csrf_token || null,
      localPasswordReset: config.localPasswordReset,
      localResetReady: localReset.unlocked(req),
    }),
  );
  api.post('/auth/register', authLimit, async (req, res) => {
    const result = await services.auth.register(
      schema.registration.parse(req.body),
      req.session?.token_hash,
    );
    sendLogin(res, result, 201);
  });
  api.post('/auth/login', authLimit, async (req, res) => {
    const result = await services.auth.login(schema.login.parse(req.body), req.session?.token_hash);
    sendLogin(res, result);
  });
  api.post('/auth/local-reset/unlock', rateLimitRequests(8, 15 * 60000), (req, res) => {
    localReset.unlock(req, res);
    sendSuccess(res, { unlocked: true });
  });
  api.post('/auth/reset-password', rateLimitRequests(8, 15 * 60000), async (req, res) => {
    if (config.localPasswordReset && !localReset.unlocked(req)) {
      throw new ApiError(403, 'LOCAL_RESET_LOCKED', 'Buka JastipHub dari file pembuka lokal.');
    }
    const result = config.localPasswordReset
      ? await services.auth.resetLocalPassword(passwordChangeInput(req.body))
      : await services.auth.resetPassword(resetInput(req.body));
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    sendSuccess(res, result);
  });
  api.post('/auth/logout', requireUser, async (req, res) => {
    const result = await services.auth.logout(req.session.token_hash);
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    sendSuccess(res, result);
  });
}
