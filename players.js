import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';

const PLAYERS_COLLECTION = 'players';

export function renderPlayersSection(container) {
  container.innerHTML = `
    <h2>Hráči</h2>
    <p class="muted">Základní databáze hráčů. Na ní budou navázané tréninky, docházka a SMS.</p>

    <form id="playerForm" class="form-grid">
      <label>Jméno<input name="firstName" required /></label>
      <label>Příjmení<input name="lastName" required /></label>
      <label>Ročník<input name="birthYear" value="2018" /></label>
      <label>Tým<input name="team" value="HC Litvínov 2018" /></label>
      <label>Rodič<input name="parentName" /></label>
      <label>Telefon rodiče<input name="parentPhone" placeholder="+420..." /></label>
      <label>E-mail rodiče<input name="parentEmail" type="email" /></label>
      <button type="submit">Uložit hráče</button>
    </form>

    <div class="section-header">
      <h3>Seznam hráčů</h3>
      <button id="reloadPlayers" type="button">Načíst</button>
    </div>
    <div id="playersList" class="list muted">Zatím nenačteno.</div>
  `;

  document.querySelector('#playerForm').addEventListener('submit', savePlayer);
  document.querySelector('#reloadPlayers').addEventListener('click', loadPlayers);
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
  form.team.value = 'HC Litvínov 2018';
  await loadPlayers();
}

async function loadPlayers() {
  const list = document.querySelector('#playersList');
  list.textContent = 'Načítám hráče...';

  const q = query(collection(db, PLAYERS_COLLECTION), orderBy('lastName'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    list.innerHTML = '<p class="muted">Zatím nejsou uložení žádní hráči.</p>';
    return;
  }

  list.innerHTML = Array.from(snapshot.docs)
    .map((doc) => {
      const player = doc.data();
      return `
        <article class="list-item">
          <strong>${player.firstName ?? ''} ${player.lastName ?? ''}</strong>
          <span>${player.birthYear ?? ''} · ${player.parentPhone ?? 'telefon nedoplněn'}</span>
        </article>
      `;
    })
    .join('');
}
