import { createPlayer, loadPlayers, renderPlayers } from './players.js';
import { createTraining, loadTrainings, renderTrainings } from './trainings.js';

const playerForm = document.querySelector('#playerForm');
const trainingForm = document.querySelector('#trainingForm');
const playersList = document.querySelector('#playersList');
const trainingsList = document.querySelector('#trainingsList');
const reloadPlayers = document.querySelector('#reloadPlayers');
const reloadTrainings = document.querySelector('#reloadTrainings');
const toast = document.querySelector('#toast');

playerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const formData = Object.fromEntries(new FormData(playerForm));
    await createPlayer(formData);
    playerForm.reset();
    playerForm.elements.team.value = '2018';
    await refreshPlayers();
    showToast('Hráč uložen.');
  } catch (error) {
    showToast(error.message, true);
  }
});

trainingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const formData = Object.fromEntries(new FormData(trainingForm));
    await createTraining(formData);
    trainingForm.reset();
    trainingForm.elements.title.value = 'Trénink';
    trainingForm.elements.team.value = '2018';
    await refreshTrainings();
    showToast('Trénink uložen.');
  } catch (error) {
    showToast(error.message, true);
  }
});

reloadPlayers.addEventListener('click', refreshPlayers);
reloadTrainings.addEventListener('click', refreshTrainings);

async function refreshPlayers() {
  try {
    playersList.textContent = 'Načítám hráče...';
    const players = await loadPlayers();
    renderPlayers(players, playersList);
  } catch (error) {
    playersList.className = 'list empty error';
    playersList.textContent = `Hráče se nepodařilo načíst: ${error.message}`;
  }
}

async function refreshTrainings() {
  try {
    trainingsList.textContent = 'Načítám tréninky...';
    const trainings = await loadTrainings();
    renderTrainings(trainings, trainingsList);
  } catch (error) {
    trainingsList.className = 'list empty error';
    trainingsList.textContent = `Tréninky se nepodařilo načíst: ${error.message}`;
  }
}

function showToast(message, isError = false) {
  toast.hidden = false;
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.hidden = true;
  }, 3500);
}

refreshPlayers();
refreshTrainings();
