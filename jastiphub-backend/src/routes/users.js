import { requireUser } from '../security.js';
import { sendSuccess } from '../http.js';
import * as schema from '../validation.js';

export function registerUserRoutes(api, services) {
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
}
