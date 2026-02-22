import {
  base64UrlDecode,
  base64UrlEncode,
  consumeRateLimit,
  deriveFlag,
  getClientIdentifier,
  rateLimitHeaders,
  type WorkerEnv
} from '../../../../shared/src/index.js';

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

function issueUnsignedTicket(): string {
  const payload = {
    role: 'student',
    scope: ['profile:read'],
    issuedAt: '2026-02-22T00:00:00Z'
  };
  return base64UrlEncode(JSON.stringify(payload));
}

function decodePayload(ticket: string): { role?: string; scope?: string[] } {
  const decoded = base64UrlDecode(ticket);
  return JSON.parse(decoded) as { role?: string; scope?: string[] };
}

export async function handleLevel04(
  request: Request,
  env: WorkerEnv,
  _ctx: unknown,
  url: URL
): Promise<Response> {
  const client = getClientIdentifier(request);
  const rate = consumeRateLimit(`level04:${client}`, 15, 60_000);
  const headers = rateLimitHeaders(rate);

  if (!rate.allowed) {
    return json({ error: 'rate_limited', detail: 'Too many requests for level04' }, 429, headers);
  }

  if (request.method === 'GET') {
    if (url.pathname.endsWith('/token')) {
      return json({ token: issueUnsignedTicket() }, 200, headers);
    }

    return json(
      {
        level: 'L04',
        category: ['Web Logic', 'Authorization'],
        objective: 'Obtain maintainer scope and submit the token.',
        tokenEndpoint: '/api/level04/token',
        submitEndpoint: '/api/level04/submit'
      },
      200,
      headers
    );
  }

  if (request.method === 'POST' && url.pathname.endsWith('/submit')) {
    let ticket = '';
    try {
      const body = (await request.json()) as { token?: string };
      ticket = body.token ?? '';
    } catch {
      return json({ error: 'invalid_json' }, 400, headers);
    }

    if (!ticket) {
      return json({ error: 'missing_token' }, 400, headers);
    }

    let payload: { role?: string; scope?: string[] };
    try {
      payload = decodePayload(ticket);
    } catch {
      return json({ error: 'invalid_token_format' }, 400, headers);
    }

    const hasFlagScope = payload.scope?.includes('flag:read') ?? false;
    if (payload.role !== 'maintainer' || !hasFlagScope) {
      return json({ ok: false, detail: 'Ticket accepted but lacks maintainer flag scope.' }, 403, headers);
    }

    const proof = env.L04_EXPECTED_ANSWER;
    const flag = await deriveFlag('L04', proof, env.CTF_FLAG_SALT);
    return json({ ok: true, flag }, 200, headers);
  }

  return json({ error: 'method_not_allowed' }, 405, headers);
}
