import { renderPlayers } from './players.js';
import { renderExerciseLog } from './trainings.js';
import { renderOverview } from './attendance.js';
import { renderSettings } from './sms.js';

export function renderApp() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <header class="topbar">
      <div>
        <h1>Domácí cvičení HC Litvínov</h1>
        <p>Zápis domácího cvičení hráčů</p>
      </div>
    </header>

    <nav class="tabs">
      <button class="tab active" data-tab="exerciseLog">Záznam cvičení</button>
      <button class="tab" data-tab="overview">Přehled</button>
      <button class="tab" data-tab="players">Hráči</button>
      <button class="tab" data-tab="settings">Nastavení</button>
    </nav>

    <main id="content" class="content"></main>
  `;

  const content = document.getElementById('content');

  function openTab(tab) {
    document.querySelectorAll('.tab').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });

    if (tab === 'exerciseLog') renderExerciseLog(content);
    if (tab === 'overview') renderOverview(content);
    if (tab === 'players') renderPlayers(content);
    if (tab === 'settings') renderSettings(content);
  }

  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => openTab(button.dataset.tab));
  });

  openTab('exerciseLog');
}
