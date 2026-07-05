import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';

const EXERCISE_LOGS_COLLECTION = 'exerciseLogs';

export function renderExerciseLog(container) {
  container.innerHTML = `
    <section class="card">
      <h2>Záznam cvičení</h2>
      <p>Domácí zápis cvičení hráče.</p>

      <form id="exerciseForm" class="form">
        <label>Datum
          <input name="date" type="date" required>
        </label>

        <label>Jméno hráče
          <input name="playerName" required placeholder="Např. Jan Novák">
        </label>

        <label>Typ cvičení
          <input name="exerciseType" required placeholder="Např. bruslení, střelba, koordinace">
        </label>

        <label>Délka / počet
          <input name="amount" placeholder="Např. 20 minut nebo 3 série">
        </label>

        <label>Poznámka
          <textarea name="note" placeholder="Jak se cvičení dařilo?"></textarea>
        </label>

        <button type="submit">Uložit záznam</button>
      </form>

      <p id="saveMessage"></p>
    </section>
  `;

  document.getElementById('exerciseForm').addEventListener('submit', saveExerciseLog);
}

async function saveExerciseLog(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));

  await addDoc(collection(db, EXERCISE_LOGS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });

  form.reset();
  document.getElementById('saveMessage').textContent = 'Záznam cvičení byl uložen.';
}
