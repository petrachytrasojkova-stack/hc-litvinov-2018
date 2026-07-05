import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';

const playersRef = collection(db, 'players');

export async function createPlayer(data) {
  const player = {
    firstName: clean(data.firstName),
    lastName: clean(data.lastName),
    birthYear: clean(data.birthYear),
    team: clean(data.team) || '2018',
    parentName: clean(data.parentName),
    parentPhone: clean(data.parentPhone),
    parentEmail: clean(data.parentEmail),
    active: true,
    createdAt: serverTimestamp(),
  };

  if (!player.firstName || !player.lastName) {
    throw new Error('Vyplň jméno i příjmení hráče.');
  }

  return addDoc(playersRef, player);
}

export async function loadPlayers() {
  const q = query(playersRef, orderBy('lastName'), orderBy('firstName'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export function renderPlayers(players, target) {
  if (!players.length) {
    target.className = 'list empty';
    target.textContent = 'Zatím nejsou vložení žádní hráči.';
    return;
  }

  target.className = 'list';
  target.innerHTML = players.map((player) => `
    <article class="item">
      <strong>${escapeHtml(player.lastName)} ${escapeHtml(player.firstName)}</strong>
      <span class="meta">Tým: ${escapeHtml(player.team || '-')} · Ročník: ${escapeHtml(player.birthYear || '-')}</span>
      <span class="meta">Rodič: ${escapeHtml(player.parentName || '-')} · Tel.: ${escapeHtml(player.parentPhone || '-')}</span>
    </article>
  `).join('');
}

function clean(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
