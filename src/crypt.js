// Helper for safe Uint8Array <-> Base64 conversion
function uint8ToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptAES(plaintext, password) {
  const enc = new TextEncoder();
  
  // 1. Generate dynamic salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 2. Derive key using key derivation
  const keyMaterial = await crypto.subtle.importKey(
    "raw", 
    enc.encode(password), 
    "PBKDF2", 
    false, 
    ["deriveKey"]
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // 3. Encrypt data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(plaintext)
  );

  // 4. Return salt, IV, and data
  return {
    salt: uint8ToBase64(salt),
    iv: uint8ToBase64(iv),
    data: uint8ToBase64(new Uint8Array(encryptedBuffer))
  };
}

export async function decryptAES({ salt, iv, data }, password) {
  const enc = new TextEncoder();

  const saltBytes = base64ToUint8(salt);
  const ivBytes = base64ToUint8(iv);
  const dataBytes = base64ToUint8(data);

  // 1. Derive key using transmitted salt
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // 2. Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    dataBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
}