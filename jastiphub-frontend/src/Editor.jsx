import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp, useResource } from './store';
import { countries, fee, money, range, place, destinationCover, maskPhone } from './data';
import { validateImage } from './images';
import { Art, Icon } from './Art';
import { Button, Dialog, Field, Head, ResourceState } from './ui';
import { WhatsApp } from './Trips';

function PhotoPicker({ trip, close, onSave }) {
  const { upload } = useApp();
  const [uploading, setUploading] = useState(false);
  const [custom, setCustom] = useState(trip.cover);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const auto = destinationCover(trip.country);
  async function select(file) {
    if (!file || busy) return;
    setBusy(true);
    setError('');
    try {
      validateImage(file);
      setCustom((await upload(file, 'cover')).url);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  if (uploading)
    return (
      <Dialog
        title="Unggah foto perjalanan"
        subtitle="Pilih satu foto yang sesuai dengan destinasi tripmu."
        onClose={() => !busy && close()}
      >
        <label
          className="dropzone file-btn"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            select(e.dataTransfer.files[0]);
          }}
        >
          {custom ? <Art name={custom} /> : <Icon name="upload" size={38} />}
          <b>{busy ? 'Mengunggah foto…' : 'Pilih foto dari perangkat'}</b>
          <small>JPG, PNG, WebP · maksimal 5 MB · dipotong ke 16:9</small>
          <input
            disabled={busy}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => select(e.target.files[0])}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <Button kind="light" disabled={busy} onClick={() => setUploading(false)}>
            Kembali
          </Button>
          <Button
            disabled={!custom || busy}
            onClick={() => {
              onSave(custom);
              close();
            }}
          >
            Simpan foto
          </Button>
        </div>
      </Dialog>
    );
  return (
    <Dialog
      title="Foto perjalanan"
      subtitle="Gunakan foto otomatis sesuai destinasi atau unggah fotomu sendiri."
      onClose={close}
    >
      <Art className="photo-example" name={custom || auto} alt="Pratinjau foto perjalanan" />
      <button className="photo-choice" onClick={() => setCustom(null)}>
        <Icon name="check" />
        <span>
          <b>Gunakan foto otomatis</b>
          <small>Foto destinasi akan tampil sebagai cover trip.</small>
        </span>
      </button>
      <button className="photo-choice" onClick={() => setUploading(true)}>
        <Icon name="upload" />
        <span>
          <b>Unggah foto sendiri</b>
          <small>Pilih JPG, PNG, atau WebP · maksimal 5 MB.</small>
        </span>
      </button>
      <p className="hint">
        Pilihan diterapkan ke form. Simpan trip untuk menyimpan perubahan cover.
      </p>
      <div className="actions">
        <Button kind="light" onClick={close}>
          Batal
        </Button>
        <Button
          onClick={() => {
            onSave(custom);
            close();
          }}
        >
          Simpan pilihan
        </Button>
      </div>
    </Dialog>
  );
}

export function Editor() {
  const { id } = useParams();
  const resource = useResource(id ? '/me/trips/' + encodeURIComponent(id) : null);
  if (id && (resource.loading || resource.error || !resource.data))
    return (
      <main className="page">
        <ResourceState resource={resource} />
      </main>
    );
  return <EditorForm key={id || 'new'} existing={resource.data} />;
}

