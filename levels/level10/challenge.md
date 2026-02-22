# Level 10 - Registrar Chain of Custody

- Category: Multi-step chaining, Web logic, Crypto, Forensics
- Difficulty: Very Hard

## What participants receive
- Online endpoints:
  - `GET /api/level10`
  - `GET /api/level10/pieces?ticket=...` or `GET /api/level10?action=pieces&ticket=...`
  - `POST /api/level10/submit` or `POST /api/level10?action=submit`

## Objective
Chain multiple flaws and encoding steps to reconstruct the final phrase and obtain the final flag.

## Test with curl
```bash
curl https://ctf-trpl-wbi.vercel.app/api/level10
curl "https://ctf-trpl-wbi.vercel.app/api/level10?action=pieces&ticket=<edited-ticket>"
curl -X POST "https://ctf-trpl-wbi.vercel.app/api/level10?action=submit" \
  -H "content-type: application/json" \
  -d '{"answer":"<your-answer>"}'
```

## Safety
No external systems are touched. All mechanics are local toy logic flaws and reversible encoding steps.
