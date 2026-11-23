import { sendSuccess } from './http.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerUserRoutes } from './routes/users.js';
import { registerTripRoutes } from './routes/trips.js';
import { registerInteractionRoutes } from './routes/interactions.js';
import { registerMediaRoutes } from './routes/media.js';

export { SESSION_COOKIE } from './routes/auth.js';

export function registerRoutes(api, services, config) {
  api.get('/health', async (req, res) => sendSuccess(res, await services.health()));
  registerAuthRoutes(api, services, config);
  registerUserRoutes(api, services);
  registerTripRoutes(api, services);
  registerInteractionRoutes(api, services);
  registerMediaRoutes(api, services);
}
