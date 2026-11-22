import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Brand } from '../components/Layout';
import { RecoveryDialog } from '../components/RecoveryDialog';
import { Button, Field, Loading, RequestError } from '../components/UI';
import { request } from '../services/api';
import { useApp } from '../services/store';

export function ResetPasswordPage() {
  const {
    boot,
    ready,
    error: bootError,
    localPasswordReset,
    localResetReady,
    setMessage,
  } = useApp();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState('');
  const needsLocalLauncher = localPasswordReset && !localResetReady;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await request('/auth/reset-password', { method: 'POST', body: values });
      await boot();
      if (localPasswordReset) {
        setMessage(result.message);
        nav('/login', { replace: true });
      } else {
        setRecovery(result.recoveryCode);
      }
    } catch (error) {
      setError(error.message);
      if (error.code === 'LOCAL_RESET_LOCKED') await boot();
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page reset-page">
      <Brand />
      <div className="panel reset-panel">
        <h1>Atur ulang password</h1>
        {!ready ? (
          <Loading />
        ) : bootError ? (
          <RequestError error={bootError} retry={boot} />
        ) : (
          <>
            {needsLocalLauncher && (
              <p className="sub">
                Buka aplikasi dari <code>jastiphub-backend/.data/.jastiphub-local.html</code> untuk
                mereset akun lokal.
              </p>
            )}
            {!localPasswordReset && (
              <p className="sub">Gunakan kode pemulihan yang kamu simpan saat daftar.</p>
            )}
            <form onSubmit={submit}>
              <Field label="Username">
                <input name="handle" required autoComplete="username" maxLength="30" />
              </Field>
              {!localPasswordReset && (
                <Field label="Kode pemulihan">
                  <input
                    name="recoveryCode"
                    required
                    autoComplete="off"
                    maxLength="100"
                    spellCheck="false"
                  />
                </Field>
              )}
              <Field label="Password baru">
                <input
                  name="password"
                  required
                  type="password"
                  minLength={localPasswordReset ? undefined : 8}
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
                <Button type="submit" disabled={busy || needsLocalLauncher}>
                  {busy ? 'Memproses…' : 'Simpan password baru'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
      {recovery && (
        <RecoveryDialog code={recovery} onContinue={() => nav('/login', { replace: true })} />
      )}
    </main>
  );
}
