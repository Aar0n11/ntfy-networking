import { sendMessage, initWebsocket, status } from "./websocket.js";

async function loadConfig() {
  try {
    const response = await fetch("config.json");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const config = await response.json();
    return config;
  } catch (error) {
    console.error("Error loading JSON:", error);
    throw error;
  }
}

let hash;
let _config;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const config = await loadConfig();
    _config = config;

    initWebsocket(
      config.topic,
      config.localhost,
      config.url,
      config.debug
    );

    if (config.debug) {
      document.addEventListener("onMessage", (e) => {
        document.getElementById("DEBUG_label").innerText =
          e.detail.message;
      });
    }
  } catch (error) {
    console.error(error);
  }
});

async function waitForHandshake() {
  while (status !== "received handshake") {
    await sleep(100);
  }
}

async function waitForMD5() {
  while (!localStorage.getItem("hash")) {
    await sleep(10);
  }

  hash = localStorage.getItem("hash");
}

async function message(message) {
  await waitForHandshake();
  await waitForMD5();

  sendMessage(message, hash);
}

async function debug() {
  await waitForHandshake();
  await waitForMD5();

  const messageText = document.getElementById("DEBUG_textarea").value;
  message(messageText);
}

window.debug = debug;
window.sendMessage = message;
