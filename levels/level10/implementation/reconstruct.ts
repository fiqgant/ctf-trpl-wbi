import { rot13 } from '../../../shared/src/crypto.js';

export function xorHexWithByte(hex: string, key: number): string {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex input');
  }

  let out = '';
  for (let i = 0; i < hex.length; i += 2) {
    const b = Number.parseInt(hex.slice(i, i + 2), 16);
    out += String.fromCharCode(b ^ key);
  }
  return out;
}

export function reconstructFinalPhrase(): string {
  const part1 = Buffer.from('636861696e2d6f66', 'hex').toString('utf8');
  const part2 = rot13('-phfgbql');
  const part3 = xorHexWithByte('065d4e59424d424e4f', 43);
  const part4 = Buffer.from('LWZpcS15ZXMtMTA=', 'base64').toString('utf8');
  return `${part1}${part2}${part3}${part4}`.toLowerCase();
}
