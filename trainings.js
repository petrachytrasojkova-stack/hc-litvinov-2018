import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';

const TRAININGS_COLLECTION = 'trainings';

export function renderTrainingsSection(container) {
  container.innerHTML = `
    <h2>Tréninky</h2>
    <p class="muted">Evidence tréninků. Později se z tréninku automaticky vytvoří docházka pro aktivní hráče.</p>

    <form id="trainingForm" class="form-grid">
      <label>Název<input name="title" value="Trénink" required /></label>
      <label>Datum<input name="date" type="date" required /></label>
      <label>Čas<input name="time" type="time" required /></label>
      <label>Místo<input name="place" placeholder="Zimní stadion" /></label>
      <label>Tým<input name="team" value="HC Litvínov 2018" /></label>
      <label class="full">Poznámka<textarea name="note" rows="3"></textarea></label>
      <button type="submit">Uložit trénink</button>
    </form>

    <div class="section-header">
      <h3>Seznam tréninků</h3>
      <button id="reloadTrainings" type="button">Načíst</button>
    </div>
    <div id="trainingsList" class="list muted">Zatím nenačteno.</div>
  `;

  document.querySelector('#trainingForm').addEventListener('submit', saveTraining);
  document.querySelector('#reloadTrainings').addEventListener('click', loadTrainings);
}

async function saveTraining(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));

  await addDoc(collection(db, TRAININGS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });

  form.reset();
  form.title.value = 'Trénink';
  form.team.value = 'HC Litvínov 2018';
  await loadTrainings();
}

async function loadTrainings() {
  const list = document.querySelector('#trainingsList');
  list.textContent = 'Načítám tréninky...';

  const q = query(collection(db, TRAININGS_COLLECTION), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    list.innerHTML = '<p class="muted">Zatím nejsou uložené žádné tréninky.</p>';
    return;
  }

  list.innerHTML = Array.from(snapshot.docs)
    .map((doc) => {
      const training = doc.data();
      return `
        <article class="list-item">
          <strong>${training.title ?? 'Trénink'}</strong>
          <span>${training.date ?? ''} ${training.time ?? ''} · ${training.place ?? ''}</span>
        </article>
      `;
    })
    .join('');
}
