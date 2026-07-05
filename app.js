import { renderHome, show } from './auth.js';

export const state = {
  currentUser: null,
  currentAdmin: false,
  players: [],
  plans: [],
  exercises: [],
  entries: [],
  admin: {
    password: 'hclitvinov',
    phone: ''
  }
};

export function renderApp() {
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h1>HC Litvínov - ročník 2018</h1>
      <div class="muted"><span id="activePlanTitle">Léto 2026</span> · online tréninkový deník</div>
    </div>

    <section id="home" class="card"></section>
    <section id="registration" class="card hidden"></section>
    <section id="login" class="card hidden"></section>
    <section id="forgot" class="card hidden"></section>
    <section id="entry" class="card hidden"></section>
    <section id="overview" class="card hidden"></section>
    <section id="statistics" class="card hidden"></section>
    <section id="adminLogin" class="card hidden"></section>
    <section id="settings" class="card hidden"></section>
  `;

  window.appShow = show;
  renderHome();
}
