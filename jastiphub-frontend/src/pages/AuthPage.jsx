import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Art, Icon } from '../components/Art';
import { Brand } from '../components/Layout';
import { RecoveryDialog } from '../components/RecoveryDialog';
import { Button, Field, Loading, RequestError } from '../components/UI';
import { request } from '../services/api';
import { useApp } from '../services/store';
export function AuthPage({ register = false }) {
  const { authenticate, localPasswordReset, ready, error: bootError, boot, invalidate } = useApp();
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
        ['name', 'Nama lengkap', 'Nama lengkap'],
        ['handle', 'Username', 'Username'],
        ['password', 'Password', 'Password'],
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
        await request('/me/saved-trips/' + encodeURIComponent(loc.state.save), {
          method: 'PUT',
        });
        invalidate();
      }
      nav(target, {
        replace: true,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    if (authenticated) return complete();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    setError('');
    setBusy(true);
    try {
      const result = await authenticate(register ? 'register' : 'login', body);
      setAuthenticated(true);
      if (result.recoveryCode) setRecovery(result.recoveryCode);
      else await complete();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      className={twMerge(
        'grid min-h-[100svh] mobile:grid-cols-[1fr]! mobile:min-h-[100svh]! mobile:[align-content:start]! ' +
          (register
            ? 'grid-cols-[38.7%_1fr] [&_.auth-art_>_div]:py-[13%] [&_.auth-art_>_div]:px-[10%] [&_.auth-art_>_div]:[flex:1] [&_.auth-art_a]:text-[28px] [&_.auth-art_a]:font-extrabold [&_.auth-art_h2]:text-[length:clamp(26px,_2.35vw,_35px)] [&_.auth-art_h2]:leading-[1.5] [&_.auth-art_h2]:mt-[20%] [&_.auth-art_h2]:mx-0 [&_.auth-art_h2]:mb-[7%] [&_.auth-art_>_.art]:h-[42%] [&_.auth-art_>_.art]:min-h-55 [&_.auth-main]:py-[7%] [&_.auth-main]:px-[8%] [&_.auth-main_h1]:m-0 [&_.auth-main_form]:p-[25px] [&_.auth-main_form]:gap-5 [&_.auth-switch]:mb-0 laptop-fit:[&_.auth-main]:[padding-block:clamp(18px,_3svh,_32px)]! laptop-fit:[&_.auth-main_form]:p-[clamp(14px,_2.4svh,_24px)]! laptop-fit:[&_.auth-main_form]:gap-[clamp(8px,_1.6svh,_15px)]! laptop-fit:[&_.auth-art_>_div]:[padding-block:clamp(24px,_6svh,_60px)]! laptop-fit:[&_.auth-art_h2]:[margin-block:clamp(20px,_6svh,_60px)_clamp(12px,_3svh,_28px)]! laptop-fit:[&_.auth-art_>_.art]:min-h-0! laptop-short:[&_.auth-main_form]:grid-cols-[repeat(2,_minmax(0,_1fr))]! laptop-short:[&_.auth-main_form_>_:nth-child(n_+_3)]:[grid-column:1_/_-1]! laptop-compact:[&_.auth-main_form_>_.field:nth-child(3)]:[grid-column:auto]! laptop-compact:[&_.auth-main_form_>_.field:nth-child(4)]:[grid-column:auto]! tablet:[&_.auth-main_form]:p-5! mobile:[&_.auth-art]:flex-row! mobile:[&_.auth-art_>_div]:py-4.5! mobile:[&_.auth-art_>_div]:px-[6%]! mobile:[&_.auth-art_a]:text-[16px]! mobile:[&_.auth-art_h2]:text-[19px]! mobile:[&_.auth-art_h2]:my-1.5! mobile:[&_.auth-art_h2]:mx-0! mobile:[&_.auth-art_h2]:leading-[1.3]! mobile:[&_.auth-art_h2_br]:hidden! mobile:[&_.auth-art_>_.art]:w-[35%]! mobile:[&_.auth-art_>_.art]:h-auto! mobile:[&_.auth-art_>_.art]:min-h-0! mobile:[&_.auth-main]:py-7! mobile:[&_.auth-main]:px-[6%]!'
            : 'grid-cols-[45.1%_1fr] [&_.auth-art_>_.art]:absolute [&_.auth-art_>_.art]:inset-0 [&_.auth-art_>_div]:mt-auto [&_.auth-art_>_div]:relative [&_.auth-art_>_div]:[background:var(--color-deep)] [&_.auth-art_>_div]:min-h-[35.8%] [&_.auth-art_>_div]:py-[clamp(36px,_6vw,_90px)] [&_.auth-art_>_div]:px-[9%] laptop-fit:[&_.auth-main_h1]:mt-[clamp(18px,_4svh,_38px)]! laptop-fit:[&_.auth-art_>_div]:[padding-block:clamp(24px,_5svh,_50px)]! laptop-compact:[&_.auth-main_form]:grid-cols-[repeat(2,_minmax(0,_1fr))]! laptop-compact:[&_.auth-main_form_>_:not(.field)]:[grid-column:1_/_-1]! mobile:[&_.auth-art_>_.art]:left-[55%]! mobile:[&_.auth-art_>_div]:w-[60%]! mobile:[&_.auth-art_>_div]:min-h-35! mobile:[&_.auth-art_>_div]:py-[25px]! mobile:[&_.auth-art_>_div]:px-[6%]! mobile:[&_.auth-art_>_div_p:last-child]:hidden!'),
      )}
    >
      <aside className="auth-art [background:var(--color-deep)] text-white flex flex-col relative [&_p]:text-[#e9f5f1] [&_p]:mt-2.5 [&_p]:text-[14px] [&_h2]:text-[28px] mobile:min-h-[125px]! mobile:overflow-hidden! mobile:[&_h2]:text-[20px]! mobile:[&_p]:text-[11px]! mobile:[&_p]:my-[5px]! mobile:[&_p]:mx-0!">
        {register ? (
          <>
            <div>
              <Link to="/">JastipHub</Link>
              <h2 className="mobile:text-[22px]!">
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
              <h2 className="mobile:text-[22px]!">Perjalanan dimulai di sini.</h2>
              <p>Masuk untuk bicara langsung dengan jastiper.</p>
              <p>Temukan perjalanan menarik untuk titipan berikutnya.</p>
            </div>
          </>
        )}
      </aside>
      <section className="auth-main py-[clamp(45px,_7.5vw,_108px)] px-[clamp(25px,_8.5vw,_120px)] self-center [&_h1]:text-[31px] [&_h1]:mt-16 [&_form]:grid [&_form]:gap-6.5 [&_form]:mt-13 [&_form]:py-3.5 [&_form]:px-5.5 [&_.forgot]:[justify-self:end] laptop-fit:[padding-block:clamp(18px,_3svh,_32px)]! laptop-fit:[&_form]:mt-[clamp(16px,_3svh,_32px)]! laptop-fit:[&_form]:gap-[clamp(10px,_2svh,_18px)]! laptop-fit:[&_form]:[padding-block:0]! laptop-fit:[&_.field]:gap-[clamp(4px,_0.85svh,_8px)]! laptop-fit:[&_.field_input]:[padding-block:clamp(8px,_1.25svh,_12px)]! tablet:[padding-inline:7%]! tablet:[&_form]:[padding-inline:0]! mobile:py-7! mobile:px-[6%]! mobile:[&_h1]:text-[28px]! mobile:[&_h1]:mt-5! mobile:[&_form]:mt-5! mobile:[&_form]:gap-4.5! mobile:[&_.brand_.art]:w-[29px]! mobile:[&_.brand_.art]:h-[29px]!">
        {!register && <Brand />}
        <h1 className="mobile:text-[30px]!">
          {register ? 'Buat akun JastipHub' : 'Selamat datang lagi.'}
        </h1>
        <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
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
          <form
            onSubmit={submit}
            className={twMerge(
              register ? 'rounded-2xl border border-line bg-white overflow-hidden' : '',
            )}
          >
            {labels.map(([name, title, placeholder]) => (
              <Field key={name} label={title}>
                <span className="block relative [&_>_input]:pr-[45px] [&_>_button]:absolute [&_>_button]:right-3.5 [&_>_button]:top-[50%] [&_>_button]:[transform:translateY(-50%)] [&_>_.icon]:absolute [&_>_.icon]:right-3.5 [&_>_.icon]:top-[50%] [&_>_.icon]:[transform:translateY(-50%)]">
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
                    maxLength={name === 'name' ? 100 : name === 'phone' ? 30 : undefined}
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
              <Link
                className="forgot inline-flex items-center gap-2 text-brand font-bold text-left text-[13px] [&:hover]:[text-decoration:underline]"
                to="/reset-password"
              >
                Lupa password?
              </Link>
            )}
            {error && (
              <p
                className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
                role="alert"
              >
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
          </form>
        )}
        <div className="auth-switch [&_a:hover]:[text-decoration:underline] flex justify-center gap-5 text-[13px] text-muted mt-5 mx-0 mb-12 [&_a]:text-brand [&_a]:font-bold laptop-fit:[margin-block:clamp(12px,_2svh,_20px)]! mobile:mt-[15px]! mobile:mx-0! mobile:mb-5!">
          {register ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <Link to={(register ? '/login' : '/register') + loc.search} state={loc.state}>
            {register ? 'Masuk' : 'Daftar gratis'}
          </Link>
        </div>
        {!register && (
          <p className="hint text-[12px] mt-3.5 [&_.icon]:mr-[9px]">
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
