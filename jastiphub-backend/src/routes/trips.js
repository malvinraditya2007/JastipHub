import { ApiError } from '../errors.js';
import { requireUser } from '../security.js';
import { sendSuccess } from '../http.js';
import * as schema from '../validation.js';

export function registerTripRoutes(api, services) {
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
}
