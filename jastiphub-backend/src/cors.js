import { ApiError } from './errors.js';
import { allowedAppOrigins } from './security.js';

// Hanya frontend yang dikonfigurasi boleh membaca API dengan cookie sesi.
export function cors(config) {
  const allowed = allowedAppOrigins(config);

  return (req, res, next) => {
    const origin = req.get('origin');
    res.vary('Origin');

    if (origin && !allowed.has(origin)) {
      throw new ApiError(403, 'INVALID_ORIGIN', 'Origin frontend tidak diizinkan.');
    }
    if (origin) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Expose-Headers', 'X-Request-Id, Retry-After');
    }
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-Token');
      res.set('Access-Control-Max-Age', '600');
      return res.sendStatus(204);
    }
    next();
  };
}
