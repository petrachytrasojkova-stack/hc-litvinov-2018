import { state } from './app.js';
import { activePlan, activeExercises, show } from './auth.js';
import { getEntries } from './store.js';
import { dateList, esc, formatDate } from './utils.js';

function entryKey(uid, date, planId) {
  return `${uid}__${planId}__${date}`;
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

function lastEntryDate(entries, uid, planId) {
  const dates = entries
    .filter(e => e.uid === uid && e.plan === planId)
    .map(e => e.date)
    .filter(Boolean)
    .sort();

  return dates.length ? dates[dates.length - 1] : null;
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
        <h2>${state.currentAdmin ? 'Přehled hráčů' : 'Můj přehled'}</h2>
        <div class="note">${esc(plan.name || '')}</div>
      </div>
      <button class="secondary" id="overviewBack">Zpět</button>
    </div>

    <div class="grid">
      ${users.map(user => {
        let sum = 0;
        let doneDays = 0;

        dates.forEach(date => {
          const c = completion(map[entryKey(user.id, date, plan.id)], exercises);
          sum += c;
          if (c > 0) doneDays++;
        });

        const percent = Math.round(sum / (dates.length || 1) * 100);
        const last = lastEntryDate(entries, user.id, plan.id);

        return `
          <div class="card" style="background:#f9fafb">
            <h3 style="margin-top:0">🏒 ${esc(user.name || '')}</h3>
            <p><b>${percent} %</b> splněno</p>
            <p class="muted">${doneDays} / ${dates.length} dní</p>
            <p class="muted">Poslední zápis: ${last ? formatDate(last) : 'zatím žádný'}</p>
            <button class="secondary" onclick="window.showPlayerOverview('${user.id}')">Detail</button>
          </div>
        `;
      }).join('')}
    </div>

    <div id="overviewDetail"></div>
  `;

  document.getElementById('overview').innerHTML = html;
  document.getElementById('overviewBack').onclick = () => show(state.currentAdmin ? 'settings' : 'entry');

  window.showPlayerOverview = (uid) => {
    renderPlayerDetail(uid, entries, map, dates, plan, exercises);
  };
}

function renderPlayerDetail(uid, entries, map, dates, plan, exercises) {
  const user = state.players.find(p => p.id === uid) || state.currentUser;

  let html = `
    <div class="card" style="margin-top:18px">
      <h3>Detail – ${esc(user.name || '')}</h3>
  `;

  dates.forEach(date => {
    const entry = map[entryKey(uid, date, plan.id)];

    html += `
      <div class="exercise" style="margin-bottom:10px">
        <h4 style="margin:0 0 8px">${entry ? '✅' : '❌'} ${formatDate(date)}</h4>
    `;

    if (entry) {
      exercises.forEach(ex => {
        html += `
          <div>
            <b>${esc(ex.name || '')}</b>: ${esc(entry[ex.key] || '—')}
          </div>
        `;
      });

      if (entry.other) {
        html += `<p><b>Jiná aktivita:</b><br>${esc(entry.other)}</p>`;
      }
    } else {
      html += `<p class="muted">Bez zápisu.</p>`;
    }

    html += `</div>`;
  });

  html += `</div>`;

  document.getElementById('overviewDetail').innerHTML = html;
}
