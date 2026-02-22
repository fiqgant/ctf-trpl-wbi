import {
  consumeRateLimit,
  deriveFlag,
  getClientIdentifier,
  hmacSha256Hex,
  hexToBytes,
  rateLimitHeaders,
  xorWithRepeatingKey,
  bytesToHex,
  type WorkerEnv
} from '../../../../shared/src/index.js';

const encoder = new TextEncoder();

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
}

async function levelKey(salt: string): Promise<Uint8Array> {
  const hex = await hmacSha256Hex(salt, 'L05:stream-key');
  return hexToBytes(hex.slice(0, 32));
}

async function encryptWithLevelKey(plainText: string, salt: string): Promise<string> {
  const key = await levelKey(salt);
  const plain = encoder.encode(plainText);
  const cipher = xorWithRepeatingKey(plain, key);
  return bytesToHex(cipher);
}

export async function handleLevel05(
  request: Request,
  env: WorkerEnv,
  _ctx: unknown,
  url: URL
): Promise<Response> {
  const secretPlainText = env.L05_EXPECTED_ANSWER;
  const client = getClientIdentifier(request);
  const rate = consumeRateLimit(`level05:${client}`, 18, 60_000);
  const headers = rateLimitHeaders(rate);

  if (!rate.allowed) {
    return json({ error: 'rate_limited', detail: 'Too many requests for level05' }, 429, headers);
  }

  if (request.method === 'GET' && url.pathname === '/api/level05') {
    const secretCipherHex = await encryptWithLevelKey(secretPlainText, env.CTF_FLAG_SALT);
    return json(
      {
        level: 'L05',
        category: ['Crypto'],
        objective: 'Recover the plaintext used to create secretCipherHex.',
        secretCipherHex,
        oracleEndpoint: '/api/level05/oracle?plain=<text>',
        submitEndpoint: '/api/level05/submit'
      },
      200,
      headers
    );
  }

  if (request.method === 'GET' && url.pathname === '/api/level05/oracle') {
    const plain = url.searchParams.get('plain') ?? '';
    if (!plain) {
      return json({ error: 'missing_plain' }, 400, headers);
    }
    if (plain.length > 64) {
      return json({ error: 'plain_too_long', maxLength: 64 }, 400, headers);
    }

    const cipherHex = await encryptWithLevelKey(plain, env.CTF_FLAG_SALT);
    return json({ plainLength: plain.length, cipherHex }, 200, headers);
  }

  if (request.method === 'POST' && url.pathname === '/api/level05/submit') {
    let secret = '';
    try {
      const body = (await request.json()) as { secret?: string };
      secret = body.secret?.trim() ?? '';
    } catch {
      return json({ error: 'invalid_json' }, 400, headers);
    }

    if (secret !== secretPlainText) {
      return json({ ok: false, message: 'Incorrect plaintext.' }, 403, headers);
    }

    const flag = await deriveFlag('L05', secretPlainText, env.CTF_FLAG_SALT);
    return json({ ok: true, submissionAnswer: secretPlainText, flag }, 200, headers);
  }

  return json({ error: 'not_found' }, 404, headers);
}
