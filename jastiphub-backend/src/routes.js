import multer from 'multer';
import { ApiError } from './errors.js';
import { requireUser } from './security.js';
import { sendSuccess, rateLimitRequests } from './http.js';
import { createLocalResetAccess } from './local-reset.js';
import { SESSION_DURATION } from './services/auth-service.js';
import { passwordChangeInput } from './utils/password-change.js';
import * as schema from './validation.js';

export const SESSION_COOKIE = 'jh_session';

function resetInput(body) {
  const { recoveryCode } = body ?? {};
  if (typeof recoveryCode !== 'string' || !recoveryCode.trim() || recoveryCode.length > 100) {
    throw new ApiError(422, 'INVALID_RECOVERY', 'Masukkan username dan kode pemulihan yang valid.');
  }
  return { ...passwordChangeInput(body, 8), recoveryCode };
}

export function registerRoutes(api, services, config) {
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

  // Status layanan dan autentikasi.
  api.get('/health', async (req, res) => sendSuccess(res, await services.health()));
  api.get('/auth/session', async (req, res) =>
    sendSuccess(res, {
      user: req.user ? await services.users.getProfile(req.user.id, true) : null,
      csrfToken: req.session?.csrf_token || null,
      demoEnabled: config.demo,
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
  api.post('/auth/demo', authLimit, async (req, res) => {
    sendLogin(res, await services.auth.demo(req.session?.token_hash));
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

  // Profil pribadi dan profil publik.
  api.get('/me', requireUser, async (req, res) =>
    sendSuccess(res, await services.users.getProfile(req.user.id, true)),
  );
  api.patch('/me', requireUser, async (req, res) =>
    sendSuccess(
      res,
      await services.users.updateProfile(req.user.id, schema.profile.parse(req.body)),
    ),
  );
  api.get('/users/:id', async (req, res) =>
    sendSuccess(res, await services.users.getProfile(schema.id.parse(req.params.id))),
  );
  api.get('/users/:id/reviews', async (req, res) => {
    const userId = schema.id.parse(req.params.id);
    const pagination = schema.listing.pick({ page: true, pageSize: true }).parse(req.query);
    res.json(await services.users.listReviews(userId, pagination));
  });

  // Pencarian, detail trip, dan editor trip.
  api.get('/destinations', async (req, res) =>
    sendSuccess(res, await services.trips.listDestinations()),
  );
  api.get('/trips', async (req, res) =>
    res.json(await services.trips.search(schema.listing.parse(req.query), req.user?.id)),
  );
  api.get('/me/trips', requireUser, async (req, res) =>
    sendSuccess(res, await services.trips.listOwned(req.user.id)),
  );
  api.get('/me/trips/:id', requireUser, async (req, res) =>
    sendSuccess(
      res,
      await services.trips.getTrip(schema.id.parse(req.params.id), req.user.id, true),
    ),
  );
  api.get('/trips/:id', async (req, res) =>
    sendSuccess(res, await services.trips.getTrip(schema.id.parse(req.params.id), req.user?.id)),
  );
  api.post('/trips', requireUser, async (req, res) => {
    const result = await services.trips.save(req.user.id, schema.tripInput.parse(req.body));
    sendSuccess(res, result.trip, result.created ? 201 : 200);
  });
  api.patch('/trips/:id', requireUser, async (req, res) => {
    const data = schema.tripInput.parse(req.body);
    if (data.id) throw new ApiError(422, 'IMMUTABLE_ID', 'ID trip tidak dapat diubah.');
    const result = await services.trips.save(req.user.id, data, schema.id.parse(req.params.id));
    sendSuccess(res, result.trip);
  });

  // Trip favorit.
  api.get('/me/saved-trips', requireUser, async (req, res) =>
    sendSuccess(res, await services.trips.listSaved(req.user.id)),
  );
  api.put('/me/saved-trips/:id', requireUser, async (req, res) =>
    sendSuccess(
      res,
      await services.trips.setSaved(req.user.id, schema.id.parse(req.params.id), true),
    ),
  );
  api.delete('/me/saved-trips/:id', requireUser, async (req, res) =>
    sendSuccess(
      res,
      await services.trips.setSaved(req.user.id, schema.id.parse(req.params.id), false),
    ),
  );

  // Kontak WhatsApp, ulasan, dan laporan.
  api.post('/trips/:id/contact', requireUser, rateLimitRequests(40, 60000), async (req, res) => {
    const tripId = schema.id.parse(req.params.id);
    const stopId = schema.id.optional().parse(req.body?.stopId);
    sendSuccess(res, await services.interactions.openContact(tripId, req.user.id, stopId));
  });
  api.get('/me/contacts', requireUser, async (req, res) =>
    sendSuccess(res, await services.interactions.listContacts(req.user.id)),
  );
  api.get('/trips/:id/review-eligibility', requireUser, async (req, res) => {
    const trip = await services.trips.getTrip(schema.id.parse(req.params.id), req.user.id);
    sendSuccess(res, await services.interactions.eligibility(trip, req.user.id));
  });
  api.post('/trips/:id/reviews', requireUser, async (req, res) => {
    const tripId = schema.id.parse(req.params.id);
    const data = schema.reviewInput.parse(req.body);
    sendSuccess(res, await services.interactions.saveReview(tripId, req.user.id, data), 201);
  });
  api.post('/reports', rateLimitRequests(10, 60 * 60000), async (req, res) =>
    sendSuccess(
      res,
      await services.interactions.report(req.user?.id, schema.reportInput.parse(req.body)),
      201,
    ),
  );

  // File diproses service; metadata file disimpan melalui repository.
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 1, parts: 2 },
  });
  api.post(
    '/uploads',
    requireUser,
    rateLimitRequests(20, 60000),
    upload.single('file'),
    async (req, res) => {
      const result = await services.media.upload(req.user.id, req.file, req.body?.purpose);
      sendSuccess(res, result, 201);
    },
  );
}
