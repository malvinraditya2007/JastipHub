import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Icon } from '../components/Art';
import { Report } from '../components/TripDialogs';
import { Button, Field, Head, ResourceState } from '../components/UI';
import { range } from '../data';
import { request } from '../services/api';
import { useApp, useResource } from '../services/store';

export function ReviewPage() {
  const { id } = useParams();
  const { invalidate, setMessage } = useApp();
  const nav = useNavigate();
  const trip = useResource('/trips/' + encodeURIComponent(id));
  const eligibility = useResource('/trips/' + encodeURIComponent(id) + '/review-eligibility');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');
  const [report, setReport] = useState(false);
  const [busy, setBusy] = useState(false);
  async function send(e) {
    e.preventDefault();
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
      <main className="page">
        <ResourceState resource={trip} />
      </main>
    );
  if (eligibility.loading || eligibility.error || !eligibility.data)
    return (
      <main className="page">
        <ResourceState resource={eligibility} />
      </main>
    );
  if (!eligibility.data.eligible)
    return (
      <main className="page">
        <Head title="Ulasan belum tersedia." subtitle={eligibility.data.reason} />
        <Button to="/profile">Kembali ke profil</Button>
      </main>
    );
  const t = trip.data;
  const p = t.person;
  return (
    <main className="page">
      <Head
        title={'Bagaimana ' + p.name + ' berkomunikasi?'}
        subtitle="Nilai komunikasi dan transparansi fee berdasarkan pengalamanmu."
      />
      <div className="review-status">
        <Icon name="check" size={26} />
        <div>
          <h3>Permintaan kontak tercatat</h3>
          <p>
            {p.name} · {t.city} Trip · {range(t)}
          </p>
        </div>
        <span className="tag">Trip selesai · ulasan diizinkan</span>
      </div>
      <div className="review-grid">
        <form className="panel review-form" onSubmit={send}>
          <fieldset disabled={busy} className="form-fieldset">
            <h2>Nilai komunikasi jastiper</h2>
            <p>Pilih rating 1–5 berdasarkan pengalamanmu.</p>
            <div className="stars" role="group" aria-label="Rating">
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
            <label className="checkbox">
              <input required name="acknowledged" type="checkbox" />
              Saya memahami bahwa transaksi di WhatsApp belum diverifikasi JastipHub.
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="actions">
              <Button type="submit" icon="arrow">
                {busy ? 'Mengirim…' : 'Kirim Ulasan'}
              </Button>
            </div>
          </fieldset>
        </form>
        <aside className="side-note">
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
          <button className="text-btn" onClick={() => setReport(true)}>
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
