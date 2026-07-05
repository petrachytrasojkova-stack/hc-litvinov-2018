import { renderPlayers } from './players.js';
import { renderTrainings } from './trainings.js';
import { renderAttendance } from './attendance.js';
import { renderSms } from './sms.js';

export function renderApp() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <header class="topbar">
      <div>
        <h1>Tréninky HC Litvínov</h1>
        <p>Produkční základ aplikace</p>
      </div>
    </header>

    <nav class="tabs">
      <button class="tab active" data-tab="players">Hráči</button>
      <button class="tab" data-tab="trainings">Tréninky</button>
      <button class="tab" data-tab="attendance">Docházka</button>
      <button class="tab" data-tab="sms">SMS</button>
    </nav>

    <main id="content" class="content"></main>
  `;

  const content = document.getElementById('content');

  function openTab(tab) {
    document.querySelectorAll('.tab').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });

    if (tab === 'players') renderPlayers(content);
    if (tab === 'trainings') renderTrainings(content);
    if (tab === 'attendance') renderAttendance(content);
    if (tab === 'sms') renderSms(content);
  }

  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => openTab(button.dataset.tab));
  });

  openTab('players');
}
