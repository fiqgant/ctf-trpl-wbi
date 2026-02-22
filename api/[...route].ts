import type { WorkerEnv } from '../shared/src/types.js';
import { handleLevel02 } from '../apps/worker/src/routes/level02.js';
import { handleLevel04 } from '../apps/worker/src/routes/level04.js';
import { handleLevel05 } from '../apps/worker/src/routes/level05.js';
import { handleLevel08 } from '../apps/worker/src/routes/level08.js';
import { handleLevel10 } from '../apps/worker/src/routes/level10.js';

export const config = {
  runtime: 'edge'
};

const REQUIRED_ENV_KEYS = [
  'CTF_FLAG_SALT',
  'L02_EXPECTED_ANSWER',
  'L04_EXPECTED_ANSWER',
  'L05_EXPECTED_ANSWER',
  'L08_EXPECTED_ANSWER',
  'L10_EXPECTED_ANSWER'
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,x-campus-role,x-audit-mode'
    }
  });
}

function resolveEnv(): { env: WorkerEnv | null; missing: RequiredEnvKey[] } {
  const globalProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const source = globalProcess?.env ?? {};

  const missing: RequiredEnvKey[] = [];
  const values = {} as Record<RequiredEnvKey, string>;

  for (const key of REQUIRED_ENV_KEYS) {
    const value = source[key]?.trim();
    if (!value) {
      missing.push(key);
      continue;
    }
    values[key] = value;
  }

  if (missing.length > 0) {
    return { env: null, missing };
  }

  return { env: values as WorkerEnv, missing: [] };
}

function notFound(): Response {
  return json(
    {
      error: 'Not Found',
      routes: ['/api/health', '/api/level02', '/api/level04', '/api/level05', '/api/level08', '/api/level10']
    },
    404
  );
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return json({ ok: true });
  }

  const resolved = resolveEnv();
  if (!resolved.env) {
    return json(
      {
        error: 'server_not_configured',
        detail: `Missing required environment variables in Vercel project settings: ${resolved.missing.join(', ')}`
      },
      500
    );
  }
  const env = resolved.env;

  const url = new URL(request.url);
  const fakeCtx = null as never;

  if (url.pathname === '/api/health') {
    return json({ ok: true, service: 'ctf-ts-vercel-api', date: '2026-02-22' });
  }

  if (url.pathname.startsWith('/api/level02')) {
    return handleLevel02(request, env, fakeCtx, url);
  }

  if (url.pathname.startsWith('/api/level04')) {
    return handleLevel04(request, env, fakeCtx, url);
  }

  if (url.pathname.startsWith('/api/level05')) {
    return handleLevel05(request, env, fakeCtx, url);
  }

  if (url.pathname.startsWith('/api/level08')) {
    return handleLevel08(request, env, fakeCtx, url);
  }

  if (url.pathname.startsWith('/api/level10')) {
    return handleLevel10(request, env, fakeCtx, url);
  }

  return notFound();
}
