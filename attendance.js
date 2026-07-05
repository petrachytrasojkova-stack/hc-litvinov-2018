import {
  addDoc,
  collection,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';

const attendanceRef = collection(db, 'attendance');

export async function setAttendance({ trainingId, playerId, status }) {
  if (!trainingId || !playerId) {
    throw new Error('Chybí trénink nebo hráč.');
  }

  return addDoc(attendanceRef, {
    trainingId,
    playerId,
    status: status || 'unknown',
    confirmedAt: serverTimestamp(),
  });
}
