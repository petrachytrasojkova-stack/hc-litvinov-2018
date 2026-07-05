import { collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';

const EXERCISE_LOGS_COLLECTION = 'exerciseLogs';

export function renderOverview(container) {
  container.innerHTML = `
    <section class="card">
      <h2>Přehled záznamů</h2>
      <button id="reloadOverview" type="button">Načíst záznamy</button>
      <div id="overviewList" class="list">Načítám...</div>
    </section>
  `;

  document.getElementById('reloadOverview').addEventListener('click', loadOverview);
  loadOverview();
}

async function loadOverview() {
  const list = document.getElementById('overviewList');
  list.textContent = 'Načítám záznamy...';

  const q = query(collection(db, EXERCISE_LOGS_COLLECTION), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    list.innerHTML = '<p>Zatím nejsou uložené žádné záznamy.</p>';
    return;
  }

  list.innerHTML = snapshot.docs.map(doc => {
    const item = doc.data();

    return `
      <div class="list-item">
        <strong>${formatDate(item.date)} · ${item.playerName || ''}</strong><br>
        <span>${item.exerciseType || ''}</span><br>
        <small>${item.amount || ''}</small><br>
        <small>${item.note || ''}</small>
      </div>
    `;
  }).join('');
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}
