import { renderPlayersSection } from './players.js';
import { renderTrainingsSection } from './trainings.js';
import { renderAttendanceSection } from './attendance.js';
import { renderSmsSection } from './sms.js';

export function renderApp() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <main class="layout">
      <header class="hero">
        <div>
          <p class="eyebrow">HC Litvínov 2018</p>
          <h1>Tréninky a docházka</h1>
          <p class="subtitle">Produkční základ aplikace pro správu hráčů, tréninků, docházky a SMS.</p>
        </div>
      </header>

      <nav class="tabs" aria-label="Hlavní moduly">
        <button class="tab is-active" data-tab="players">Hráči</button>
        <button class="tab" data-tab="trainings">Tréninky</button>
        <button class="tab" data-tab="attendance">Docházka</button>
        <button class="tab" data-tab="sms">SMS</button>
      </nav>

      <section id="content" class="card"></section>
    </main>
  `;

  const content = document.querySelector('#content');
  const tabs = document.querySelectorAll('.tab');

  const renderTab = (tabName) => {
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === tabName));

    if (tabName === 'players') renderPlayersSection(content);
    if (tabName === 'trainings') renderTrainingsSection(content);
    if (tabName === 'attendance') renderAttendanceSection(content);
    if (tabName === 'sms') renderSmsSection(content);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => renderTab(tab.dataset.tab));
  });

  renderTab('players');
}
