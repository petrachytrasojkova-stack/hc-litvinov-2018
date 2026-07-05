import { state } from './app.js';
import { show, refresh, adminLogout } from './auth.js';
import {
  savePlan,
  deletePlan,
  saveExercise,
  deleteExercise,
  deletePlayer,
  saveAdminSettings,
  resetDefaults
} from './store.js';
import { esc, normPhone } from './utils.js';

export async function renderAdmin() {
  if (!state.currentAdmin) {
    show('adminLogin');
    return;
  }

  await refresh();

  document.getElementById('settings').innerHTML = `
    <div class="row" style="justify-content:space-between">
      <h2>Správce</h2>
      <button class="secondary" id="adminLogoutBtn">Odhlásit správce</button>
    </div>

    <h3>Nastavení správce</h3>
    <div class="row">
      <div>
        <label>Nové heslo správce</label>
        <input id="newAdminPass" type="password" placeholder="nové heslo">
      </div>
      <div>
        <label>Telefon správce</label>
        <input id="adminPhone" value="${esc(state.admin.phone || '')}" type="tel" placeholder="+420777123456">
      </div>
      <button id="saveAdminBtn">Uložit nastavení</button>
      <button class="secondary" id="goOverviewAll">Přehled všech hráčů</button>
    </div>
    <p id="adminMsg" class="muted"></p>

    <h3>Plány domácího cvičení</h3>
    <p class="note">Plán určuje období, ve kterém hráči zapisují domácí cvičení.</p>
    <div id="plansSettings" class="scroll"></div>
    <p>
      <button id="addPlanBtn">+ Přidat plán</button>
      <button class="secondary" id="resetDefaultsBtn">Obnovit výchozí plán a cvičení</button>
    </p>

    <h3>Cvičení</h3>
    <p class="note">Cvičení se zobrazí hráči v denním zápisu, pokud je přiřazené k aktivnímu plánu.</p>
    <div id="exerciseSettings"></div>
    <p><button id="addExerciseBtn">+ Přidat cvičení</button></p>

    <h3>Registrovaní hráči</h3>
    <div id="playersSettings" class="scroll"></div>
  `;

  document.getElementById('adminLogoutBtn').onclick = adminLogout;
  document.getElementById('goOverviewAll').onclick = () => show('overview');
  document.getElementById('saveAdminBtn').onclick = doSaveAdmin;
  document.getElementById('addPlanBtn').onclick = addPlan;
  document.getElementById('addExerciseBtn').onclick = addExercise;
  document.getElementById('resetDefaultsBtn').onclick = doResetDefaults;

  renderPlans();
  renderExercises();
  renderPlayers();
}

function renderPlans() {
  const html = `
    <table>
      <tr>
        <th class="left">Název</th>
        <th>Od</th>
        <th>Do</th>
        <th>Stav</th>
        <th>Aktivní</th>
        <th>Akce</th>
      </tr>
      ${state.plans.map(p => `
        <tr>
          <td class="left"><input id="pname_${p.id}" value="${esc(p.name || '')}"></td>
          <td><input type="date" id="pstart_${p.id}" value="${esc(p.start || '')}"></td>
          <td><input type="date" id="pend_${p.id}" value="${esc(p.end || '')}"></td>
          <td>
            <select id="pstatus_${p.id}">
              <option value="active" ${p.status === 'active' ? 'selected' : ''}>Aktivní</option>
              <option value="locked" ${p.status === 'locked' ? 'selected' : ''}>Uzamčený</option>
              <option value="archived" ${p.status === 'archived' ? 'selected' : ''}>Archivovaný</option>
            </select>
          </td>
          <td><input type="checkbox" id="pactive_${p.id}" ${p.active ? 'checked' : ''}></td>
          <td>
            <button onclick="window.savePlanRow('${p.id}')">Uložit</button>
            <button class="danger" onclick="window.deletePlanRow('${p.id}')">Smazat</button>
          </td>
        </tr>
      `).join('')}
    </table>
  `;

  document.getElementById('plansSettings').innerHTML = html;
}

