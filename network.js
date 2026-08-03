import { joinRoom, selfId } from 'https://esm.sh/trystero';

export { selfId };

let room = null;

// Action senders/receivers (populated after join)
export let send = {};
export let on = {};

export function join(roomCode) {
    room = joinRoom({ appId: 'kingmaker-v1' }, roomCode)
    const actions = ['lobby', 'join', 'joinResult', 'ready', 'start', 'action', 'state', 'hand', 'error'];
    for (const name of actions) {
        const [sendFn, onFn] = room.makeAction(name);
        send[name] = sendFn
        on[name] = onFn
    }
    return room;
}

export function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
}

export function getRoom() {
    return room
}
