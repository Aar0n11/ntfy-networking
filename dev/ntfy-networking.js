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

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   decryptMessage: () => (/* binding */ decryptMessage),\n/* harmony export */   encryptMessage: () => (/* binding */ encryptMessage),\n/* harmony export */   getPublicKeyJWK: () => (/* binding */ getPublicKeyJWK),\n/* harmony export */   initKeys: () => (/* binding */ initKeys),\n/* harmony export */   setPeerPublicKey: () => (/* binding */ setPeerPublicKey)\n/* harmony export */ });\nlet ownKeyPair = null;\nlet peerPublicKey = null;\n\nasync function initKeys() {\n  ownKeyPair = await crypto.subtle.generateKey(\n    {\n      name: 'RSA-OAEP',\n      modulusLength: 2048,\n      publicExponent: new Uint8Array([1, 0, 1]),\n      hash: 'SHA-256'\n    },\n    true,\n    ['encrypt', 'decrypt']\n  );\n  return ownKeyPair;\n}\n\nasync function getPublicKeyJWK() {\n  if (!ownKeyPair) await initKeys();\n  return crypto.subtle.exportKey('jwk', ownKeyPair.publicKey);\n}\n\nasync function setPeerPublicKey(jwk) {\n  peerPublicKey = await crypto.subtle.importKey(\n    'jwk', jwk,\n    { name: 'RSA-OAEP', hash: 'SHA-256' },\n    false,\n    ['encrypt']\n  );\n}\n\nasync function encryptMessage(plaintext) {\n  if (!peerPublicKey) throw new Error('Peer public key not set');\n  const encoded = new TextEncoder().encode(plaintext);\n  const ciphertext = await crypto.subtle.encrypt(\n    { name: 'RSA-OAEP' },\n    peerPublicKey,\n    encoded\n  );\n  return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));\n}\n\nasync function decryptMessage(b64) {\n  if (!ownKeyPair) await initKeys();\n  const binary = atob(b64);\n  const ciphertext = new Uint8Array(binary.length);\n  for (let i = 0; i < binary.length; i++) ciphertext[i] = binary.charCodeAt(i);\n  const plaintext = await crypto.subtle.decrypt(\n    { name: 'RSA-OAEP' },\n    ownKeyPair.privateKey,\n    ciphertext\n  );\n  return new TextDecoder().decode(plaintext);\n}\n\n//# sourceURL=webpack:///./src/crypt.js?\n}");

/***/ },

/***/ "./src/scripts.js"
/*!************************!*\
  !*** ./src/scripts.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _websocket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./websocket.js */ \"./src/websocket.js\");\n\n\nconst sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));\n\n(0,_websocket_js__WEBPACK_IMPORTED_MODULE_0__.initWebsocket)();\n\nasync function waitForHandshake () {\n    while (_websocket_js__WEBPACK_IMPORTED_MODULE_0__.status !== \"recieved handshake\") {\n        await sleep(100);\n    }\n}\n\nasync function main() {\n    await waitForHandshake();\n\n    const message = document.getElementById(\"input\").value\n    ;(0,_websocket_js__WEBPACK_IMPORTED_MODULE_0__.sendMessage)(message);\n}\n\nwindow.main = main\n\n//# sourceURL=webpack:///./src/scripts.js?\n}");

/***/ },

/***/ "./src/websocket.js"
/*!**************************!*\
  !*** ./src/websocket.js ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   clientId: () => (/* binding */ clientId),\n/* harmony export */   initWebsocket: () => (/* binding */ initWebsocket),\n/* harmony export */   sendMessage: () => (/* binding */ sendMessage),\n/* harmony export */   status: () => (/* binding */ status)\n/* harmony export */ });\n/* harmony import */ var _crypt_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./crypt.js */ \"./src/crypt.js\");\n\n\nlet status = \"uninitialized\";\nconst clientId = crypto.randomUUID();\n\nasync function initWebsocket() {\n  const ws = new WebSocket('wss://ntfy.sh/U2Nob29sb2d6/ws');\n\n  ws.onopen = async () => {\n    await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.initKeys)();\n    const myPubKey = await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.getPublicKeyJWK)();\n\n    await fetch(\"https://ntfy.sh/U2Nob29sb2d6\", {\n      method: 'POST',\n      headers: { 'Content-Type': 'text/plain' },\n      body: JSON.stringify({ type: 'handshake', from: clientId, publicKey: myPubKey })\n    });\n    status = \"pending handshake\";\n  };\n\n  ws.onmessage = async (event) => {\n    const envelope = JSON.parse(event.data);\n    const msg = envelope.message !== undefined ? JSON.parse(envelope.message) : envelope;\n\n    if (msg.from === clientId) return;\n\n    if (msg.type === 'handshake') {\n      await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.setPeerPublicKey)(msg.publicKey);\n      status = \"recieved handshake\";\n    }\n\n    if (msg.type === 'message') {\n      const plaintext = await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.decryptMessage)(msg.data);\n      console.log('Received:', plaintext);\n    }\n  };\n}\n\nasync function sendMessage(message) {\n  const data = await (0,_crypt_js__WEBPACK_IMPORTED_MODULE_0__.encryptMessage)(message);\n  await fetch(\"https://ntfy.sh/U2Nob29sb2d6\", {\n    method: 'POST',\n    headers: { 'Content-Type': 'text/plain' },\n    body: JSON.stringify({ type: 'message', from: clientId, data })\n  });\n}\n\n//# sourceURL=webpack:///./src/websocket.js?\n}");

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