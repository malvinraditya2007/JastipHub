import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Icon } from '../components/Art';
import { Report } from '../components/TripDialogs';
import { ReviewPhotos } from '../components/ReviewPhotos';
import { Button, Field, Head, ResourceState } from '../components/UI';
import { range } from '../data';
import { validateImage } from '../images';
import { request } from '../services/api';
import { useApp, useResource } from '../services/store';
export function ReviewPage() {
  const { id } = useParams();
  const { invalidate, setMessage, upload } = useApp();
  const nav = useNavigate();
  const trip = useResource('/trips/' + encodeURIComponent(id));
  const eligibility = useResource('/trips/' + encodeURIComponent(id) + '/review-eligibility');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');
  const [report, setReport] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const picker = useRef(null);
  const photoLock = useRef(false);
  async function addPhotos(files) {
    if (!files.length || photoLock.current || busy) return;
    photoLock.current = true;
    setError('');
    try {
      if (photos.length + files.length > 3) throw new Error('Maksimal 3 foto per ulasan.');
      files.forEach(validateImage);
      setUploading(true);
      for (const [index, file] of files.entries()) {
        setProgress({ current: index + 1, total: files.length });
        const result = await upload(file, 'review');
        setPhotos((previous) => [...previous, result.url]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      photoLock.current = false;
      setUploading(false);
    }
  }
  async function send(e) {
    e.preventDefault();
    if (busy || photoLock.current) return;
    const values = new FormData(e.currentTarget);
    if (!rating) {
      setError('Pilih rating terlebih dahulu.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await request('/trips/' + id + '/reviews', {
        method: 'POST',
        body: {
          rating,
          text: values.get('text'),
          photos,
          acknowledged: values.get('acknowledged') === 'on',
        },
      });
      invalidate();
      setMessage('Ulasan berhasil disimpan.');
      nav('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  if (trip.loading || trip.error || !trip.data)
    return (
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
        <ResourceState resource={trip} />
      </main>
    );
  if (eligibility.loading || eligibility.error || !eligibility.data)
    return (
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
        <ResourceState resource={eligibility} />
      </main>
    );
  if (!eligibility.data.eligible)
    return (
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
        <Head title="Ulasan belum tersedia." subtitle={eligibility.data.reason} />
        <Button to="/profile">Kembali ke profil</Button>
      </main>
    );
  const t = trip.data;
  const p = t.person;
  return (
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
      <Head
        title={'Bagaimana ' + p.name + ' berkomunikasi?'}
        subtitle="Nilai komunikasi dan transparansi fee berdasarkan pengalamanmu."
      />
      <div className="flex items-center gap-4.5 py-5 px-6 mt-7.5 mx-0 mb-16.5 [&_.tag]:ml-auto mobile:my-4.5! mobile:mx-0! mobile:py-2.5! mobile:px-0! mobile:flex-wrap! mobile:[&_.tag]:m-0!">
        <Icon name="check" size={26} />
        <div>
          <h3>Permintaan kontak tercatat</h3>
          <p>
            {p.name} · {t.city} Trip · {range(t)}
          </p>
        </div>
        <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
          Trip selesai · ulasan diizinkan
        </span>
      </div>
      <div className="grid gap-6 grid-cols-[minmax(0,_1.97fr)_minmax(0,_1fr)] tablet:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]! mobile:grid-cols-[1fr]! mobile:gap-4!">
        <form
          className="rounded-2xl border border-line bg-white overflow-hidden p-[25px] [&_p]:text-[13px] [&_>_b]:text-[13px] [&_>_b]:text-deep [&_.field]:mt-8 mobile:p-4.5!"
          onSubmit={send}
        >
          <fieldset
            disabled={busy}
            className="[border:0] p-0 m-0 min-w-0 [&:disabled]:opacity-[0.75]"
          >
            <h2 className="mobile:text-[22px]!">Nilai komunikasi jastiper</h2>
            <p>Pilih rating 1–5 berdasarkan pengalamanmu.</p>
            <div
              className="flex gap-4.5 items-center mt-7 mx-0 mb-[9px] [&_button]:grid [&_button]:place-items-center [&_button]:w-[51px] [&_button]:h-12.5 [&_span]:text-[44px] [&_span]:leading-[1] [&_span]:text-[#a9b1b5] mobile:gap-[7px]!"
              role="group"
              aria-label="Rating"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  aria-label={n + ' bintang'}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                  key={n}
                >
                  {n <= rating ? <Icon name="selectedStar" size={39} /> : <span>☆</span>}
                </button>
              ))}
            </div>
            <b>
              {rating
                ? rating +
                  ' / 5 · ' +
                  ['', 'Buruk', 'Kurang', 'Cukup', 'Baik', 'Sangat baik'][rating]
                : 'Pilih rating'}
            </b>
            <Field label="Ulasan singkat">
              <textarea
                required
                name="text"
                rows="5"
                maxLength="1200"
                placeholder="Ceritakan pengalaman komunikasimu."
              />
            </Field>
            <section className="mt-7 rounded-xl border border-dashed border-line bg-warm p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm">
                    Foto bukti <span className="font-normal text-muted">(opsional)</span>
                  </h3>
                  <p className="mt-1 text-xs!">
                    JPG, PNG, atau WebP · maksimal 3 foto, 5 MB per foto.
                  </p>
                </div>
                <Button
                  kind="light"
                  icon="upload"
                  disabled={uploading || photos.length === 3}
                  onClick={() => picker.current.click()}
                >
                  {uploading ? 'Mengunggah…' : 'Tambah foto'}
                </Button>
                <input
                  ref={picker}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  disabled={uploading || photos.length === 3}
                  aria-label="Pilih foto bukti ulasan"
                  onChange={(event) => {
                    const files = Array.from(event.target.files);
                    event.target.value = '';
                    addPhotos(files);
                  }}
                />
              </div>
              <ReviewPhotos
                photos={photos}
                disabled={uploading || busy}
                onRemove={(index) =>
                  setPhotos((previous) => previous.filter((_, i) => i !== index))
                }
              />
              <p className="mt-3 text-xs!" role={uploading ? 'status' : undefined}>
                {uploading
                  ? `Mengunggah foto ${progress.current} dari ${progress.total}…`
                  : `${photos.length}/3 foto · Foto akan terlihat bersama ulasan. Hindari data pribadi.`}
              </p>
            </section>
            <label className="flex gap-[13px] items-start text-[12px] text-muted mt-7.5">
              <input required name="acknowledged" type="checkbox" />
              Saya memahami bahwa transaksi di WhatsApp belum diverifikasi JastipHub.
            </label>
            {error && (
              <p
                className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
              <Button type="submit" icon="arrow" disabled={uploading}>
                {busy ? 'Mengirim…' : 'Kirim Ulasan'}
              </Button>
            </div>
          </fieldset>
        </form>
        <aside className="side-note [&_p]:flex [&_p]:items-center [&_p]:gap-3.5 [&_p]:text-[13px] [align-self:start] [border-left:2px_solid_#b4ded0] py-8.5 px-5.5 mt-2 [&_h3]:mb-6 [&_p]:mt-3 [&_p]:mx-0 [&_p]:mb-5.5 mobile:p-[15px]!">
          <h3>Tulis yang benar-benar kamu alami.</h3>
          {[
            'Satu ulasan per akun per trip.',
            'Tulis pengalaman komunikasi.',
            'Jangan bagikan data pribadi.',
          ].map((s) => (
            <p key={s}>
              <Icon name="check" />
              {s}
            </p>
          ))}
          <hr />
          <button
            className="inline-flex items-center gap-2 text-brand font-bold text-left text-[13px] [&:hover]:[text-decoration:underline]"
            onClick={() => setReport(true)}
          >
            <Icon name="flag" />
            Laporkan hal mencurigakan
          </button>
          <Button kind="white" to={'/jastiper/' + p.id}>
            Lihat Profil {p.name}
          </Button>
        </aside>
      </div>
      {report && <Report person={p} close={() => setReport(false)} />}
    </main>
  );
}
