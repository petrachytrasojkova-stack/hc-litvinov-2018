import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';
import { DEFAULT_PLANS, DEFAULT_EXERCISES } from './utils.js';

export async function getPlayers(){ const s=await getDocs(query(collection(db,'players'),orderBy('name'))); return s.docs.map(d=>({id:d.id,...d.data()})); }
export async function savePlayer(player){ await setDoc(doc(db,'players',player.id), {...player,updatedAt:serverTimestamp()}); }
export async function deletePlayer(id){ await deleteDoc(doc(db,'players',id)); }
export async function getPlans(){ const s=await getDocs(collection(db,'plans')); if(s.empty){ for(const p of DEFAULT_PLANS) await setDoc(doc(db,'plans',p.id),p); return DEFAULT_PLANS; } return s.docs.map(d=>({id:d.id,...d.data()})); }
export async function savePlan(plan){ await setDoc(doc(db,'plans',plan.id),plan); }
export async function deletePlan(id){ await deleteDoc(doc(db,'plans',id)); }
export async function getExercises(){ const s=await getDocs(collection(db,'exercises')); if(s.empty){ for(const e of DEFAULT_EXERCISES) await setDoc(doc(db,'exercises',e.key),e); return DEFAULT_EXERCISES; } return s.docs.map(d=>({key:d.id,...d.data()})); }
export async function saveExercise(ex){ await setDoc(doc(db,'exercises',ex.key),ex); }
export async function deleteExercise(key){ await deleteDoc(doc(db,'exercises',key)); }
export async function getEntries(){ const s=await getDocs(collection(db,'entries')); return s.docs.map(d=>({id:d.id,...d.data()})); }
export async function saveEntry(entry){ const id=`${entry.uid}__${entry.plan}__${entry.date}`; await setDoc(doc(db,'entries',id),{...entry,updatedAt:serverTimestamp()}); }
export async function getAdminSettings(){ const snap=await getDoc(doc(db,'settings','admin')); if(!snap.exists()) return {password:'hclitvinov',phone:''}; return snap.data(); }
export async function saveAdminSettings(data){ await setDoc(doc(db,'settings','admin'),data,{merge:true}); }
export async function resetDefaults() {
  for (const p of DEFAULT_PLANS) {
    await setDoc(doc(db, 'plans', p.id), p);
  }

  for (const e of DEFAULT_EXERCISES) {
    await setDoc(doc(db, 'exercises', e.key), e);
  }
}
