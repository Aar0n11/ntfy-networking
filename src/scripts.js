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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document.addEventListener("DOMContentLoaded", () => {
  loadConfig()
    .then((config) => {
      initWebsocket(config.topic, config.localhost);
    })
    .catch((error) => {
      console.error(error);
    });
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

async function main() {
  await waitForHandshake();
  await waitForMD5();

  const message = document.getElementById("DEBUG_textarea").value;
  sendMessage(message, hash);
}

document.addEventListener("onMessage", (e) => {
  document.getElementById("DEBUG_label").innerText = e.detail.message;
});

window.main = main;
