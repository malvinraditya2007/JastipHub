import { useState } from 'react';
import { range } from '../data';
import { request } from '../services/api';
import { useApp } from '../services/store';
import { Icon } from './Art';
import { Button, Dialog } from './UI';
export function Report({ person, close }) {
  const { setMessage } = useApp();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await request('/reports', {
        method: 'POST',
        body: {
          targetId: person.id,
          reason,
          details,
        },
      });
      close();
      setMessage('Laporan diterima. Nomor: ' + result.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title="Laporkan profil jastiper"
      subtitle="Laporkan perilaku atau informasi yang mencurigakan."
      onClose={() => !busy && close()}
    >
      <form onSubmit={submit}>
        {['Informasi trip menyesatkan', 'Meminta pembayaran mencurigakan', 'Alasan lainnya'].map(
          (r) => (
            <label
              className="flex items-center gap-4 py-4.5 px-0 [border-top:1px_solid_var(--color-line)]"
              key={r}
            >
              <input
                required
                type="radio"
                name="reason"
                checked={r === reason}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ),
        )}
        <label className="field [&_span:first-child]:block grid gap-2.5 text-[14px] font-semibold [&_:is(input,_textarea,_output)]:w-full [&_:is(input,_textarea,_output)]:font-medium [&_textarea]:resize-y mobile:text-[13px]!">
          <span>Penjelasan {reason === 'Alasan lainnya' ? '(wajib)' : '(opsional)'}</span>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required={reason === 'Alasan lainnya'}
            maxLength="2000"
            rows="3"
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
          <Button kind="light" disabled={busy} onClick={close}>
            Batal
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Mengirim…' : 'Kirim Laporan'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
export function WhatsApp({ trip: t, close, preview = false, stopId }) {
  const { user } = useApp();
  const p = t.person || user;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const stop = t.stops?.find((s) => s.id === stopId);
  const msg = `Halo ${p.name}, aku menemukan trip ${t.city || 'pilihanmu'} di JastipHub. Masih menerima titipan? ${stop ? `Boleh tanya produk di ${stop.name} dan total biayanya?` : 'Boleh tanya produk dan total biayanya?'}`;
  async function open() {
    setBusy(true);
    setError('');
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    try {
      const result = await request('/trips/' + t.id + '/contact', {
        method: 'POST',
        body: stopId
          ? {
              stopId,
            }
          : {},
      });
      if (tab) {
        tab.location.replace(result.url);
        close();
      } else setFallbackUrl(result.url);
    } catch (error) {
      tab?.close();
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={'Hubungi ' + p.name + ' di WhatsApp'}
      subtitle={'Trip ' + (t.city || 'pilihanmu') + ' · ' + range(t)}
      onClose={() => !busy && close()}
    >
      <div className="[background:var(--color-sage)] rounded-[12px] p-4 my-4 mx-0 [&_h4]:my-2.5 [&_h4]:mx-0 [&_p]:text-ink">
        <Icon name="wa" size={28} />
        <h4>Pesan otomatis</h4>
        <p>{msg}</p>
      </div>
      <p className="text-[13px] rounded-[12px] p-4 my-4 mx-0 [background:#f5f5f8]">
        Permintaan membuka kontak dicatat saat kamu menekan Buka WhatsApp. Pesan dan transaksi di
        WhatsApp tidak otomatis terverifikasi.
      </p>
      {error && (
        <p
          className="text-[#9b2e26] [background:#fff1ef] py-2.5 px-3 rounded-[8px] text-[14px] my-3 mx-0"
          role="alert"
        >
          {error}
        </p>
      )}
      {fallbackUrl && (
        <p className="hint text-[12px] mt-3.5 [&_.icon]:mr-[9px]">
          Browser memblokir tab baru. Kontak sudah tercatat; lanjutkan melalui tautan di bawah.
        </p>
      )}
      <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
        <Button kind="light" disabled={busy} onClick={close}>
          Tutup preview
        </Button>
        {!preview &&
          user &&
          (fallbackUrl ? (
            <a
              className="btn inline-flex items-center justify-center gap-2 rounded-[11px] font-bold text-sm min-h-10 py-2 px-5.5 [transition:background_0.15s,_color_0.15s] leading-[1.25] text-center [&.primary]:bg-brand [&.primary]:text-white [&.primary:hover]:[background:#04564e] [&.white]:bg-white [&.white]:text-deep [&.light]:bg-sage [&.light]:text-deep [&.muted]:[background:#f4f1ee] [&.muted]:text-muted [&.white:hover]:[background:#d9ece5] [&.light:hover]:[background:#d9ece5] [&.muted:hover]:[background:#d9ece5] primary"
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              Lanjut ke WhatsApp
            </a>
          ) : (
            <Button disabled={busy} onClick={open}>
              {busy ? 'Mencatat kontak…' : 'Buka WhatsApp'}
            </Button>
          ))}
      </div>
    </Dialog>
  );
}
