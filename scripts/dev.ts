import { spawn } from 'node:child_process';

function run(command: string, args: string[]): ReturnType<typeof spawn> {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[dev] exited with code ${code}`);
    }
  });

  return child;
}

const requiredEnv = [
  'CTF_FLAG_SALT',
  'L02_EXPECTED_ANSWER',
  'L04_EXPECTED_ANSWER',
  'L05_EXPECTED_ANSWER',
  'L08_EXPECTED_ANSWER',
  'L10_EXPECTED_ANSWER'
] as const;

const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());

if (missingEnv.length > 0) {
  console.error(`Missing required env vars: ${missingEnv.join(', ')}`);
  console.error('Example: copy .env.example to .env.local and export them before running dev.');
  process.exit(1);
}

const dev = run('npx', ['--yes', 'vercel', 'dev', '--listen', '3000']);

function shutdown(): void {
  dev.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
