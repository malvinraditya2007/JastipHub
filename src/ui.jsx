import {useEffect,useRef,useState} from 'react';
import {Link,NavLink,Outlet,useLocation,useNavigate,Navigate} from 'react-router';
import {Art,Icon} from './Art';
import {useApp} from './store';
export function Button({to,kind='primary',icon,children,className='',...props}){
  const attrs={className:'btn '+kind+' '+className,...props};
  const content=<>{icon && <Icon name={icon}/ >}{children}</>;
  return to?<Link {...attrs} to={to}>{content}</Link>:<button type="button" {...attrs}>{content}</button>;
}
export function Brand(){return <Link to="/" className="brand" aria-label="JastipHub, beranda"><Art name="logo"/>JastipHub</Link>}
export function Dialog({title,children,onClose,subtitle}){
  const ref=useRef(null);
  useEffect(()=>{const el=ref.current; const old=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return ()=>{el.close();document.body.style.overflow=old}},[]);
  return <dialog ref={ref} aria-label={title} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===ref.current)onClose()}}>
    <div className="dialog-body"><h2>{title}</h2>{subtitle && <p className="sub">{subtitle}</p>}{children}</div>
  </dialog>;
}
export function How({close}){return <Dialog title="Cara kerja JastipHub" subtitle="Pilih trip, cek informasinya, lalu hubungi jastiper." onClose={close}>
  {[['search','Temukan perjalanan','Cari destinasi dan toko, lalu lihat tanggal trip serta fee.'],['shield','Periksa jastiper','Baca profil, riwayat ulasan, dan aturan fee sebelum chat.'],['wa','Lanjut via WhatsApp','Diskusikan produk, pembayaran, dan pengiriman langsung.']].map(([i,h,t])=><div className="how-row" key={h}><span><Icon name={i} size={24}/></span><div><h3>{h}</h3><p>{t}</p></div></div>)}
  <p className="hint">JastipHub tidak memproses pembayaran atau menjamin transaksi.</p><div className="actions"><Button onClick={close}>Tutup</Button></div>
</Dialog>}
export function Layout(){
  const {user}=useApp();const [how,setHow]=useState(false);const {pathname}=useLocation();
  const activeExplore=pathname==='/'||pathname.startsWith('/trips/')&&!pathname.includes('edit')&&!pathname.includes('baru')||pathname.startsWith('/jastiper/');
  const activeMine=pathname==='/my-trips'||pathname.includes('/edit')||pathname==='/trips/baru';
  return <><header><div className="navbar"><Brand/><nav aria-label="Navigasi utama"><Link className={activeExplore?'active':''} to="/"><Icon name="compass"/>Explore</Link><Link className={activeMine?'active':''} to="/my-trips"><Icon name="bag"/>My Trips</Link><button onClick={()=>setHow(true)}>Cara Kerja</button></nav><div className="nav-right"><Button to="/trips/baru" icon="plus">Buat Trip</Button><NavLink to={user?'/profile':'/login'} className="profile-link">{user?<Art name={user.avatar} className="avatar"/>:<Icon name="bag"/>}{user?'Profil':'Masuk'}</NavLink></div></div></header><Outlet/>{how&&<How close={()=>setHow(false)}/>}</>;
}
export function Gate({children}){const {user}=useApp();const loc=useLocation();return user?children:<Navigate replace to={'/login?next='+encodeURIComponent(loc.pathname+loc.search)}/>;}
export function Head({title,subtitle,extra}){return <div className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div>{extra}</div>}
export function Empty({children}){return <div className="empty">{children}</div>}
export function Notices(){const {message,setMessage}=useApp();useEffect(()=>{if(message){const timer=setTimeout(()=>setMessage(''),4500);return ()=>clearTimeout(timer);}},[message,setMessage]);return message?<div className="toast" role="status">{message}<button aria-label="Tutup pemberitahuan" onClick={()=>setMessage('')}>×</button></div>:null;}
export function useSave(){
 const {user,toggle}=useApp(),nav=useNavigate(),loc=useLocation();
 return id=>{if(user)toggle(id);else nav('/login?next='+encodeURIComponent(loc.pathname+loc.search),{state:{save:id}})};
}
export function Missing(){return <main className="page"><Head title="Halaman tidak ditemukan." subtitle="Trip atau halaman ini tidak tersedia."/><Button to="/">Kembali ke Explore</Button></main>}
export function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
