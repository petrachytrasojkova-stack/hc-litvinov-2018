import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';

const PLAYERS_COLLECTION = 'players';

export function renderPlayers(container) {
  container.innerHTML = `
    <section class="card">
      <h2>Hráči</h2>

      <form id="playerForm" class="form">
        <label>Jméno hráče
          <input name="firstName" required placeholder="Jan">
        </label>

        <label>Příjmení hráče
          <input name="lastName" required placeholder="Novák">
        </label>

        <label>Ročník
          <input name="birthYear" value="2018">
        </label>

        <label>Telefon rodiče
          <input name="parentPhone" placeholder="+420 777 123 456">
        </label>

        <button type="submit">Uložit hráče</button>
      </form>

      <h3>Seznam hráčů</h3>
      <div id="playersList" class="list">Načítám...</div>
    </section>
  `;

  document.getElementById('playerForm').addEventListener('submit', savePlayer);
  loadPlayers();
}

async function savePlayer(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));

  await addDoc(collection(db, PLAYERS_COLLECTION), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });

  form.reset();
  form.birthYear.value = '2018';
  await loadPlayers();
}

async function loadPlayers() {
  const list = document.getElementById('playersList');
  list.textContent = 'Načítám hráče...';

  const q = query(collection(db, PLAYERS_COLLECTION), orderBy('lastName'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    list.innerHTML = '<p>Zatím nejsou uložení žádní hráči.</p>';
    return;
  }

  list.innerHTML = snapshot.docs.map(doc => {
    const player = doc.data();
    return `
      <div class="list-item">
        <strong>${player.firstName || ''} ${player.lastName || ''}</strong><br>
        <span>${player.birthYear || ''} · ${player.parentPhone || 'telefon nedoplněn'}</span>
      </div>
    `;
  }).join('');
}
