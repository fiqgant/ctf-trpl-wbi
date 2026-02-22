import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { deriveFlagCommitment, requireFlagSalt } from '../../shared/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function compileAssemblyScript(source: string, output: string): void {
  const args = [source, '-O3', '--runtime', 'stub', '--exportRuntime', '-o', output];

  try {
    execFileSync('pnpm', ['exec', 'asc', ...args], { stdio: 'inherit' });
    return;
  } catch {
    execFileSync('npm', ['exec', '--yes', '--package=assemblyscript@0.27.31', '--', 'asc', ...args], {
      stdio: 'inherit'
    });
  }
}

async function sha256File(filePath: string): Promise<string> {
  const data = await readFile(filePath);
  return createHash('sha256').update(data).digest('hex');
}

async function main(): Promise<void> {
  const distDir = path.join(__dirname, 'dist');
  const source = path.join(__dirname, 'implementation', 'reverse.ts');
  const wasmPath = path.join(distDir, 'level06.wasm');

  await mkdir(distDir, { recursive: true });
  compileAssemblyScript(source, wasmPath);

  const salt = requireFlagSalt(process.env);
  const flagCommitment = await deriveFlagCommitment('L06', 'vector-lattice-trpl', salt);
  const sha256 = await sha256File(wasmPath);

  await writeFile(
    path.join(distDir, 'notes.txt'),
    ['Training build target: wasm32', 'Exported function: validate(input: string) -> i32', `sha256=${sha256}`].join('\n'),
    'utf8'
  );

  await writeFile(
    path.join(distDir, 'manifest.json'),
    JSON.stringify({ level: 'L06', sha256, flagCommitment }, null, 2),
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
