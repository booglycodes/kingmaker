import { joinRoom, selfId } from 'https://esm.sh/trystero';

export { selfId };

let room = null;

// Action senders/receivers (populated after join)
export let send = {};
export let on = {};

export function join(roomCode) {
  room = joinRoom({ appId: 'kingmaker-v1' }, roomCode);

  const actions = ['lobby', 'join', 'joinResult', 'ready', 'start', 'action', 'state', 'hand', 'error'];

  for (const name of actions) {
    const action = room.makeAction(name);
    console.log(`makeAction('${name}') returned:`, typeof action, action);

    if (typeof action === 'function') {
      // makeAction returns the send function directly, with .onMessage property
      send[name] = (data, target) => {
        if (target) {
          action(data, target);
        } else {
          action(data);
        }
      };
      on[name] = (callback) => {
        // The receive function might be attached to the send function
        // or returned differently
      };
    } else if (Array.isArray(action)) {
      send[name] = action[0];
      on[name] = action[1];
    } else if (action && typeof action === 'object') {
      // Object with send/onMessage
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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function getRoom() {
  return room;
}
