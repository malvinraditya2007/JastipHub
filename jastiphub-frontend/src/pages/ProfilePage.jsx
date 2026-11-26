import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp, useResource } from '../services/store';
import { maskPhone, range } from '../data';
import { validateImage } from '../images';
import { Icon } from '../components/Art';
import { Avatar } from '../components/Avatar';
import { avatarColors } from '../utils/avatar';
import { Head, Field, Button, Dialog, Empty, ResourceState } from '../components/UI';
function EditProfile({ close }) {
  const { user, updateProfile, upload, setMessage } = useApp();
  const [avatar, setAvatar] = useState(user.avatar);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || null);
  const [displayName, setDisplayName] = useState(user.name);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError('');
    try {
      await updateProfile({
        ...values,
        avatar,
        avatarColor,
      });
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
        <fieldset
          className="[border:0] p-0 m-0 min-w-0 [&:disabled]:opacity-[0.75]"
          disabled={busy}
        >
          <div className="inline-person flex items-center gap-3 [&_small]:flex [&_small]:items-center [&_small]:gap-[5px]">
            <Avatar
              src={avatar}
              name={displayName}
              color={avatarColor}
              className="avatar w-10.5 h-10.5 rounded-[50%] flex-none [&.large]:w-18 [&.large]:h-18 [&.giant]:w-[125px] [&.giant]:h-[125px] mobile:[&.giant]:w-18! mobile:[&.giant]:h-18! large"
            />
            <label className="btn inline-flex items-center justify-center gap-2 rounded-[11px] font-bold text-sm min-h-10 py-2 px-5.5 [transition:background_0.15s,_color_0.15s] leading-[1.25] text-center light bg-sage text-deep [&:hover]:[background:#d9ece5] cursor-pointer relative [&_input]:absolute [&_input]:inset-0 [&_input]:opacity-[0] [&_input]:cursor-pointer [&_input]:w-full [&_input]:h-full [&:focus-within]:[outline:2px_solid_var(--color-brand)]">
              {busy ? 'Memproses…' : 'Ubah foto'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => select(e.target.files[0])}
              />
            </label>
            {avatar && (
              <Button kind="light" onClick={() => setAvatar('')}>
                Gunakan inisial
              </Button>
            )}
          </div>
          <p className="hint text-[12px] mt-3 mb-5">
            Foto profil opsional. Tanpa foto, inisial namamu akan tampil otomatis.
          </p>
          {!avatar && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Warna inisial</p>
              <div
                role="group"
                aria-label="Warna inisial"
                className="flex flex-wrap items-center gap-2"
              >
                <button
                  type="button"
                  aria-pressed={!avatarColor}
                  onClick={() => setAvatarColor(null)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${!avatarColor ? 'border-brand bg-sage text-brand' : 'border-line text-muted'}`}
                >
                  Otomatis
                </button>
                {avatarColors.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={label}
                    title={label}
                    aria-pressed={avatarColor === value}
                    onClick={() => setAvatarColor(value)}
                    className="grid size-8 place-items-center rounded-full text-white outline-offset-2 aria-pressed:outline-2 aria-pressed:outline-brand focus-visible:outline-2 focus-visible:outline-brand"
                    style={{ backgroundColor: value }}
                  >
                    {avatarColor === value && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
              <p className="hint text-[12px] mt-2">
                Otomatis memilih warna dari namamu dan tetap sama setiap kali dibuka.
              </p>
            </div>
          )}
          <div className="form-grid grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[20px_26px] mobile:gap-3.5! mobile:[&_input]:p-2.5! mobile:[&_output]:p-2.5!">
            {[
              ['name', 'Nama lengkap', 100],
              ['handle', 'Username', undefined],
              ['phone', 'Nomor WhatsApp', 30],
              ['city', 'Domisili', 100],
            ].map(([key, label, max]) => (
              <Field key={key} label={label}>
                <input
                  name={key}
                  required={key !== 'city'}
                  type={key === 'phone' ? 'tel' : 'text'}
                  maxLength={max}
                  defaultValue={user[key]}
                  onChange={
                    key === 'name' ? (event) => setDisplayName(event.target.value) : undefined
                  }
                />
              </Field>
            ))}
          </div>
          <p className="hint text-[12px] mt-3.5 [&_.icon]:mr-[9px]">
            Nomor WhatsApp lengkap hanya diberikan melalui aksi kontak setelah login.
          </p>
          {error && (
            <p
              role="alert"
              className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
            >
              {error}
            </p>
          )}
          <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
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
export function ProfilePage() {
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
    <main className="w-[min(88.6%,_1240px)] [margin-inline:auto] pt-[49px] pb-14.5 tablet:w-[92%]! mobile:pt-7!">
      <Head title="Profil & pengaturan akun." subtitle="Kelola informasi profil dan kontakmu." />
      <section className="[&_h2]:text-[28px] [&_.tag]:mt-6 flex items-center gap-6 p-[31px] [&_.btn]:ml-auto [&_.btn]:min-w-42.5 mobile:p-5! mobile:gap-[15px]! mobile:[&_h2]:text-[24px]! mobile:[&_.tag]:mt-2.5! mobile:flex-wrap! mobile:[&_.btn]:min-w-0! mobile:[&_.btn]:ml-0! rounded-2xl border border-line bg-white overflow-hidden">
        <Avatar
          src={user.avatar}
          name={user.name}
          color={user.avatarColor}
          className="avatar w-10.5 h-10.5 rounded-[50%] flex-none [&.large]:w-18 [&.large]:h-18 [&.giant]:w-[125px] [&.giant]:h-[125px] mobile:[&.giant]:w-18! mobile:[&.giant]:h-18! giant"
        />
        <div>
          <h2 className="mobile:text-[22px]!">{user.name}</h2>
          <p>@{user.handle}</p>
          <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
            Akun terdaftar
          </span>
        </div>
        <Button kind="light" icon="edit" onClick={() => setEdit(true)}>
          Edit Profil
        </Button>
      </section>
      <section className="mt-13 [&_.story:first-of-type]:mt-[25px] mobile:my-7.5! mobile:mx-0! mobile:[&_.sub]:mb-3!">
        <h2 className="mobile:text-[22px]!">Informasi akun</h2>
        <div className="grid gap-6 grid-cols-[1.57fr_1fr] mt-4 tablet:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]! mobile:grid-cols-[1fr]! mobile:gap-4!">
          <div className="rounded-2xl border border-line bg-white overflow-hidden p-[25px] [&_>_div]:flex [&_>_div]:items-start [&_>_div]:gap-4.5 [&_>_div]:py-5 [&_>_div]:px-0 [&_>_div]:[border-bottom:1px_solid_var(--color-line)] [&_>_div:last-child]:[border:0] [&_b]:block [&_p]:text-[13px] mobile:p-4.5!">
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
          <div className="rounded-2xl border border-line bg-white overflow-hidden [&_p]:flex [&_p]:items-center [&_p]:gap-[5px] p-[25px] [&_p]:text-[13px] flex flex-col justify-center [&_h3]:pt-3 [&_h3]:px-0 [&_h3]:pb-4.5 [&_h3]:[border-bottom:1px_solid_var(--color-line)] mobile:p-4.5!">
            <h3>Riwayat permintaan kontak</h3>
            <ResourceState resource={contacts} />
            {!contacts.loading &&
              !contacts.error &&
              (contacts.data?.length ? (
                contacts.data.map(({ trip: t, eligible, reviewed, reason }) => (
                  <div
                    className="[&_>_.btn]:w-full [&_>_.btn]:min-h-12 pt-4.5 px-0 pb-0 [&_.tag]:my-4.5 [&_.tag]:mx-0 [&_.tag]:w-full"
                    key={t.id}
                  >
                    <div className="inline-person flex items-center gap-3 [&_small]:flex [&_small]:items-center [&_small]:gap-[5px]">
                      <Avatar
                        src={t.person.avatar}
                        name={t.person.name}
                        color={t.person.avatarColor}
                        className="avatar w-10.5 h-10.5 rounded-[50%] flex-none [&.large]:w-18 [&.large]:h-18 [&.giant]:w-[125px] [&.giant]:h-[125px] mobile:[&.giant]:w-18! mobile:[&.giant]:h-18!"
                      />
                      <div>
                        <b>
                          {t.person.name} · {t.city} Trip
                        </b>
                        <p>{range(t)}</p>
                      </div>
                    </div>
                    <span className="tag bg-sage text-deep inline-flex items-center justify-center py-[7px] px-[23px] rounded-[50px] text-[12px] font-semibold">
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
      <aside className="flex items-start gap-[17px] text-deep [border-top:1px_solid_var(--color-line)] mt-8.5 py-[21px] px-0 [&_p]:text-[13px] [&_p]:text-inherit [&_p]:mt-1">
        <Icon name="shield" size={24} />
        <div>
          <h3>Ulasan bukan verifikasi pembelian.</h3>
          <p>
            Riwayat mencatat permintaan membuka kontak. Pesan dan transaksi di WhatsApp tidak
            otomatis terverifikasi.
          </p>
        </div>
      </aside>
      <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
        <button
          disabled={busy}
          className="inline-flex items-center gap-2 text-brand font-bold text-left text-[13px] [&:hover]:[text-decoration:underline]"
          onClick={exit}
        >
          {busy ? 'Keluar…' : 'Keluar akun'}
        </button>
      </div>
      {edit && <EditProfile close={() => setEdit(false)} />}
    </main>
  );
}
