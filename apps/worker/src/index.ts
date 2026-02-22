import type { WorkerEnv } from '../../../shared/src/types.js';
import { handleLevel02 } from './routes/level02.js';
import { handleLevel04 } from './routes/level04.js';
import { handleLevel05 } from './routes/level05.js';
import { handleLevel08 } from './routes/level08.js';
import { handleLevel10 } from './routes/level10.js';

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,x-campus-role,x-audit-mode',
      ...extraHeaders
    }
  });
}

function notFound(): Response {
  return json(
    {
      error: 'Not Found',
      routes: [
        '/api/health',
        '/api/level02',
        '/api/level04',
        '/api/level05',
        '/api/level08',
        '/api/level10'
      ]
    },
    404
  );
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: unknown): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return json({ ok: true });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'ctf-ts-worker', date: '2026-02-22' });
    }

    if (url.pathname.startsWith('/api/level02')) {
      return handleLevel02(request, env, ctx, url);
    }

    if (url.pathname.startsWith('/api/level04')) {
      return handleLevel04(request, env, ctx, url);
    }

    if (url.pathname.startsWith('/api/level05')) {
      return handleLevel05(request, env, ctx, url);
    }

    if (url.pathname.startsWith('/api/level08')) {
      return handleLevel08(request, env, ctx, url);
    }

    if (url.pathname.startsWith('/api/level10')) {
      return handleLevel10(request, env, ctx, url);
    }

    return notFound();
  }
};
