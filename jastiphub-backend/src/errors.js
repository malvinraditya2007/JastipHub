import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    Object.assign(this, { status, code, fields });
  }
}
export const missing = () =>
  new ApiError(404, 'NOT_FOUND', 'Data tidak ditemukan atau tidak tersedia.');
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) {
    const fields = Object.fromEntries(
      error.issues.map((issue) => [issue.path.join('.'), issue.message]),
    );
    error = new ApiError(
      422,
      'VALIDATION_ERROR',
      Object.values(fields)[0] || 'Periksa data yang diisi.',
      fields,
    );
  } else if (error.code === 'ER_DUP_ENTRY') {
    error = new ApiError(
      409,
      'CONFLICT',
      'Username atau data ini sudah digunakan. Muat ulang lalu coba lagi.',
    );
  } else if (error.code === 'ER_LOCK_DEADLOCK' || error.code === 'ER_LOCK_WAIT_TIMEOUT') {
    error = new ApiError(409, 'CONFLICT', 'Data sedang diperbarui. Silakan coba lagi.');
  } else if (error.code === 'LIMIT_FILE_SIZE' || error.type === 'entity.too.large') {
    error = new ApiError(413, 'TOO_LARGE', 'Ukuran unggahan maksimal 5 MB.');
  } else if (error.name === 'MulterError') {
    error = new ApiError(422, 'INVALID_UPLOAD', 'Unggah tepat satu file gambar.');
  } else if (error instanceof SyntaxError && error.status === 400) {
    error = new ApiError(400, 'INVALID_JSON', 'Format request tidak valid.');
  }
  const status = error.status || 500;
  if (status >= 500)
    console.error(`[${req.requestId}] ${error.code || error.name}: ${error.message}`);
  res.status(status).json({
    error: {
      code: status >= 500 ? 'INTERNAL_ERROR' : error.code,
      message: status >= 500 ? 'Terjadi gangguan server. Silakan coba lagi.' : error.message,
      ...(error.fields ? { fields: error.fields } : {}),
      requestId: req.requestId,
    },
  });
}
