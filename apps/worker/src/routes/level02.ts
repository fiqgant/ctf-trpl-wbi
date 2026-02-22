import {
  consumeRateLimit,
  deriveFlag,
  getClientIdentifier,
  rateLimitHeaders,
  type WorkerEnv
} from '../../../../shared/src/index.js';

interface SubmitPayload {
  campusRole?: string;
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

export async function handleLevel02(
  request: Request,
  env: WorkerEnv,
  _ctx: unknown,
  _url: URL
): Promise<Response> {
  const client = getClientIdentifier(request);
  const rate = consumeRateLimit(`level02:${client}`, 20, 60_000);
  const headers = rateLimitHeaders(rate);

  if (!rate.allowed) {
    return json({ error: 'rate_limited', detail: 'Too many requests for level02' }, 429, headers);
  }

  if (request.method === 'GET') {
    return json(
      {
        level: 'L02',
        category: ['Web Logic', 'Authorization'],
        objective: 'Access the admin panel by understanding what server data is trusted.',
        endpoint: '/api/level02',
        submit: 'POST JSON {"campusRole":"admin"} or use header x-campus-role: admin'
      },
      200,
      headers
    );
  }

  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, headers);
  }

  let payload: SubmitPayload = {};
  try {
    payload = (await request.json()) as SubmitPayload;
  } catch {
    payload = {};
  }

  const trustedRole = (request.headers.get('x-campus-role') ?? payload.campusRole ?? 'student').toLowerCase();

  if (trustedRole !== 'admin') {
    return json({ ok: false, message: 'Only admin can view this panel.' }, 403, headers);
  }

  const proof = env.L02_EXPECTED_ANSWER;
  const flag = await deriveFlag('L02', proof, env.CTF_FLAG_SALT);
  return json({ ok: true, flag }, 200, headers);
}
