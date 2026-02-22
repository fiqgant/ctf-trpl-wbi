# Level 04 - Unsigned Campus Ticket

- Category: Web logic, Authorization
- Difficulty: Medium

## What participants receive
- Online endpoints:
  - `GET /api/level04`
  - `GET /api/level04/token`
  - `POST /api/level04/submit`

## Objective
Escalate a training ticket to maintainer privilege and obtain the flag.

## Test with curl
```bash
curl https://ctf-trpl-wbi.vercel.app/api/level04
curl https://ctf-trpl-wbi.vercel.app/api/level04/token
curl -X POST https://ctf-trpl-wbi.vercel.app/api/level04/submit \
  -H "content-type: application/json" \
  -d '{"token":"<edited_token>"}'
```

## Safety
This is a toy auth validation flaw on local JSON payload only. No real identity provider is involved.
