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
        { type: 'text/plain' },
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
      <code className="recovery-code" data-testid="recovery-code">
        {code}
      </code>
      <div className="actions">
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
        <p className="hint" role="status">
          {copyError}
        </p>
      )}
      <label className="checkbox">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        Saya sudah menyimpan kode ini di tempat pribadi.
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <Button disabled={!saved || busy} onClick={onContinue}>
          {busy ? 'Memproses…' : 'Lanjutkan'}
        </Button>
      </div>
    </Dialog>
  );
}
