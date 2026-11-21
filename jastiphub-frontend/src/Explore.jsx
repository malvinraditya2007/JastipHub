import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Art, Icon } from './Art';
import { countries, countryKey, fee, place, range } from './data';
import { Button, Empty, useSave, ResourceState, Pagination } from './ui';
import { useResource } from './store';
export function TripCard({ trip: t }) {
  const save = useSave();
  const p = t.person;
  const on = t.saved;
  return (
    <article className="trip-card">
      <div className="card-visual">
        <Link to={'/trips/' + t.id} aria-label={'Lihat trip ' + t.city}>
          <Art name={t.thumb || t.cover} alt={place(t)} />
        </Link>
        <span className="location">
          <Icon name="pin" size={15} />
          {place(t)}
        </span>
        <button
          className={'favorite ' + (on ? 'selected' : '')}
          aria-pressed={on}
          aria-label={(on ? 'Hapus simpanan ' : 'Simpan ') + t.city}
          onClick={() => save(t)}
        >
          <Icon name="heartWhite" size={24} />
        </button>
      </div>
      <div className="card-body">
        <h3>{t.city} Trip</h3>
        <div className="card-date">
          <Icon name="smallCal" size={17} />
          {range(t, true)}
        </div>
        <div className="card-owner">
          <Art name={p.avatar} className="avatar" />
          <div>
            <b>{p.name}</b>
            <small>
              <Icon name="rating" size={16} />
              {p.rating ? p.rating + ' (' + p.count + ' ulasan)' : 'Belum ada ulasan'}
            </small>
          </div>
        </div>
        <div className="fee-badge">
          <small>Jastip Fee</small>
          <strong>{fee(t)}</strong>
        </div>
        <div className="card-stores">
          <small>
            <Icon name="store" size={15} />
            Toko yang akan dikunjungi
          </small>
          <div className="tags">
            {t.stores.slice(0, 3).map((s) => (
              <span key={s}>{s}</span>
            ))}
            {t.stores.length > 3 && <span>+{t.stores.length - 3}</span>}
          </div>
        </div>
        <Button className="card-cta" to={'/trips/' + t.id}>
          Lihat Trip <Icon name="arrow" />
        </Button>
      </div>
    </article>
  );
}
const countryIcons = new Map([
  ['Jepang', 'explore-Group1'],
  ['Korea Selatan', 'explore-Group2'],
  ['Singapura', 'explore-Group3'],
  ['Thailand', 'explore-Group4'],
  ['Hong Kong', 'explore-Group5'],
  ['Malaysia', 'flag-my'],
  ['Taiwan', 'flag-tw'],
  ['Vietnam', 'flag-vn'],
  ['Tiongkok', 'flag-cn'],
  ['Australia', 'flag-au'],
  ['Inggris', 'flag-gb'],
  ['Amerika Serikat', 'flag-us'],
]);

