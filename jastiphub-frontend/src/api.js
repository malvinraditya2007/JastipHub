let csrfToken = null;
const backendOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function mediaUrl(path) {
  return path?.startsWith('/uploads/') ? backendOrigin + path : path;
}
export const setCsrfToken = (value) => {
  csrfToken = value;
};
export class ApiError extends Error {
  constructor(error, status) {
    super(error.message);
    Object.assign(this, error, { status });
  }
}
export async function request(path, { method = 'GET', body, signal, full = false } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), body instanceof FormData ? 45000 : 20000);
  const headers = { 'X-Requested-With': 'JastipHub' };
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  try {
    const response = await fetch(backendOrigin + '/api/v1' + path, {
      method,
      credentials: 'include',
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && !path.startsWith('/auth/'))
        window.dispatchEvent(new Event('jastiphub:session-expired'));
      throw new ApiError(
        json?.error || {
          code: 'SERVER_UNAVAILABLE',
          message: 'Server belum tersedia. Coba lagi sebentar.',
        },
        response.status,
      );
    }
    if (!json || !('data' in json))
      throw new ApiError(
        { code: 'INVALID_RESPONSE', message: 'Respons server belum sesuai. Coba lagi.' },
        502,
      );
    return full ? json : json.data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      {
        code: 'NETWORK_ERROR',
        message: controller.signal.aborted
          ? 'Server terlalu lama merespons. Data form tetap ada; silakan coba lagi.'
          : 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.',
      },
      0,
    );
  } finally {
    clearTimeout(timeout);
  }
}
