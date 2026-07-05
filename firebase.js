import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

// TODO: Sem vlož konfiguraci z Firebase Console.
// Project settings → General → Your apps → SDK setup and configuration.
const firebaseConfig = {
  apiKey: 'DOPLNIT',
  authDomain: 'DOPLNIT',
  projectId: 'DOPLNIT',
  storageBucket: 'DOPLNIT',
  messagingSenderId: 'DOPLNIT',
  appId: 'DOPLNIT',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
