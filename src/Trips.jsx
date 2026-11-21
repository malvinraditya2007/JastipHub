import {useState} from 'react';
import {useParams,useNavigate,useSearchParams,Link} from 'react-router';
import {useApp} from './store';
import {Art,Icon} from './Art';
import {fee,place,range,demoReviews,today} from './data';
import {Button,Dialog,Empty,Head,Missing,useSave} from './ui';

export function Report({person,close}){
 const {change,user,setMessage}=useApp(),[reason,setReason]=useState('');
 return <Dialog title="Laporkan profil jastiper" subtitle="Laporkan perilaku atau informasi yang mencurigakan." onClose={close}><form onSubmit={e=>{e.preventDefault();if(change(d=>({...d,reports:[...d.reports,{target:person.id,author:user?.id||null,reason,date:today()}]}))){close();setMessage('Laporan contoh tersimpan di perangkat ini.')}}}>
 {['Informasi trip menyesatkan','Meminta pembayaran mencurigakan','Alasan lainnya'].map(r=><label className="radio-row" key={r}><input required type="radio" name="reason" checked={r===reason} onChange={()=>setReason(r)}/>{r}</label>)}<p className="hint">Laporan simulasi disimpan di perangkat ini.</p><div className="actions"><Button kind="light" onClick={close}>Batal</Button><Button type="submit">Kirim Laporan</Button></div></form></Dialog>
}
export function WhatsApp({trip:t,close,preview=false}){
 const {person,contacted,user}=useApp();const p=person(t.owner);
 const msg='Halo '+p.name+', aku menemukan trip '+t.city+' di JastipHub. Masih menerima titipan? Boleh tanya produk dan total biayanya?';
 return <Dialog title={'Hubungi '+p.name+' di WhatsApp'} subtitle={'Trip '+t.city+' · '+range(t)} onClose={close}>
 <div className="msg-preview"><Icon name="wa" size={28}/><h4>Pesan otomatis</h4><p>{msg}</p></div><p className="notice">Nomor WhatsApp diambil dari profil jastiper. Kontak dicatat saat kamu membuka WhatsApp.</p>
 <div className="actions"><Button kind="light" onClick={close}>Tutup preview</Button>{!preview&&user&&<a className="btn primary" href={'https://wa.me/'+p.phone+'?text='+encodeURIComponent(msg)} target="_blank" rel="noopener noreferrer" onClick={e=>{if(!contacted(t.id)){e.preventDefault();return}close()}}>Buka WhatsApp</a>}</div></Dialog>
}
function MiniProfile({t,close}){
 const {person}=useApp(),p=person(t.owner);return <Dialog title="Profil jastiper" onClose={close}><div className="inline-person"><Art name={p.avatar} className="avatar large"/><div><h2>{p.name}</h2><p>@{p.handle}</p></div></div><p>Rating pengguna</p><div className="rating-line"><Icon name="star" size={25}/><strong>{p.rating||'—'}</strong> {p.count||0} ulasan (contoh)</div><hr/><b>Trip tersedia</b><p>{place(t)} · {range(t,true)}</p><p className="hint">Rating bersifat ilustrasi, bukan bukti transaksi.</p><div className="actions"><Button onClick={close}>Tutup</Button></div></Dialog>
}
export function Detail(){
 const {id}=useParams(),{all,person,user,saved}=useApp(),save=useSave(),nav=useNavigate();const [params,setParams]=useSearchParams();const [modal,setModal]=useState(null);
 const t=all.find(t=>t.id===id&&(t.status==='published'||t.owner===user?.id));if(!t)return <Missing/>;
 const p=person(t.owner),contact=params.get('contact')==='1'&&!!user;
 function openChat(){if(!user)nav('/login?next='+encodeURIComponent('/trips/'+id+'?contact=1'));else setParams({contact:'1'})}
 return <main className="page detail"><div className="detail-head"><div><h1>{id==='seoul'?'Seoul · Korea Selatan':place(t)}</h1><div className="meta"><span><Icon name="calendar"/>{range(t)}</span><span><Icon name="location"/>{t.stores.length} toko dalam rencana perjalanan</span></div></div><Button kind="white" icon="heart" aria-pressed={saved.includes(id)} onClick={()=>save(id)}>{saved.includes(id)?'Tersimpan':'Simpan'}</Button></div>
 <div className="detail-grid"><Art name={t.cover} className="detail-cover" alt={place(t)}/><aside className="panel contact-card"><h4>Fee jastip per barang</h4><div className="fee-line"><strong>{fee(t)}</strong> {t.type==='percentage'?'dari harga barang':'per barang'}</div><hr/><div className="inline-person"><Art name={p.avatar} className="avatar"/><div><h3>{p.name}</h3><small><Icon name="star" size={17}/> {p.rating||'—'} · {p.count||0} ulasan (contoh)</small></div></div><button className="text-btn" onClick={()=>p.id==='owen'?nav('/jastiper/owen'):setModal('profile')}>Profil &amp; ulasan jastiper <Icon name="chevron" size={16}/></button><Button icon="message" onClick={openChat}>Chat via WhatsApp</Button><p className="hint"><Icon name="shield"/>Login wajib agar kontak tercatat.</p><p className="hint">Transaksi diatur langsung via WhatsApp.</p></aside></div>
 <section className="about"><h2>Tentang perjalanan</h2><p>{p.name} akan berkunjung ke beberapa toko di {t.city}. Kamu dapat menanyakan produk yang dicari melalui WhatsApp sebelum tanggal keberangkatan.</p></section>
 <section><h2>Rute belanja {p.name}</h2><p className="sub">Toko yang direncanakan. Konfirmasi jadwal dan produk langsung lewat WhatsApp.</p>{t.stores.map((s,i)=>{const date=new Date(t.start+'T12:00');date.setDate(date.getDate()+(t.days?.[i]||0));return <div className="itinerary" key={s}><b>{date.toLocaleDateString('id-ID',{day:'numeric',month:'short'}).toUpperCase()}</b><div><h3>{s}</h3><p>{t.categories?.[i]||'Rencana kunjungan'}</p></div><button aria-label={'Tanya tentang '+s} onClick={openChat}><Icon name="next"/></button></div>})}</section>
 <section className="steps"><h2>Cara kerjanya</h2><div>{[['Temukan trip','Cek rute, toko, dan fee.'],['Hubungi jastiper','Sepakati barang lewat WhatsApp.'],['Koordinasi langsung','Pembayaran dilakukan di luar platform.']].map(([h,sub],i)=><div key={h}><strong>0{i+1}</strong><div><b>{h}</b><p>{sub}</p></div></div>)}</div></section><small>Contoh data dan jadwal untuk desain MVP. Biaya pengiriman disepakati langsung dengan jastiper.</small>
 {contact&&<WhatsApp trip={t} close={()=>setParams({},{replace:true})}/>} {modal==='profile'&&<MiniProfile t={t} close={()=>setModal(null)}/>}</main>
}
export function CompactCard({t,publicView=false}){
 return <article className="compact panel"><Art name={publicView&&t.id==='tokyo'?'tokyoProfile':publicView?t.cover:t.thumb||t.cover} alt={place(t)} preserveAspectRatio={!publicView}/><div>{publicView&&<span className="tag">Menerima titipan</span>}<h3>{publicView?place(t):t.city+' Trip'}</h3><p>{!publicView&&<Icon name="calendar"/>}{range(t,true)}</p><div><small>Jastip fee</small><strong>{fee(t)}</strong></div><Button icon="arrow" to={'/trips/'+t.id}>Lihat Trip</Button></div></article>
}
export function Jastiper(){
 const {id}=useParams(),{all,person,db}=useApp(),[report,setReport]=useState(false);const p=person(id);if(!p)return <Missing/>;
 const trips=all.filter(t=>t.owner===id&&t.status==='published'&&t.end>=today());const stories=[...db.reviews.filter(r=>all.find(t=>t.id===r.trip)?.owner===id).map(r=>[person(r.author).name,person(r.author).avatar,String(r.rating),r.text]),...(id==='owen'?demoReviews:[])];
 return <main className="page"><Head title="Kenali orang di balik trip." subtitle="Periksa reputasi, aktivitas trip, dan ulasan sebelum mengambil keputusan."/><section className="reputation panel"><div className="inline-person"><Art name={p.avatar} className="avatar giant"/><div><h2>{p.name}</h2><p>@{p.handle}</p><span className="tag">Akun terdaftar</span></div></div><div className="reputation-score"><div><strong>{p.rating||'—'} <Icon name="star" size={25}/></strong><b>{p.count||0}</b><small>Rating pengguna</small><small>Ulasan (contoh)</small></div><p>Reputasi publik berdasarkan ulasan pengguna.</p></div></section>
 <section className="content-block"><h2>Trip yang tersedia</h2><div className="available-grid"><div>{trips.map(t=><CompactCard key={t.id} t={t} publicView/>)}</div><div className="panel trust"><b><Icon name="shield"/>Tidak ada pembayaran di JastipHub.</b><p>Gunakan WhatsApp untuk menanyakan biaya, ketersediaan, dan kesepakatan.</p></div></div></section>
 <section className="content-block"><h2>Cerita dari pengguna</h2><p className="sub">Pengalaman koordinasi dari pengguna yang tercatat menghubungi jastiper. Bukan bukti transaksi.</p>{stories.map(([name,avatar,rating,text],i)=><div className="panel story" key={i}><div className="inline-person"><Art name={avatar} className="avatar"/><div><b>{name}</b><small><Icon name="star" size={15}/>{rating}</small></div></div><span>“{text}”</span></div>)}<div className="actions"><button className="text-btn" onClick={()=>setReport(true)}><Icon name="flag"/>Laporkan profil</button></div></section>
 {report&&<Report person={p} close={()=>setReport(false)}/>}</main>
}
export function MyTrips(){
 const {all,user,saved}=useApp();const mine=all.filter(t=>t.owner===user.id),bookmarks=all.filter(t=>saved.includes(t.id)&&t.status==='published');
 return <main className="page"><Head title="Trip yang kamu kelola." subtitle="Pantau perjalanan yang kamu buat dan trip yang kamu simpan." extra={<Button icon="plus" to="/trips/baru">Buat Trip Baru</Button>}/><h2>Sedang kamu tawarkan</h2>
 {mine.length?mine.map(t=><article className="offer" key={t.id}><Art name={t.cover}/><div><span className="tag">{t.status==='draft'?'Draf':'Menerima pertanyaan'}</span><h2>{place(t)}</h2><p><Icon name="calendar"/>{range(t)}</p><small>Fee trip</small><div className="offer-bottom"><strong>{fee(t)}</strong><span>{t.stores.length} toko terjadwal</span><Button to={'/trips/'+t.id+'/edit'} kind="white" icon="edit">Edit Trip</Button></div></div></article>):<Empty>Belum ada trip yang kamu buat.</Empty>}
 <section className="content-block"><h2>Disimpan untuk nanti</h2><p className="sub">Trip favorit yang ingin kamu lihat lagi.</p>{bookmarks.length?<div className="saved-grid">{bookmarks.map(t=><CompactCard key={t.id} t={t}/>)}</div>:<Empty>Belum ada trip tersimpan. <Link to="/">Cari trip di Explore</Link></Empty>}</section></main>
}
