import { state } from './app.js';
import { activePlan, activeExercises, show } from './auth.js';
import { getEntries, saveEntry, deleteEntry } from './store.js';
import { dateList, esc, formatDate } from './utils.js';

function entryKey(uid, date, planId) {
  return `${uid}__${planId}__${date}`;
}

function isPlank(ex) {
  return (ex.name || '').toLowerCase().includes('plank');
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

  document.getElementById('overview').innerHTML = `
    <div class="row" style="justify-content:space-between">
      <div>
        <h2>${state.currentAdmin ? 'Přehled hráčů' : 'Můj přehled'}</h2>
        <div class="note">${esc(plan.name || '')}</div>
      </div>
      <button class="secondary" id="overviewBack">Zpět</button>
    </div>

    <div id="editBox"></div>

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
            <button class="secondary detail-btn" data-uid="${esc(user.id)}">Detail</button>
          </div>
        `;
      }).join('')}
    </div>

    <div id="overviewDetail"></div>
  `;

  document.getElementById('overviewBack').addEventListener('click', () => {
    show(state.currentAdmin ? 'settings' : 'entry');
  });

  document.querySelectorAll('.detail-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById('editBox').innerHTML = '';
      renderPlayerDetail(button.dataset.uid, entries, map, dates, plan, exercises);
    });
  });
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
        html += `<div><b>${esc(ex.name || '')}</b>: ${esc(entry[ex.key] || '—')}</div>`;
      });

      if (entry.other) {
        html += `<p><b>Jiná aktivita:</b><br>${esc(entry.other)}</p>`;
      }

      if (state.currentAdmin) {
        html += `
          <p>
            <button class="secondary edit-entry-btn" data-entry-id="${esc(entry.id)}">✏️ Upravit</button>
            <button class="danger delete-entry-btn" data-entry-id="${esc(entry.id)}">🗑️ Smazat</button>
          </p>
        `;
      }
    } else {
      html += `<p class="muted">Bez zápisu.</p>`;
    }

    html += `</div>`;
  });

  html += `</div>`;

  document.getElementById('overviewDetail').innerHTML = html;

  document.querySelectorAll('.edit-entry-btn').forEach(button => {
    button.addEventListener('click', () => {
      const entry = entries.find(e => e.id === button.dataset.entryId);
      renderEditForm(entry, exercises);
    });
  });

  document.querySelectorAll('.delete-entry-btn').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('Opravdu smazat tento zápis? Hráči se potom tento den znovu nabídne k zápisu.')) return;
      await deleteEntry(button.dataset.entryId);
      await renderOverview();
    });
  });
}

function renderEditForm(entry, exercises) {
  if (!entry) return;

  document.getElementById('editBox').innerHTML = `
    <div class="card" style="margin-top:18px;background:#f9fafb">
      <h3>✏️ Upravit zápis</h3>
      <p class="muted">${esc(entry.player || '')} · ${formatDate(entry.date)}</p>

      ${exercises.map(ex => `
        <label>${esc(ex.name || '')}</label>
        <input
          id="edit_${esc(ex.key)}"
          value="${esc(entry[ex.key] || '')}"
          style="width:100%"
          ${isPlank(ex)
            ? 'inputmode="numeric" placeholder="např. 02:30" pattern="^[0-9]{1,2}:[0-5][0-9]$"'
            : 'type="number" min="0" step="1" placeholder="celé číslo"'}
        >
      `).join('')}

      <label>Jiná aktivita</label>
      <textarea id="edit_other" rows="3" style="width:100%">${esc(entry.other || '')}</textarea>

      <p>
        <button id="saveEditBtn">💾 Uložit změny</button>
        <button class="secondary" id="cancelEditBtn">Zrušit</button>
      </p>

      <div id="editMsg" class="success"></div>
    </div>
  `;

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editBox').innerHTML = '';
  });

  document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const msg = document.getElementById('editMsg');

    for (const ex of exercises) {
      const value = document.getElementById('edit_' + ex.key).value.trim();

      if (!value) continue;

      if (isPlank(ex) && !/^[0-9]{1,2}:[0-5][0-9]$/.test(value)) {
        msg.textContent = `U cvičení ${ex.name} zadej čas ve formátu mm:ss, např. 02:30.`;
        return;
      }

      if (!isPlank(ex) && !/^\d+$/.test(value)) {
        msg.textContent = `U cvičení ${ex.name} zadej celé číslo.`;
        return;
      }
    }

    const updated = {
      ...entry,
      other: document.getElementById('edit_other').value.trim()
    };

    exercises.forEach(ex => {
      updated[ex.key] = document.getElementById('edit_' + ex.key).value.trim();
    });

    await saveEntry(updated);

    msg.textContent = 'Změny byly uloženy.';
    setTimeout(() => renderOverview(), 800);
  });
}
