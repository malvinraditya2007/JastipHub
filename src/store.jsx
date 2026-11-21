import {createContext,useContext,useState} from 'react';
import {initial,people,seeds,pastTrip,today,destinationCover,uploadedCover} from './data';
const Context=createContext(null);
const key='jastiphub.frontend.v1';
function read(){
  try {return JSON.parse(localStorage.getItem(key))||initial;} catch {return initial;}
}
export function Store({children}){
  const [db,setDb]=useState(read);
  const [message,setMessage]=useState('');
  function change(fn){
    const next=fn(read());
    try{localStorage.setItem(key,JSON.stringify(next));setDb(next);return true;}
    catch{setMessage('Data belum tersimpan. Ruang penyimpanan browser mungkin penuh.');return false;}
  }
  const user=db.accounts.find(a=>a.id===db.current);
  // Resolve automatic covers from the current country, including older saved trips.
  const userTrips=db.trips.map(trip=>({...trip,cover:uploadedCover(trip.cover)??destinationCover(trip.country)}));
  const all=[...seeds,...userTrips,pastTrip];
  const person=id=>people[id]||db.accounts.find(a=>a.id===id);
  const saved=db.saved[user?.id]||[];
  const contacts=db.contacts[user?.id]||[];
  function toggle(id){return change(d=>{
    const ids=d.saved[user.id]||[];
    return {...d,saved:{...d.saved,[user.id]:ids.includes(id)?ids.filter(i=>i!==id):[...ids,id]}};
  });}
  function contacted(id){return change(d=>({...d,contacts:{...d.contacts,[user.id]:[...new Set([...(d.contacts[user.id]||[]),id])]}}));}
  const eligible=t=>user && t && contacts.includes(t.id) && t.owner!==user.id && t.end<today() && !db.reviews.some(r=>r.trip===t.id && r.author===user.id);
  return <Context.Provider value={{db,user,change,all,person,saved,contacts,toggle,contacted,eligible,message,setMessage}}>{children}</Context.Provider>;
}
export const useApp=()=>useContext(Context);
export async function digest(password,salt){
  const data=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',data.encode(password),'PBKDF2',false,['deriveBits']);
  const result=await crypto.subtle.deriveBits({name:'PBKDF2',salt:data.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
  return Array.from(new Uint8Array(result),byte=>byte.toString(16).padStart(2,'0')).join('');
}
