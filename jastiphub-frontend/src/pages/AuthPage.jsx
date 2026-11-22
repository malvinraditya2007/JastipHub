import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Art, Icon } from '../components/Art';
import { Brand } from '../components/Layout';
import { RecoveryDialog } from '../components/RecoveryDialog';
import { Button, Field, Loading, RequestError } from '../components/UI';
import { request } from '../services/api';
import { useApp } from '../services/store';

export function AuthPage({ register = false }) {
  const {
    authenticate,
    demoEnabled,
    localPasswordReset,
    ready,
    error: bootError,
    boot,
    invalidate,
  } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const next = params.get('next');
  let target = '/';
  try {
    const parsed = new URL(next || '/', window.location.origin);
    if (
      parsed.origin === window.location.origin &&
      !['/login', '/register'].includes(parsed.pathname)
    )
      target = parsed.pathname + parsed.search;
  } catch {
    /* Keep home for invalid destinations. */
  }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [recovery, setRecovery] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const labels = register
    ? [
        ['name', 'Nama lengkap', 'Aldo Pratama'],
        ['handle', 'Username', 'aldojastip'],
        ['password', 'Password', 'Minimal 8 karakter'],
        ['phone', 'Nomor WhatsApp', '+62 81234567890'],
      ]
    : [
        ['handle', 'Username', 'Username'],
        ['password', 'Password', 'Password'],
      ];
  async function complete() {
    setBusy(true);
    setError('');
    try {
      if (loc.state?.save) {
        await request('/me/saved-trips/' + encodeURIComponent(loc.state.save), { method: 'PUT' });
        invalidate();
      }
      nav(target, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function enter(action, body) {
    setError('');
    setBusy(true);
    try {
      const result = await authenticate(action, body);
      setAuthenticated(true);
      if (result.recoveryCode) setRecovery(result.recoveryCode);
      else await complete();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  function submit(e) {
    e.preventDefault();
    if (authenticated) return complete();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    return enter(register ? 'register' : 'login', values);
  }
  return (
    <main className={'auth ' + (register ? 'register' : 'login')}>
      <aside className="auth-art">
        {register ? (
          <>
            <div>
              <Link to="/">JastipHub</Link>
              <h2>
                Belanja dari trip
                <br />
                atau buat tripmu
                <br />
                sendiri.
              </h2>
              <p>Nggak perlu pilih role saat daftar.</p>
            </div>
            <Art name="register" />
          </>
        ) : (
          <>
            <Art name="login" />
            <div>
              <h2>Perjalanan dimulai di sini.</h2>
              <p>Masuk untuk bicara langsung dengan jastiper.</p>
              <p>Temukan perjalanan menarik untuk titipan berikutnya.</p>
            </div>
          </>
        )}
      </aside>
      <section className="auth-main">
        {!register && <Brand />}
        <h1>{register ? 'Buat akun JastipHub' : 'Selamat datang lagi.'}</h1>
        <p className="sub">
          {register
            ? localPasswordReset
              ? 'Daftar dengan username dan password.'
              : 'Daftar dengan username dan password, lalu simpan kode pemulihanmu.'
            : 'Masuk dengan username dan password untuk melanjutkan.'}
        </p>
        {!ready ? (
          <Loading />
        ) : bootError ? (
          <RequestError error={bootError} retry={boot} />
        ) : (
          <form onSubmit={submit} className={register ? 'panel' : ''}>
            {labels.map(([name, title, placeholder]) => (
              <Field key={name} label={title}>
                <span className="input-wrap">
                  <input
                    required
                    name={name}
                    type={
                      name === 'password'
                        ? show
                          ? 'text'
                          : 'password'
                        : name === 'phone'
                          ? 'tel'
                          : 'text'
                    }
                    autoComplete={
                      {
                        password: register ? 'new-password' : 'current-password',
                        name: 'name',
                        handle: 'username',
                        phone: 'tel',
                      }[name]
                    }
                    minLength={
                      name === 'password' && register ? 8 : name === 'handle' ? 3 : undefined
                    }
                    maxLength={
                      name === 'password'
                        ? 128
                        : name === 'handle'
                          ? 30
                          : name === 'name'
                            ? 100
                            : 30
                    }
                    pattern={name === 'handle' ? '[A-Za-z0-9_]{3,30}' : undefined}
                    placeholder={placeholder}
                    disabled={authenticated}
                  />
                  {name === 'password' && (
                    <button
                      type="button"
                      aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                      onClick={() => setShow(!show)}
                    >
                      <Icon name="eye" />
                    </button>
                  )}
                </span>
              </Field>
            ))}
            {!register && (
              <Link className="forgot text-btn" to="/reset-password">
                Lupa password?
              </Link>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy} icon="arrow">
              {busy
                ? 'Memproses…'
                : authenticated
                  ? 'Lanjutkan'
                  : register
                    ? 'Daftar Sekarang'
                    : 'Masuk'}
            </Button>
            {!register && demoEnabled && (
              <button
                type="button"
                disabled={busy}
                className="demo-link"
                onClick={() => enter('demo')}
              >
                Masuk akun demo Aldo
              </button>
            )}
          </form>
        )}
        <div className="auth-switch">
          {register ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <Link to={(register ? '/login' : '/register') + loc.search} state={loc.state}>
            {register ? 'Masuk' : 'Daftar gratis'}
          </Link>
        </div>
        {!register && (
          <p className="hint">
            <Icon name="shield" />
            Tidak ada pembayaran yang diproses di JastipHub.
          </p>
        )}
      </section>
      {recovery && (
        <RecoveryDialog code={recovery} onContinue={complete} error={error} busy={busy} />
      )}
    </main>
  );
}
