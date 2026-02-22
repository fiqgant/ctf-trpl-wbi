import {
  base64UrlDecode,
  base64UrlEncode,
  consumeRateLimit,
  deriveFlag,
  getClientIdentifier,
  rateLimitHeaders,
  rot13,
  type WorkerEnv
} from '../../../../shared/src/index.js';

const xorKey = 0x2b;

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

function bootstrapTicket(): string {
  const payload = {
    role: 'student',
    scope: ['pieces:read'],
    issuedAt: '2026-02-22T00:00:00Z',
    hint: 'Unsigned training token'
  };

  return base64UrlEncode(JSON.stringify(payload));
}

function parseTicket(ticket: string): { role?: string; scope?: string[] } {
  return JSON.parse(base64UrlDecode(ticket)) as { role?: string; scope?: string[] };
}

export async function handleLevel10(
  request: Request,
  env: WorkerEnv,
  _ctx: unknown,
  url: URL
): Promise<Response> {
  const expectedAnswer = env.L10_EXPECTED_ANSWER.trim().toLowerCase();
  const client = getClientIdentifier(request);
  const rate = consumeRateLimit(`level10:${client}`, 10, 60_000);
  const headers = rateLimitHeaders(rate);

  if (!rate.allowed) {
    return json({ error: 'rate_limited', detail: 'Too many requests for level10' }, 429, headers);
  }

  if (request.method === 'GET' && url.pathname === '/api/level10') {
    return json(
      {
        level: 'L10',
        category: ['Multi-step Chaining', 'Web Logic', 'Crypto', 'Forensics'],
        objective: 'Chain multiple flaws to recover the final phrase.',
        bootstrap: {
          noteBase64: 'VXNlIC9hcGkvbGV2ZWwxMC9waWVjZXMgd2l0aCBhbiBhdWRpdCB0aWNrZXQu',
          ticket: bootstrapTicket()
        },
        submitEndpoint: '/api/level10/submit'
      },
      200,
      headers
    );
  }

  if (request.method === 'GET' && url.pathname === '/api/level10/pieces') {
    const ticket = url.searchParams.get('ticket') ?? '';
    if (!ticket) {
      return json({ error: 'missing_ticket' }, 400, headers);
    }

    let payload: { role?: string; scope?: string[] };
    try {
      payload = parseTicket(ticket);
    } catch {
      return json({ error: 'invalid_ticket' }, 400, headers);
    }

    if (payload.role !== 'audit') {
      return json({ error: 'forbidden', detail: 'Audit role required for raw forensic pieces.' }, 403, headers);
    }

    const body = {
      part1Hex: '636861696e2d6f66',
      part2Rot13: rot13('-custody'),
      part4Base64: 'LWZpcS15ZXMtMTA=',
      note: 'Decode part1 from hex, apply rot13 to part2, use response headers for part3, decode part4 from base64.'
    };

    return json(body, 200, {
      ...headers,
      'x-l10-part3-xor-hex': '065d4e59424d424e4f',
      'x-l10-xor-key-decimal': String(xorKey)
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/level10/submit') {
    let answer = '';
    try {
      const body = (await request.json()) as { answer?: string };
      answer = body.answer?.trim().toLowerCase() ?? '';
    } catch {
      return json({ error: 'invalid_json' }, 400, headers);
    }

    if (answer !== expectedAnswer) {
      return json({ ok: false, message: 'Final chain phrase is incorrect.' }, 403, headers);
    }

    const flag = await deriveFlag('L10', expectedAnswer, env.CTF_FLAG_SALT);
    return json({ ok: true, flag }, 200, headers);
  }

  return json({ error: 'not_found' }, 404, headers);
}
