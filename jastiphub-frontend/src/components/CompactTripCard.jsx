import { fee, place, range } from '../data';
import { Art, Icon } from './Art';
import { Button } from './UI';

export function CompactTripCard({ t, publicView = false }) {
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
