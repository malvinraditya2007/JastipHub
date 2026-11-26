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

export function countryKey(country = '') {
  const name = country.trim().toLowerCase().replace(/\s+/g, ' ');
  return countryAliases.get(name) ?? name;
}

export function destinationCover(country) {
  return landmarkCovers.get(countryKey(country)) ?? universalCover;
}
