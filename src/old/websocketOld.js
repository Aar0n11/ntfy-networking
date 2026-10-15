import { initKeys, getPublicKeyJWK, setPeerPublicKey, encryptMessage, decryptMessage } from './cryptOld.js';

export let status = "uninitialized";
export const clientId = crypto.randomUUID();

export async function initWebsocket() {
  const ws = new WebSocket('wss://ntfy.sh/U2Nob29sb2d6/ws');

  ws.onopen = async () => {
    await initKeys();
    const myPubKey = await getPublicKeyJWK();

    await fetch("https://ntfy.sh/U2Nob29sb2d6", {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ type: 'handshake', from: clientId, publicKey: myPubKey })
    });
    status = "pending handshake";
  };

  ws.onmessage = async (event) => {
    const envelope = JSON.parse(event.data);
    const msg = envelope.message !== undefined ? JSON.parse(envelope.message) : envelope;

    if (msg.from === clientId) return;

    if (msg.type === 'handshake') {
      await setPeerPublicKey(msg.publicKey);
      status = "recieved handshake";
    }

    if (msg.type === 'message') {
      const plaintext = await decryptMessage(msg.data);
      console.log('Received:', plaintext);
    }
  };
}

export async function sendMessage(message) {
  const data = await encryptMessage(message);
  await fetch("https://ntfy.sh/U2Nob29sb2d6", {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ type: 'message', from: clientId, data })
  });
}