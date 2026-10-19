import { sendMessage, initWebsocket, status } from "./websocket.js"

let hash;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

document.addEventListener('onload', initWebsocket());

async function waitForHandshake () {
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

    window.getHash = getHash

    const message = document.getElementById("DEBUG_textarea").value;
    sendMessage(message, hash);
}

document.addEventListener("onMessage", (e) => {
    document.getElementById("DEBUG_label").innerText = e.detail.message;
})

window.main = main;