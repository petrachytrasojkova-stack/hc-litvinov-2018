// Firebase konfigurace
// 1) Ve Firebase Console otevři Project settings → General → Your apps.
// 2) Najdi objekt firebaseConfig.
// 3) Nahraď hodnoty níže svými údaji z Firebase.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAqqYrnxMeTN8YvAC-60Y6DdAammlIYhqg',
  authDomain: 'hc-litvinov-2018.firebaseapp.com',
  projectId: 'hc-litvinov-2018',
  storageBucket: 'hc-litvinov-2018.firebasestorage.app',
  messagingSenderId: '1034887165949',
  appId: '1:1034887165949:web:3d971fe8671656d38b8b94',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
