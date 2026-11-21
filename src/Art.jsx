import {defaultCoverAssets} from './data';

const sprite='explore-AvatarAldo';
const picture={
  logo:['explore-JastipHubImportedAirplaneLogo',165.03,148.21,-33.21,-19.78],
  hero:['explore-HeroPhotoImportedBackgroundOnly',100,149.07,0,-7.22],
  aldo:[sprite,3520.93,2416.28,-3174.42,-30.23],
  owen:[sprite,3440.91,2416.28,-236.36,-1902.33],
  nadia:[sprite,3440.91,2416.28,-1290.91,-1897.67],
  kevin:[sprite,3364.44,2416.28,-2260,-1897.67],
  tokyoCard:[sprite,345.66,1194.25,-19.18,-762.07],
  seoulCard:[sprite,351.28,1180.68,-126.22,-751.14],
  singaporeCard:[sprite,344.87,1180.68,-226.65,-751.14],
  tokyo:['tokyo-TokyoShoppingDistrictGenerated',112.79,123.87,-5.9,-7.42],
  tokyoProfile:['owen-TokyoVisual',140.12,123.87,-10.18,-11.94],
  seoul:['seoul-DestinationPhotoSeoulKoreaSelatan'],singapore:['singapore-DestinationPhotoSingapura'],
  login:['login-OriginalJapaneseTravelStillLife'],
  register:['register-ShoppingToteStillLife',141.86,137.14,-32.99,-35.71]
};
const imageRatios={
  [sprite]:1514/1039,
  'explore-JastipHubImportedAirplaneLogo':1312/1199,
  'explore-HeroPhotoImportedBackgroundOnly':2175/723,
  'tokyo-TokyoShoppingDistrictGenerated':1376/768,
  'owen-TokyoVisual':1376/768,
  'register-ShoppingToteStillLife':1376/768
};
export function Art({name,className='',alt='',preserveAspectRatio=false}) {
  const landmark=defaultCoverAssets.has(name);
  const source=picture[name];
  if(!landmark && !source && !name?.startsWith('data:image/'))return <span aria-hidden="true" className={'initial '+className}>J</span>;
  const [file,width=100,height=100,left=0,top=0]=source||[];
  const src=landmark?'/art/'+name:file?'/art/'+file+'.png':name;
  const imageStyle={width:width+'%',height:height+'%',left:left+'%',top:top+'%'};
  const cropRatio=preserveAspectRatio && imageRatios[file]*height/width;

  return <span className={'art '+className}>
    {cropRatio ? <span className="art-frame">
      <span className="art-crop" style={{'--crop-ratio':cropRatio}}>
        <img alt={alt} src={src} style={imageStyle}/>
      </span>
    </span> : <img alt={alt} src={src} style={{...imageStyle,objectFit:landmark||preserveAspectRatio||!source?'cover':'fill'}}/>}
  </span>;
}
const icons={compass:'explore-IconCompass',bag:'explore-IconBag1',plus:'explore-IconPlus',plane:'explore-IconPlane',accent:'explore-YellowEditorialAccent',search:'explore-IconSearch',calendar:'tokyo-IconCalendar',date:'explore-IconCal1',down:'explore-IconDown',searchTrip:'explore-IconCompass1',globe:'explore-IconGlobe',pin:'explore-IconPin',heart:'tokyo-IconHeart',heartWhite:'explore-IconHeart',rating:'explore-StarRating',star:'tokyo-IconStar',arrow:'explore-IconArrow',next:'tokyo-IconArrow',chevron:'tokyo-IconChevron',message:'tokyo-IconMessage',shield:'tokyo-IconShield',edit:'mytrips-IconEdit',check:'editor-IconCheck',info:'editor-IconInfo',mail:'account-IconMail',eye:'login-IconEye',flag:'owen-IconFlagReport',upload:'photo-IconUpload',wa:'wa-ChatMessageIcon',store:'explore-IconBag',smallCal:'explore-IconCal',selectedStar:'review-SelectedRatingStar1',location:'tokyo-IconPin'};
export function Icon({name,size=18,className=''}){return <img alt="" aria-hidden="true" className={'icon '+className} width={size} height={size} src={'/art/'+(icons[name]||name)+'.svg'}/>;}
