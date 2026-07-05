export function renderPlayers(container) {
  container.innerHTML = `
    <section class="card">
      <h2>Hráči</h2>
      <p>Správa hráčů bude v dalším kroku ukládat data do Firebase.</p>

      <form class="form">
        <label>Jméno hráče
          <input type="text" placeholder="Např. Jan Novák">
        </label>

        <label>Telefon rodiče
          <input type="tel" placeholder="+420 777 123 456">
        </label>

        <button type="button">Uložit hráče</button>
      </form>
    </section>
  `;
}
