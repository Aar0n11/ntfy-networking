#!/bin/sh
emcc ./src/wasm.c -o ./dist/wasm.js \
  -sEXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -sEXPORTED_FUNCTIONS='["_main", "_calculate_md5", "_testWASM", "_malloc", "_free"]' \
  -sMODULARIZE=1 \
  -sEXPORT_NAME='createMd5Module'

npm run build-prod
npm run build-dev

cp ./src/index.html ./dist/index.html
cp ./src/index.html ./dev/index.html

cp ./dist/wasm.js ./dev/wasm.js
cp ./dist/wasm.wasm ./dev/wasm.wasm

cp ./src/config.json ./dist/config.json
cp ./src/config.json ./dev/config.json

cp ./src/loadWASM.js ./dist/loadWASM.js
cp ./src/loadWASM.js ./dev/loadWASM.js