import { createAuthService } from './auth-service.js';
import { createUserService } from './user-service.js';
import { createTripService } from './trip-service.js';
import { createInteractionService } from './interaction-service.js';
import { createMediaService } from './media-service.js';

export async function createServices(repositories, config) {
  return {
    auth: await createAuthService(repositories, config),
    users: createUserService(repositories),
    trips: createTripService(repositories),
    interactions: createInteractionService(repositories),
    media: createMediaService(repositories, config),
    async health() {
      await repositories.system.ping();
      return { status: 'ok', database: 'mysql' };
    },
  };
}
