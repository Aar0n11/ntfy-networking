/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/crypt.js"
/*!**********************!*\
  !*** ./src/crypt.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   decryptAES: () => (/* binding */ decryptAES),\n/* harmony export */   encryptAES: () => (/* binding */ encryptAES)\n/* harmony export */ });\n// Helper for safe Uint8Array <-> Base64 conversion\nfunction uint8ToBase64(bytes) {\n  let binary = '';\n  const len = bytes.byteLength;\n  for (let i = 0; i < len; i++) {\n    binary += String.fromCharCode(bytes[i]);\n  }\n  return btoa(binary);\n}\n\nfunction base64ToUint8(base64) {\n  const binary = atob(base64);\n  const bytes = new Uint8Array(binary.length);\n  for (let i = 0; i < binary.length; i++) {\n    bytes[i] = binary.charCodeAt(i);\n  }\n  return bytes;\n}\n\nasync function encryptAES(plaintext, password) {\n  const enc = new TextEncoder();\n  \n  // 1. Generate dynamic salt and IV\n  const salt = crypto.getRandomValues(new Uint8Array(16));\n  const iv = crypto.getRandomValues(new Uint8Array(12));\n\n  // 2. Derive key using key derivation\n  const keyMaterial = await crypto.subtle.importKey(\n    \"raw\", \n    enc.encode(password), \n    \"PBKDF2\", \n    false, \n    [\"deriveKey\"]\n  );\n  \n  const key = await crypto.subtle.deriveKey(\n    { name: \"PBKDF2\", salt: salt, iterations: 100000, hash: \"SHA-256\" },\n    keyMaterial,\n    { name: \"AES-GCM\", length: 256 },\n    false,\n    [\"encrypt\"]\n  );\n\n  // 3. Encrypt data\n  const encryptedBuffer = await crypto.subtle.encrypt(\n    { name: \"AES-GCM\", iv: iv },\n    key,\n    enc.encode(plaintext)\n  );\n\n  // 4. Return salt, IV, and data\n  return {\n    salt: uint8ToBase64(salt),\n    iv: uint8ToBase64(iv),\n    data: uint8ToBase64(new Uint8Array(encryptedBuffer))\n  };\n}\n\nasync function decryptAES({ salt, iv, data }, password) {\n  const enc = new TextEncoder();\n\n  const saltBytes = base64ToUint8(salt);\n  const ivBytes = base64ToUint8(iv);\n  const dataBytes = base64ToUint8(data);\n\n  // 1. Derive key using transmitted salt\n  const keyMaterial = await crypto.subtle.importKey(\n    \"raw\",\n    enc.encode(password),\n    \"PBKDF2\",\n    false,\n    [\"deriveKey\"]\n  );\n\n  const key = await crypto.subtle.deriveKey(\n    { name: \"PBKDF2\", salt: saltBytes, iterations: 100000, hash: \"SHA-256\" },\n    keyMaterial,\n    { name: \"AES-GCM\", length: 256 },\n    false,\n    [\"decrypt\"]\n  );\n\n  // 2. Decrypt\n  const decryptedBuffer = await crypto.subtle.decrypt(\n    { name: \"AES-GCM\", iv: ivBytes },\n    key,\n    dataBytes\n  );\n\n  return new TextDecoder().decode(decryptedBuffer);\n}\n\n//# sourceURL=webpack:///./src/crypt.js?\n}");

/***/ },

/***/ "./src/scripts.js"
/*!************************!*\
  !*** ./src/scripts.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _websocket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./websocket.js */ \"./src/websocket.js\");\n\n\nlet mainConfig;\n\nasync function loadConfig() {\n  try {\n    const response = await fetch(\"config.json\");\n\n    if (!response.ok) {\n      throw new Error(`HTTP error! Status: ${response.status}`);\n    }\n\n    const config = await response.json();\n    return config;\n  } catch (error) {\n    console.error(\"Error loading JSON:\", error);\n    throw error;\n  }\n}\n\nlet hash;\n\nconst sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n  loadConfig()\n    .then((config) => {\n      mainConfig = config;\n      (0,_websocket_js__WEBPACK_IMPORTED_MODULE_0__.initWebsocket)(config.topic, config.localhost);\n      console.log(mainConfig);\n    })\n    .catch((error) => {\n      console.error(error);\n    });\n});\n\nasync function waitForHandshake() {\n  while (_websocket_js__WEBPACK_IMPORTED_MODULE_0__.status !== \"received handshake\") {\n    await sleep(100);\n  }\n}\n\nasync function waitForMD5() {\n  while (!localStorage.getItem(\"hash\")) {\n    await sleep(10);\n  }\n\n  hash = localStorage.getItem(\"hash\");\n}\n\nasync function main() {\n  await waitForHandshake();\n  await waitForMD5();\n\n  const message = document.getElementById(\"DEBUG_textarea\").value;\n  (0,_websocket_js__WEBPACK_IMPORTED_MODULE_0__.sendMessage)(message, hash);\n}\n\ndocument.addEventListener(\"onMessage\", (e) => {\n  document.getElementById(\"DEBUG_label\").innerText = e.detail.message;\n});\n\nwindow.main = main;\n\n\n//# sourceURL=webpack:///./src/scripts.js?\n}");

/***/ },

