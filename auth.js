import { state } from './app.js';
import { getPlayers, savePlayer, getPlans, getExercises, getEntries, getAdminSettings } from './store.js';
import { renderEntry } from './entry.js';
import { renderOverview } from './overview.js';
import { renderAdmin } from './admin.js';
import { esc, fullName, normPhone, slug } from './utils.js';

export async function refresh(){
  state.players = await getPlayers();
  state.plans = await getPlans();
  state.exercises = await getExercises();
  state.entries = await getEntries();
  state.admin = await getAdminSettings();
  const active = activePlan();
  document.getElementById('activePlanTitle').textContent = active.name;
}

export function activePlan(){
  return state.plans.find(p => p.active) || state.plans[0] || {
    id:'leto_2026',
    name:'Léto 2026',
    start:'2026-07-01',
    end:'2026-08-31',
    status:'active'
  };
}

export function activeExercises(planId = activePlan().id){
  return state.exercises.filter(e => (e.plans || []).includes(planId));
}

export function show(id){
  ['home','registration','login','forgot','entry','overview','adminLogin','settings'].forEach(x =>
    document.getElementById(x).classList.toggle('hidden', x !== id)
  );

  if(id === 'home') renderHome();
  if(id === 'registration') renderRegistration();
  if(id === 'login') renderLogin();
  if(id === 'forgot') renderForgot();
  if(id === 'entry') renderEntry();
  if(id === 'overview') renderOverview();
  if(id === 'adminLogin') renderAdminLogin();
  if(id === 'settings') renderAdmin();
}

export async function renderHome(){
  await refresh();
  document.getElementById('home').innerHTML = `
    <h2>Vstup</h2>
    <div class="choice">
      <button id="goLogin">📝 Zápis</button>
      <button id="goReg">👤 Registrace</button>
      <button id="goForgot">🔑 Zapomenutý přístup</button>
      <button id="goAdmin">🛡️ Správce</button>
    </div>
    <p class="note">Hráč/rodič po přihlášení vidí jen svoje dítě. Správce vidí vše.</p>
  `;

  goLogin.onclick = () => show('login');
  goReg.onclick = () => show('registration');
  goForgot.onclick = () => show('forgot');
  goAdmin.onclick = () => show('adminLogin');
}

function renderRegistration(){
  document.getElementById('registration').innerHTML = `
    <h2>Registrace hráče</h2>

    <fieldset>
      <legend>👤 Hráč</legend>
      <div class="row">
        <div>
          <label>Jméno hráče</label>
          <input id="regFirstName" placeholder="např. David">
        </div>
        <div>
          <label>Příjmení hráče</label>
          <input id="regLastName" placeholder="např. Novák">
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>👨‍👩‍👦 Zákonný zástupce</legend>
      <label>Telefon rodiče</label>
      <input id="regPhone" type="tel" placeholder="+420 777 123 456">
      <div class="note">Telefon zadej jako české číslo, např. 777123456 nebo +420777123456.</div>
    </fieldset>

    <fieldset>
      <legend>🔒 Přístup</legend>
      <div class="row">
        <div>
          <label>PIN</label>
          <input id="regPin" type="password" inputmode="numeric" maxlength="6" placeholder="6 číslic">
          <div class="note">PIN musí mít přesně 6 číslic.</div>
        </div>
        <div>
          <label>Potvrzení PINu</label>
          <input id="regPin2" type="password" inputmode="numeric" maxlength="6" placeholder="zopakuj PIN">
          <div class="note">Zadej stejný 6místný PIN znovu.</div>
        </div>
      </div>
    </fieldset>

    <p>
      <button id="doRegister">Registrovat</button>
      <button class="secondary" id="backHome">Zpět</button>
    </p>

    <div id="regMsg" class="muted"></div>
  `;

  backHome.onclick = () => show('home');
  doRegister.onclick = registerPlayer;
}

