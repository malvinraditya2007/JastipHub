export const countries = [
  'Jepang',
  'Korea Selatan',
  'Singapura',
  'Thailand',
  'Hong Kong',
  'Malaysia',
  'Taiwan',
  'Vietnam',
  'Tiongkok',
  'Australia',
  'Inggris',
  'Amerika Serikat',
];
export const money = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
export const fee = (t) =>
  t.value === null || t.value === '' || t.value === undefined
    ? 'Belum diisi'
    : t.type === 'fixed_per_item'
      ? money(t.value)
      : t.value + '%';
export const place = (t) => (t.city === t.country ? t.city : t.city + ', ' + t.country);
export function range(t, short = false) {
  if (!t.start || !t.end) return 'Tanggal belum lengkap';
  const a = new Date(t.start + 'T12:00:00');
  const b = new Date(t.end + 'T12:00:00');
  const same = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const options = { day: 'numeric', month: short ? 'short' : 'long', year: 'numeric' };
  return (
    (same ? a.getDate() : a.toLocaleDateString('id-ID', options)) +
    '–' +
    b.toLocaleDateString('id-ID', options)
  );
}
export function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
const landmarkCovers = new Map([
  ['jepang', 'cover-japan.png'],
  ['korea selatan', 'cover-south-korea.png'],
  ['singapura', 'cover-singapore.png'],
  ['thailand', 'cover-thailand.png'],
  ['hong kong', 'cover-hong-kong.png'],
  ['malaysia', 'cover-malaysia.webp'],
  ['taiwan', 'cover-taiwan.webp'],
  ['vietnam', 'cover-vietnam.webp'],
  ['tiongkok', 'cover-china.webp'],
  ['australia', 'cover-australia.webp'],
  ['inggris', 'cover-united-kingdom.webp'],
  ['amerika serikat', 'cover-united-states.webp'],
]);
const countryAliases = new Map([
  ['japan', 'jepang'],
  ['south korea', 'korea selatan'],
  ['singapore', 'singapura'],
  ['hongkong', 'hong kong'],
  ['china', 'tiongkok'],
  ['united kingdom', 'inggris'],
  ['uk', 'inggris'],
  ['united states', 'amerika serikat'],
  ['usa', 'amerika serikat'],
]);
const universalCover = 'cover-universal.png';
export const defaultCoverAssets = new Set([...landmarkCovers.values(), universalCover]);

export function countryKey(country = '') {
  const name = country.trim().toLowerCase().replace(/\s+/g, ' ');
  return countryAliases.get(name) ?? name;
}

export function destinationCover(country) {
  return landmarkCovers.get(countryKey(country)) ?? universalCover;
}

export const maskPhone = (phone) => '•••• •••• ' + phone.slice(-4);
