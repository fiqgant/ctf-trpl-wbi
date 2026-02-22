import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveFlagCommitment, requireFlagSalt, rot13, utf8ToBase64 } from '../../shared/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(): Promise<void> {
  const distDir = path.join(__dirname, 'dist');
  await mkdir(distDir, { recursive: true });

  const answer = 'trpl-wbi-fiq-08';
  const encoded = utf8ToBase64(rot13(answer).split('').reverse().join(''));

  const salt = requireFlagSalt(process.env);
  const flagCommitment = await deriveFlagCommitment('L01', answer, salt);

  const brief = [
    'Robotics Attic Recovery',
    '-----------------------',
    'The phrase was layered three times.',
    `payload=${encoded}`,
    'Decode in the correct order.'
  ].join('\n');

  await writeFile(path.join(distDir, 'brief.txt'), brief, 'utf8');
  await writeFile(
    path.join(distDir, 'manifest.json'),
    JSON.stringify(
      {
        level: 'L01',
        answerEncoding: 'base64(reverse(rot13(text)))',
        flagCommitment
      },
      null,
      2
    ),
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
