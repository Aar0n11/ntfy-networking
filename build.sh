#!/bin/sh
emcc src/wasm.c -o dist/wasm.js -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS=ccall,cwrap -s ENVIRONMENT=web
npm run build-prod
npm run build-dev