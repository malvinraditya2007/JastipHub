import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Art } from './Art';
import { avatarAppearance } from '../utils/avatar';

export function Avatar({
  src,
  name = '',
  color: selectedColor,
  className = '',
  alt,
  preserveAspectRatio = false,
}) {
  const [failedSource, setFailedSource] = useState(null);
  const { initials, color } = avatarAppearance(name, selectedColor);
  const label = alt || (name ? `Foto profil ${name}` : 'Foto profil');
  const fallback = (
    <span
      role="img"
      aria-label={label}
      className={twMerge(
        'avatar inline-grid place-items-center overflow-hidden rounded-full font-semibold text-white select-none [container-type:inline-size]',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <span aria-hidden="true" className="text-[40cqw] leading-none">
        {initials}
      </span>
    </span>
  );
  if (!src || failedSource === src) return fallback;
  return (
    <Art
      name={src}
      alt={label}
      className={className}
      preserveAspectRatio={preserveAspectRatio}
      fallback={fallback}
      onError={() => setFailedSource(src)}
    />
  );
}
