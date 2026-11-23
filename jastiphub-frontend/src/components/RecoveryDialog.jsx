import { useState } from 'react';
import { Button, Dialog } from './UI';
export function RecoveryDialog({ code, onContinue, error = '', busy = false }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          `Kode pemulihan JastipHub\n\n${code}\n\nSimpan secara pribadi. Kode ini dapat dipakai satu kali untuk mengganti password.\n`,
        ],
        {
          type: 'text/plain',
        },
      ),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jastiphub-kode-pemulihan.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <Dialog
      title="Simpan kode pemulihanmu"
      subtitle="Gunakan kode ini jika lupa password. Kode hanya ditampilkan sekarang dan diganti setelah digunakan."
      onClose={() => {}}
    >
      <code
        className="block text-[18px] [background:#e8f5ef] text-[#074e48] [overflow-wrap:anywhere] p-5 rounded-[12px] mt-6 select-all"
        data-testid="recovery-code"
      >
        {code}
      </code>
      <div className="actions flex flex-wrap items-center justify-end gap-3 mt-7 mobile:gap-2!">
        <Button
          kind="light"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setCopyError('');
            } catch {
              setCopyError(
                'Browser membatasi clipboard. Gunakan Unduh kode atau pilih dan salin kode secara manual.',
              );
            }
          }}
        >
          {copied ? 'Tersalin' : 'Salin kode'}
        </Button>
        <Button kind="light" onClick={download}>
          Unduh kode
        </Button>
      </div>
      {copyError && (
        <p className="hint text-[12px] mt-3.5 [&_.icon]:mr-[9px]" role="status">
          {copyError}
        </p>
      )}
      <label className="flex gap-[13px] items-start text-[12px] text-muted mt-7.5">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        Saya sudah menyimpan kode ini di tempat pribadi.
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
        <Button disabled={!saved || busy} onClick={onContinue}>
          {busy ? 'Memproses…' : 'Lanjutkan'}
        </Button>
      </div>
    </Dialog>
  );
}
