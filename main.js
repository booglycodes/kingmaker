import { createGame, joinGame, toggleReady, setOnGameStart } from './lobby.js';
import { initHost, initClient } from './game.js';

// ============================================================
// WIRE UP LOBBY -> GAME TRANSITION
// ============================================================
setOnGameStart((data, context) => {
  if (context.isHost) {
    initHost(data.playerOrder, context.players);
  } else {
    initClient(data.playerOrder, context.myName);
  }
});

// ============================================================
// START SCREEN: CREATE / JOIN TOGGLE
// ============================================================
let mode = 'create'; // 'create' or 'join'

const tabCreate = document.getElementById('tab-create');
const tabJoin = document.getElementById('tab-join');
const inputCode = document.getElementById('input-code');
const btnGo = document.getElementById('btn-go');

function setMode(m) {
  mode = m;
  tabCreate.classList.toggle('active', mode === 'create');
  tabJoin.classList.toggle('active', mode === 'join');
  inputCode.classList.toggle('hidden', mode === 'create');
  btnGo.textContent = mode === 'create' ? 'Create Game' : 'Join Game';
}

tabCreate.addEventListener('click', () => setMode('create'));
tabJoin.addEventListener('click', () => setMode('join'));

// ============================================================
// GO BUTTON
// ============================================================
btnGo.addEventListener('click', () => {
  if (mode === 'create') {
    createGame();
  } else {
    joinGame();
  }
});

// ============================================================
// LOBBY BUTTONS
// ============================================================
document.getElementById('btn-ready').addEventListener('click', toggleReady);

document.getElementById('btn-copy').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('display-link').value);
  document.getElementById('btn-copy').textContent = 'Copied!';
  setTimeout(() => document.getElementById('btn-copy').textContent = 'Copy', 2000);
});

// ============================================================
// AUTO-JOIN FROM URL
// ============================================================
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('room')) {
  const code = urlParams.get('room').toUpperCase();
  inputCode.value = code;
  setMode('join');
}
