import { twMerge } from 'tailwind-merge';
import { defaultCoverAssets } from '../data';
const picture = {
  logo: ['explore-JastipHubImportedAirplaneLogo', 165.03, 148.21, -33.21, -19.78],
  hero: ['explore-HeroPhotoImportedBackgroundOnly', 100, 149.07, 0, -7.22],
  login: ['login-OriginalJapaneseTravelStillLife'],
  register: ['register-ShoppingToteStillLife', 141.86, 137.14, -32.99, -35.71],
};
const imageRatios = {
  'explore-JastipHubImportedAirplaneLogo': 1312 / 1199,
  'explore-HeroPhotoImportedBackgroundOnly': 2175 / 723,
  'register-ShoppingToteStillLife': 1376 / 768,
};
export function Art({
  name,
  className = '',
  alt = '',
  preserveAspectRatio = false,
  fallback,
  onError,
}) {
  const landmark = defaultCoverAssets.has(name);
  const source = picture[name];
  const uploaded =
    typeof name === 'string' &&
    (/^\/uploads\/[a-f0-9-]+\.webp$/.test(name) ||
      /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(name) ||
      name.startsWith('data:image/') ||
      name.startsWith('blob:'));
  if (!landmark && !source && !uploaded)
    return (
      fallback || (
        <span
          aria-hidden="true"
          className={twMerge(
            'inline-grid place-items-center bg-sage text-brand font-bold ' + className,
          )}
        >
          J
        </span>
      )
    );
  const [file, width = 100, height = 100, left = 0, top = 0] = source || [];
  const src = landmark ? '/art/covers/' + name : file ? '/art/' + file + '.png' : name;
  const imageStyle = {
    '--art-width': width + '%',
    '--art-height': height + '%',
    '--art-left': left + '%',
    '--art-top': top + '%',
  };
  const cropRatio = preserveAspectRatio && (imageRatios[file] * height) / width;
  return (
    <span className={twMerge('art block relative overflow-hidden isolate', className)}>
      {cropRatio ? (
        <span className="absolute inset-0 [container-type:size]">
          <span
            className="absolute top-[50%] left-[50%] w-[max(100cqw,_calc(100cqh_*_var(--crop-ratio)))] aspect-[var(--crop-ratio)] [translate:-50%_-50%] overflow-hidden"
            style={{
              '--crop-ratio': cropRatio,
            }}
          >
            <img
              alt={alt}
              src={src}
              onError={onError}
              className="absolute block max-w-none w-[var(--art-width)] h-[var(--art-height)] left-[var(--art-left)] top-[var(--art-top)]"
              style={imageStyle}
            />
          </span>
        </span>
      ) : (
        <img
          alt={alt}
          src={src}
          onError={onError}
          className={twMerge(
            'absolute block max-w-none w-[var(--art-width)] h-[var(--art-height)] left-[var(--art-left)] top-[var(--art-top)]',
            landmark || preserveAspectRatio || !source ? 'object-cover' : 'object-fill',
          )}
          style={imageStyle}
        />
      )}
    </span>
  );
}
const icons = {
  compass: 'explore-IconCompass',
  bag: 'explore-IconBag1',
  plus: 'explore-IconPlus',
  plane: 'explore-IconPlane',
  accent: 'explore-YellowEditorialAccent',
  search: 'explore-IconSearch',
  calendar: 'tokyo-IconCalendar',
  date: 'explore-IconCal1',
  down: 'explore-IconDown',
  searchTrip: 'explore-IconCompass1',
  globe: 'explore-IconGlobe',
  pin: 'explore-IconPin',
  heart: 'tokyo-IconHeart',
  heartWhite: 'explore-IconHeart',
  rating: 'explore-StarRating',
  star: 'tokyo-IconStar',
  arrow: 'explore-IconArrow',
  next: 'tokyo-IconArrow',
  chevron: 'tokyo-IconChevron',
  message: 'tokyo-IconMessage',
  shield: 'tokyo-IconShield',
  edit: 'mytrips-IconEdit',
  check: 'editor-IconCheck',
  info: 'editor-IconInfo',
  eye: 'login-IconEye',
  flag: 'owen-IconFlagReport',
  upload: 'photo-IconUpload',
  wa: 'wa-ChatMessageIcon',
  store: 'explore-IconBag',
  smallCal: 'explore-IconCal',
  selectedStar: 'review-SelectedRatingStar1',
  location: 'tokyo-IconPin',
};
export function Icon({ name, size = 18, className = '' }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={twMerge('icon inline-block flex-none align-middle object-contain ' + className)}
      width={size}
      height={size}
      src={'/art/' + (icons[name] || name) + '.svg'}
    />
  );
}