function renderExercises() {
  document.getElementById('exerciseSettings').innerHTML = state.exercises.map(e => {
    const planChecks = state.plans.map(p => `
      <label class="check">
        <input type="checkbox" data-exercise="${e.key}" data-plan="${p.id}" ${(e.plans || []).includes(p.id) ? 'checked' : ''}>
        ${esc(p.name || '')}
      </label>
    `).join('');

    return `
      <div class="card" style="background:#f9fafb">
        <div class="row">
          <div>
            <label>Název</label>
            <input id="ename_${e.key}" value="${esc(e.name || '')}">
          </div>
          <div>
            <label>Plán / cíl</label>
            <input id="etarget_${e.key}" value="${esc(e.target || '')}" placeholder="např. 3×10">
          </div>
          <div>
            <label>Jednotka</label>
            <input id="eunit_${e.key}" value="${esc(e.unit || '')}" placeholder="opakování / čas">
          </div>
          <button onclick="window.saveExerciseRow('${e.key}')">Uložit</button>
          <button class="danger" onclick="window.deleteExerciseRow('${e.key}')">Smazat</button>
        </div>

        <details>
          <summary><b>Přiřadit k plánům</b></summary>
          <div style="padding-top:8px">${planChecks}</div>
        </details>
      </div>
    `;
  }).join('');
}

function renderPlayers() {
  if (!state.players.length) {
    document.getElementById('playersSettings').innerHTML = '<p class="note">Zatím není registrován žádný hráč.</p>';
    return;
  }

  document.getElementById('playersSettings').innerHTML = `
    <table>
      <tr>
        <th class="left">Hráč</th>
        <th>Telefon</th>
        <th>PIN</th>
        <th>Akce</th>
      </tr>
      ${state.players.map(p => `
        <tr>
          <td class="left">${esc(p.name || '')}</td>
          <td>${esc(p.phone || '')}</td>
          <td><b>${esc(p.pin || '')}</b></td>
          <td><button class="danger" onclick="window.deletePlayerRow('${p.id}')">Smazat</button></td>
        </tr>
      `).join('')}
    </table>
  `;
}

async function doSaveAdmin() {
  const data = {
    password: state.admin.password || 'hclitvinov',
    phone: state.admin.phone || ''
  };

  const newPass = document.getElementById('newAdminPass').value.trim();
  const phoneRaw = document.getElementById('adminPhone').value.trim();

  if (newPass) data.password = newPass;

  if (phoneRaw) {
    const phone = normPhone(phoneRaw);
    if (!phone) {
      document.getElementById('adminMsg').textContent = 'Telefon není ve správném formátu.';
      return;
    }
    data.phone = phone;
  }

  await saveAdminSettings(data);
  document.getElementById('adminMsg').textContent = 'Nastavení uloženo.';
  await renderAdmin();
}

async function addPlan() {
  const id = 'plan_' + Date.now();

  await savePlan({
    id,
    name: 'Nový plán',
    note: '',
    start: '2026-09-01',
    end: '2026-09-30',
    status: 'active',
    active: false
  });

  await renderAdmin();
}

async function addExercise() {
  const key = 'cvik_' + Date.now();
  const activePlan = state.plans.find(p => p.active) || state.plans[0];

  await saveExercise({
    key,
    name: 'Nové cvičení',
    target: '',
    unit: 'opakování',
    plans: activePlan ? [activePlan.id] : []
  });

  await renderAdmin();
}

async function doResetDefaults() {
  if (!confirm('Obnovit výchozí plán a cvičení? Stávající položky se nepřepíší celé, ale výchozí se znovu uloží.')) return;

  await resetDefaults();
  await renderAdmin();
}

window.savePlanRow = async (id) => {
  const plan = state.plans.find(p => p.id === id);

  const updated = {
    ...plan,
    name: document.getElementById('pname_' + id).value,
    start: document.getElementById('pstart_' + id).value,
    end: document.getElementById('pend_' + id).value,
    status: document.getElementById('pstatus_' + id).value,
    active: document.getElementById('pactive_' + id).checked
  };

  if (updated.active) {
    for (const p of state.plans) {
      if (p.id !== id && p.active) {
        await savePlan({ ...p, active: false });
      }
    }
  }

  await savePlan(updated);
  await renderAdmin();
};

window.deletePlanRow = async (id) => {
  if (!confirm('Smazat plán?')) return;
  await deletePlan(id);
  await renderAdmin();
};

window.saveExerciseRow = async (key) => {
  const exercise = state.exercises.find(e => e.key === key);
  const checkedPlans = Array.from(document.querySelectorAll(`input[data-exercise="${key}"][data-plan]:checked`))
    .map(input => input.dataset.plan);

  await saveExercise({
    ...exercise,
    name: document.getElementById('ename_' + key).value,
    target: document.getElementById('etarget_' + key).value,
    unit: document.getElementById('eunit_' + key).value,
    plans: checkedPlans
  });

  await renderAdmin();
};

window.deleteExerciseRow = async (key) => {
  if (!confirm('Smazat cvičení?')) return;
  await deleteExercise(key);
  await renderAdmin();
};

window.deletePlayerRow = async (id) => {
  if (!confirm('Smazat hráče?')) return;
  await deletePlayer(id);
  await renderAdmin();
};
