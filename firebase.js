// Firebase konfigurace
// 1) Ve Firebase Console otevři Project settings → General → Your apps.
// 2) Najdi objekt firebaseConfig.
// 3) Nahraď hodnoty níže svými údaji z Firebase.

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'DOPLNIT',
  authDomain: 'DOPLNIT',
  projectId: 'DOPLNIT',
  storageBucket: 'DOPLNIT',
  messagingSenderId: 'DOPLNIT',
  appId: 'DOPLNIT',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
