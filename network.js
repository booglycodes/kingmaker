import { joinRoom, selfId } from 'https://esm.sh/trystero';
import allWords from 'https://esm.sh/an-array-of-english-words';

export { selfId };

const fiveLetterWords = allWords.filter(w => w.length === 5 && /^[a-z]+$/.test(w));
console.log('Word list loaded:', fiveLetterWords.length, 'words');

let room = null;

// Action senders/receivers (populated after join)
export let send = {};
export let on = {};

export function join(roomCode) {
  room = joinRoom({ appId: 'kingmaker-v1' }, roomCode);

  const actions = ['lobby', 'join', 'joinResult', 'ready', 'start', 'action', 'state', 'hand', 'error'];

  for (const name of actions) {
    const action = room.makeAction(name);
    if (Array.isArray(action)) {
      send[name] = action[0];
      on[name] = action[1];
    } else if (action && typeof action === 'object') {
      send[name] = (data, target) => {
        if (target) {
          action.send(data, { target });
        } else {
          action.send(data);
        }
      };
      on[name] = (callback) => {
        action.onMessage = (data, peerId) => callback(data, peerId);
      };
    }
  }

  return room;
}

export function generateCode() {
  if (fiveLetterWords.length === 0) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }
  return fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)].toUpperCase();
}

export function getRoom() {
  return room;
}
