import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useApp } from '../services/store';
import { Art, Icon } from './Art';
import { Button, Dialog } from './UI';
export function Brand() {
  return (
    <Link
      to="/"
      className="brand inline-flex items-center text-brand font-extrabold gap-3 text-[23px] tracking-[-0.65px] flex-none [&_.art]:w-[41px] [&_.art]:h-[41px] tablet:text-[19px]! tablet:gap-1.5!"
      aria-label="JastipHub, beranda"
    >
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
        <div
          className="flex items-center gap-4 py-4.5 px-0 [border-top:1px_solid_var(--color-line)] [&_>_span]:p-3 [&_>_span]:[background:var(--color-sage)] [&_>_span]:rounded-[12px] [&_p]:text-[13px]"
          key={h}
        >
          <span>
            <Icon name={i} size={24} />
          </span>
          <div>
            <h3>{h}</h3>
            <p>{t}</p>
          </div>
        </div>
      ))}
      <p className="hint text-[12px] mt-3.5 [&_.icon]:mr-[9px]">
        JastipHub tidak memproses pembayaran atau menjamin transaksi.
      </p>
      <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
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
      <header className="[background:white] relative z-[2]">
        <div className="h-14 max-w-350 py-0 px-[5.45%] m-auto flex items-center gap-[4%] [&_.brand]:text-[21px] [&_.brand_.art]:w-8 [&_.brand_.art]:h-8 [&_.profile-link_.avatar]:w-8 [&_.profile-link_.avatar]:h-8 [&_nav]:flex [&_nav]:items-center [&_nav]:gap-3 [&_nav]:ml-[6%] [&_nav_a]:flex [&_nav_a]:items-center [&_nav_a]:gap-[11px] [&_nav_a]:py-2 [&_nav_a]:px-[19px] [&_nav_a]:rounded-[11px] [&_nav_a]:text-[14px] [&_nav_a]:leading-[24px] [&_nav_a]:font-semibold [&_nav_a]:whitespace-nowrap [&_nav_button]:flex [&_nav_button]:items-center [&_nav_button]:gap-[11px] [&_nav_button]:py-2 [&_nav_button]:px-[19px] [&_nav_button]:rounded-[11px] [&_nav_button]:leading-[24px] [&_nav_button]:whitespace-nowrap [&_nav_.active]:[background:var(--color-sage)] [&_nav_.active]:text-deep [&_nav_.active]:font-bold [&_nav_a:hover]:[background:#f2f8f5] [&_nav_button:hover]:[background:#f2f8f5] [&_nav_button]:font-medium [&_nav_button]:text-muted [&_nav_button]:text-[14px] wide:[padding-inline:75px]! narrow:[&_nav]:ml-0! narrow:[&_nav]:gap-0.5! narrow:[&_nav_a]:[padding-inline:12px]! narrow:[&_nav_button]:[padding-inline:12px]! tablet:py-0! tablet:px-[4%]! tablet:gap-[2%]! tablet:[&_nav_a]:gap-[5px]! mobile:h-auto! mobile:min-h-22! mobile:grid! mobile:grid-cols-[1fr_auto]! mobile:gap-0! mobile:pt-1.5! mobile:[&_.brand_.art]:w-8! mobile:[&_.brand_.art]:h-8! mobile:[&_nav]:[grid-row:2]! mobile:[&_nav]:[grid-column:1/-1]! mobile:[&_nav]:justify-center! mobile:[&_nav]:gap-2.5! mobile:[&_nav]:py-1! mobile:[&_nav]:px-0! mobile:[&_nav_a]:text-[12px]! mobile:[&_nav_a]:leading-[18px]! mobile:[&_nav_a]:py-1.5! mobile:[&_nav_a]:px-3! mobile:[&_nav_button]:text-[12px]! mobile:[&_nav_button]:leading-[18px]! mobile:[&_nav_button]:py-1.5! mobile:[&_nav_button]:px-3! mobile:[&_nav_.icon]:w-4!">
          <Brand />
          <nav aria-label="Navigasi utama">
            <Link className={twMerge(activeExplore ? 'active' : '')} to="/">
              <Icon name="compass" />
              Explore
            </Link>
            <Link className={twMerge(activeMine ? 'active' : '')} to="/my-trips">
              <Icon name="bag" />
              My Trips
            </Link>
            <button onClick={() => setHow(true)}>Cara Kerja</button>
          </nav>
          <div className="ml-auto flex items-center gap-[clamp(16px,_3.8vw,_60px)] [&_>_.btn]:min-w-36 tablet:gap-3! tablet:[&_>_.btn]:min-w-0! mobile:[grid-column:2]! mobile:[grid-row:1]! mobile:[&_>_.btn]:min-h-[33px]! mobile:[&_>_.btn]:text-[12px]! mobile:[&_>_.btn]:py-[7px]! mobile:[&_>_.btn]:px-3!">
            <Button to="/trips/baru" icon="plus">
              Buat Trip
            </Button>
            <NavLink
              to={user ? '/profile' : '/login'}
              className="profile-link [&:hover]:[background:#f2f8f5] inline-flex items-center gap-2 rounded-lg font-semibold whitespace-nowrap text-[14px] mobile:text-[12px]! mobile:[&_.avatar]:w-7.5! mobile:[&_.avatar]:h-7.5!"
            >
              {user ? (
                <Art
                  name={user.avatar}
                  className="avatar w-10.5 h-10.5 rounded-[50%] flex-none [&.large]:w-18 [&.large]:h-18 [&.giant]:w-[125px] [&.giant]:h-[125px] mobile:[&.giant]:w-18! mobile:[&.giant]:h-18!"
                />
              ) : (
                <Icon name="bag" />
              )}
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
