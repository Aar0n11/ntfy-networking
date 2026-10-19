import { encryptAES, decryptAES } from "./crypt.js";

export let status = "uninitialized";

let clientUUIDs = [];
const myUUID = self.crypto.randomUUID();

let topic;
let localhost;

export async function initWebsocket(ntfyTopic, ntfyLocalhost = false) {
  topic = ntfyTopic;
  localhost = ntfyLocalhost;

  let ws;
  if (localhost) ws = new WebSocket(`ws://localhost:8080/${topic}/ws`);
  else ws = new WebSocket(`wss://ntfy.sh/${topic}/ws`);

  ws.onopen = async () => {
    // Broadcast initial handshake to all listening peers
    await fetch(
      localhost
        ? `http://localhost:8080/${topic}`
        : `https://ntfy.sh/${topic}/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "handshake", from: myUUID }),
      },
    );
    status = "pending handshake";
  };

  ws.onmessage = async (event) => {
    try {
      const envelope = JSON.parse(event.data);
      if (envelope.event !== "message" || !envelope.message) return;

      const msg =
        typeof envelope.message === "string"
          ? JSON.parse(envelope.message)
          : envelope.message;

      // Ignore our own messages when the sender is identifiable.
      if (msg.from === myUUID) return;

      // Handshakes are sent as plain JSON.
      if (msg.type === "handshake") {
        if (!clientUUIDs.includes(msg.from)) {
          clientUUIDs.push(msg.from);
          status = "received handshake";
        }

        await fetch(
          localhost
            ? `http://localhost:8080/${topic}`
            : `https://ntfy.sh/${topic}/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "handshake_ack",
              from: myUUID,
              to: msg.from,
            }),
          },
        );

        return;
      }

      if (msg.type === "handshake_ack") {
        if (msg.to === myUUID && !clientUUIDs.includes(msg.from)) {
          clientUUIDs.push(msg.from);
          console.info("Received handshake from " + msg.from);
          status = "received handshake";
        }

        return;
      }

      // Encrypted messages have salt, iv and data, not a plaintext type.
      if (!msg.salt || !msg.iv || !msg.data) return;

      let decryptedMsg = null;
      let senderUUID = null;

      for (const uuid of clientUUIDs) {
        try {
          const decryptedJson = await decryptAES(msg, uuid);
          const candidate = JSON.parse(decryptedJson);

          if (candidate.type !== "message") continue;

          decryptedMsg = candidate;
          senderUUID = uuid;
          break;
        } catch {
          // This peer's key did not decrypt the envelope.
        }
      }

      if (!decryptedMsg) return;

      if (localStorage.getItem("hash") !== decryptedMsg.hash) {
        console.warn(
          `Client: ${senderUUID} had wrong hash: ${decryptedMsg.hash}`,
        );
      }

      if (decryptedMsg.to?.includes(myUUID)) {
        const dataListObj = JSON.parse(decryptedMsg.dataList);
        const encryptedForMe = dataListObj[myUUID];

        if (encryptedForMe) {
          const plaintext = await decryptAES(encryptedForMe, myUUID);

          document.dispatchEvent(
            new CustomEvent("onMessage", {
              detail: { message: plaintext },
            }),
          );

          console.info("Received:", plaintext);
        }
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  };
}

export async function sendMessage(message, documentHash, to = clientUUIDs) {
  if (to.length === 0) {
    console.warn("No recipient UUIDs available to send message.");
    return;
  }

  const plaintext =
    typeof message === "string" ? message : JSON.stringify(message);

  const encryptedEntries = await Promise.all(
    to.map(async (uuid) => [uuid, await encryptAES(plaintext, uuid)]),
  );

  const payload = JSON.stringify({
    type: "message",
    from: myUUID,
    to,
    dataList: JSON.stringify(Object.fromEntries(encryptedEntries)),
    hash: documentHash,
  });

  // encryptAES returns an object, so serialize it for ntfy.
  const encryptedEnvelope = await encryptAES(payload, myUUID);

  await fetch(
    localhost ? `http://localhost:8080/${topic}` : `https://ntfy.sh/${topic}/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encryptedEnvelope),
    },
  );
}
