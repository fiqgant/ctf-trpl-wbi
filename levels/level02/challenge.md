# Level 02 - Training Admin Panel

- Category: Web logic, Authorization
- Difficulty: Easy

## What participants receive
- Online endpoint: `GET /api/level02`

## Objective
Obtain the admin-only response and recover the level flag.

## Test with curl
```bash
curl https://ctf-trpl-wbi.vercel.app/api/level02
curl -X POST https://ctf-trpl-wbi.vercel.app/api/level02 -H "content-type: application/json" -d '{"campusRole":"student"}'
curl -X POST https://ctf-trpl-wbi.vercel.app/api/level02 -H "x-campus-role: admin"
```

## Safety
No code execution or external network calls; only controlled JSON/header parsing with rate limits.
