export async function encryptAES(plaintext, password) {
  // 1. Encode password and generate a key using PBKDF2
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", 
    enc.encode(password), 
    "PBKDF2", 
    false, 
    ["deriveKey"]
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("random-salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Generate a random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 3. Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(plaintext)
  );

  // 4. Return IV and ciphertext (as Base64 for storage/transmission)
  return {
    iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
    data: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
  };
}

export async function decryptAES({ iv, data }, password) {
  const enc = new TextEncoder();

  // 1. Derive the same key (same salt, iterations, hash)
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("random-salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Convert base64 strings back to Uint8Arrays
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const dataBytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));

  // 3. Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    dataBytes
  );

  // 4. Decode to string
  return new TextDecoder().decode(decryptedBuffer);
}

