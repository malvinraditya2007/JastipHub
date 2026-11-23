import multer from 'multer';
import { requireUser } from '../security.js';
import { sendSuccess, rateLimitRequests } from '../http.js';

export function registerMediaRoutes(api, services) {
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
