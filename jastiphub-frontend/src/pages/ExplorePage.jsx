import { twMerge } from 'tailwind-merge';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Art, Icon } from '../components/Art';
import { Avatar } from '../components/Avatar';
import { countries, countryKey, fee, place, range } from '../data';
import { Button, Empty, useSave, ResourceState, Pagination } from '../components/UI';
import { useResource } from '../services/store';

function StoreList({ stores }) {
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
    for (const item of list.children) resize.observe(item);
    list.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => {
      resize.disconnect();
      list.removeEventListener('scroll', updateScroll);
    };
  }, [stores]);
  function move(direction) {
    const list = rail.current;
    list.scrollBy({ left: direction * list.clientWidth * 0.8 });
  }
  const overflow = scroll.left || scroll.right;
  const arrowClass =
    'grid size-7 shrink-0 place-items-center rounded-full border border-line bg-white text-ink hover:bg-sage';
  return (
    <div className="flex min-w-0 items-center gap-1.5 mt-1 min-h-7 [&_span]:shrink-0 [&_span]:whitespace-nowrap [&_span]:py-[5px] [&_span]:px-2.5 [&_span]:rounded-[24px] [&_span]:[background:#f0f0f4] [&_span]:text-[11px] [&_span]:leading-[1.3] narrow:[&_span]:text-[10px]! mobile:[&_span]:text-[11px]!">
      {overflow && (
        <button
          type="button"
          className={arrowClass}
          aria-label="Geser toko ke kiri"
          disabled={!scroll.left}
          onClick={() => move(-1)}
        >
          <Icon name="chevron" size={14} className="rotate-180" />
        </button>
      )}
      <div
        ref={rail}
        className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Daftar toko"
        tabIndex={0}
      >
        {stores.slice(0, 5).map((store) => (
          <span key={store}>{store}</span>
        ))}
      </div>
      {overflow && (
        <button
          type="button"
          className={arrowClass}
          aria-label="Geser toko ke kanan"
          disabled={!scroll.right}
          onClick={() => move(1)}
        >
          <Icon name="chevron" size={14} />
        </button>
      )}
      {stores.length > 5 && (
        <span aria-label={`${stores.length - 5} toko lainnya`}>+{stores.length - 5}</span>
      )}
    </div>
  );
}

