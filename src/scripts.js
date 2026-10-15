import { sendMessage, initWebsocket, status } from "./websocket.js"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

document.addEventListener('onload', initWebsocket());

async function waitForHandshake () {
    while (status !== "received handshake") {
        await sleep(100);
    }
}

async function main() {
    await waitForHandshake();

    console.log("sent");
    const message = document.getElementById("DEBUG_textarea").value;
    sendMessage(message);
}

document.addEventListener("onMessage", (e) => {
    document.getElementById("DEBUG_label").innerText = e.detail.message;
})

window.main = main