import { encryptAES, decryptAES } from "./crypt.js";

export let status = "uninitialized";

let clientUUIDs = [];
const myUUID = self.crypto.randomUUID();

export async function initWebsocket() {
  const ws = new WebSocket('wss://ntfy.sh/U2Nob29sb2d6/ws');

  ws.onopen = async () => {
    // Broadcast initial handshake to all listening peers
    await fetch("https://ntfy.sh/U2Nob29sb2d6", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'handshake', from: myUUID })
    });
    status = "pending handshake";
  };

  ws.onmessage = async (event) => {
    try {
      const envelope = JSON.parse(event.data);
      if (envelope.event !== "message" || !envelope.message) return;

      const msg = JSON.parse(envelope.message);
      if (msg.from === myUUID) return;

      // Handle initial handshake from a new peer
      if (msg.type === 'handshake') {
        if (!clientUUIDs.includes(msg.from)) {
          clientUUIDs.push(msg.from);
          status = "received handshake";
        }

        // Send a targeted acknowledgment back so the new peer registers us
        await fetch("https://ntfy.sh/U2Nob29sb2d6", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'handshake_ack', 
            from: myUUID, 
            to: msg.from 
          })
        });
      }

      // Handle incoming acknowledgment sent specifically to us
      if (msg.type === 'handshake_ack') {
        if (msg.to === myUUID && !clientUUIDs.includes(msg.from)) {
          clientUUIDs.push(msg.from);
          console.info("Recieved handshake from " + msg.from)
          status = "received handshake";
        }
      }

      // Handle incoming encrypted messages
      if (msg.type === 'message') {
        let newMsg;
        for(let i = 0; i < clientUUIDs.length; i++) {
          if(JSON.parse(await decryptAES(msg, clientUUIDs[i]))) {
            newMsg = JSON.parse(await decryptAES(msg, clientUUIDs[i])); 
            break;
          }
        }

        if (newMsg.to && newMsg.to.includes(myUUID) && newMsg.dataList[myUUID]) {
          const plaintext = await decryptAES(newMsg.dataList[myUUID], myUUID);

          const event = new CustomEvent('onMessage', {
            detail: { message: plaintext }
          })
          document.dispatchEvent(event);
          
          console.info('Received:', plaintext);
        }
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  };
}

export async function sendMessage(message, to = clientUUIDs) {
  if (to.length === 0) {
    console.warn("No recipient UUIDs available to send message.");
    return;
  }

  const encryptedEntries = await Promise.all(
    to.map(async (uuid) => [uuid, await encryptAES(message, uuid)])
  );

  await fetch("https://ntfy.sh/U2Nob29sb2d6", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'message',
      from: myUUID,
      to: to,
      dataList: await encryptAES(JSON.stringify(Object.fromEntries(encryptedEntries)), myUUID)
    })
  });
}