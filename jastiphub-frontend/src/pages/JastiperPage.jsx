import { useState } from 'react';
import { useParams } from 'react-router';
import { Art, Icon } from '../components/Art';
import { CompactTripCard } from '../components/CompactTripCard';
import { Report } from '../components/TripDialogs';
import { Empty, Head, Pagination, ResourceState } from '../components/UI';
import { useResource } from '../services/store';

export function JastiperPage() {
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
                trips.data.data.map((t) => <CompactTripCard key={t.id} t={t} publicView />)
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
