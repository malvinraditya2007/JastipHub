import { rateLimit } from 'express-rate-limit';

export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ data });
}

export function rateLimitRequests(limit, windowMs) {
  return rateLimit({
    limit,
    windowMs,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Coba lagi nanti.' },
      }),
  });
}
