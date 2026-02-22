const encoder = new TextEncoder();
const decoder = new TextDecoder();

let cachedCrypto: Crypto | null = null;

function getWebCrypto(): Crypto {
  if (cachedCrypto) {
    return cachedCrypto;
  }

  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    cachedCrypto = globalThis.crypto;
    return cachedCrypto;
  }

  throw new Error('Web Crypto API is not available in this runtime');
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }

  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return out;
}

export async function sha256Hex(message: string): Promise<string> {
  const webCrypto = getWebCrypto();
  const digest = await webCrypto.subtle.digest('SHA-256', encoder.encode(message));
  return bytesToHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const webCrypto = getWebCrypto();
  const key = await webCrypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await webCrypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bytesToHex(new Uint8Array(signature));
}

export function xorWithRepeatingKey(input: Uint8Array, key: Uint8Array): Uint8Array {
  const out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    out[i] = input[i] ^ key[i % key.length];
  }
  return out;
}

export function xorUtf8ToHex(plainText: string, keyText: string): string {
  const input = encoder.encode(plainText);
  const key = encoder.encode(keyText);
  return bytesToHex(xorWithRepeatingKey(input, key));
}

export function xorHexToUtf8(hexCipher: string, keyText: string): string {
  const cipher = hexToBytes(hexCipher);
  const key = encoder.encode(keyText);
  return decoder.decode(xorWithRepeatingKey(cipher, key));
}

export function rot13(input: string): string {
  return input.replace(/[a-zA-Z]/g, (ch) => {
    const code = ch.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64Lookup: Record<string, number> = Object.fromEntries(
  Array.from(base64Alphabet).map((ch, i) => [ch, i])
) as Record<string, number>;

function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (b0 << 16) | (b1 << 8) | b2;

    out += base64Alphabet[(n >> 18) & 63];
    out += base64Alphabet[(n >> 12) & 63];
    out += i + 1 < bytes.length ? base64Alphabet[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? base64Alphabet[n & 63] : '=';
  }
  return out;
}

function base64ToBytes(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, '');
  if (clean.length % 4 !== 0) {
    throw new Error('Invalid base64 input length');
  }

  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = clean[i];
    const c1 = clean[i + 1];
    const c2 = clean[i + 2];
    const c3 = clean[i + 3];

    const v0 = base64Lookup[c0];
    const v1 = base64Lookup[c1];
    const v2 = c2 === '=' ? 0 : base64Lookup[c2];
    const v3 = c3 === '=' ? 0 : base64Lookup[c3];

    if (v0 === undefined || v1 === undefined || (c2 !== '=' && v2 === undefined) || (c3 !== '=' && v3 === undefined)) {
      throw new Error('Invalid base64 input characters');
    }

    const n = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    out.push((n >> 16) & 0xff);
    if (c2 !== '=') {
      out.push((n >> 8) & 0xff);
    }
    if (c3 !== '=') {
      out.push(n & 0xff);
    }
  }

  return Uint8Array.from(out);
}

export function utf8ToBase64(input: string): string {
  const bytes = encoder.encode(input);
  if (typeof btoa === 'function') {
    let binary = '';
    for (const b of bytes) {
      binary += String.fromCharCode(b);
    }
    return btoa(binary);
  }
  return bytesToBase64(bytes);
}

export function base64ToUtf8(input: string): string {
  if (typeof atob === 'function') {
    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return decoder.decode(bytes);
  }
  return decoder.decode(base64ToBytes(input));
}

export function base64UrlEncode(input: string): string {
  return utf8ToBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return base64ToUtf8(padded);
}
