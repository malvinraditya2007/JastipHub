export const avatarColors = [
  { value: '#0f766e', label: 'Hijau' },
  { value: '#4338ca', label: 'Biru indigo' },
  { value: '#b45309', label: 'Oranye' },
  { value: '#be185d', label: 'Merah muda' },
  { value: '#0369a1', label: 'Biru' },
  { value: '#6d28d9', label: 'Ungu' },
  { value: '#b91c1c', label: 'Merah' },
];

export function avatarAppearance(name = '', selectedColor) {
  const normalized = name.trim().normalize('NFC');
  const initials = Array.from(normalized.toLocaleUpperCase('id-ID'))[0] || '?';
  let hash = 0;
  for (const character of normalized.toLocaleLowerCase('id-ID')) {
    hash = (Math.imul(hash, 31) + character.codePointAt(0)) >>> 0;
  }
  const color = /^#[0-9a-f]{6}$/i.test(selectedColor || '')
    ? selectedColor
    : avatarColors[hash % avatarColors.length].value;
  return { initials, color };
}
