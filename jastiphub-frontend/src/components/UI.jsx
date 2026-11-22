import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useApp } from '../services/store';
import { Icon } from './Art';

export function Button({ to, kind = 'primary', icon, children, className = '', ...props }) {
  const attrs = { className: 'btn ' + kind + ' ' + className, ...props };
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
    >
      <div className="dialog-body">
        <h2>{title}</h2>
        {subtitle && <p className="sub">{subtitle}</p>}
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
      <main className="page">
        <Loading />
      </main>
    );
  if (error)
    return (
      <main className="page">
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
    <p className="loading" role="status">
      Memuat data…
    </p>
  );
}
export function RequestError({ error, retry }) {
  return (
    <div className="empty">
      <p className="error" role="alert">
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
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {extra}
    </div>
  );
}
export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
export function Pagination({ meta, onPage }) {
  return meta?.pages > 1 ? (
    <div className="pagination">
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
    <div className="toast" role="status">
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
        state: { save: trip.id },
      });
  };
}
export function Missing() {
  return (
    <main className="page">
      <Head title="Halaman tidak ditemukan." subtitle="Trip atau halaman ini tidak tersedia." />
      <Button to="/">Kembali ke Explore</Button>
    </main>
  );
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
