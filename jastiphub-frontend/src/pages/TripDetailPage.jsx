import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { Art, Icon } from '../components/Art';
import { Avatar } from '../components/Avatar';
import { WhatsApp } from '../components/TripDialogs';
import { Button, ResourceState, useSave } from '../components/UI';
import { fee, place, range } from '../data';
import { useApp, useResource } from '../services/store';
export function TripDetailPage() {
  const { id } = useParams();
  const { user } = useApp();
  const save = useSave();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const resource = useResource('/trips/' + encodeURIComponent(id));
  const t = resource.data;
  function openChat(stopId) {
    const suffix = '?contact=1' + (stopId ? '&stop=' + encodeURIComponent(stopId) : '');
    if (!user) nav('/login?next=' + encodeURIComponent('/trips/' + id + suffix));
    else
      setParams({
        contact: '1',
        ...(stopId
          ? {
              stop: stopId,
            }
          : {}),
      });
  }
  if (!t || resource.loading || resource.error)
    return (
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
        <ResourceState resource={resource} variant="detail" label="Menyiapkan detail perjalanan…" />
      </main>
    );
  const p = t.person;
  const own = t.owner === user?.id;
  return (
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7! [&_h1]:text-[37px] mobile:[&_h1]:text-[30px]! mobile:[&_>_small]:block!">
      <ResourceState resource={resource} />
      <div className="flex items-center justify-between gap-5 mb-[59px] mobile:items-start! mobile:gap-2! mobile:mb-5.5! mobile:[&_>_.btn]:text-[12px]! mobile:[&_>_.btn]:min-h-8.5! mobile:[&_>_.btn]:py-[7px]! mobile:[&_>_.btn]:px-2.5!">
        <div>
          <h1 className="mobile:text-[30px]!">{place(t)}</h1>
          <div className="flex items-center [&_span]:flex [&_span]:items-center gap-10 mt-4 text-muted [&_span]:gap-[9px] mobile:flex-wrap! mobile:gap-[5px_15px]! mobile:text-[12px]!">
            <span>
              <Icon name="calendar" />
              {range(t)}
            </span>
            <span>
              <Icon name="location" />
              {t.stores.length} toko dalam rencana perjalanan
            </span>
          </div>
        </div>
        <Button kind="white" icon="heart" aria-pressed={t.saved} onClick={() => save(t)}>
          {t.saved ? 'Tersimpan' : 'Simpan'}
        </Button>
      </div>
      <div className="grid grid-cols-[2.065fr_1fr] gap-5.5 tablet:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]! mobile:grid-cols-[1fr]! mobile:gap-4!">
        <Art
          name={t.cover}
          className="rounded-[16px] min-h-97.5 tablet:min-h-80! mobile:min-h-0! mobile:aspect-[1.91]!"
          alt={place(t)}
        />
        <aside className="rounded-2xl border border-line bg-white overflow-hidden p-6 mobile:p-5!">
          <h4>Fee jastip per barang</h4>
          <div className="fee-line flex items-center gap-[13px] text-[14px] text-muted mt-3.5 [&_strong]:text-[40px] [&_strong]:text-brand [&_strong]:leading-[1.2] tablet:flex-wrap! mobile:[&_strong]:text-[34px]!">
            <strong>{fee(t)}</strong>
            {t.type === 'percentage' ? 'dari harga barang' : 'per barang'}
          </div>
          <hr className="my-5" />
          <Link
            className="group flex items-center gap-3 rounded-xl py-1 text-left"
            to={'/jastiper/' + p.id}
          >
            <Avatar
              src={p.avatar}
              name={p.name}
              color={p.avatarColor}
              className="size-12 shrink-0 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-base leading-snug">{p.name}</h3>
              <small className="mt-1 flex items-center gap-1.5">
                <Icon name="star" size={17} /> {p.rating || '—'} · {p.count} ulasan
              </small>
              <span className="mt-1.5 block text-xs font-bold text-brand group-hover:underline">
                Profil &amp; ulasan jastiper
              </span>
            </div>
            <Icon name="chevron" size={18} className="shrink-0 text-brand" />
          </Link>
          {own ? (
            <Button className="mt-5 min-h-12 w-full" icon="edit" to={'/trips/' + t.id + '/edit'}>
              Edit Trip
            </Button>
          ) : (
            <Button className="mt-5 min-h-12 w-full" icon="message" onClick={() => openChat()}>
              Chat via WhatsApp
            </Button>
          )}
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-sage p-3">
            <Icon name="shield" size={18} className="mt-0.5 shrink-0 text-brand" />
            <div className="min-w-0 space-y-1">
              <p className="text-xs leading-relaxed">
                Login wajib agar permintaan kontak tercatat.
              </p>
              <p className="text-xs leading-relaxed">Transaksi diatur langsung via WhatsApp.</p>
            </div>
          </div>
        </aside>
      </div>
      <section className="mt-[51px] mx-0 mb-15 [&_p]:mt-4.5 [&_p]:max-w-150 mobile:my-7.5! mobile:mx-0!">
        <h2 className="mobile:text-[22px]!">Tentang perjalanan</h2>
        <p>
          {p.name} akan berkunjung ke beberapa toko di {t.city}. Kamu dapat menanyakan produk yang
          dicari melalui WhatsApp sebelum tanggal keberangkatan.
        </p>
      </section>
      <section>
        <h2 className="mobile:text-[22px]!">Rute belanja {p.name}</h2>
        <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
          Toko yang direncanakan. Konfirmasi jadwal dan produk langsung lewat WhatsApp.
        </p>
        {t.stores.map((s, i) => {
          const date = t.start ? new Date(t.start + 'T12:00') : null;
          if (date) date.setDate(date.getDate() + (t.days?.[i] || 0));
          return (
            <div
              className="flex items-center min-h-25.5 [border-bottom:1px_solid_#e8e3df] gap-9.5 [&_>_b]:text-[14px] [&_>_b]:text-brand [&_>_b]:w-28 [&_>_b]:self-center [&_>_b]:leading-[56px] [&_>_b]:[border-right:1px_solid_var(--color-line)] [&_h3]:text-[20px] [&_p]:text-[13px] [&_p]:mt-[5px] [&_button]:ml-auto [&_button]:p-3.5 mobile:gap-4! mobile:min-h-[83px]! mobile:[&_>_b]:w-[65px]! mobile:[&_>_b]:text-[12px]! mobile:[&_h3]:text-[17px]!"
              key={s}
            >
              <b>
                {date
                  ? date
                      .toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })
                      .toUpperCase()
                  : 'DRAF'}
              </b>
              <div>
                <h3>{s}</h3>
                <p>{t.categories?.[i] || 'Rencana kunjungan'}</p>
              </div>
              {!own && (
                <button aria-label={'Tanya tentang ' + s} onClick={() => openChat(t.stops[i].id)}>
                  <Icon name="next" />
                </button>
              )}
            </div>
          );
        })}
      </section>
      <section className="[border-top:1px_solid_var(--color-line)] mt-[43px] mx-0 mb-[55px] pt-6 [&_>_div]:flex [&_>_div]:gap-4.5 [&_>_div_>_div]:flex [&_>_div_>_div]:gap-4.5 [&_>_div]:mt-[21px] [&_>_div]:justify-between [&_strong]:text-brand [&_strong]:text-[21px] [&_p]:text-[13px] mobile:my-7.5! mobile:mx-0! mobile:[&_>_div]:flex-col!">
        <h2 className="mobile:text-[22px]!">Cara kerjanya</h2>
        <div>
          {[
            ['Temukan trip', 'Cek rute, toko, dan fee.'],
            ['Hubungi jastiper', 'Sepakati barang lewat WhatsApp.'],
            ['Koordinasi langsung', 'Pembayaran dilakukan di luar platform.'],
          ].map(([h, sub], i) => (
            <div key={h}>
              <strong>0{i + 1}</strong>
              <div>
                <b>{h}</b>
                <p>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {params.get('contact') === '1' && user && !own && (
        <WhatsApp
          trip={t}
          stopId={params.get('stop') || undefined}
          close={() =>
            setParams(
              {},
              {
                replace: true,
              },
            )
          }
        />
      )}
    </main>
  );
}
