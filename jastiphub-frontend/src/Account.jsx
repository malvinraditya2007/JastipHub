import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp, useResource } from './store';
import { request } from './api';
import { maskPhone, range } from './data';
import { validateImage } from './images';
import { Art, Icon } from './Art';
import { Head, Field, Button, Dialog, Empty, ResourceState } from './ui';
import { Report } from './Trips';

function EditProfile({ close }) {
  const { user, updateProfile, upload, setMessage } = useApp();
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError('');
    try {
      await updateProfile({ ...values, avatar });
      close();
      setMessage('Perubahan profil tersimpan.');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function select(file) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      validateImage(file);
      setAvatar((await upload(file, 'avatar')).url);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title="Edit profil"
      subtitle="Perbarui profil dan nomor WhatsApp untuk menerima titipan."
      onClose={() => !busy && close()}
    >
      <form onSubmit={save}>
        <fieldset className="form-fieldset" disabled={busy}>
          <div className="inline-person">
            <Art name={avatar} className="avatar large" />
            <label className="btn light file-btn">
              {busy ? 'Memproses…' : 'Ubah foto'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => select(e.target.files[0])}
              />
            </label>
          </div>
          <div className="form-grid">
            {[
              ['name', 'Nama lengkap', 100],
              ['handle', 'Username', 30],
              ['phone', 'Nomor WhatsApp', 30],
              ['city', 'Domisili', 100],
            ].map(([key, label, max]) => (
              <Field key={key} label={label}>
                <input
                  name={key}
                  required={key !== 'city'}
                  type={key === 'phone' ? 'tel' : 'text'}
                  maxLength={max}
                  pattern={key === 'handle' ? '[A-Za-z0-9_]{3,30}' : undefined}
                  defaultValue={user[key]}
                />
              </Field>
            ))}
          </div>
          <p className="hint">
            Nomor WhatsApp lengkap hanya diberikan melalui aksi kontak setelah login.
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="actions">
            <Button kind="light" onClick={close}>
              Batal
            </Button>
            <Button type="submit">Simpan perubahan</Button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

export function Account() {
  const { user, logout, setMessage } = useApp();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const contacts = useResource('/me/contacts');
  async function exit() {
    setBusy(true);
    try {
      await logout();
      nav('/');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <Head title="Profil & pengaturan akun." subtitle="Kelola informasi profil dan kontakmu." />
      <section className="identity panel">
        <Art name={user.avatar} className="avatar giant" />
        <div>
          <h2>{user.name}</h2>
          <p>@{user.handle}</p>
          <span className="tag">Akun terdaftar</span>
        </div>
        <Button kind="light" icon="edit" onClick={() => setEdit(true)}>
          Edit Profil
        </Button>
      </section>
      <section className="content-block">
        <h2>Informasi akun</h2>
        <div className="account-grid">
          <div className="panel info-list">
            {[
              ['bag', 'Username', '@' + user.handle],
              ['wa', 'Nomor WhatsApp', maskPhone(user.phone)],
              ['location', 'Domisili', user.city || 'Belum diisi'],
            ].map(([icon, label, value]) => (
              <div key={label}>
                <Icon name={icon} />
                <div>
                  <small>{label}</small>
                  <b>{value}</b>
                </div>
              </div>
            ))}
          </div>
          <div className="panel history">
            <h3>Riwayat permintaan kontak</h3>
            <ResourceState resource={contacts} />
            {!contacts.loading &&
              !contacts.error &&
              (contacts.data?.length ? (
                contacts.data.map(({ trip: t, eligible, reviewed, reason }) => (
                  <div className="history-item" key={t.id}>
                    <div className="inline-person">
                      <Art name={t.person.avatar} className="avatar" />
                      <div>
                        <b>
                          {t.person.name} · {t.city} Trip
                        </b>
                        <p>{range(t)}</p>
                      </div>
                    </div>
                    <span className="tag">
                      {reviewed
                        ? 'Ulasan sudah dikirim'
                        : eligible
                          ? 'Bisa memberi ulasan'
                          : reason}
                    </span>
                    {eligible && (
                      <Button icon="star" to={'/ulasan/' + t.id}>
                        Beri Ulasan
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <Empty>Belum ada permintaan kontak tercatat.</Empty>
              ))}
          </div>
        </div>
      </section>
      <aside className="account-note">
        <Icon name="shield" size={24} />
        <div>
          <h3>Ulasan bukan verifikasi pembelian.</h3>
          <p>
            Riwayat mencatat permintaan membuka kontak. Pesan dan transaksi di WhatsApp tidak
            otomatis terverifikasi.
          </p>
        </div>
      </aside>
      <div className="actions">
        <button disabled={busy} className="text-btn" onClick={exit}>
          {busy ? 'Keluar…' : 'Keluar akun'}
        </button>
      </div>
      {edit && <EditProfile close={() => setEdit(false)} />}
    </main>
  );
}

export function Review() {
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
