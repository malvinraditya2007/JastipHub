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
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
      <Head
        title="Trip yang kamu kelola."
        subtitle="Pantau perjalanan yang kamu buat dan trip yang kamu simpan."
        extra={
          <Button icon="plus" to="/trips/baru">
            Buat Trip Baru
          </Button>
        }
      />
      <h2 className="mobile:text-[22px]!">Sedang kamu tawarkan</h2>
      <ResourceState resource={mine} />
      {!mine.loading &&
        !mine.error &&
        (mine.data?.length ? (
          mine.data.map((t) => (
            <article
              className="grid grid-cols-[36.4%_1fr] rounded-[16px] [background:var(--color-deep)] text-white overflow-hidden mt-[15px] mx-0 mb-5 min-h-75 [&_>_div]:p-7 [&_.tag]:[background:white] [&_h2]:text-[27px] [&_h2]:mt-5.5 [&_p]:text-[#dbefeb] [&_small]:text-[#dbefeb] [&_p]:flex [&_p]:items-center [&_p]:gap-2.5 [&_p]:mt-2.5 [&_p]:mx-0 [&_p]:mb-7.5 [&_p_img]:[filter:brightness(0)_invert(1)] mobile:grid-cols-[1fr]! mobile:[&_>_.art]:aspect-[2.25]! mobile:[&_>_div]:p-4.5! mobile:[&_h2]:text-[24px]! mobile:[&_h2]:mt-2.5! mobile:[&_p]:mt-[9px]! mobile:[&_p]:mx-0! mobile:[&_p]:mb-3.5!"
              key={t.id}
            >
              <Art name={t.cover} />
              <div>
                <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
                  {t.status === 'draft'
                    ? 'Draf'
                    : t.end < today()
                      ? 'Selesai'
                      : 'Menerima pertanyaan'}
                </span>
                <h2 className="mobile:text-[22px]!">{place(t)}</h2>
                <p>
                  <Icon name="calendar" />
                  {range(t)}
                </p>
                <small>Fee trip</small>
                <div className="flex items-center gap-7.5 [&_strong]:text-[29px] [&_span]:text-[12px] [&_.btn]:ml-auto mobile:gap-[15px]!">
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
      <section className="mt-13 [&_.story:first-of-type]:mt-[25px] mobile:my-7.5! mobile:mx-0! mobile:[&_.sub]:mb-3!">
        <h2 className="mobile:text-[22px]!">Disimpan untuk nanti</h2>
        <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
          Trip favorit yang ingin kamu lihat lagi.
        </p>
        <ResourceState resource={saved} />
        {!saved.loading &&
          !saved.error &&
          (saved.data?.length ? (
            <div className="grid gap-6 grid-cols-[repeat(2,_minmax(0,_1fr))] mt-7.5 tablet:grid-cols-[1fr]! mobile:grid-cols-[1fr]! mobile:gap-4!">
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