function TripCard({ trip: t }) {
  const save = useSave();
  const p = t.person;
  const on = t.saved;
  return (
    <article className="overflow-hidden rounded-2xl bg-white [border:1px_solid_#eae5e2]">
      <div className="aspect-[406.9/128.5] relative [&_>_a]:block [&_>_a]:w-full [&_>_a]:h-full [&_.art]:block [&_.art]:w-full [&_.art]:h-full">
        <Link to={'/trips/' + t.id} aria-label={'Lihat trip ' + t.city}>
          <Art name={t.thumb || t.cover} alt={place(t)} />
        </Link>
        <span className="absolute top-3 left-[15px] pointer-events-none flex items-center gap-[7px] py-1.5 px-3 rounded-[22px] [background:white] text-[13px] font-[650]">
          <Icon name="pin" size={15} />
          {place(t)}
        </span>
        <button
          className={twMerge(
            "absolute top-[7px] right-[7px] grid place-items-center [background:transparent_url('/art/explore-FavoriteBackground.svg')_center/contain_no-repeat] rounded-[50%] w-9 h-9 [&.selected]:[background-color:var(--color-brand)] [&:hover]:[background-color:var(--color-brand)] " +
              (on ? 'selected' : ''),
          )}
          aria-pressed={on}
          aria-label={(on ? 'Hapus simpanan ' : 'Simpan ') + t.city}
          onClick={() => save(t)}
        >
          <Icon name="heartWhite" size={24} />
        </button>
      </div>
      <div className="relative pt-[7px] px-[17px] pb-1.5 [&_h3]:text-[16px] [&_h3]:leading-[22px] [&_h3]:font-bold [&_h3]:tracking-[-0.25px] mobile:py-2.5! mobile:px-4!">
        <h3>{t.city} Trip</h3>
        <div className="flex items-center gap-[9px] text-[14px] text-muted my-[3px] mx-0">
          <Icon name="smallCal" size={17} />
          {range(t, true)}
        </div>
        <div className="flex items-center gap-[15px] mt-[3px] mx-0 mb-[9px] [&_small]:flex [&_small]:items-center [&_small]:gap-[5px] [&_small]:text-[11px] [&_small]:text-ink">
          <Avatar
            src={p.avatar}
            name={p.name}
            color={p.avatarColor}
            alt={'Foto profil ' + p.name}
            preserveAspectRatio
            className="avatar size-[39px] shrink-0 overflow-hidden rounded-full"
          />
          <div>
            <b>{p.name}</b>
            <small>
              <Icon name="rating" size={16} />
              {p.rating ? p.rating + ' (' + p.count + ' ulasan)' : 'Belum ada ulasan'}
            </small>
          </div>
        </div>
        <div className="absolute rounded-xl bg-sage text-brand text-center right-[15px] top-6.5 py-1.5 px-3 [&_small]:block [&_small]:text-[11px] [&_small]:text-deep [&_small]:font-semibold [&_strong]:text-[22px] narrow:right-[9px]!">
          <small>Jastip Fee</small>
          <strong>{fee(t)}</strong>
        </div>
        <div className="[border-top:1px_solid_var(--color-line)] pt-1.5 px-0 pb-2 [&_small]:text-[11px] [&_small]:text-ink [&_small]:flex [&_small]:items-center [&_small]:gap-[7px]">
          <small>
            <Icon name="store" size={15} />
            Toko yang akan dikunjungi
          </small>
          <StoreList stores={t.stores} />
        </div>
        <Button
          className="w-[calc(100%_+_8px)] ml-[-4px] min-h-[37px] p-[7px]"
          to={'/trips/' + t.id}
        >
          Lihat Trip <Icon name="arrow" />
        </Button>
      </div>
    </article>
  );
}
const countryIcons = new Map([
  ['Jepang', 'flags/explore-Group1'],
  ['Korea Selatan', 'flags/explore-Group2'],
  ['Singapura', 'flags/explore-Group3'],
  ['Thailand', 'flags/explore-Group4'],
  ['Hong Kong', 'flags/explore-Group5'],
  ['Malaysia', 'flags/flag-my'],
  ['Taiwan', 'flags/flag-tw'],
  ['Vietnam', 'flags/flag-vn'],
  ['Tiongkok', 'flags/flag-cn'],
  ['Australia', 'flags/flag-au'],
  ['Inggris', 'flags/flag-gb'],
  ['Amerika Serikat', 'flags/flag-us'],
]);
function DestinationFilters({ destinations, selected, onSelect }) {
  const rail = useRef(null);
  const [scroll, setScroll] = useState({
    left: false,
    right: false,
  });
  useEffect(() => {
    const list = rail.current;
    function updateScroll() {
      const left = list.scrollLeft > 1;
      const right = list.scrollLeft + list.clientWidth < list.scrollWidth - 1;
      setScroll((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : {
              left,
              right,
            },
      );
    }
    const resize = new ResizeObserver(updateScroll);
    resize.observe(list);
    list.addEventListener('scroll', updateScroll, {
      passive: true,
    });
    updateScroll();
    return () => {
      resize.disconnect();
      list.removeEventListener('scroll', updateScroll);
    };
  }, [destinations.length]);
  function move(direction) {
    const list = rail.current;
    list.scrollBy({
      left: direction * list.clientWidth * 0.7,
    });
  }
  return (
    <div className="flex items-center gap-3 justify-between mt-[13px] [&_>_b]:text-[16px] [&_>_b]:whitespace-nowrap narrow:items-start! narrow:flex-col! narrow:gap-2! mobile:[&_>_b]:text-[14px]!">
      <b id="destinations-label">Destinasi Populer</b>
      <div className="grid grid-cols-[auto_minmax(0,_1fr)_auto] items-center gap-1 [flex:1] min-w-0 [&_>_button]:grid [&_>_button]:place-items-center [&_>_button]:rounded-full [&_>_button]:border [&_>_button]:border-line [&_>_button]:bg-white [&_>_button]:text-ink [&_>_button]:w-8 [&_>_button]:h-8 [&_>_button:hover:not(:disabled)]:[background:var(--color-sage)] narrow:w-full!">
        <button
          type="button"
          className="[&_.icon]:rotate-[90deg]"
          aria-label="Geser destinasi ke kiri"
          disabled={!scroll.left}
          onClick={() => move(-1)}
        >
          <Icon name="down" size={16} />
        </button>
        <div
          ref={rail}
          className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none] scroll-smooth p-1 [&::-webkit-scrollbar]:hidden [&_.chip]:flex-none mobile:gap-[7px]!"
          role="group"
          aria-labelledby="destinations-label"
        >
          {['', ...destinations].map((name) => {
            const active = countryKey(name) === countryKey(selected);
            return (
              <button
                type="button"
                className={twMerge(
                  "chip inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white font-semibold py-[5px] px-[clamp(10px,_1.35vw,_21px)] text-[14px] leading-[20px] whitespace-nowrap min-h-8 [&.chosen]:bg-brand [&.chosen]:text-white [&.chosen]:border-brand [&:hover:not(.chosen)]:[background:#edf6f2] [&_img[src*='/flags/explore-Group']]:rounded-[100%] [&_img[src*='/flags/explore-Group']]:[mask:url('/art/flags/explore-Group.svg')_center/contain_no-repeat] [&_img[src*='/flags/flag-']]:rounded-[100%] [&:not(.chosen)_img[src*='Globe']]:[filter:brightness(0.4)] narrow:[padding-inline:13px]! mobile:text-[12px]! mobile:min-h-[33px]! mobile:py-1.5! mobile:px-[11px]! mobile:[&_.icon]:w-[15px]! " +
                    (active ? 'chosen' : ''),
                )}
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
          className="[&_.icon]:rotate-[-90deg]"
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
export function ExplorePage() {
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
  const resource = useResource('/trips?' + query, {
    full: true,
  });
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
      <section className="h-78 relative isolate overflow-hidden [background:#deedf8] [&:after]:absolute [&:after]:inset-0 [&:after]:z-[-1] [&:after]:[content:''] [&:after]:[background:linear-gradient(90deg,_#deedf8_0%,_#deedf8_39%,_transparent_65%)] [&_h1]:text-[37px] [&_h1]:leading-[1.22] [&_h1]:mt-4 [&_h1]:mx-0 [&_h1]:mb-[3px] [&_h1]:relative [&_h1]:table [&_h1]:tracking-[-1.4px] [&_h1_.icon]:absolute [&_h1_.icon]:right-[-18px] [&_h1_.icon]:top-[-10px] [&_h1_em]:text-brand [&_h1_em]:not-italic [&_p]:text-[17px] [&_p]:leading-[1.48] [&_p]:font-medium mobile:h-[235px]! mobile:[&:after]:[background:linear-gradient(90deg,_#deedf8_20%,_#deedf8dc_58%,_transparent)]! mobile:[&_h1]:text-[length:clamp(26px,_6.5vw,_35px)]! mobile:[&_h1]:mt-3.5! mobile:[&_h1]:mx-0! mobile:[&_h1]:mb-1.5! mobile:[&_h1]:tracking-[-1px]! mobile:[&_h1_.icon]:w-[27px]! mobile:[&_h1_.icon]:right-[-15px]! mobile:[&_p]:text-[13px]! mobile:[&_p]:max-w-[65%]! mobile:[&_.art]:min-w-0!">
        <Art
          name="hero"
          className="absolute inset-0 z-[-1] wide:[&_img]:[object-fit:cover]! mobile:[inset:0_-50%_0_-28%]!"
        />
        <div className="w-[min(83.4%,_1168px)] m-auto pt-[29px] mobile:w-[90%]! mobile:pt-5.5!">
          <span className="inline-flex items-center gap-2 rounded-full text-deep font-semibold [background:#d6eee7] text-[12px] py-[9px] px-4.5 mobile:text-[10px]! mobile:py-1.5! mobile:px-[11px]!">
            <Icon name="plane" size={17} />
            Jastip Otentik, Dari Perjalanan Nyata
          </span>
          <h1 className="mobile:text-[30px]!">
            Titip Belanja Mudah
            <Icon name="accent" size={43} />
            <br />
            dari <em>Berbagai Destinasi</em>
          </h1>
          <p>
            Temukan trip terpercaya, titip barang dari toko
            <br className="mobile:hidden!" /> favorit, dan belanja dengan tenang.
          </p>
        </div>
      </section>
      <div className="w-[min(88.6%,_1240px)] [margin-inline:auto] max-w-312.5 pb-7 tablet:w-[92%]!">
        <form
          className="flex gap-3 bg-white relative mt-[-28px] mx-auto mb-[13px] max-w-302.5 w-[97%] py-2 px-[13px] rounded-[20px] [box-shadow:0_4px_13px_#1923310e] [&_>_.btn]:w-[18%] [&_>_.btn]:min-h-10 [&_>_.btn]:text-[14px] [&_>_.btn_.icon]:w-5 mobile:w-full! mobile:mt-[-24px]! mobile:flex-wrap! mobile:gap-[7px]! mobile:p-[9px]! mobile:rounded-[15px]! mobile:[&_>_.btn]:w-full! mobile:[&_>_.btn]:h-[37px]! mobile:[&_>_.btn]:min-h-[37px]! mobile:[&_>_.btn]:text-[14px]! mobile:[&_>_.btn_img]:w-4.5!"
          onSubmit={(e) => {
            e.preventDefault();
            update({
              q,
              date,
            });
          }}
        >
          <div className="flex flex-1 min-w-0 items-center [background:#f9f9fc] [border:1px_solid_#d2d6e3] rounded-[12px] mobile:basis-full! mobile:h-11.5!">
            <label className="flex items-center gap-4.5 pl-[19px] [flex:1] [&_input]:py-[7px] [&_input]:px-0 [&_input]:[background:none] [&_input]:[border:0] [&_input]:[flex:1] [&_input]:min-w-10 [&_input]:text-[16px] [&_input]:leading-[24px] mobile:gap-[7px]! mobile:pl-2! mobile:[&_.icon]:w-[17px]! mobile:[&_input]:text-[12px]! mobile:[&_input]:w-full!">
              <Icon name="search" size={24} />
              <input
                aria-label="Cari destinasi, toko, atau jastiper"
                placeholder="Cari destinasi, toko, atau jastiper..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-4.5 [border-left:1px_solid_#cfd2dd] [flex:0_1_36%] pt-0 pr-4.5 pb-0 pl-[27px] relative h-8 text-muted [&_span]:grid [&_span]:gap-[1px] [&_small]:text-[11px] [&_small]:leading-[1.25] [&_b]:text-[14px] [&_b]:leading-[1.25] [&_b]:font-medium [&_.icon:last-of-type]:ml-auto [&_input]:absolute [&_input]:inset-0 [&_input]:opacity-[0] [&_input]:w-full [&_input]:p-0 [&:focus-within]:[outline:2px_solid_var(--color-brand)] mobile:[flex:0_0_35%]! mobile:[padding-inline:8px]! mobile:gap-[5px]! mobile:[&_.icon]:w-[15px]! mobile:[&_.icon:last-of-type]:hidden! mobile:[&_b]:text-[11px]! mobile:[&_small]:text-[9px]!">
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
          onSelect={(name) =>
            update({
              country: name,
            })
          }
        />
        <div className="flex justify-between items-center gap-4 mt-4 mx-0 mb-3 [&_h2]:text-[25px] [&_p]:text-[13px] mobile:items-start! mobile:flex-col! mobile:gap-3! mobile:[&_h2]:text-[24px]! mobile:[&_p]:text-[12px]!">
          <div>
            <h2 className="mobile:text-[22px]!">Trip Mendatang</h2>
            <p>Jelajahi trip dari jastiper yang akan segera mengunjungi toko favoritmu.</p>
          </div>
          <label className="group inline-flex shrink-0 items-center gap-2.5 text-xs font-medium text-muted mobile:self-end! mobile:gap-2!">
            <span>Urutkan</span>
            <span className="relative block">
              <select
                className="h-10 w-48 appearance-none rounded-xl border border-line bg-white py-2 pl-3.5 pr-10 text-[13px] font-semibold text-ink transition-colors hover:border-brand/40 focus:border-brand mobile:w-46! mobile:text-xs!"
                value={sort}
                onChange={(e) =>
                  update({
                    sort: e.target.value,
                  })
                }
              >
                <option value="soon">Segera Berangkat</option>
                <option value="latest">Terakhir Berangkat</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
              <Icon
                name="down"
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 opacity-70 transition-opacity group-hover:opacity-100"
              />
            </span>
          </label>
        </div>
        {(search || day || country) && (
          <button
            className="inline-flex items-center gap-2 text-brand font-bold text-left text-[13px] [&:hover]:[text-decoration:underline] mb-3"
            onClick={() => {
              setParams({});
              setQ('');
              setDate('');
            }}
          >
            Reset filter
          </button>
        )}
        <ResourceState resource={resource} variant="cards" label="Mencari trip untukmu…" />
        {!resource.loading &&
          !resource.error &&
          (results.length ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[19px] mobile:gap-4!">
                {results.map((t) => (
                  <TripCard key={t.id} trip={t} />
                ))}
              </div>
              <Pagination
                meta={resource.data?.meta}
                onPage={(page) =>
                  update({
                    page: String(page),
                  })
                }
              />
            </>
          ) : (
            <Empty>Belum ada trip yang cocok. Coba destinasi atau tanggal lain.</Empty>
          ))}
      </div>
    </main>
  );
}
