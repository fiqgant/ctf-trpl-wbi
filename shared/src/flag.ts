import { hmacSha256Hex } from './crypto.js';

function normalizeProof(proof: string): string {
  return proof.trim().toLowerCase();
}

export function requireFlagSalt(source?: { CTF_FLAG_SALT?: string } | Record<string, string | undefined>): string {
  const salt = source?.CTF_FLAG_SALT ?? source?.['CTF_FLAG_SALT'];
  if (!salt || !salt.trim()) {
    throw new Error('Missing required environment variable: CTF_FLAG_SALT');
  }
  return salt.trim();
}

export async function deriveFlag(levelId: string, proof: string, salt: string): Promise<string> {
  const normalizedLevel = levelId.toUpperCase();
  const normalizedProof = normalizeProof(proof);
  const digest = await hmacSha256Hex(salt, `${normalizedLevel}:${normalizedProof}`);
  return `CTF{${normalizedLevel}_${digest.slice(0, 24)}}`;
}

export async function deriveFlagFromEnv(
  levelId: string,
  proof: string,
  source?: { CTF_FLAG_SALT?: string } | Record<string, string | undefined>
): Promise<string> {
  return deriveFlag(levelId, proof, requireFlagSalt(source));
}

export async function deriveFlagCommitment(levelId: string, proof: string, salt: string): Promise<string> {
  const flag = await deriveFlag(levelId, proof, salt);
  return hmacSha256Hex(salt, `commit:${flag}`);
}
