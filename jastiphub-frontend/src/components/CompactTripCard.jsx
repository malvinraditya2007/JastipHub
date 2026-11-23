import { fee, place, range } from '../data';
import { Art, Icon } from './Art';
import { Button } from './UI';
export function CompactTripCard({ t, publicView = false }) {
  return (
    <article className="[&_p_.icon]:mr-[9px] [&_h3]:text-[16px] [&_h3]:leading-[22px] [&_h3]:font-bold [&_h3]:tracking-[-0.25px] flex min-h-52.5 [&_>_.art]:w-[37%] [&_>_.art]:flex-none [&_>_div]:relative [&_>_div]:[flex:1] [&_>_div]:p-6 [&_>_div]:min-w-0 [&_h3]:mt-1 [&_h3]:mx-0 [&_h3]:mb-[9px] [&_p]:text-[14px] [&_.tag]:mb-[9px] [&_>_div_>_div]:mt-3.5 [&_>_div_>_div]:flex [&_>_div_>_div]:items-center [&_>_div_>_div]:gap-[15px] [&_strong]:text-brand [&_strong]:text-[23px] [&_.btn]:float-right [&_.btn]:py-2 [&_.btn]:px-6 [&_.btn]:min-h-10 narrow:[&_>_div]:p-4! mobile:min-h-40! mobile:[&_>_div]:p-3.5! mobile:[&_.btn]:py-2! mobile:[&_.btn]:px-3.5! rounded-2xl border border-line bg-white overflow-hidden">
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
        {publicView && (
          <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
            Menerima titipan
          </span>
        )}
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
