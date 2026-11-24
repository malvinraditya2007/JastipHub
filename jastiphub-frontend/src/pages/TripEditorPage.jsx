import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp, useResource } from '../services/store';
import { countries, fee, money, range, place, destinationCover, maskPhone } from '../data';
import { validateImage } from '../images';
import { Art, Icon } from '../components/Art';
import { Button, Dialog, Field, Head, ResourceState } from '../components/UI';
import { WhatsApp } from '../components/TripDialogs';
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
          className="w-full min-h-50 flex flex-col items-center justify-center gap-3.5 [background:var(--color-sage)] [border:1px_dashed_#90b4a9] rounded-[12px] text-center p-5 [&_.art]:w-full [&_.art]:aspect-[16/9] cursor-pointer relative [&_input]:absolute [&_input]:inset-0 [&_input]:opacity-[0] [&_input]:cursor-pointer [&_input]:w-full [&_input]:h-full [&:focus-within]:[outline:2px_solid_var(--color-brand)]"
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
          <p
            className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
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
      <Art
        className="w-full h-full aspect-[16/9] rounded-[12px] mb-4"
        name={custom || auto}
        alt="Pratinjau foto perjalanan"
      />
      <button
        className="flex items-center gap-4 py-4.5 px-0 [border-top:1px_solid_var(--color-line)] [&_small]:text-[13px] w-full text-left [&_small]:block"
        onClick={() => setCustom(null)}
      >
        <Icon name="check" />
        <span>
          <b>Gunakan foto otomatis</b>
          <small>Foto destinasi akan tampil sebagai cover trip.</small>
        </span>
      </button>
      <button
        className="flex items-center gap-4 py-4.5 px-0 [border-top:1px_solid_var(--color-line)] [&_small]:text-[13px] w-full text-left [&_small]:block"
        onClick={() => setUploading(true)}
      >
        <Icon name="upload" />
        <span>
          <b>Unggah foto sendiri</b>
          <small>Pilih JPG, PNG, atau WebP · maksimal 5 MB.</small>
        </span>
      </button>
      <p className="hint text-[12px] mt-3.5 [&_.icon]:mr-[9px]">
        Pilihan diterapkan ke form. Simpan trip untuk menyimpan perubahan cover.
      </p>
      <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
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
export function TripEditorPage() {
  const { id } = useParams();
  const resource = useResource(id ? '/me/trips/' + encodeURIComponent(id) : null);
  if (id && (resource.loading || resource.error || !resource.data))
    return (
      <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
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
      ? {
          ...existing,
          cover: existing.customCover,
          value: existing.value ?? '',
        }
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
  const set = (k, v) =>
    setT((prev) => ({
      ...prev,
      [k]: v,
    }));
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
    const record = {
      ...t,
      city: t.city.trim(),
      country: t.country.trim(),
      status,
    };
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
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7! [&_.page-head]:mb-[55px] mobile:[&_.page-head]:mb-4.5!">
      <Head
        title="Perjalananmu bisa jadi kesempatan titip."
        subtitle="Isi tujuan, jadwal, toko, dan fee sebelum mempublikasikan trip."
      />
      <div className="text-right text-[12px] text-muted pb-3 [border-bottom:1px_solid_var(--color-line)] mb-8 mobile:mb-4!">
        {published ? 'Trip telah dipublikasikan' : 'Draf belum dipublikasikan'}
      </div>
      <div className="grid gap-6 grid-cols-[minmax(0,_1.97fr)_minmax(0,_1fr)] tablet:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]! mobile:grid-cols-[1fr]! mobile:gap-4! mobile:flex! mobile:flex-col!">
        <form
          className="rounded-2xl border border-line bg-white overflow-hidden p-[25px] [&_.sub]:text-[13px] [&_h3]:mt-[27px] [&_h3]:mx-0 [&_h3]:mb-[5px] [&_hr]:my-7 [&_hr]:mx-0 [&_>_.btn.light]:mt-[15px] [&_>_.btn.light]:mx-0 [&_>_.btn.light]:mb-0 mobile:p-4.5! mobile:[&_.actions_.btn]:[flex:1]!"
          onSubmit={(e) => {
            e.preventDefault();
            save('published');
          }}
        >
          <fieldset
            disabled={busy}
            className="[border:0] p-0 m-0 min-w-0 [&:disabled]:opacity-[0.75]"
          >
            <h2 className="mobile:text-[22px]!">Detail perjalanan</h2>
            <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
              Tuliskan informasi yang dibutuhkan calon penitip.
            </p>
            <hr />
            <datalist id="countries">
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </datalist>
            <div className="form-grid grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[20px_26px] mobile:gap-3.5! mobile:[&_input]:p-2.5! mobile:[&_output]:p-2.5!">
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
            <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
              Hari ke-0 adalah tanggal berangkat. Jadwal tidak dapat diubah setelah ada permintaan
              kontak.
            </p>
            <div className="flex items-center flex-wrap my-4 mx-0 gap-[9px] [&_>_.text-btn]:ml-auto">
              {t.stores.map((name, i) => (
                <div className="w-full p-3 [border:1px_solid_#e6e4e5] rounded-[10px]" key={name}>
                  <div className="flex justify-between items-center gap-3 mb-3">
                    <b>{name}</b>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-brand font-bold text-left text-[13px] [&:hover]:[text-decoration:underline]"
                      aria-label={'Hapus ' + name}
                      onClick={() => remove(i)}
                    >
                      Hapus ×
                    </button>
                  </div>
                  <div className="form-grid grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[20px_26px] mobile:gap-3.5! mobile:[&_input]:p-2.5! mobile:[&_output]:p-2.5!">
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
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-brand font-bold text-left text-[13px] [&:hover]:[text-decoration:underline]"
                  onClick={() => setAdding(true)}
                >
                  ＋ Tambah toko
                </button>
              )}
            </div>
            {adding && (
              <div className="flex gap-2 [&_input]:[flex:1] mobile:[&_.btn]:[padding-inline:12px]!">
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
            <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
              Fee berlaku untuk setiap titipan pada trip ini.
            </p>
            <div className="flex gap-3.5 my-5 mx-0 [&_.btn]:min-w-35 tablet:[&_.btn]:min-w-0!">
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
            <div className="form-grid grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[20px_26px] mobile:gap-3.5! mobile:[&_input]:p-2.5! mobile:[&_output]:p-2.5!">
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
            <p className="sub text-[14px] mt-2 mobile:text-[13px]!">
              Nomor diambil dari profil akunmu.
            </p>
            <Button kind="light" icon="wa" className="w-full" to="/profile">
              WhatsApp akun · {maskPhone(user.phone)}
            </Button>
            {error && (
              <p
                className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
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
          <div className="rounded-2xl border border-line bg-white overflow-hidden [&_.btn.primary]:w-full [&_.btn.primary]:min-h-12 [&_+_.side-note]:mt-5.5">
            <div className="relative aspect-[16/9] [&_.art]:w-full [&_.art]:h-full [&_.tag]:absolute [&_.tag]:top-4 [&_.tag]:left-4 [&_.tag]:[background:white] [&_.btn]:absolute [&_.btn]:bottom-3.5 [&_.btn]:right-4.5 [&_.btn]:min-h-8.5 [&_.btn]:py-[7px] [&_.btn]:px-[15px]">
              <Art name={previewCover} alt="Pratinjau cover trip" />
              <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
                {t.cover ? 'Foto pilihan' : 'Foto otomatis'} · {t.city || 'Destinasi'}
              </span>
              <Button disabled={busy} kind="white" icon="edit" onClick={() => setModal('photo')}>
                Ganti Foto
              </Button>
            </div>
            <div className="pt-[55px] px-5.5 pb-5.5 [&_p]:text-[13px] [&_p]:mt-[11px] [&_.fee-line_strong]:text-[27px] [&_.tag]:mt-[21px] [&_.tag]:mx-0 [&_.tag]:mb-8.5 tablet:py-[25px]! tablet:px-[15px]!">
              <h2 className="mobile:text-[22px]!">
                {t.city || t.country ? place(t) : 'Tujuan perjalanan'}
              </h2>
              <p className="flex items-center gap-[9px]">
                <Icon name="calendar" />
                {range(t, true)}
              </p>
              <hr />
              <small>Fee jastip</small>
              <div className="fee-line flex items-center gap-[13px] text-[14px] text-muted mt-3.5 [&_strong]:text-[40px] [&_strong]:text-brand [&_strong]:leading-[1.2] tablet:flex-wrap! mobile:[&_strong]:text-[34px]!">
                <strong>{fee(t)}</strong>
                <small>
                  {t.type === 'percentage'
                    ? 'Dari harga barang yang dititipkan'
                    : 'Per barang yang dititipkan'}
                </small>
              </div>
              <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
                {t.stores.length} toko terjadwal
              </span>
              <Button icon="message" onClick={() => setModal('wa')}>
                Chat Jastiper (preview)
              </Button>
            </div>
          </div>
          <div className="side-note [&_p]:flex [&_p]:items-center [&_p]:gap-3.5 [&_p]:text-[13px] [align-self:start] [border-left:2px_solid_#b4ded0] py-8.5 px-5.5 mt-2 [&_h3]:mb-6 [&_p]:mt-3 [&_p]:mx-0 [&_p]:mb-5.5 mobile:p-[15px]!">
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
        <WhatsApp
          trip={{
            ...t,
            person: user,
          }}
          preview
          close={() => setModal('')}
        />
      )}
    </main>
  );
}
