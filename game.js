import { send, on } from './network.js';
import { showScreen, log } from './ui.js';

// ============================================================
// GAME - HOST SIDE
// ============================================================
export function initHost(playerOrder, players) {
  showScreen('screen-game');
  log('Game started (HOST). Players: ' + playerOrder.join(', '));

  // TODO: create game engine here
  // const engine = new GameEngine(playerOrder);

  // Listen for client actions
  on.action((data, peerId) => {
    const playerIdx = players.findIndex(p => p.peerId === peerId);
    if (playerIdx === -1) return;

    log(`Action from ${players[playerIdx].name}: ${JSON.stringify(data)}`);

    // TODO: validate and process action
    // TODO: broadcast state
    // sendState(buildPublicState());
    // sendHand(playerHand, peerId);  // send to each player individually
  });

  // TODO: send initial state + hands
}

// ============================================================
// GAME - CLIENT SIDE
// ============================================================
export function initClient(playerOrder, myName) {
  showScreen('screen-game');
  log('Game started (CLIENT). Players: ' + playerOrder.join(', '));

  // Receive public game state
  on.state((state, peerId) => {
    log('State update received');
    // TODO: render game board from state
  });

  // Receive private hand
  on.hand((data, peerId) => {
    log('Hand received: ' + data.hand.length + ' cards');
    // TODO: render your hand
  });

  // Receive errors
  on.error((data, peerId) => {
    log('Error: ' + data.message);
  });
}

// ============================================================
// SEND ACTION (client calls this)
// ============================================================
export function sendGameAction(action) {
  send.action(action);
}