async function registerPlayer(){
  let first = regFirstName.value.trim();
  let last = regLastName.value.trim();
  let pin = regPin.value.trim();
  let pin2 = regPin2.value.trim();
  let phone = normPhone(regPhone.value);
  let name = fullName(first,last);

  if(!first || !last || !pin || !pin2 || !phone){
    regMsg.textContent = 'Vyplň jméno, příjmení, telefon a PIN.';
    return;
  }

  if(!/^\d{6}$/.test(pin)){
    regMsg.textContent = 'PIN musí mít přesně 6 číslic.';
    return;
  }

  if(pin !== pin2){
    regMsg.textContent = 'PINy se neshodují.';
    return;
  }

  if(state.players.some(u => u.name.toLowerCase() === name.toLowerCase())){
    regMsg.textContent = 'Tento hráč už je registrovaný.';
    return;
  }

  let player = {
    id: slug(name),
    firstName: first,
    lastName: last,
    name,
    pin,
    phone,
    created: new Date().toISOString(),
    active: true
  };

  await savePlayer(player);
  regMsg.innerHTML = 'Registrováno. Přihlašovací jméno: <b>' + esc(name) + '</b>.';
}

function renderLogin(){
  let options = state.players.map(p => `<option value="${esc(p.name)}">`).join('');

  document.getElementById('login').innerHTML = `
    <h2>Zápis</h2>
    <div class="row">
      <div>
        <label>Jméno hráče</label>
        <input id="loginName" list="playersList" placeholder="Příjmení Jméno">
        <datalist id="playersList">${options}</datalist>
      </div>
      <div>
        <label>PIN</label>
        <input id="loginPin" type="password" inputmode="numeric" placeholder="6 číslic">
      </div>
      <button id="doLogin">Pokračovat</button>
      <button class="secondary" id="loginBack">Zpět</button>
    </div>
    <p><button class="link" id="forgotLink">Zapomenutý přístup</button></p>
    <div id="loginMsg" class="muted"></div>
  `;

  doLogin.onclick = login;
  loginBack.onclick = () => show('home');
  forgotLink.onclick = () => show('forgot');
}

function login(){
  let name = loginName.value.trim();
  let pin = loginPin.value.trim();

  let u = state.players.find(x =>
    x.name.toLowerCase() === name.toLowerCase() && x.pin === pin
  );

  if(!u){
    loginMsg.textContent = 'Jméno nebo PIN nesouhlasí.';
    return;
  }

  state.currentUser = u;
  show('entry');
}

function renderForgot(){
  document.getElementById('forgot').innerHTML = `
    <h2>Zapomenutý přístup</h2>
    <p class="note">V ostré verzi odešle server SMS přes GoSMS API. Teď PIN vidí správce v administraci.</p>
    <p><button class="secondary" id="forgotBack">Zpět</button></p>
  `;

  forgotBack.onclick = () => show('home');
}

function renderAdminLogin(){
  document.getElementById('adminLogin').innerHTML = `
    <h2>Správce</h2>
    <div class="row">
      <div>
        <label>Jméno</label>
        <input id="adminName" value="admin">
      </div>
      <div>
        <label>Heslo</label>
        <input id="adminPass" type="password" placeholder="hclitvinov">
      </div>
      <button id="doAdminLogin">Přihlásit</button>
      <button class="secondary" id="adminBack">Zpět</button>
    </div>
    <div id="adminMsg" class="muted"></div>
  `;

  doAdminLogin.onclick = () => {
    if(adminName.value === 'admin' && adminPass.value === state.admin.password){
      state.currentAdmin = true;
      show('settings');
    } else {
      adminMsg.textContent = 'Špatné přihlášení.';
    }
  };

  adminBack.onclick = () => show('home');
}

export function logout(){
  state.currentUser = null;
  show('home');
}

export async function adminLogout(){
  state.currentAdmin = false;
  show('home');
}
