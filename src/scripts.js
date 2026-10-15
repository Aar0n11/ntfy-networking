import { sendMessage, initWebsocket, status } from "./websocket.js"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

initWebsocket();

async function waitForHandshake () {
    while (status !== "recieved handshake") {
        await sleep(100);
    }
}

async function main() {
    await waitForHandshake();

    const message = document.getElementById("input").value
    sendMessage(message);
}

window.main = main