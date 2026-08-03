import { joinRoom, selfId } from 'https://esm.sh/trystero';

export { selfId };

let room = null;
let roomWords = [];

// Load common words from Google 10k list, filter to 3-5 letters
const wordsReady = fetch('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt')
  .then(r => r.text())
  .then(text => {
    roomWords = text.split('\n').filter(w => w.length >= 3 && w.length <= 5 && /^[a-z]+$/.test(w));
    console.log('Word list loaded:', roomWords.length, 'common words');
  })
  .catch(() => {
    console.warn('Word list fetch failed, using fallback');
  });

export { wordsReady };

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
  if (roomWords.length === 0) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  }
  const word = roomWords[Math.floor(Math.random() * roomWords.length)].toUpperCase();
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return word + '-' + num;
}

export function getRoom() {
  return room;
}