function DestinationFilters({ destinations, selected, onSelect }) {
  const rail = useRef(null);
  const [scroll, setScroll] = useState({ left: false, right: false });
  useEffect(() => {
    const list = rail.current;
    function updateScroll() {
      const left = list.scrollLeft > 1;
      const right = list.scrollLeft + list.clientWidth < list.scrollWidth - 1;
      setScroll((previous) =>
        previous.left === left && previous.right === right ? previous : { left, right },
      );
    }
    const resize = new ResizeObserver(updateScroll);
    resize.observe(list);
    list.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => {
      resize.disconnect();
      list.removeEventListener('scroll', updateScroll);
    };
  }, [destinations.length]);

  function move(direction) {
    const list = rail.current;
    list.scrollBy({ left: direction * list.clientWidth * 0.7 });
  }

  return (
    <div className="destinations">
      <b id="destinations-label">Destinasi Populer</b>
      <div className="destination-picker">
        <button
          type="button"
          className="destination-prev"
          aria-label="Geser destinasi ke kiri"
          disabled={!scroll.left}
          onClick={() => move(-1)}
        >
          <Icon name="down" size={16} />
        </button>
        <div ref={rail} className="chips" role="group" aria-labelledby="destinations-label">
          {['', ...destinations].map((name) => {
            const active = countryKey(name) === countryKey(selected);
            return (
              <button
                type="button"
                className={'chip ' + (active ? 'chosen' : '')}
                aria-pressed={active}
                key={name}
                onClick={() => onSelect(name)}
              >
                <Icon size={19} name={countryIcons.get(name) || 'globe'} />
                {name || 'Semua Destinasi'}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="destination-next"
          aria-label="Geser destinasi ke kanan"
          disabled={!scroll.right}
          onClick={() => move(1)}
        >
          <Icon name="down" size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const day = params.get('date') || '';
  const country = params.get('country') || '';
  const sort = params.get('sort') || 'soon';
  const [q, setQ] = useState(search);
  const [date, setDate] = useState(day);
  useEffect(() => {
    setQ(search);
  }, [search]);
  useEffect(() => {
    setDate(day);
  }, [day]);
  function update(changes) {
    const next = new URLSearchParams(params);
    if (!('page' in changes)) next.delete('page');
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next);
  }
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({
    q: search,
    date: day,
    country,
    sort,
    page: params.get('page') || '1',
  }))
    if (value) query.set(key, value);
  const resource = useResource('/trips?' + query, { full: true });
  const destinationResource = useResource('/destinations');
  const results = resource.data?.data || [];
  const selectedCountry = countryKey(country);
  const destinations = new Map(countries.map((name) => [countryKey(name), name]));
  for (const destination of destinationResource.data || []) {
    const key = destination.key;
    if (key && !destinations.has(key)) destinations.set(key, destination.name);
  }
  if (selectedCountry && !destinations.has(selectedCountry))
    destinations.set(selectedCountry, country);
  return (
    <main>
      <section className="hero">
        <Art name="hero" className="hero-art" />
        <div className="hero-inner">
          <span className="eyebrow">
            <Icon name="plane" size={17} />
            Jastip Otentik, Dari Perjalanan Nyata
          </span>
          <h1>
            Titip Belanja Mudah
            <Icon name="accent" size={43} />
            <br />
            dari <em>Berbagai Destinasi</em>
          </h1>
          <p>
            Temukan trip terpercaya, titip barang dari toko
            <br className="desktop-break" /> favorit, dan belanja dengan tenang.
          </p>
        </div>
      </section>
      <div className="explore-shell">
        <form
          className="searchbar"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q, date });
          }}
        >
          <div className="search-inputs">
            <label className="search-text">
              <Icon name="search" size={24} />
              <input
                aria-label="Cari destinasi, toko, atau jastiper"
                placeholder="Cari destinasi, toko, atau jastiper..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <label className="search-date">
              <Icon name="date" size={25} />
              <span>
                <small>Tanggal trip</small>
                <b>
                  {date ? new Date(date + 'T12:00').toLocaleDateString('id-ID') : 'Pilih tanggal'}
                </b>
              </span>
              <Icon name="down" size={16} />
              <input
                aria-label="Pilih tanggal trip"
                type="date"
                value={date}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch {
                    /* Browser may not expose a date picker. */
                  }
                }}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
          <Button type="submit" icon="searchTrip">
            Cari Trip
          </Button>
        </form>
        <DestinationFilters
          destinations={[...destinations.values()]}
          selected={country}
          onSelect={(name) => update({ country: name })}
        />
        <div className="list-heading">
          <div>
            <h2>Trip Mendatang</h2>
            <p>Jelajahi trip dari jastiper yang akan segera mengunjungi toko favoritmu.</p>
          </div>
          <label>
            Urutkan{' '}
            <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
              <option value="soon">Segera Berangkat</option>
              <option value="latest">Terakhir Berangkat</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </label>
        </div>
        {(search || day || country) && (
          <button
            className="text-btn mb-3"
            onClick={() => {
              setParams({});
              setQ('');
              setDate('');
            }}
          >
            Reset filter
          </button>
        )}
        <ResourceState resource={resource} />
        {!resource.loading &&
          !resource.error &&
          (results.length ? (
            <>
              <div className="trip-grid">
                {results.map((t) => (
                  <TripCard key={t.id} trip={t} />
                ))}
              </div>
              <Pagination
                meta={resource.data?.meta}
                onPage={(page) => update({ page: String(page) })}
              />
            </>
          ) : (
            <Empty>Belum ada trip yang cocok. Coba destinasi atau tanggal lain.</Empty>
          ))}
      </div>
    </main>
  );
}
