import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveFlagCommitment, requireFlagSalt } from '../../shared/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function xorHex(plainText: string, keyHex: string): string {
  const plain = Buffer.from(plainText, 'utf8');
  const key = Buffer.from(keyHex, 'hex');
  const out = Buffer.alloc(plain.length);

  for (let i = 0; i < plain.length; i += 1) {
    out[i] = plain[i] ^ key[i % key.length]!;
  }

  return out.toString('hex');
}

async function main(): Promise<void> {
  const distDir = path.join(__dirname, 'dist');
  await mkdir(distDir, { recursive: true });

  const knownPlain = 'attendance=present;room=E2;';
  const targetPlain = 'final_key=starlight-lab-42-wbi';
  const keyHex = '1a2b3c4d5e6f77889900aabbccddeeff1021324354657687';

  const knownCipherHex = xorHex(knownPlain, keyHex);
  const targetCipherHex = xorHex(targetPlain, keyHex);

  const salt = requireFlagSalt(process.env);
  const flagCommitment = await deriveFlagCommitment('L07', 'starlight-lab-42-wbi', salt);

  await writeFile(
    path.join(distDir, 'packets.json'),
    JSON.stringify({ knownPlain, knownCipherHex, targetCipherHex }, null, 2),
    'utf8'
  );

  await writeFile(
    path.join(distDir, 'manifest.json'),
    JSON.stringify({ level: 'L07', method: 'xor-keystream-reuse', flagCommitment }, null, 2),
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
