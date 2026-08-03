import { selfId, send, on, join, generateCode } from './network.js';
import { showScreen, log } from './ui.js';

let isHost = false;
let myName = '';
let myReady = false;
let roomCode = '';
let players = []; // [{ peerId, name, ready }]
let peerNames = {};

let onGameStart = null;

export function setOnGameStart(cb) {
  onGameStart = cb;
}

export function getPlayers() { return players; }
export function getMyName() { return myName; }
export function getIsHost() { return isHost; }
export function getRoomCode() { return roomCode; }

// ============================================================
// CREATE GAME (HOST)
// ============================================================
export function createGame() {
  myName = document.getElementById('input-name').value.trim();
  if (!myName) { showError('Enter a name'); return; }

  roomCode = generateCode();
  isHost = true;

  updateUrl();
  const room = join(roomCode);

  players = [{ peerId: selfId, name: myName, ready: false }];

  room.onPeerJoin = peerId => {
    log(`Peer connected: ${peerId.slice(0, 8)}`);
  };

  room.onPeerLeave = peerId => {
    players = players.filter(p => p.peerId !== peerId);
    broadcastLobby();
    log(`${peerNames[peerId] || 'Peer'} left`);
  };

  on.join((data, peerId) => {
    const name = data.name;
    if (players.some(p => p.name === name)) {
      send.joinResult({ success: false, reason: 'Name already taken' }, peerId);
      return;
    }
    players.push({ peerId, name, ready: false });
    peerNames[peerId] = name;
    send.joinResult({ success: true }, peerId);
    broadcastLobby();
    log(`${name} joined`);
  });

  on.ready((data, peerId) => {
    const p = players.find(x => x.peerId === peerId);
    if (p) {
      p.ready = data.ready;
      broadcastLobby();
      checkAutoStart();
    }
  });

  showLobby();
  log('Room created. You are HOST.');
}

// ============================================================
// JOIN GAME (CLIENT)
// ============================================================
export function joinGame() {
  myName = document.getElementById('input-name').value.trim();
  roomCode = document.getElementById('input-code').value.trim().toUpperCase();
  if (!myName) { showError('Enter a name'); return; }
  if (!roomCode) { showError('Enter a room code'); return; }

  isHost = false;
  updateUrl();
  const room = join(roomCode);

  // Go to lobby immediately
  showLobby();
  log('Connecting to room ' + roomCode + '...');

  let joined = false;

  room.onPeerJoin = peerId => {
    if (!joined) {
      joined = true;
      send.join({ name: myName }, peerId);
      log('Found host, requesting to join...');
    }
  };

  room.onPeerLeave = peerId => {
    log(`Peer left: ${peerId.slice(0, 8)}`);
  };

  on.joinResult((data, peerId) => {
    if (data.success) {
      log('Joined!');
    } else {
      // Rejected — go back to start screen
      showScreen('screen-start');
      showError(data.reason || 'Rejected');
    }
  });

  on.lobby((data, peerId) => {
    players = data.players;
    renderLobby();
  });

  on.start((data, peerId) => {
    if (onGameStart) onGameStart(data, { isHost, myName, players });
  });
}

// ============================================================
// LOBBY INTERNALS
// ============================================================
function broadcastLobby() {
  send.lobby({ players: players.map(p => ({ name: p.name, ready: p.ready })) });
  renderLobby();
}

function checkAutoStart() {
  if (players.length >= 3 && players.every(p => p.ready)) {
    const playerOrder = players.map(p => p.name);
    send.start({ playerOrder });
    if (onGameStart) onGameStart({ playerOrder }, { isHost, myName, players });
  }
}

function showLobby() {
  showScreen('screen-lobby');
  document.getElementById('display-code').textContent = roomCode;
  const link = window.location.origin + window.location.pathname + '?room=' + roomCode;
  document.getElementById('display-link').value = link;
  renderLobby();
}

function renderLobby() {
  const list = document.getElementById('player-list');
  list.innerHTML = players.map(p => {
    const you = (p.name === myName) ? ' (you)' : '';
    const cls = p.ready ? 'ready' : 'not-ready';
    const txt = p.ready ? '✓ Ready' : 'Waiting...';
    return `<li><span>${p.name}${you}</span><span class="${cls}">${txt}</span></li>`;
  }).join('');

  const readyCount = players.filter(p => p.ready).length;
  const need = Math.max(0, 3 - players.length);
  document.getElementById('lobby-status').textContent =
    `${readyCount}/${players.length} ready` + (need > 0 ? ` — need ${need} more` : '');
}

export function toggleReady() {
  myReady = !myReady;
  document.getElementById('btn-ready').textContent = myReady ? 'Unready' : 'Ready';

  if (isHost) {
    const me = players.find(p => p.peerId === selfId);
    if (me) me.ready = myReady;
    broadcastLobby();
    checkAutoStart();
  } else {
    send.ready({ ready: myReady });
  }
}

// ============================================================
// HELPERS
// ============================================================
function updateUrl() {
  const url = new URL(window.location);
  url.searchParams.set('room', roomCode);
  history.replaceState(null, '', url);
}

function showError(msg) {
  document.getElementById('start-error').textContent = msg;
}
