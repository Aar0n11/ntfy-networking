#!/bin/sh
emcc src/wasm.c -o dist/wasm.js -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS=ccall,cwrap -s ENVIRONMENT=web
npm run build-prod
npm run build-dev

cp ./src/index.html ./dist/index.html
cp ./src/index.html ./dev/index.html

cp ./dist/wasm.js ./dev/wasm.js
cp ./dist/wasm.wasm ./dev/wasm.wasm