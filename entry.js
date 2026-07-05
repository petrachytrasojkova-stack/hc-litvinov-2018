import { state } from './app.js';
import { activePlan, activeExercises, show, logout } from './auth.js';
import { saveEntry, getEntriesForUserPlan } from './store.js';
import { dateList, esc, formatDate } from './utils.js';

export async function renderEntry() {
  if (!state.currentUser) {
    show('login');
    return;
  }

  const plan = activePlan();
  const exercises = activeExercises();
  const allDates = dateList(plan);

  const existingEntries = await getEntriesForUserPlan(state.currentUser.id, plan.id);
  const usedDates = new Set(existingEntries.map(entry => entry.date));
  const availableDates = allDates.filter(date => !usedDates.has(date));

  document.getElementById('entry').innerHTML = `
    <div class="row" style="justify-content:space-between">
      <div>
        <h2>Domácí cvičení</h2>
        <div class="muted">${esc(state.currentUser.name)} · ${esc(plan.name || '')}</div>
      </div>
      <div>
        <button class="secondary" id="goOverview">Přehled</button>
        <button class="secondary" id="doLogout">Odhlásit</button>
      </div>
    </div>

    ${availableDates.length ? `
      <div class="card" style="background:#f9fafb">
        <div class="row">
          <div>
            <label>Datum zápisu</label>
            <select id="dateSelect">
              ${availableDates.map(d => `<option value="${d}">${formatDate(d)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <h3>Předepsaná cvičení</h3>
      <div id="exerciseGrid" class="grid"></div>

      <details class="card" style="background:#f9fafb">
        <summary><b>➕ Přidat jinou aktivitu</b></summary>
        <label>Jiná aktivita</label>
        <textarea id="other" rows="3" style="width:100%" placeholder="Např. běh 20 min, kolo, brusle..."></textarea>
      </details>

      <p>
        <button id="saveEntryBtn">💾 Uložit zápis</button>
      </p>

      <div id="saved" class="success"></div>
    ` : `
      <div class="card" style="background:#f9fafb">
        <h3>Všechny dostupné dny už máš zapsané ✅</h3>
        <p class="muted">Pokud je potřeba něco opravit, požádej trenéra nebo správce.</p>
      </div>
    `}
  `;

  document.getElementById('goOverview').onclick = () => show('overview');
  document.getElementById('doLogout').onclick = logout;

  if (availableDates.length) {
    document.getElementById('saveEntryBtn').onclick = doSave;
    renderExercises(exercises);
  }
}

function renderExercises(exercises) {
  const grid = document.getElementById('exerciseGrid');
  grid.innerHTML = '';

  if (!exercises.length) {
    grid.innerHTML = '<p class="note">Pro aktivní plán zatím nejsou nastavená žádná cvičení.</p>';
    return;
  }

  exercises.forEach(ex => {
    const isTime = (ex.unit || '').toLowerCase().includes('čas') || (ex.unit || '').toLowerCase().includes('min');

    const div = document.createElement('div');
    div.className = 'exercise';
    div.innerHTML = `
      <h3 style="margin-top:0">🏒 ${esc(ex.name || '')}</h3>
      <p class="muted">Plán: <b>${esc(ex.target || '—')}</b> ${esc(ex.unit || '')}</p>

      <label>${isTime ? 'Odcvičeno' : 'Splněno / počet'}</label>
      <input
        style="width:100%;margin-top:2px"
        id="ex_${esc(ex.key)}"
        placeholder="${isTime ? 'např. 15 min nebo 02:30' : 'např. 10 / 20 / 3×10'}"
      >
    `;

    grid.appendChild(div);
  });
}

async function doSave() {
  const plan = activePlan();

  if (plan.status !== 'active') {
    document.getElementById('saved').textContent = 'Tento plán je uzamčený nebo archivovaný.';
    return;
  }

  const entry = {
    uid: state.currentUser.id,
    player: state.currentUser.name,
    plan: plan.id,
    date: document.getElementById('dateSelect').value,
    other: document.getElementById('other')?.value.trim() || '',
    updated: new Date().toISOString()
  };

  activeExercises().forEach(ex => {
    entry[ex.key] = document.getElementById('ex_' + ex.key).value.trim();
  });

  await saveEntry(entry);

  document.getElementById('saved').textContent =
    'Zápis byl uložen. Tento den už se hráči znovu nenabídne.';

  setTimeout(() => renderEntry(), 1000);
}
