import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router';
import { useApp, useResource } from './store';
import { request } from './api';
import { Art, Icon } from './Art';
import { fee, place, range, today } from './data';
import { Button, Dialog, Empty, Head, useSave, ResourceState, Pagination } from './ui';

export function Report({ person, close }) {
  const { setMessage } = useApp();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await request('/reports', {
        method: 'POST',
        body: { targetId: person.id, reason, details },
      });
      close();
      setMessage('Laporan diterima. Nomor: ' + result.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title="Laporkan profil jastiper"
      subtitle="Laporkan perilaku atau informasi yang mencurigakan."
      onClose={() => !busy && close()}
    >
      <form onSubmit={submit}>
        {['Informasi trip menyesatkan', 'Meminta pembayaran mencurigakan', 'Alasan lainnya'].map(
          (r) => (
            <label className="radio-row" key={r}>
              <input
                required
                type="radio"
                name="reason"
                checked={r === reason}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ),
        )}
        <label className="field">
          <span>Penjelasan {reason === 'Alasan lainnya' ? '(wajib)' : '(opsional)'}</span>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required={reason === 'Alasan lainnya'}
            maxLength="2000"
            rows="3"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <Button kind="light" disabled={busy} onClick={close}>
            Batal
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Mengirim…' : 'Kirim Laporan'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function WhatsApp({ trip: t, close, preview = false, stopId }) {
  const { user } = useApp();
  const p = t.person || user;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const stop = t.stops?.find((s) => s.id === stopId);
  const msg = `Halo ${p.name}, aku menemukan trip ${t.city || 'pilihanmu'} di JastipHub. Masih menerima titipan? ${stop ? `Boleh tanya produk di ${stop.name} dan total biayanya?` : 'Boleh tanya produk dan total biayanya?'}`;
  async function open() {
    setBusy(true);
    setError('');
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    try {
      const result = await request('/trips/' + t.id + '/contact', {
        method: 'POST',
        body: stopId ? { stopId } : {},
      });
      if (tab) {
        tab.location.replace(result.url);
        close();
      } else setFallbackUrl(result.url);
    } catch (error) {
      tab?.close();
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={'Hubungi ' + p.name + ' di WhatsApp'}
      subtitle={'Trip ' + (t.city || 'pilihanmu') + ' · ' + range(t)}
      onClose={() => !busy && close()}
    >
      <div className="msg-preview">
        <Icon name="wa" size={28} />
        <h4>Pesan otomatis</h4>
        <p>{msg}</p>
      </div>
      <p className="notice">
        Permintaan membuka kontak dicatat saat kamu menekan Buka WhatsApp. Pesan dan transaksi di
        WhatsApp tidak otomatis terverifikasi.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {fallbackUrl && (
        <p className="hint">
          Browser memblokir tab baru. Kontak sudah tercatat; lanjutkan melalui tautan di bawah.
        </p>
      )}
      <div className="actions">
        <Button kind="light" disabled={busy} onClick={close}>
          Tutup preview
        </Button>
        {!preview &&
          user &&
          (fallbackUrl ? (
            <a
              className="btn primary"
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              Lanjut ke WhatsApp
            </a>
          ) : (
            <Button disabled={busy} onClick={open}>
              {busy ? 'Mencatat kontak…' : 'Buka WhatsApp'}
            </Button>
          ))}
      </div>
    </Dialog>
  );
}

export function Detail() {
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

export function CompactCard({ t, publicView = false }) {
  return (
    <article className="compact panel">
      <Art
        name={
          publicView && t.id === 'tokyo'
            ? 'tokyoProfile'
            : publicView
              ? t.cover
              : t.thumb || t.cover
        }
        alt={place(t)}
        preserveAspectRatio={!publicView}
      />
      <div>
        {publicView && <span className="tag">Menerima titipan</span>}
        <h3>{publicView ? place(t) : t.city + ' Trip'}</h3>
        <p>
          {!publicView && <Icon name="calendar" />}
          {range(t, true)}
        </p>
        <div>
          <small>Jastip fee</small>
          <strong>{fee(t)}</strong>
        </div>
        <Button icon="arrow" to={'/trips/' + t.id}>
          Lihat Trip
        </Button>
      </div>
    </article>
  );
}

export function Jastiper() {
  const { id } = useParams();
  const [report, setReport] = useState(false);
  const [page, setPage] = useState(1);
  const [tripPage, setTripPage] = useState(1);
  const profile = useResource('/users/' + encodeURIComponent(id));
  const trips = useResource('/trips?ownerId=' + encodeURIComponent(id) + '&page=' + tripPage, {
    full: true,
  });
  const reviews = useResource('/users/' + encodeURIComponent(id) + '/reviews?page=' + page, {
    full: true,
  });
  const p = profile.data;
  if (!p || profile.loading || profile.error)
    return (
      <main className="page">
        <ResourceState resource={profile} />
      </main>
    );
  return (
    <main className="page">
      <Head
        title="Kenali orang di balik trip."
        subtitle="Periksa reputasi, aktivitas trip, dan ulasan sebelum mengambil keputusan."
      />
      <section className="reputation panel">
        <div className="inline-person">
          <Art name={p.avatar} className="avatar giant" />
          <div>
            <h2>{p.name}</h2>
            <p>@{p.handle}</p>
            <span className="tag">Akun terdaftar</span>
          </div>
        </div>
        <div className="reputation-score">
          <div>
            <strong>
              {p.rating || '—'} <Icon name="star" size={25} />
            </strong>
            <b>{p.count}</b>
            <small>Rating pengguna</small>
            <small>Ulasan</small>
          </div>
          <p>Reputasi berdasarkan ulasan pengguna.</p>
        </div>
      </section>
      <section className="content-block">
        <h2>Trip yang tersedia</h2>
        <ResourceState resource={trips} />
        {!trips.loading && !trips.error && trips.data && (
          <div className="available-grid">
            <div>
              {trips.data.data.length ? (
                trips.data.data.map((t) => <CompactCard key={t.id} t={t} publicView />)
              ) : (
                <Empty>Belum ada trip mendatang.</Empty>
              )}
              <Pagination meta={trips.data.meta} onPage={setTripPage} />
            </div>
            <div className="panel trust">
              <b>
                <Icon name="shield" />
                Tidak ada pembayaran di JastipHub.
              </b>
              <p>Gunakan WhatsApp untuk menanyakan biaya, ketersediaan, dan kesepakatan.</p>
            </div>
          </div>
        )}
      </section>
      <section className="content-block">
        <h2>Cerita dari pengguna</h2>
        <p className="sub">
          Ulasan komunikasi dari pengguna yang tercatat meminta membuka kontak. Bukan bukti
          transaksi.
        </p>
        <ResourceState resource={reviews} />
        {!reviews.loading && !reviews.error && reviews.data && (
          <>
            {reviews.data.data.length ? (
              reviews.data.data.map((r) => (
                <div className="panel story" key={r.id}>
                  <div className="inline-person">
                    <Art name={r.author.avatar} className="avatar" />
                    <div>
                      <b>{r.author.name}</b>
                      <small>
                        <Icon name="star" size={15} />
                        {r.rating}
                      </small>
                    </div>
                  </div>
                  <span>“{r.text}”</span>
                </div>
              ))
            ) : (
              <Empty>Belum ada ulasan.</Empty>
            )}
            <Pagination meta={reviews.data.meta} onPage={setPage} />
          </>
        )}
        <div className="actions">
          <button className="text-btn" onClick={() => setReport(true)}>
            <Icon name="flag" />
            Laporkan profil
          </button>
        </div>
      </section>
      {report && <Report person={p} close={() => setReport(false)} />}
    </main>
  );
}

export function MyTrips() {
  const mine = useResource('/me/trips');
  const saved = useResource('/me/saved-trips');
  return (
    <main className="page">
      <Head
        title="Trip yang kamu kelola."
        subtitle="Pantau perjalanan yang kamu buat dan trip yang kamu simpan."
        extra={
          <Button icon="plus" to="/trips/baru">
            Buat Trip Baru
          </Button>
        }
      />
      <h2>Sedang kamu tawarkan</h2>
      <ResourceState resource={mine} />
      {!mine.loading &&
        !mine.error &&
        (mine.data?.length ? (
          mine.data.map((t) => (
            <article className="offer" key={t.id}>
              <Art name={t.cover} />
              <div>
                <span className="tag">
                  {t.status === 'draft'
                    ? 'Draf'
                    : t.end < today()
                      ? 'Selesai'
                      : 'Menerima pertanyaan'}
                </span>
                <h2>{place(t)}</h2>
                <p>
                  <Icon name="calendar" />
                  {range(t)}
                </p>
                <small>Fee trip</small>
                <div className="offer-bottom">
                  <strong>{fee(t)}</strong>
                  <span>{t.stores.length} toko terjadwal</span>
                  <Button to={'/trips/' + t.id + '/edit'} kind="white" icon="edit">
                    Edit Trip
                  </Button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <Empty>Belum ada trip yang kamu buat.</Empty>
        ))}
      <section className="content-block">
        <h2>Disimpan untuk nanti</h2>
        <p className="sub">Trip favorit yang ingin kamu lihat lagi.</p>
        <ResourceState resource={saved} />
        {!saved.loading &&
          !saved.error &&
          (saved.data?.length ? (
            <div className="saved-grid">
              {saved.data.map((t) => (
                <CompactCard key={t.id} t={t} />
              ))}
            </div>
          ) : (
            <Empty>
              Belum ada trip tersimpan. <Link to="/">Cari trip di Explore</Link>
            </Empty>
          ))}
      </section>
    </main>
  );
}
