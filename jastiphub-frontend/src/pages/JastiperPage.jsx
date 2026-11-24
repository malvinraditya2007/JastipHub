import { useState } from 'react';
import { useParams } from 'react-router';
import { Icon } from '../components/Art';
import { Avatar } from '../components/Avatar';
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
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
        <ResourceState resource={profile} />
      </main>
    );
  return (
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
      <Head
        title="Kenali orang di balik trip."
        subtitle="Periksa reputasi, aktivitas trip, dan ulasan sebelum mengambil keputusan."
      />
      <section className="grid grid-cols-[3fr_2fr] min-h-[277px] [&_>_.inline-person]:p-8.5 [&_>_.inline-person]:items-start [&_>_.inline-person]:pt-10.5 [&_>_.inline-person]:gap-[27px] [&_h2]:text-[28px] [&_.tag]:mt-6 mobile:grid-cols-[1fr]! mobile:gap-4! mobile:[&_>_.inline-person]:p-5! mobile:[&_>_.inline-person]:gap-[15px]! mobile:[&_h2]:text-[24px]! mobile:[&_.tag]:mt-2.5! rounded-2xl border border-line bg-white overflow-hidden">
        <div className="inline-person flex items-center gap-3 [&_small]:flex [&_small]:items-center [&_small]:gap-[5px]">
          <Avatar
            src={p.avatar}
            name={p.name}
            color={p.avatarColor}
            className="avatar w-10.5 h-10.5 rounded-[50%] flex-none [&.large]:w-18 [&.large]:h-18 [&.giant]:w-[125px] [&.giant]:h-[125px] mobile:[&.giant]:w-18! mobile:[&.giant]:h-18! giant"
          />
          <div>
            <h2 className="mobile:text-[22px]!">{p.name}</h2>
            <p>@{p.handle}</p>
            <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
              Akun terdaftar
            </span>
          </div>
        </div>
        <div className="p-12 [background:var(--color-sage)] [&_>_div]:grid [&_>_div]:grid-cols-[1fr_1fr] [&_>_div]:items-baseline [&_strong]:text-[40px] [&_strong]:text-brand [&_b]:text-[30px] [&_small]:text-[11px] [&_small]:tracking-[1px] [&_small]:font-[650] [&_p]:mt-9.5 [&_p]:text-[13px] tablet:p-7.5! mobile:p-5! mobile:[&_p]:mt-3!">
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
      <section className="mt-13 [&_.story:first-of-type]:mt-[25px] mobile:my-7.5! mobile:mx-0! mobile:[&_.sub]:mb-3!">
        <h2 className="mobile:text-[22px]!">Trip yang tersedia</h2>
        <ResourceState resource={trips} />
        {!trips.loading && !trips.error && trips.data && (
          <div className="grid gap-6 grid-cols-[1.7fr_1fr] mt-4.5 tablet:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]! mobile:grid-cols-[1fr]! mobile:gap-4!">
            <div>
              {trips.data.data.length ? (
                trips.data.data.map((t) => <CompactTripCard key={t.id} t={t} publicView />)
              ) : (
                <Empty>Belum ada trip mendatang.</Empty>
              )}
              <Pagination meta={trips.data.meta} onPage={setTripPage} />
            </div>
            <div className="rounded-2xl border border-line bg-white overflow-hidden [&_p]:text-[13px] grid content-center p-6 gap-4 [&_b]:flex [&_b]:items-center [&_b]:gap-3.5">
              <b>
                <Icon name="shield" />
                Tidak ada pembayaran di JastipHub.
              </b>
              <p>Gunakan WhatsApp untuk menanyakan biaya, ketersediaan, dan kesepakatan.</p>
            </div>
          </div>
        )}
      </section>
      <section className="mt-13 [&_.story:first-of-type]:mt-[25px] mobile:my-7.5! mobile:mx-0! mobile:[&_.sub]:mb-3!">
        <h2 className="mobile:text-[22px]!">Cerita dari pengguna</h2>
        <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
          Ulasan komunikasi dari pengguna yang tercatat meminta membuka kontak. Bukan bukti
          transaksi.
        </p>
        <ResourceState resource={reviews} />
        {!reviews.loading && !reviews.error && reviews.data && (
          <>
            {reviews.data.data.length ? (
              reviews.data.data.map((r) => (
                <div
                  className="rounded-2xl border border-line bg-white overflow-hidden story [&_span]:text-[13px] grid items-center grid-cols-[30%_1fr] py-3.5 px-5 mt-3 min-h-19 mobile:grid-cols-[1fr]! mobile:gap-2.5!"
                  key={r.id}
                >
                  <div className="inline-person flex items-center gap-3 [&_small]:flex [&_small]:items-center [&_small]:gap-[5px]">
                    <Avatar
                      src={r.author.avatar}
                      name={r.author.name}
                      color={r.author.avatarColor}
                      className="avatar w-10.5 h-10.5 rounded-[50%] flex-none [&.large]:w-18 [&.large]:h-18 [&.giant]:w-[125px] [&.giant]:h-[125px] mobile:[&.giant]:w-18! mobile:[&.giant]:h-18!"
                    />
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
        <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
          <button
            className="inline-flex items-center gap-2 text-brand font-bold text-left text-[13px] [&:hover]:[text-decoration:underline]"
            onClick={() => setReport(true)}
          >
            <Icon name="flag" />
            Laporkan profil
          </button>
        </div>
      </section>
      {report && <Report person={p} close={() => setReport(false)} />}
    </main>
  );
}
