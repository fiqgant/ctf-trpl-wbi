import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const generators = ['level01', 'level03', 'level06', 'level07', 'level09'];

function run(command: string, args: string[]): void {
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env
  });
}

async function copyDist(level: string): Promise<void> {
  const source = path.join(repoRoot, 'levels', level, 'dist');
  const dest = path.join(repoRoot, 'apps', 'web', 'public', 'downloads', level);

  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
  await cp(source, dest, { recursive: true });
}

async function main(): Promise<void> {
  if (!process.env.CTF_FLAG_SALT) {
    throw new Error('CTF_FLAG_SALT must be set before running build-all');
  }

  for (const level of generators) {
    const generatorPath = path.join('levels', level, 'generator.ts');
    run('npx', ['--yes', 'tsx', generatorPath]);
    await copyDist(level);
  }

  console.log('Offline generators completed and downloads copied to apps/web/public/downloads');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
