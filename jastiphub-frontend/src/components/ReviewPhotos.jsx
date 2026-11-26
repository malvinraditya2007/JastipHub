import { useState } from 'react';
import { Art, Icon } from './Art';
import { Button, Dialog } from './UI';

export function ReviewPhotos({ photos = [], onRemove, disabled = false }) {
  const [active, setActive] = useState(null);
  if (!photos.length) return null;
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3" aria-label="Foto bukti ulasan">
        {photos.map((url, index) => (
          <div key={url} className="relative">
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Perbesar foto bukti ${index + 1}`}
              className="group block size-20 overflow-hidden rounded-xl border border-line bg-sage cursor-zoom-in mobile:size-18!"
            >
              <Art
                name={url}
                alt={`Foto bukti ulasan ${index + 1}`}
                className="size-full transition-transform group-hover:scale-105"
              />
            </button>
            {onRemove && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemove(index)}
                aria-label={`Hapus foto bukti ${index + 1}`}
                className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full border border-line bg-white text-lg leading-none text-ink shadow-sm transition-colors hover:bg-sage"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {active !== null && photos[active] && (
        <Dialog
          title="Foto bukti ulasan"
          subtitle={`Foto ${active + 1} dari ${photos.length}`}
          onClose={() => setActive(null)}
        >
          <img
            src={photos[active]}
            alt={`Foto bukti ulasan ${active + 1} dalam ukuran penuh`}
            className="mt-4 max-h-[60svh] w-full rounded-xl object-contain bg-warm"
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {photos.length > 1 && (
              <div className="flex gap-2">
                <Button
                  kind="light"
                  className="px-3"
                  aria-label="Foto sebelumnya"
                  disabled={active === 0}
                  onClick={() => setActive((index) => index - 1)}
                >
                  <Icon name="chevron" className="rotate-180" />
                </Button>
                <Button
                  kind="light"
                  className="px-3"
                  aria-label="Foto berikutnya"
                  disabled={active === photos.length - 1}
                  onClick={() => setActive((index) => index + 1)}
                >
                  <Icon name="chevron" />
                </Button>
              </div>
            )}
            <Button kind="light" className="ml-auto" onClick={() => setActive(null)}>
              Tutup foto
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
