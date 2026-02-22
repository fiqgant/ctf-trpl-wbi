import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveFlagCommitment, requireFlagSalt, rot13 } from '../../shared/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(): Promise<void> {
  const distDir = path.join(__dirname, 'dist');
  await mkdir(distDir, { recursive: true });

  const answer = 'library-basement-locker-6020';
  const clue = rot13(answer);
  const salt = requireFlagSalt(process.env);
  const flagCommitment = await deriveFlagCommitment('L03', answer, salt);

  const lines = [
    '2026-01-14T22:10:02Z INFO door=LIB-SOUTH actor=night_guard result=ok',
    '2026-01-14T22:13:47Z WARN camera=LIB-B1 stream=stutter trace=33f9a4',
    `2026-01-14T22:15:11Z INFO investigator=oncall note="ROT13: ${clue}"`,
    '2026-01-14T22:16:53Z INFO archive=sealed incident=LIB-774'
  ].join('\n');

  await writeFile(path.join(distDir, 'incident.log'), `${lines}\n`, 'utf8');
  await writeFile(
    path.join(distDir, 'manifest.json'),
    JSON.stringify({ level: 'L03', clueTransform: 'rot13', flagCommitment }, null, 2),
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
