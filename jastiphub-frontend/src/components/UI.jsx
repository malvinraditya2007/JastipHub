import { twMerge } from 'tailwind-merge';
import { useEffect, useRef } from 'react';
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
        <Loading />
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
export function Loading() {
  return (
    <p className="py-7 px-0" role="status">
      Memuat data…
    </p>
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
export function ResourceState({ resource }) {
  if (resource.loading) return <Loading />;
  if (resource.error)
    return resource.error.status === 404 ? (
      <Missing />
    ) : (
      <RequestError error={resource.error} retry={resource.reload} />
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
