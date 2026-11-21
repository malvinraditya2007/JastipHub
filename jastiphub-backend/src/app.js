import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { errorHandler, missing } from './errors.js';
import { browserProtection } from './security.js';
import { rateLimitRequests } from './http.js';
import { registerRoutes, SESSION_COOKIE } from './routes.js';
import { createRepositories } from './database/repositories/index.js';
import { createServices } from './services/index.js';
import { cors } from './cors.js';

export async function createApp(database, config) {
  const repositories = createRepositories(database);
  const services = await createServices(repositories, config);
  const app = express();

  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);
  app.use(
    helmet({
      contentSecurityPolicy: config.production
        ? {
            directives: {
              'img-src': ["'self'", 'data:', 'blob:'],
              'style-src': ["'self'", "'unsafe-inline'"],
              'upgrade-insecure-requests': [],
            },
          }
        : false,
      strictTransportSecurity: config.production ? undefined : false,
    }),
  );
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set('X-Request-Id', req.requestId);
    next();
  });
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  await mkdir(config.uploadDir, { recursive: true });
  app.use(
    '/uploads',
    express.static(config.uploadDir, {
      dotfiles: 'deny',
      index: false,
      immutable: true,
      maxAge: '1y',
      setHeaders(res) {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  const api = express.Router();
  app.use('/api/v1', api);
  api.use(cors(config));
  api.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  api.use(rateLimitRequests(600, 60000));
  api.use(async (req, res, next) => {
    const session = await services.auth.readSession(req.cookies[SESSION_COOKIE]);
    if (session) {
      req.session = session;
      req.user = { id: session.user_id };
    }
    next();
  });
  api.use(browserProtection(config));
  registerRoutes(api, services, config);

  api.use((req, res, next) => next(missing()));
  app.use((req, res, next) => next(missing()));
  app.use(errorHandler);
  return app;
}
