import { twMerge } from 'tailwind-merge';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useApp } from '../services/store';
import { Icon } from './Art';

const buttonKinds = {
  primary: 'primary bg-brand text-white [&:hover]:[background:#04564e]',
  white: 'white bg-white text-deep [&:hover]:[background:#d9ece5]',
  light: 'light bg-sage text-deep [&:hover]:[background:#d9ece5]',
  muted: 'muted [background:#f4f1ee] text-muted [&:hover]:[background:#d9ece5]',
};

export function Button({ to, kind = 'primary', icon, children, className = '', ...props }) {
  const attrs = {
    className: twMerge(
      'btn inline-flex items-center justify-center gap-2 rounded-[11px] font-bold text-sm min-h-10 py-2 px-5.5 [transition:background_0.15s,_color_0.15s] leading-[1.25] text-center',
      buttonKinds[kind],
      className,
    ),
    ...props,
  };
  const content = (
    <>
      {icon && <Icon name={icon} />}
      {children}
    </>
  );
  return to ? (
    <Link {...attrs} to={to}>
      {content}
    </Link>
  ) : (
    <button type="button" {...attrs}>
      {content}
    </button>
  );
}

export function BackButton({
  fallback = '/',
  fallbackLabel = 'Explore',
  className = '',
  disabled = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  // React Router counts only entries inside this app, unlike history.length.
  const canGoBack = window.history.state?.idx > 0;
  const label = canGoBack ? 'Kembali' : 'Kembali ke ' + fallbackLabel;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        canGoBack ? navigate(-1) : navigate(fallback, { replace: true, state: location.state })
      }
      aria-label={canGoBack ? 'Kembali ke halaman sebelumnya' : label}
      className={twMerge(
        'group inline-flex min-h-11 items-center gap-2.5 rounded-full pr-3 text-sm font-semibold text-muted transition-colors hover:text-brand active:text-deep disabled:pointer-events-none mobile:text-xs',
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white transition-[background-color,border-color,transform] group-hover:border-brand/30 group-hover:bg-sage group-active:scale-95">
        <Icon
          name="chevron"
          size={16}
          className="rotate-180 transition-transform group-hover:-translate-x-0.5"
        />
      </span>
      {label}
    </button>
  );
}

export function Dialog({ title, children, onClose, subtitle }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const old = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      el.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="fixed inset-0 m-auto w-[min(550px,_calc(100%_-_28px))] max-h-[90svh] text-ink [border:0] rounded-[17px] [background:white] [box-shadow:0_20px_80px_#19233133] [&::backdrop]:[background:#151f2a70]"
    >
      <div className="p-7 [&_>_.sub]:mb-6 [&_.inline-person]:my-5.5 [&_.inline-person]:mx-0 [&_.form-grid]:mt-5 mobile:p-5! mobile:[&_.form-grid]:grid-cols-[1fr]! mobile:[&_.actions_.btn]:[padding-inline:13px]!">
        <h2 className="mobile:text-[22px]!">{title}</h2>
        {subtitle && <p className="sub text-[14px] mt-2 mobile:text-[13px]!">{subtitle}</p>}
        {children}
      </div>
    </dialog>
  );
}
export function Gate({ children }) {
  const { user, ready, error, boot } = useApp();
  const loc = useLocation();
  if (!ready)
    return (
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
        <Loading label="Menyiapkan akunmu…" />
      </main>
    );
  if (error)
    return (
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
        <RequestError error={error} retry={boot} />
      </main>
    );
  return user ? (
    children
  ) : (
    <Navigate replace to={'/login?next=' + encodeURIComponent(loc.pathname + loc.search)} />
  );
}
const loadingTips = [
  'Periksa tanggal perjalanan dan biaya jastip sebelum menitip barang.',
  'Tanyakan ketersediaan produk dan total biaya lewat WhatsApp jastiper.',
  'Simpan trip yang menarik supaya mudah ditemukan lagi di My Trips.',
];

function SkeletonLine({ className = '' }) {
  return <span className={twMerge('loading-skeleton block h-3 rounded-full', className)} />;
}

