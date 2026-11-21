import {useState} from 'react';
import {Link,useLocation,useNavigate,useSearchParams} from 'react-router';
import {useApp,digest} from './store';
import {Art,Icon} from './Art';
import {Brand,Button,Dialog,Field} from './ui';
import {normalizePhone} from './data';
export function Auth({register=false}){
 const {db,change}=useApp(),nav=useNavigate(),loc=useLocation(),[params]=useSearchParams();
 const next=params.get('next'),target=next?.startsWith('/')&&!next.startsWith('//')?next:'/';
 const [modal,setModal]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[show,setShow]=useState(false);
 const labels=register?[['name','Nama lengkap','Aldo Pratama'],['handle','Username','aldojastip'],['email','Email','aldo@example.com'],['password','Password','Minimal 8 karakter'],['phone','Nomor WhatsApp','+62 •••••••••']]:[['email','Email','aldo@example.com'],['password','Password','••••••••••']];
 function enter(account,isNew=false){const saveId=loc.state?.save;const ok=change(d=>({...d,current:account.id,accounts:isNew?[...d.accounts,account]:d.accounts,saved:saveId?{...d.saved,[account.id]:[...new Set([...(d.saved[account.id]||[]),saveId])]}:d.saved}));if(ok)nav(target,{replace:true});}
 async function submit(e){e.preventDefault();setError('');setBusy(true);const values=Object.fromEntries(new FormData(e.currentTarget));const email=values.email.trim().toLowerCase();
 try{if(register){
 const handle=values.handle.trim().replace(/^@/,'');if(!values.name.trim()||!handle)throw Error('Lengkapi nama dan username.');
 if(db.accounts.some(a=>a.email.toLowerCase()===email||a.handle.toLowerCase()===handle.toLowerCase()))throw Error('Email atau username sudah digunakan.');
 const salt=crypto.randomUUID(),hash=await digest(values.password,salt),phone=normalizePhone(values.phone);if(!/^\d{8,15}$/.test(phone))throw Error('Periksa nomor WhatsApp.');
 enter({id:crypto.randomUUID(),name:values.name.trim(),handle,email,salt,hash,phone,avatar:'',city:''},true);
 }else{const account=db.accounts.find(a=>a.email.toLowerCase()===email);
 if(!account?.hash||await digest(values.password,account.salt)!==account.hash)throw Error('Email atau password belum sesuai. Untuk mencoba akun Aldo, pilih Masuk akun demo.');
 enter(account);}}catch(err){setError(err.message)}finally{setBusy(false)}}
 return <main className={'auth '+(register?'register':'login')}><aside className="auth-art">{register?<><div><Link to="/">JastipHub</Link><h2>Belanja dari trip<br/>atau buat tripmu<br/>sendiri.</h2><p>Nggak perlu pilih role saat daftar.</p></div><Art name="register"/></>:<><Art name="login"/><div><h2>Perjalanan dimulai di sini.</h2><p>Masuk untuk bicara langsung dengan jastiper.</p><p>Temukan perjalanan menarik untuk titipan berikutnya.</p></div></>}</aside>
 <section className="auth-main">{!register&&<Brand/>}<h1>{register?'Buat akun JastipHub':'Selamat datang lagi.'}</h1><p className="sub">{register?'Temukan trip favorit dan hubungi jastiper lewat WhatsApp.':'Masuk sebelum memulai obrolan dengan jastiper.'}</p>
 <form onSubmit={submit} className={register?'panel':''}>{labels.map(([name,title,placeholder])=><Field key={name} label={title}><span className="input-wrap"><input required name={name} type={name==='password'?(show?'text':'password'):name==='phone'?'tel':name==='email'?'email':'text'} autoComplete={{password:register?'new-password':'current-password',email:'email',name:'name',handle:'username',phone:'tel'}[name]} minLength={name==='password'&&register?8:undefined} placeholder={placeholder}/>{name==='password'?<button type="button" aria-label={show?'Sembunyikan password':'Tampilkan password'} onClick={()=>setShow(!show)}><Icon name="eye"/></button>:name==='email'?<Icon name="mail"/>:null}</span></Field>)}
 {!register&&<button className="forgot text-btn" type="button" onClick={()=>setModal('forgot')}>Lupa password?</button>}{error&&<p className="error" role="alert">{error}</p>}
 <Button type="submit" disabled={busy} icon="arrow">{busy?'Memproses…':register?'Daftar Sekarang':'Masuk'}</Button>
 {!register&&<button type="button" className="demo-link" onClick={()=>enter(db.accounts.find(a=>a.id==='aldo'))}>Masuk akun demo Aldo</button>}</form>
 <div className="auth-switch">{register?'Sudah punya akun?':'Belum punya akun?'} <Link to={(register?'/login':'/register')+loc.search} state={loc.state}>{register?'Masuk':'Daftar gratis'}</Link></div>
 {!register&&<p className="hint"><Icon name="shield"/>Tidak ada pembayaran yang diproses di JastipHub.</p>}</section>
 {modal==='forgot'&&<Dialog title="Atur ulang password" subtitle="Masukkan email yang terdaftar." onClose={()=>setModal('')}><form onSubmit={e=>{e.preventDefault();setModal('reset')}}><Field label="Email"><input required type="email" placeholder="nama@email.com"/></Field><p className="hint">Simulasi lokal. Pengiriman email tersedia setelah backend terhubung.</p><div className="actions"><Button kind="light" onClick={()=>setModal('')}>Batal</Button><Button type="submit">Kirim tautan reset</Button></div></form></Dialog>}
 {modal==='reset'&&<Dialog title="Periksa emailmu" subtitle="Simulasi reset password selesai. Belum ada email yang dikirim." onClose={()=>setModal('')}><Button className="w-full mt-6" onClick={()=>setModal('')}>Kembali ke Login</Button></Dialog>}</main>
}
