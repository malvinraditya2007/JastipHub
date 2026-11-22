import { Link } from 'react-router';
import { Art, Icon } from '../components/Art';
import { CompactTripCard } from '../components/CompactTripCard';
import { Button, Empty, Head, ResourceState } from '../components/UI';
import { fee, place, range, today } from '../data';
import { useResource } from '../services/store';

export function MyTripsPage() {
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
                <CompactTripCard key={t.id} t={t} />
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