/***/ "./src/websocket.js"
/*!**************************!*\
  !*** ./src/websocket.js ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initWebsocket: () => (/* binding */ initWebsocket),\n/* harmony export */   sendMessage: () => (/* binding */ sendMessage),\n/* harmony export */   status: () => (/* binding */ status)\n/* harmony export */ });\n/* harmony import */ var _crypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./crypt.js */ \"./src/crypt.js\");\n\n\nlet status = \"uninitialized\";\n\nlet clientUUIDs = [];\nconst myUUID = self.crypto.randomUUID();\n\nlet topic;\nlet localhost;\n\nasync function initWebsocket(ntfyTopic, ntfyLocalhost = false) {\n  topic = ntfyTopic;\n  localhost = ntfyLocalhost;\n\n  let ws;\n  if (localhost) ws = new WebSocket(`ws://localhost:8080/${topic}/ws`);\n  else ws = new WebSocket(`wss://ntfy.sh/${topic}/ws`);\n\n  ws.onopen = async () => {\n    // Broadcast initial handshake to all listening peers\n    await fetch(\n      localhost\n        ? `http://localhost:8080/${topic}`\n        : `https://ntfy.sh/${topic}/`,\n      {\n        method: \"POST\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ type: \"handshake\", from: myUUID }),\n      },\n    );\n    status = \"pending handshake\";\n  };\n\n  ws.onmessage = async (event) => {\n    try {\n      const envelope = JSON.parse(event.data);\n      if (envelope.event !== \"message\" || !envelope.message) return;\n\n      const msg =\n        typeof envelope.message === \"string\"\n          ? JSON.parse(envelope.message)\n          : envelope.message;\n\n      // Ignore our own messages when the sender is identifiable.\n      if (msg.from === myUUID) return;\n\n      // Handshakes are sent as plain JSON.\n      if (msg.type === \"handshake\") {\n        if (!clientUUIDs.includes(msg.from)) {\n          clientUUIDs.push(msg.from);\n          status = \"received handshake\";\n        }\n\n        await fetch(\n          localhost\n            ? `http://localhost:8080/${topic}`\n            : `https://ntfy.sh/${topic}/`,\n          {\n            method: \"POST\",\n            headers: { \"Content-Type\": \"application/json\" },\n            body: JSON.stringify({\n              type: \"handshake_ack\",\n              from: myUUID,\n              to: msg.from,\n            }),\n          },\n        );\n\n        return;\n      }\n\n      if (msg.type === \"handshake_ack\") {\n        if (msg.to === myUUID && !clientUUIDs.includes(msg.from)) {\n          clientUUIDs.push(msg.from);\n          console.info(\"Received handshake from \" + msg.from);\n          status = \"received handshake\";\n        }\n\n        return;\n      }\n\n      // Encrypted messages have salt, iv and data, not a plaintext type.\n      if (!msg.salt || !msg.iv || !msg.data) return;\n\n      let decryptedMsg = null;\n      let senderUUID = null;\n\n      for (const uuid of clientUUIDs) {\n        try {\n          const decryptedJson = await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.decryptAES)(msg, uuid);\n          const candidate = JSON.parse(decryptedJson);\n\n          if (candidate.type !== \"message\") continue;\n\n          decryptedMsg = candidate;\n          senderUUID = uuid;\n          break;\n        } catch {\n          // This peer's key did not decrypt the envelope.\n        }\n      }\n\n      if (!decryptedMsg) return;\n\n      if (localStorage.getItem(\"hash\") !== decryptedMsg.hash) {\n        console.warn(\n          `Client: ${senderUUID} had wrong hash: ${decryptedMsg.hash}`,\n        );\n      }\n\n      if (decryptedMsg.to?.includes(myUUID)) {\n        const dataListObj = JSON.parse(decryptedMsg.dataList);\n        const encryptedForMe = dataListObj[myUUID];\n\n        if (encryptedForMe) {\n          const plaintext = await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.decryptAES)(encryptedForMe, myUUID);\n\n          document.dispatchEvent(\n            new CustomEvent(\"onMessage\", {\n              detail: { message: plaintext },\n            }),\n          );\n\n          console.info(\"Received:\", plaintext);\n        }\n      }\n    } catch (err) {\n      console.error(\"Error processing message:\", err);\n    }\n  };\n}\n\nasync function sendMessage(message, documentHash, to = clientUUIDs) {\n  if (to.length === 0) {\n    console.warn(\"No recipient UUIDs available to send message.\");\n    return;\n  }\n\n  const plaintext =\n    typeof message === \"string\" ? message : JSON.stringify(message);\n\n  const encryptedEntries = await Promise.all(\n    to.map(async (uuid) => [uuid, await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.encryptAES)(plaintext, uuid)]),\n  );\n\n  const payload = JSON.stringify({\n    type: \"message\",\n    from: myUUID,\n    to,\n    dataList: JSON.stringify(Object.fromEntries(encryptedEntries)),\n    hash: documentHash,\n  });\n\n  // encryptAES returns an object, so serialize it for ntfy.\n  const encryptedEnvelope = await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.encryptAES)(payload, myUUID);\n\n  await fetch(\n    localhost ? `http://localhost:8080/${topic}` : `https://ntfy.sh/${topic}/`,\n    {\n      method: \"POST\",\n      headers: { \"Content-Type\": \"application/json\" },\n      body: JSON.stringify(encryptedEnvelope),\n    },\n  );\n}\n\n\n//# sourceURL=webpack:///./src/websocket.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	let __webpack_exports__ = __webpack_require__("./src/scripts.js");
/******/ 	
/******/ })()
;