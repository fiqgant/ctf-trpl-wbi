# Level 08 - Audit Log Fragments

- Category: Web logic, Forensics
- Difficulty: Hard

## What participants receive
- Online endpoints:
  - `GET /api/level08`
  - `GET /api/level08/logs?page=1..4` or `GET /api/level08?action=logs&page=1..4`
  - `POST /api/level08/submit` or `POST /api/level08?action=submit`

## Objective
Collect hidden log fragments, decode them, and submit the reconstructed phrase.

## Test with curl
```bash
curl https://ctf-trpl-wbi.vercel.app/api/level08
curl "https://ctf-trpl-wbi.vercel.app/api/level08?action=logs&page=1"
curl "https://ctf-trpl-wbi.vercel.app/api/level08?action=logs&page=1" -H "x-audit-mode: enabled"
curl "https://ctf-trpl-wbi.vercel.app/api/level08?action=logs&page=4" -H "x-audit-mode: enabled"
curl -X POST "https://ctf-trpl-wbi.vercel.app/api/level08?action=submit" \
  -H "content-type: application/json" \
  -d '{"answer":"<your-answer>"}'
```

## Safety
Only synthetic log records are served. No real forensic dataset or sensitive system logs.
