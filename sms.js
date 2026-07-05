export function renderSmsSection(container) {
  container.innerHTML = `
    <h2>SMS</h2>
    <p class="muted">Zde bude později napojení na GoSMS API.</p>

    <div class="placeholder">
      <strong>GoSMS bude řešeno bezpečně přes serverovou část.</strong>
      <p>API klíč nesmí být přímo v prohlížeči ani ve veřejném GitHub repozitáři.</p>
    </div>
  `;
}
