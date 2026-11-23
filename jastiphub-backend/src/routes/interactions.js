import { requireUser } from '../security.js';
import { sendSuccess, rateLimitRequests } from '../http.js';
import * as schema from '../validation.js';

export function registerInteractionRoutes(api, services) {
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
}
