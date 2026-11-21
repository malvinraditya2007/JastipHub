import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { request, setCsrfToken } from './api';

const Context = createContext(null);
export const useApp = () => useContext(Context);
export function Store({ children }) {
  // State sesi dan notifikasi yang dipakai bersama oleh semua halaman.
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const [demoEnabled, setDemoEnabled] = useState(false);
  // Mencegah request simpan favorit yang sama terkirim bersamaan.
  const locks = useRef(new Set());
  const invalidate = useCallback(() => setRevision((n) => n + 1), []);
  const boot = useCallback(async () => {
    setError('');
    setReady(false);
    try {
      const session = await request('/auth/session');
      setUser(session.user);
      setCsrfToken(session.csrfToken);
      setDemoEnabled(session.demoEnabled);
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
    await request('/auth/logout', { method: 'POST' });
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
        demoEnabled,
        revision,
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
  const { revision, user } = useApp();
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ data: null, loading: !!path, error: null });
  const identity = user?.id;
  useEffect(() => {
    if (!path) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    // Batalkan request lama ketika halaman atau filter berubah.
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    request(path, { signal: controller.signal, full })
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [path, revision, identity, retry, full]);
  return { ...state, reload: () => setRetry((n) => n + 1) };
}
