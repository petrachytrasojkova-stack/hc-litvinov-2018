import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';

const trainingsRef = collection(db, 'trainings');

export async function createTraining(data) {
  const training = {
    title: clean(data.title) || 'Trénink',
    date: clean(data.date),
    time: clean(data.time),
    place: clean(data.place),
    team: clean(data.team) || '2018',
    note: clean(data.note),
    createdAt: serverTimestamp(),
  };

  if (!training.date || !training.time) {
    throw new Error('Vyplň datum i čas tréninku.');
  }

  return addDoc(trainingsRef, training);
}

export async function loadTrainings() {
  const q = query(trainingsRef, orderBy('date', 'desc'), orderBy('time', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export function renderTrainings(trainings, target) {
  if (!trainings.length) {
    target.className = 'list empty';
    target.textContent = 'Zatím nejsou vložené žádné tréninky.';
    return;
  }

  target.className = 'list';
  target.innerHTML = trainings.map((training) => `
    <article class="item">
      <strong>${escapeHtml(training.title)}</strong>
      <span class="meta">${formatDate(training.date)} · ${escapeHtml(training.time || '-')} · ${escapeHtml(training.place || '-')}</span>
      <span class="meta">Tým: ${escapeHtml(training.team || '-')}</span>
      ${training.note ? `<span class="meta">${escapeHtml(training.note)}</span>` : ''}
    </article>
  `).join('');
}

function clean(value) {
  return String(value || '').trim();
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('cs-CZ').format(date);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
