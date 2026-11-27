import { requireUser } from '../security.js';
import { sendSuccess, rateLimitRequests } from '../http.js';
import * as schema from '../validation.js';
import { SESSION_DURATION } from '../services/auth-service.js';

export const SESSION_COOKIE = 'jh_session';

export function registerAuthRoutes(api, services, config) {
  const cookieOptions = {
    httpOnly: true,
    secure: config.production,
    sameSite: config.cookieSameSite,
    path: '/',
  };
  const authLimit = rateLimitRequests(20, 15 * 60000);

  function sendLogin(res, result, status = 200) {
    const { sessionToken, ...data } = result;
    res.cookie(SESSION_COOKIE, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION });
    return sendSuccess(res, data, status);
  }

  api.get('/auth/session', async (req, res) =>
    sendSuccess(res, {
      user: req.user ? await services.users.getProfile(req.user.id, true) : null,
      csrfToken: req.session?.csrf_token || null,
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
  api.post('/auth/logout', requireUser, async (req, res) => {
    const result = await services.auth.logout(req.session.token_hash);
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    sendSuccess(res, result);
  });
}
