import { initKeys, getPublicKeyJWK, setPeerPublicKey, encryptMessage, decryptMessage } from './crypt.js';

const ws = new WebSocket('wss://ntfy.sh/U2Nob29sb2d6/ws');

ws.onopen = async () => {
  await initKeys();
  const myPubKey = await getPublicKeyJWK();
  ws.send(JSON.stringify({ type: 'hello', publicKey: myPubKey }));
};

ws.onmessage = async (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'hello') {
    await setPeerPublicKey(msg.publicKey);
    console.log('[client] Peer key received, ready to encrypt.');

    const data = await encryptMessage('Hello from client!');
    ws.send(JSON.stringify({ type: 'message', data }));
  }

  if (msg.type === 'message') {
    const plaintext = await decryptMessage(msg.data);
    console.log('[client] Received:', plaintext);
  }
};