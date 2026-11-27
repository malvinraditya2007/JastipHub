import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { request, setCsrfToken } from './api';
import { createResourceCache } from './resource-cache';

const Context = createContext(null);
export const useApp = () => useContext(Context);

export function Store({ children }) {
  // State sesi dan notifikasi yang dipakai bersama oleh semua halaman.
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const [resourceCache] = useState(() => createResourceCache());
  // Mencegah request simpan favorit yang sama terkirim bersamaan.
  const locks = useRef(new Set());
  const invalidate = useCallback(() => {
    resourceCache.clear();
    setRevision((n) => n + 1);
  }, [resourceCache]);
  const boot = useCallback(async () => {
    setError('');
    setReady(false);
    try {
      const session = await request('/auth/session');
      setUser(session.user);
      setCsrfToken(session.csrfToken);
    } catch (error) {
      setError(error.message);
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    boot();
  }, [boot]);
  useEffect(() => {
    const expired = () => {
      setUser(null);
      setCsrfToken(null);
      invalidate();
      setMessage('Sesi berakhir. Silakan masuk kembali.');
    };
    window.addEventListener('jastiphub:session-expired', expired);
    return () => window.removeEventListener('jastiphub:session-expired', expired);
  }, [invalidate]);
  async function authenticate(action, body) {
    const data = await request('/auth/' + action, { method: 'POST', body });
    setUser(data.user);
    setCsrfToken(data.csrfToken);
    invalidate();
    return data;
  }
  async function logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (error) {
      if (error.status !== 401) throw error;
    }
    setUser(null);
    setCsrfToken(null);
    invalidate();
  }
  async function updateProfile(body) {
    const updated = await request('/me', { method: 'PATCH', body });
    setUser(updated);
    invalidate();
    return updated;
  }
  async function toggle(trip) {
    if (locks.current.has(trip.id)) return;
    locks.current.add(trip.id);
    try {
      await request('/me/saved-trips/' + trip.id, { method: trip.saved ? 'DELETE' : 'PUT' });
      invalidate();
      setMessage(trip.saved ? 'Trip dihapus dari simpanan.' : 'Trip tersimpan.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      locks.current.delete(trip.id);
    }
  }
  async function upload(file, purpose) {
    const form = new FormData();
    form.append('purpose', purpose);
    form.append('file', file);
    return request('/uploads', { method: 'POST', body: form });
  }
  async function saveTrip(tripForm, isNew) {
    const body = {
      ...(isNew ? { id: tripForm.id } : { version: tripForm.version }),
      city: tripForm.city,
      country: tripForm.country,
      start: tripForm.start || null,
      end: tripForm.end || null,
      type: tripForm.type,
      value: tripForm.value === '' || tripForm.value === null ? null : Number(tripForm.value),
      cover: tripForm.cover || null,
      status: tripForm.status,
      stops: tripForm.stores.map((name, index) => ({
        name,
        category: tripForm.categories?.[index] || '',
        dayOffset: tripForm.days?.[index] || 0,
      })),
    };
    const trip = await request(isNew ? '/trips' : '/trips/' + tripForm.id, {
      method: isNew ? 'POST' : 'PATCH',
      body,
    });
    invalidate();
    return trip;
  }
  return (
    <Context.Provider
      value={{
        user,
        ready,
        error,
        boot,
        revision,
        resourceCache,
        invalidate,
        authenticate,
        logout,
        updateProfile,
        toggle,
        upload,
        saveTrip,
        message,
        setMessage,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useResource(path, { full = false } = {}) {
  const { revision, user, ready, resourceCache } = useApp();
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify([user?.id || null, path, full]);
  const cached = path ? resourceCache.get(key) : null;
  const initial = {
    key,
    data: cached?.data ?? null,
    loading: !!path && !cached,
    refreshing: !!cached && !cached.fresh,
    error: null,
  };
  const [state, setState] = useState(initial);
  useEffect(() => {
    if (!path) {
      setState({ key, data: null, loading: false, refreshing: false, error: null });
      return;
    }
    if (!ready) return;
    const saved = resourceCache.get(key);
    if (saved?.fresh) {
      setState({ key, data: saved.data, loading: false, refreshing: false, error: null });
      return;
    }
    // Batalkan request lama ketika halaman atau filter berubah.
    const controller = new AbortController();
    const generation = resourceCache.generation;
    setState((previous) => {
      const data = saved?.data ?? (previous.key === key ? previous.data : null);
      return { key, data, loading: data === null, refreshing: data !== null, error: null };
    });
    request(path, { signal: controller.signal, full })
      .then((data) => {
        if (controller.signal.aborted) return;
        resourceCache.set(key, data, generation);
        setState({ key, data, loading: false, refreshing: false, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ key, data: null, loading: false, refreshing: false, error });
      });
    return () => controller.abort();
  }, [path, key, revision, retry, full, ready, resourceCache]);
  return {
    ...(state.key === key ? state : initial),
    reload: () => {
      resourceCache.delete(key);
      setRetry((n) => n + 1);
    },
  };
}
