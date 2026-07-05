export function renderAttendanceSection(container) {
  container.innerHTML = `
    <h2>Docházka</h2>
    <p class="muted">Tento modul bude v dalším kroku propojovat hráče a tréninky.</p>

    <div class="placeholder">
      <strong>Plán dalšího kroku:</strong>
      <p>Po vytvoření tréninku se automaticky vytvoří docházkové položky pro aktivní hráče.</p>
    </div>
  `;
}
