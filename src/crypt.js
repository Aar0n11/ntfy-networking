let ownKeyPair = null;
let peerPublicKey = null;

export async function initKeys() {
  ownKeyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
  return ownKeyPair;
}

export async function getPublicKeyJWK() {
  if (!ownKeyPair) await initKeys();
  return crypto.subtle.exportKey('jwk', ownKeyPair.publicKey);
}

export async function setPeerPublicKey(jwk) {
  peerPublicKey = await crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

export async function encryptMessage(plaintext) {
  if (!peerPublicKey) throw new Error('Peer public key not set');
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    peerPublicKey,
    encoded
  );
  return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
}

export async function decryptMessage(b64) {
  if (!ownKeyPair) await initKeys();
  const binary = atob(b64);
  const ciphertext = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) ciphertext[i] = binary.charCodeAt(i);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    ownKeyPair.privateKey,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}