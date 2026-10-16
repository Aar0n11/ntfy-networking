export function wrapWASM() {
  var testWASM = Module.cwrap("testWASM", "number");
  window.testWASM = testWASM;
}
