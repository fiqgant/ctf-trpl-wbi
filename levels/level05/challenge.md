# Level 05 - Reused Stream Key

- Category: Crypto
- Difficulty: Medium

## What participants receive
- Online endpoints:
  - `GET /api/level05`
  - `GET /api/level05/oracle?plain=...`
  - `POST /api/level05/submit`

## Objective
Recover the plaintext behind `secretCipherHex` and submit it.

## Test with curl
```bash
curl https://ctf-trpl-wbi.vercel.app/api/level05
curl "https://ctf-trpl-wbi.vercel.app/api/level05/oracle?plain=AAAAAAAAAA"
curl -X POST https://ctf-trpl-wbi.vercel.app/api/level05/submit \
  -H "content-type: application/json" \
  -d '{"secret":"<your-answer>"}'
```

## Safety
Toy XOR stream cipher challenge only. No real cryptographic service is attacked.
