import {
  consumeRateLimit,
  deriveFlag,
  getClientIdentifier,
  rateLimitHeaders,
  type WorkerEnv
} from '../../../../shared/src/index.js';

const rawPages: Record<string, { kind: 'hex' | 'base64'; value: string; note: string }> = {
  '1': { kind: 'hex', value: '4e4542554c41', note: 'fragment A' },
  '2': { kind: 'base64', value: 'LXRyYWNlLQ==', note: 'fragment B' },
  '3': { kind: 'hex', value: '3734', note: 'fragment C' },
  '4': { kind: 'base64', value: 'LWwwMS1sMTA=', note: 'fragment D' }
};

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

export async function handleLevel08(
  request: Request,
  env: WorkerEnv,
  _ctx: unknown,
  url: URL
): Promise<Response> {
  const action = (url.searchParams.get('action') ?? '').toLowerCase();
  const expectedAnswer = env.L08_EXPECTED_ANSWER.trim().toLowerCase();
  const client = getClientIdentifier(request);
  const rate = consumeRateLimit(`level08:${client}`, 12, 60_000);
  const headers = rateLimitHeaders(rate);

  if (!rate.allowed) {
    return json({ error: 'rate_limited', detail: 'Too many requests for level08' }, 429, headers);
  }

  if (request.method === 'GET' && url.pathname === '/api/level08' && action !== 'logs') {
    return json(
      {
        level: 'L08',
        category: ['Web Logic', 'Forensics'],
        objective: 'Recover the phrase from segmented logs.',
        hint: 'Read /api/level08/logs?page=1..4. Internal audit mode reveals full values.',
        logsEndpointCompat: '/api/level08?action=logs&page=1',
        submitEndpoint: '/api/level08/submit'
      },
      200,
      headers
    );
  }

  if (request.method === 'GET' && (url.pathname === '/api/level08/logs' || action === 'logs')) {
    const page = url.searchParams.get('page') ?? '1';
    const record = rawPages[page];

    if (!record) {
      return json({ error: 'unknown_page', validPages: ['1', '2', '3', '4'] }, 404, headers);
    }

    const auditMode = (request.headers.get('x-audit-mode') ?? '').toLowerCase() === 'enabled';

    if (!auditMode) {
      return json(
        {
          page,
          log: {
            kind: record.kind,
            value: '***redacted***',
            note: 'set x-audit-mode: enabled for internal audit output'
          }
        },
        200,
        headers
      );
    }

    return json({ page, log: record }, 200, headers);
  }

  if (request.method === 'POST' && (url.pathname === '/api/level08/submit' || action === 'submit')) {
    let answer = '';
    try {
      const body = (await request.json()) as { answer?: string };
      answer = body.answer?.trim().toLowerCase() ?? '';
    } catch {
      return json({ error: 'invalid_json' }, 400, headers);
    }

    if (answer !== expectedAnswer) {
      return json({ ok: false, message: 'Incorrect phrase.' }, 403, headers);
    }

    const flag = await deriveFlag('L08', expectedAnswer, env.CTF_FLAG_SALT);
    return json({ ok: true, submissionAnswer: expectedAnswer, flag }, 200, headers);
  }

  return json({ error: 'not_found' }, 404, headers);
}
