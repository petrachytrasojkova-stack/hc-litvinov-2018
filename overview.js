import { state } from './app.js';
import { activePlan, activeExercises, show } from './auth.js';
import { getEntries } from './store.js';
import { dateList, esc } from './utils.js';

function entryKey(uid, date, planId) {
  return uid + '__' + planId + '__' + date;
}

function completion(entry, exercises) {
  if (!entry) return 0;

  let filled = 0;

  exercises.forEach(ex => {
    if ((entry[ex.key] || '').trim()) filled++;
  });

  if ((entry.other || '').trim()) filled += 0.5;

  return Math.min(1, filled / (exercises.length || 1));
}

export async function renderOverview() {
  if (!state.currentUser && !state.currentAdmin) {
    show('login');
    return;
  }

  const entries = await getEntries();
  const plan = activePlan();
  const exercises = activeExercises();
  const dates = dateList(plan);
  const users = state.currentAdmin ? state.players : [state.currentUser];

  const map = {};
  entries.forEach(entry => {
    map[entryKey(entry.uid, entry.date, entry.plan)] = entry;
  });

  let html = `
    <div class="row" style="justify-content:space-between">
      <div>
        <h2>Přehled</h2>
        <div class="note">${state.currentAdmin ? 'Správce vidí všechny hráče.' : 'Vidíš pouze svoje záznamy.'}</div>
      </div>
      <button class="secondary" id="overviewBack">Zpět</button>
    </div>

    <p>
      <span class="pill">zelená = většinově</span>
      <span class="pill">žlutá = částečně</span>
      <span class="pill">červená = bez zápisu</span>
    </p>

    <div class="scroll">
      <table>
        <tr>
          <th class="left">Hráč</th>
          ${dates.map(iso => {
            const d = new Date(iso + 'T00:00:00');
            return `<th>${d.getDate()}.${d.getMonth() + 1}.</th>`;
          }).join('')}
          <th>%</th>
        </tr>
  `;

  users.forEach(user => {
    let sum = 0;

    html += `<tr><td class="left">${esc(user.name || '')}</td>`;

    dates.forEach(iso => {
      const c = completion(map[entryKey(user.id, iso, plan.id)], exercises);
      sum += c;

      const cls = c > 0.7 ? 'ok' : c > 0 ? 'mid' : 'bad';
      html += `<td class="${cls}">${c ? Math.round(c * 100) : ''}</td>`;
    });

    html += `<td>${Math.round(sum / (dates.length || 1) * 100)} %</td></tr>`;
  });

  html += `
      </table>
    </div>
  `;

  document.getElementById('overview').innerHTML = html;
  document.getElementById('overviewBack').onclick = () => show(state.currentAdmin ? 'settings' : 'entry');
}
