import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useApp } from './store';
import { request } from './api';
import { Art, Icon } from './Art';
import { Brand, Button, Dialog, Field, Loading, RequestError } from './ui';

export function RecoveryDialog({ code, onContinue, error = '', busy = false }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          `Kode pemulihan JastipHub\n\n${code}\n\nSimpan secara pribadi. Kode ini dapat dipakai satu kali untuk mengganti password.\n`,
        ],
        { type: 'text/plain' },
      ),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jastiphub-kode-pemulihan.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <Dialog
      title="Simpan kode pemulihanmu"
      subtitle="Gunakan kode ini jika lupa password. Kode hanya ditampilkan sekarang dan diganti setelah digunakan."
      onClose={() => {}}
    >
      <code className="recovery-code" data-testid="recovery-code">
        {code}
      </code>
      <div className="actions">
        <Button
          kind="light"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setCopyError('');
            } catch {
              setCopyError(
                'Browser membatasi clipboard. Gunakan Unduh kode atau pilih dan salin kode secara manual.',
              );
            }
          }}
        >
          {copied ? 'Tersalin' : 'Salin kode'}
        </Button>
        <Button kind="light" onClick={download}>
          Unduh kode
        </Button>
      </div>
      {copyError && (
        <p className="hint" role="status">
          {copyError}
        </p>
      )}
      <label className="checkbox">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        Saya sudah menyimpan kode ini di tempat pribadi.
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <Button disabled={!saved || busy} onClick={onContinue}>
          {busy ? 'Memproses…' : 'Lanjutkan'}
        </Button>
      </div>
    </Dialog>
  );
}

export function Auth({ register = false }) {
  const { authenticate, demoEnabled, ready, error: bootError, boot, invalidate } = useApp();
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
            ? 'Daftar dengan username dan password, lalu simpan kode pemulihanmu.'
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

export function ResetPassword() {
  const { boot } = useApp();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await request('/auth/reset-password', { method: 'POST', body: values });
      setRecovery(result.recoveryCode);
      await boot();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page reset-page">
      <Brand />
      <div className="panel reset-panel">
        <h1>Atur ulang password</h1>
        <p className="sub">Masukkan username dan kode pemulihan yang kamu simpan saat daftar.</p>
        <form onSubmit={submit}>
          <Field label="Username">
            <input name="handle" required autoComplete="username" maxLength="30" />
          </Field>
          <Field label="Kode pemulihan">
            <input
              name="recoveryCode"
              required
              autoComplete="off"
              maxLength="100"
              spellCheck="false"
            />
          </Field>
          <Field label="Password baru">
            <input
              name="password"
              required
              type="password"
              minLength="8"
              maxLength="128"
              autoComplete="new-password"
            />
          </Field>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <Button kind="light" to="/login">
              Kembali ke Login
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Memproses…' : 'Simpan password baru'}
            </Button>
          </div>
        </form>
      </div>
      {recovery && (
        <RecoveryDialog code={recovery} onContinue={() => nav('/login', { replace: true })} />
      )}
    </main>
  );
}
