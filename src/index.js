const socket = new WebSocket(`wss://ntfy.sh/U2Nob29sb2d6/ws`);
socket.onmessage = (event) => {
    console.log(event);
}