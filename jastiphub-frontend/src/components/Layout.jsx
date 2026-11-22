import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useApp } from '../services/store';
import { Art, Icon } from './Art';
import { Button, Dialog } from './UI';

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="JastipHub, beranda">
      <Art name="logo" />
      JastipHub
    </Link>
  );
}

function How({ close }) {
  return (
    <Dialog
      title="Cara kerja JastipHub"
      subtitle="Pilih trip, cek informasinya, lalu hubungi jastiper."
      onClose={close}
    >
      {[
        [
          'search',
          'Temukan perjalanan',
          'Cari destinasi dan toko, lalu lihat tanggal trip serta fee.',
        ],
        ['shield', 'Periksa jastiper', 'Baca profil, riwayat ulasan, dan aturan fee sebelum chat.'],
        ['wa', 'Lanjut via WhatsApp', 'Diskusikan produk, pembayaran, dan pengiriman langsung.'],
      ].map(([i, h, t]) => (
        <div className="how-row" key={h}>
          <span>
            <Icon name={i} size={24} />
          </span>
          <div>
            <h3>{h}</h3>
            <p>{t}</p>
          </div>
        </div>
      ))}
      <p className="hint">JastipHub tidak memproses pembayaran atau menjamin transaksi.</p>
      <div className="actions">
        <Button onClick={close}>Tutup</Button>
      </div>
    </Dialog>
  );
}
export function Layout() {
  const { user } = useApp();
  const [how, setHow] = useState(false);
  const { pathname } = useLocation();
  const activeExplore =
    pathname === '/' ||
    (pathname.startsWith('/trips/') && !pathname.includes('edit') && !pathname.includes('baru')) ||
    pathname.startsWith('/jastiper/');
  const activeMine =
    pathname === '/my-trips' || pathname.includes('/edit') || pathname === '/trips/baru';
  return (
    <>
      <header>
        <div className="navbar">
          <Brand />
          <nav aria-label="Navigasi utama">
            <Link className={activeExplore ? 'active' : ''} to="/">
              <Icon name="compass" />
              Explore
            </Link>
            <Link className={activeMine ? 'active' : ''} to="/my-trips">
              <Icon name="bag" />
              My Trips
            </Link>
            <button onClick={() => setHow(true)}>Cara Kerja</button>
          </nav>
          <div className="nav-right">
            <Button to="/trips/baru" icon="plus">
              Buat Trip
            </Button>
            <NavLink to={user ? '/profile' : '/login'} className="profile-link">
              {user ? <Art name={user.avatar} className="avatar" /> : <Icon name="bag" />}
              {user ? 'Profil' : 'Masuk'}
            </NavLink>
          </div>
        </div>
      </header>
      <Outlet />
      {how && <How close={() => setHow(false)} />}
    </>
  );
}
