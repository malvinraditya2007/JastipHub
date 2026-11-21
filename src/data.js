export const people = {
  owen: {id:'owen', name:'Owen', handle:'owenjastip', avatar:'owen', rating:4.9, count:128, phone:'12025550100'},
  nadia: {id:'nadia', name:'Nadia', handle:'nadiajastip', avatar:'nadia', rating:4.8, count:97, phone:'12025550101'},
  kevin: {id:'kevin', name:'Kevin', handle:'kevinjastip', avatar:'kevin', rating:4.9, count:205, phone:'12025550102'},
};
export const demo = {id:'aldo', name:'Aldo Pratama', handle:'aldojastip', email:'aldo@example.com', phone:'12025550103', city:'Tangerang, Indonesia', avatar:'aldo'};
export const countries = [
  'Jepang','Korea Selatan','Singapura','Thailand','Hong Kong',
  'Malaysia','Taiwan','Vietnam','Tiongkok','Australia','Inggris','Amerika Serikat',
];
export const seeds = [
  {id:'tokyo',city:'Tokyo',country:'Jepang',owner:'owen',start:'2026-12-10',end:'2026-12-15',value:10,stores:['Nintendo Tokyo','Uniqlo Ginza','Don Quijote Shibuya'],categories:['Gaming & merchandise','Fashion & daily essentials','Souvenir & kebutuhan harian'],days:[0,1,2],cover:'tokyo',thumb:'tokyoCard'},
  {id:'seoul',city:'Seoul',country:'Korea Selatan',owner:'nadia',start:'2026-12-12',end:'2026-12-17',value:8,stores:['Olive Young','Musinsa','The Hyundai Seoul'],categories:['Beauty & skincare','Fashion & streetwear','Fashion & lifestyle'],days:[0,1,3],cover:'seoul',thumb:'seoulCard'},
  {id:'singapura',city:'Singapura',country:'Singapura',owner:'kevin',start:'2026-12-14',end:'2026-12-18',value:10,stores:['FairPrice','POP MART','Changi Jewel'],categories:['Groceries & kebutuhan harian','Collectibles & merchandise','Souvenir & lifestyle'],days:[0,1,3],cover:'singapore',thumb:'singaporeCard'},
].map(t=>({...t,type:'percentage',status:'published'}));
export const bangkok = {id:'bangkok',city:'Bangkok',country:'Thailand',owner:'aldo',start:'2027-01-21',end:'2027-01-26',value:8,type:'percentage',stores:['CentralWorld','Siam Paragon','Big C Ratchadamri'],cover:null,status:'published'};
export const pastTrip = {...seeds[0],id:'osaka',city:'Osaka',start:'2026-11-04',end:'2026-11-09',stores:['Shinsaibashi']};
export const initial = {accounts:[demo],current:null,trips:[bangkok],saved:{aldo:['seoul','singapura']},contacts:{aldo:['osaka']},reviews:[],reports:[]};
export const money = n=>'Rp '+Number(n).toLocaleString('id-ID');
export const fee = t=>t.type==='fixed_per_item'?money(t.value):t.value+'%';
export const place = t=>t.city===t.country?t.city:t.city+', '+t.country;
export function range(t,short=false){
  if(!t.start || !t.end) return 'Tanggal belum lengkap';
  const a=new Date(t.start+'T12:00:00'), b=new Date(t.end+'T12:00:00');
  const same=a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear();
  const options={day:'numeric',month:short?'short':'long',year:'numeric'};
  return (same?a.getDate():a.toLocaleDateString('id-ID',options))+'–'+b.toLocaleDateString('id-ID',options);
}
export function today(){
  const now=new Date();
  return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
}
const landmarkCovers = new Map([
  ['jepang','cover-japan.png'],
  ['korea selatan','cover-south-korea.png'],
  ['singapura','cover-singapore.png'],
  ['thailand','cover-thailand.png'],
  ['hong kong','cover-hong-kong.png'],
  ['malaysia','cover-malaysia.webp'],
  ['taiwan','cover-taiwan.webp'],
  ['vietnam','cover-vietnam.webp'],
  ['tiongkok','cover-china.webp'],
  ['australia','cover-australia.webp'],
  ['inggris','cover-united-kingdom.webp'],
  ['amerika serikat','cover-united-states.webp'],
]);
const countryAliases = new Map([
  ['japan','jepang'],
  ['south korea','korea selatan'],
  ['singapore','singapura'],
  ['hongkong','hong kong'],
  ['china','tiongkok'],
  ['united kingdom','inggris'],
  ['uk','inggris'],
  ['united states','amerika serikat'],
  ['usa','amerika serikat'],
]);
const universalCover = 'cover-universal.png';
export const defaultCoverAssets = new Set([...landmarkCovers.values(),universalCover]);

export function countryKey(country=''){
  const name=country.trim().toLowerCase().replace(/\s+/g,' ');
  return countryAliases.get(name)??name;
}

export function destinationCover(country){
  return landmarkCovers.get(countryKey(country))??universalCover;
}

export function uploadedCover(cover){
  return cover?.startsWith('data:image/') ? cover : null;
}
export const maskPhone = phone=>'•••• •••• '+phone.slice(-4);
export const normalizePhone = s=>s.replace(/[^0-9]/g,'').replace(/^0/,'62');
export const demoReviews=[['Nanda','owen','5.0','Komunikasi jelas dan fee sesuai yang ditampilkan.'],['Rizky','aldo','4.8','Responsif saat menjelaskan jadwal dan produk.'],['Arini','nadia','4.9','Trip dan toko dijelaskan dengan cukup rinci.']];