function LoadingSkeleton({ variant }) {
  if (variant === 'compact') return null;
  if (variant === 'profile')
    return (
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-white p-7">
        <SkeletonLine className="size-24 shrink-0 rounded-full" />
        <div className="grid flex-1 gap-4 min-w-40">
          <SkeletonLine className="h-6 w-3/5" />
          <SkeletonLine className="w-2/5" />
          <SkeletonLine className="h-8 w-28" />
        </div>
      </div>
    );
  if (variant === 'detail')
    return (
      <div className="grid gap-5">
        <SkeletonLine className="h-8 w-2/5" />
        <SkeletonLine className="w-3/5" />
        <div className="grid grid-cols-[2fr_1fr] gap-5 mobile:grid-cols-1">
          <SkeletonLine className="h-80 rounded-2xl mobile:h-52" />
          <div className="grid content-start gap-5 rounded-2xl border border-line bg-white p-6">
            <SkeletonLine className="h-8 w-1/2" />
            <SkeletonLine className="h-14" />
            <SkeletonLine className="w-4/5" />
            <SkeletonLine className="h-11 mt-6 rounded-xl" />
          </div>
        </div>
      </div>
    );
  const cards = variant === 'cards';
  return (
    <div className={cards ? 'grid gap-[19px] md:grid-cols-2 lg:grid-cols-3' : 'grid gap-4'}>
      {Array.from({ length: cards ? 3 : 2 }, (_, index) => (
        <div
          key={index}
          className={twMerge(
            'overflow-hidden rounded-2xl border border-line bg-white',
            !cards && 'flex',
          )}
        >
          <SkeletonLine
            className={cards ? 'h-32 rounded-none' : 'min-h-32 w-1/4 shrink-0 rounded-none'}
          />
          <div className="grid flex-1 gap-4 p-5">
            <SkeletonLine className="h-5 w-3/5" />
            <SkeletonLine className="w-4/5" />
            {cards && (
              <div className="flex items-center gap-3">
                <SkeletonLine className="size-10 shrink-0 rounded-full" />
                <SkeletonLine className="w-1/2" />
              </div>
            )}
            <SkeletonLine className={cards ? 'h-9 rounded-xl' : 'w-2/5'} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Loading({ variant = 'compact', label = 'Menyiapkan datamu…', onRetry }) {
  const [showTip, setShowTip] = useState(false);
  const [tip, setTip] = useState(0);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section className="my-4" aria-label="Memuat data">
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sage"
            aria-hidden="true"
          >
            <span className="loading-spinner size-5" />
          </span>
          <div role="status" aria-live="polite">
            <p className="text-sm font-bold text-ink">{label}</p>
            {slow && (
              <p className="text-xs mt-1">Masih mengambil data. Koneksi mungkin sedang lambat.</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {slow && onRetry && (
            <button
              type="button"
              className="text-xs font-bold text-brand underline"
              onClick={onRetry}
            >
              Coba lagi
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand py-2"
            aria-expanded={showTip}
            onClick={() => setShowTip((value) => !value)}
          >
            {showTip ? 'Tutup tips' : 'Tips titip aman'}
            <Icon name="down" size={14} className={showTip ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>
      {showTip && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#cfe6dc] bg-sage p-4">
          <p className="flex-1 min-w-40 text-sm text-deep" aria-live="polite">
            {loadingTips[tip]}
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand py-2"
            onClick={() => setTip((value) => (value + 1) % loadingTips.length)}
          >
            Tips berikutnya <Icon name="arrow" size={14} />
          </button>
        </div>
      )}
      <div aria-hidden="true">
        <LoadingSkeleton variant={variant} />
      </div>
    </section>
  );
}
export function RequestError({ error, retry }) {
  return (
    <div className="rounded-xl border border-line bg-white text-muted p-8 my-4.5 mx-0 [&_a]:text-brand [&_a]:font-bold">
      <p
        className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
        role="alert"
      >
        {error?.message || error}
      </p>
      {retry && (
        <Button kind="light" onClick={retry}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}
export function ResourceState({ resource, variant = 'list', label }) {
  if (resource.loading)
    return <Loading variant={variant} label={label} onRetry={resource.reload} />;
  if (resource.error)
    return resource.error.status === 404 ? (
      <Missing />
    ) : (
      <RequestError error={resource.error} retry={resource.reload} />
    );
  if (resource.refreshing)
    return (
      <p className="flex items-center gap-2 py-3 text-xs" role="status">
        <span className="loading-spinner size-3" aria-hidden="true" />
        Memperbarui data…
      </p>
    );
  return null;
}
export function Head({ title, subtitle, extra }) {
  return (
    <div className="page-head flex justify-between items-start gap-5 mb-18.5 [&_p]:text-[14px] [&_p]:mt-2 [&_.btn]:min-w-47.5 [&_.btn]:mt-[5px] tablet:mb-[45px]! mobile:flex-wrap! mobile:gap-3! mobile:mb-7.5! mobile:[&_.btn]:min-w-0! mobile:[&_p]:text-[13px]!">
      <div>
        <h1 className="mobile:text-[30px]!">{title}</h1>
        <p>{subtitle}</p>
      </div>
      {extra}
    </div>
  );
}
export function Empty({ children }) {
  return (
    <div className="rounded-xl border border-line bg-white text-muted p-8 my-4.5 mx-0 [&_a]:text-brand [&_a]:font-bold">
      {children}
    </div>
  );
}
export function Pagination({ meta, onPage }) {
  return meta?.pages > 1 ? (
    <div className="flex items-center justify-center gap-3.5 my-6 mx-0 flex-wrap">
      <Button kind="light" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        Sebelumnya
      </Button>
      <span>
        Halaman {meta.page} dari {meta.pages}
      </span>
      <Button kind="light" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>
        Berikutnya
      </Button>
    </div>
  ) : null;
}
export function Notices() {
  const { message, setMessage } = useApp();
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);
  return message ? (
    <div
      className="fixed bottom-5.5 left-[50%] [transform:translateX(-50%)] z-[10] flex gap-[15px] items-center py-3 px-4.5 rounded-[12px] text-white [background:var(--color-deep)] [box-shadow:0_4px_20px_#0002] w-max max-w-[92vw]"
      role="status"
    >
      {message}
      <button aria-label="Tutup pemberitahuan" onClick={() => setMessage('')}>
        ×
      </button>
    </div>
  ) : null;
}
export function useSave() {
  const { user, toggle } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  return (trip) => {
    if (user) toggle(trip);
    else
      nav('/login?next=' + encodeURIComponent(loc.pathname + loc.search), {
        state: {
          save: trip.id,
        },
      });
  };
}
export function Missing() {
  return (
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
      <Head title="Halaman tidak ditemukan." subtitle="Trip atau halaman ini tidak tersedia." />
      <Button to="/">Kembali ke Explore</Button>
    </main>
  );
}
export function Field({ label, children }) {
  return (
    <label className="field [&_span:first-child]:block grid gap-2.5 text-[14px] font-semibold [&_:is(input,_textarea,_output)]:w-full [&_:is(input,_textarea,_output)]:font-medium [&_textarea]:resize-y mobile:text-[13px]!">
      <span>{label}</span>
      {children}
    </label>
  );
}