function EditorForm({ existing }) {
  const nav = useNavigate();
  const { user, saveTrip, setMessage } = useApp();
  const lock = useRef(false);
  const [t, setT] = useState(() =>
    existing
      ? { ...existing, cover: existing.customCover, value: existing.value ?? '' }
      : {
          id: crypto.randomUUID(),
          owner: user.id,
          city: '',
          country: '',
          start: '',
          end: '',
          stores: [],
          categories: [],
          days: [],
          type: 'percentage',
          value: '',
          cover: null,
          status: 'draft',
        },
  );
  const [newStore, setNewStore] = useState('');
  const [adding, setAdding] = useState(!existing);
  const [modal, setModal] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setT((prev) => ({ ...prev, [k]: v }));
  function add() {
    const name = newStore.trim();
    if (!name) return;
    if (t.stores.some((s) => s.toLowerCase() === name.toLowerCase())) {
      setError('Toko ini sudah ada di daftar.');
      return;
    }
    setT((prev) => ({
      ...prev,
      stores: [...prev.stores, name],
      categories: [...prev.categories, ''],
      days: [...prev.days, 0],
    }));
    setNewStore('');
    setAdding(false);
    setError('');
  }
  function remove(index) {
    setT((prev) => ({
      ...prev,
      stores: prev.stores.filter((_, i) => i !== index),
      categories: prev.categories.filter((_, i) => i !== index),
      days: prev.days.filter((_, i) => i !== index),
    }));
  }
  function stopField(key, index, value) {
    setT((prev) => ({
      ...prev,
      [key]: prev.stores.map((_, i) => (i === index ? value : prev[key][i])),
    }));
  }
  async function save(status) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const record = { ...t, city: t.city.trim(), country: t.country.trim(), status };
    if (
      newStore.trim() &&
      !record.stores.some((s) => s.toLowerCase() === newStore.trim().toLowerCase())
    ) {
      record.stores = [...record.stores, newStore.trim()];
      record.categories = [...record.categories, ''];
      record.days = [...record.days, 0];
    }
    try {
      await saveTrip(record, !existing);
      setMessage(
        status === 'draft'
          ? 'Draf tersimpan.'
          : existing?.status === 'published'
            ? 'Perubahan trip tersimpan.'
            : 'Trip dipublikasikan.',
      );
      nav('/my-trips');
    } catch (error) {
      setError(error.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const previewCover = t.cover || destinationCover(t.country);
  const published = existing?.status === 'published';
  return (
    <main className="page editor">
      <Head
        title="Perjalananmu bisa jadi kesempatan titip."
        subtitle="Isi tujuan, jadwal, toko, dan fee sebelum mempublikasikan trip."
      />
      <div className="draft-state">
        {published ? 'Trip telah dipublikasikan' : 'Draf belum dipublikasikan'}
      </div>
      <div className="editor-grid">
        <form
          className="panel editor-form"
          onSubmit={(e) => {
            e.preventDefault();
            save('published');
          }}
        >
          <fieldset disabled={busy} className="form-fieldset">
            <h2>Detail perjalanan</h2>
            <p className="sub">Tuliskan informasi yang dibutuhkan calon penitip.</p>
            <hr />
            <datalist id="countries">
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </datalist>
            <div className="form-grid">
              <Field label="Negara tujuan">
                <input
                  required
                  list="countries"
                  maxLength="100"
                  placeholder="Pilih negara"
                  value={t.country}
                  onChange={(e) => set('country', e.target.value)}
                />
              </Field>
              <Field label="Kota tujuan">
                <input
                  required
                  maxLength="100"
                  value={t.city}
                  placeholder="Nama kota"
                  onChange={(e) => set('city', e.target.value)}
                />
              </Field>
              <Field label="Tanggal berangkat">
                <input
                  required
                  type="date"
                  value={t.start}
                  onChange={(e) => set('start', e.target.value)}
                />
              </Field>
              <Field label="Tanggal pulang">
                <input
                  required
                  type="date"
                  min={t.start}
                  value={t.end}
                  onChange={(e) => set('end', e.target.value)}
                />
              </Field>
            </div>
            <h3>Toko yang akan dikunjungi</h3>
            <p className="sub">
              Hari ke-0 adalah tanggal berangkat. Jadwal tidak dapat diubah setelah ada permintaan
              kontak.
            </p>
            <div className="store-edit">
              {t.stores.map((name, i) => (
                <div className="stop-edit" key={name}>
                  <div className="stop-heading">
                    <b>{name}</b>
                    <button
                      type="button"
                      className="text-btn"
                      aria-label={'Hapus ' + name}
                      onClick={() => remove(i)}
                    >
                      Hapus ×
                    </button>
                  </div>
                  <div className="form-grid">
                    <Field label={'Kategori ' + name}>
                      <input
                        value={t.categories[i] || ''}
                        maxLength="150"
                        placeholder="Opsional"
                        onChange={(e) => stopField('categories', i, e.target.value)}
                      />
                    </Field>
                    <Field label={'Hari kunjungan ' + name}>
                      <input
                        type="number"
                        min="0"
                        max="366"
                        step="1"
                        value={t.days[i] ?? 0}
                        onChange={(e) => stopField('days', i, Number(e.target.value))}
                      />
                    </Field>
                  </div>
                </div>
              ))}
              {!adding && (
                <button type="button" className="text-btn" onClick={() => setAdding(true)}>
                  ＋ Tambah toko
                </button>
              )}
            </div>
            {adding && (
              <div className="add-store">
                <input
                  aria-label="Nama toko"
                  value={newStore}
                  maxLength="150"
                  placeholder="Nama toko"
                  onChange={(e) => setNewStore(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      add();
                    }
                  }}
                />
                <Button kind="light" onClick={add}>
                  Tambah toko
                </Button>
              </div>
            )}
            <hr />
            <h3>Atur fee jastip</h3>
            <p className="sub">Fee berlaku untuk setiap titipan pada trip ini.</p>
            <div className="segmented">
              {[
                ['percentage', 'Persentase (%)'],
                ['fixed_per_item', 'Nominal tetap'],
              ].map(([v, label]) => (
                <Button
                  key={v}
                  kind={v === t.type ? 'primary' : 'muted'}
                  aria-pressed={t.type === v}
                  onClick={() => set('type', v)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="form-grid">
              <Field label={t.type === 'percentage' ? 'Persentase fee' : 'Nominal per barang (Rp)'}>
                <input
                  required
                  type="number"
                  min="0"
                  step={t.type === 'percentage' ? '0.1' : '1'}
                  max={t.type === 'percentage' ? 100 : 999999999999}
                  value={t.value}
                  onChange={(e) => set('value', e.target.value)}
                />
              </Field>
              <Field label="Contoh fee">
                <output>
                  {money(t.type === 'percentage' ? (500000 * Number(t.value)) / 100 : t.value)} /
                  barang Rp 500.000
                </output>
              </Field>
            </div>
            <hr />
            <h3>Kontak WhatsApp</h3>
            <p className="sub">Nomor diambil dari profil akunmu.</p>
            <Button kind="light" icon="wa" className="w-full" to="/profile">
              WhatsApp akun · {maskPhone(user.phone)}
            </Button>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="actions">
              {!published && (
                <Button kind="white" icon="check" onClick={() => save('draft')}>
                  Simpan Draft
                </Button>
              )}
              <Button type="submit" icon="arrow">
                {busy ? 'Menyimpan…' : published ? 'Simpan Perubahan' : 'Publikasikan Trip'}
              </Button>
            </div>
          </fieldset>
        </form>
        <aside>
          <div className="panel editor-preview">
            <div className="preview-image">
              <Art name={previewCover} alt="Pratinjau cover trip" />
              <span className="tag">
                {t.cover ? 'Foto pilihan' : 'Foto otomatis'} · {t.city || 'Destinasi'}
              </span>
              <Button disabled={busy} kind="white" icon="edit" onClick={() => setModal('photo')}>
                Ganti Foto
              </Button>
            </div>
            <div className="preview-content">
              <h2>{t.city || t.country ? place(t) : 'Tujuan perjalanan'}</h2>
              <p>
                <Icon name="calendar" />
                {range(t, true)}
              </p>
              <hr />
              <small>Fee jastip</small>
              <div className="fee-line">
                <strong>{fee(t)}</strong>
                <small>
                  {t.type === 'percentage'
                    ? 'Dari harga barang yang dititipkan'
                    : 'Per barang yang dititipkan'}
                </small>
              </div>
              <span className="tag">{t.stores.length} toko terjadwal</span>
              <Button icon="message" onClick={() => setModal('wa')}>
                Chat Jastiper (preview)
              </Button>
            </div>
          </div>
          <div className="side-note">
            <h3>Cara menghitung fee</h3>
            <b>Persentase dari harga barang</b>
            <p>Contoh: 8% dari harga barang.</p>
            <hr />
            <b>Nominal tetap per barang</b>
            <p>Contoh: Rp25.000 per barang.</p>
            <hr />
            <p>
              <Icon name="info" />
              Ongkir, kurs, dan biaya lain dijelaskan di WhatsApp.
            </p>
          </div>
        </aside>
      </div>
      {modal === 'photo' && (
        <PhotoPicker trip={t} close={() => setModal('')} onSave={(v) => set('cover', v)} />
      )}
      {modal === 'wa' && (
        <WhatsApp trip={{ ...t, person: user }} preview close={() => setModal('')} />
      )}
    </main>
  );
}
