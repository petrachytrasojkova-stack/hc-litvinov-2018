import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';

const TRAININGS_COLLECTION = 'trainings';

export function renderTrainings(container) {
  container.innerHTML = `
    <section class="card">
      <h2>Tréninky</h2>

      <form id="trainingForm" class="form">
        <label>Datum
          <input name="date" type="date" required>
        </label>

        <label>Začátek
          <input name="startTime" type="time" required>
        </label>

        <label>Konec
          <input name="endTime" type="time">
        </label>

        <label>Místo
          <input name="place" placeholder="Např. ZS Litvínov" required>
        </label>

        <label>Poznámka pro rodiče
          <textarea name="note" placeholder="Např. sraz 15 minut před začátkem"></textarea>
        </label>

        <button type="submit">Uložit trénink</button>
      </form>

      <h3>Seznam tréninků</h3>
      <div id="trainingsList" class="list">Načítám...</div>
    </section>
  `;

  document.getElementById('trainingForm').addEventListener('submit', saveTraining);
  loadTrainings();
}

async function saveTraining(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));

  await addDoc(collection(db, TRAININGS_COLLECTION), {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
  });

  form.reset();
  await loadTrainings();
}

async function loadTrainings() {
  const list = document.getElementById('trainingsList');
  list.textContent = 'Načítám tréninky...';

  const q = query(collection(db, TRAININGS_COLLECTION), orderBy('date'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    list.innerHTML = '<p>Zatím nejsou uložené žádné tréninky.</p>';
    return;
  }

  list.innerHTML = snapshot.docs.map(doc => {
    const training = doc.data();

    return `
      <div class="list-item">
        <strong>${formatDate(training.date)} ${training.startTime || ''}${training.endTime ? '–' + training.endTime : ''}</strong><br>
        <span>${training.place || ''}</span><br>
        <small>${training.note || ''}</small>
      </div>
    `;
  }).join('');
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}
