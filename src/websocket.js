import { encryptAES, decryptAES } from "./crypt.js";

export let status = "uninitialized";

let clientUUIDs = [self.crypto.randomUUID()];
const myUUID = clientUUIDs[0];

export async function initWebsocket() {
  const ws = new WebSocket('wss://ntfy.sh/U2Nob29sb2d6/ws');

  ws.onopen = async () => {
    await fetch("https://ntfy.sh/U2Nob29sb2d6", {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ type: 'handshake', from: myUUID })
    });
    status = "pending handshake";
  };

  ws.onmessage = async (event) => {
    const envelope = JSON.parse(event.data);
    const msg = envelope.message !== undefined ? JSON.parse(envelope.message) : envelope;

    if (msg.from === myUUID) return;

    if (msg.type === 'handshake') {
      if(!clientUUIDs.includes(msg.from)) {
        clientUUIDs.push(msg.from);
        status = "recieved handshake";
      }
    }

    if (msg.type === 'message') {
      if(msg.to.includes(myUUID)) {
        const plaintext = await decryptAES(msg.dataList.myUUID, myUUID);
        console.log('Received:', plaintext);
      }
    }
  };
}

export async function sendMessage(message, to) {
    await fetch("https://ntfy.sh/U2Nob29sb2d6", {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ type: 'message', from: myUUID, to: to, dataList: Object.fromEntries(await Promise.all(clientUUIDs.map(async uuid => [uuid, await encryptAES(message, uuid)])))})
    });
}