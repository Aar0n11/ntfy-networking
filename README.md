# ntfy-networking

This is a in-progress library for communication between clients with ntfy, but without the hassle and with features added on.

FEATURES:<br>
Simple networking - send to individual clients rather than everyone<br>
Encryption<br>
Hash testing<br>
<br>
USAGE:<br>
Use the event listener "onMessage" to recieve messages<br>

Use the exported function "sendMessage" to send messages to clients.<br>

The default client list is all clients, but the exported function "getClients" will return a list of all registered clients, which can be used to filter which clients to send to.<br>

Use "debug" = true inside the config to set debug mode to true, which enables some console info such as recieving handshakes and messages. If debug mode is on, the script will look for a textarea with a id of "DEBUB_textarea", a label called "DEBUG_label", and a "debug" function used to send whatever is in the textarea, and incoming messages will be recieved and displayed in the label.<br>

Inside the config file, the topic must be a string of alphanumeric characters, and the url must not have any preceeding protocol or succeeding "/". It may have a port. Setting "localhost" to true will point the url to localhost:8080/topic.<br>

The index.html inside dist/ and dev/ is an example file of the imports needed. 

### Recommended:<br>
Use the docker configuration provided for a self-hosted ntfy server. Make sure you have docker installed and run
    docker compose up -d
To start the container.

## This is a personal project, it is a monstrosity of configs and imports. Use at your own risk.