let testWASM;
createMd5Module().then((Module) => {
  const calculateMd5 = Module.cwrap("calculate_md5", "string", ["string"]);
  testWASM = Module.cwrap("testWASM", "number", []);

  const doc = document.documentElement.innerHTML;
  const hash = calculateMd5(doc);
  localStorage.setItem("hash", hash);
});
