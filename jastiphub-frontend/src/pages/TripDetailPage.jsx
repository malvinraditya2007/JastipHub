import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { Art, Icon } from '../components/Art';
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
    else setParams({ contact: '1', ...(stopId ? { stop: stopId } : {}) });
  }
  if (!t || resource.loading || resource.error)
    return (
      <main className="page">
        <ResourceState resource={resource} />
      </main>
    );
  const p = t.person;
  const own = t.owner === user?.id;
  return (
    <main className="page detail">
      <div className="detail-head">
        <div>
          <h1>{place(t)}</h1>
          <div className="meta">
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
      <div className="detail-grid">
        <Art name={t.cover} className="detail-cover" alt={place(t)} />
        <aside className="panel contact-card">
          <h4>Fee jastip per barang</h4>
          <div className="fee-line">
            <strong>{fee(t)}</strong>
            {t.type === 'percentage' ? 'dari harga barang' : 'per barang'}
          </div>
          <hr />
          <div className="inline-person">
            <Art name={p.avatar} className="avatar" />
            <div>
              <h3>{p.name}</h3>
              <small>
                <Icon name="star" size={17} /> {p.rating || '—'} · {p.count} ulasan
              </small>
            </div>
          </div>
          <Link className="text-btn" to={'/jastiper/' + p.id}>
            Profil &amp; ulasan jastiper <Icon name="chevron" size={16} />
          </Link>
          {own ? (
            <Button icon="edit" to={'/trips/' + t.id + '/edit'}>
              Edit Trip
            </Button>
          ) : (
            <Button icon="message" onClick={() => openChat()}>
              Chat via WhatsApp
            </Button>
          )}
          <p className="hint">
            <Icon name="shield" />
            Login wajib agar permintaan kontak tercatat.
          </p>
          <p className="hint">Transaksi diatur langsung via WhatsApp.</p>
        </aside>
      </div>
      <section className="about">
        <h2>Tentang perjalanan</h2>
        <p>
          {p.name} akan berkunjung ke beberapa toko di {t.city}. Kamu dapat menanyakan produk yang
          dicari melalui WhatsApp sebelum tanggal keberangkatan.
        </p>
      </section>
      <section>
        <h2>Rute belanja {p.name}</h2>
        <p className="sub">
          Toko yang direncanakan. Konfirmasi jadwal dan produk langsung lewat WhatsApp.
        </p>
        {t.stores.map((s, i) => {
          const date = t.start ? new Date(t.start + 'T12:00') : null;
          if (date) date.setDate(date.getDate() + (t.days?.[i] || 0));
          return (
            <div className="itinerary" key={s}>
              <b>
                {date
                  ? date
                      .toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
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
      <section className="steps">
        <h2>Cara kerjanya</h2>
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
          close={() => setParams({}, { replace: true })}
        />
      )}
    </main>
  );
}
