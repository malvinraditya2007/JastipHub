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
      const result = await request('/auth/reset-password', {
        method: 'POST',
        body: values,
      });
      await boot();
      if (localPasswordReset) {
        setMessage(result.message);
        nav('/login', {
          replace: true,
        });
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
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7! max-w-190">
      <Brand />
      <div className="rounded-2xl border border-line bg-white overflow-hidden p-7.5 mt-7.5 [&_form]:grid [&_form]:gap-5 [&_form]:mt-[25px]">
        <h1 className="mobile:text-[30px]!">Atur ulang password</h1>
        {!ready ? (
          <Loading />
        ) : bootError ? (
          <RequestError error={bootError} retry={boot} />
        ) : (
          <>
            {needsLocalLauncher && (
              <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
                Buka aplikasi dari <code>jastiphub-backend/.data/.jastiphub-local.html</code> untuk
                mereset akun lokal.
              </p>
            )}
            {!localPasswordReset && (
              <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
                Gunakan kode pemulihan yang kamu simpan saat daftar.
              </p>
            )}
            <form onSubmit={submit}>
              <Field label="Username">
                <input name="handle" required autoComplete="username" />
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
                <input name="password" required type="password" autoComplete="new-password" />
              </Field>
              {error && (
                <p
                  className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
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
        <RecoveryDialog
          code={recovery}
          onContinue={() =>
            nav('/login', {
              replace: true,
            })
          }
        />
      )}
    </main>
  );
}
