# Vercel Deployment Guide

This project is deployed on Vercel only:
- Static challenge site from `apps/web/public`
- API endpoints from `api/[...route].ts`

## 1) Prerequisites
- Vercel account
- `pnpm` installed locally
- `CTF_FLAG_SALT` chosen for the event

## 2) Build offline artifacts
```bash
export CTF_FLAG_SALT="<strong-random-secret>"
export L02_EXPECTED_ANSWER="<private-answer-l02>"
export L04_EXPECTED_ANSWER="<private-answer-l04>"
export L05_EXPECTED_ANSWER="<private-answer-l05>"
export L08_EXPECTED_ANSWER="<private-answer-l08>"
export L10_EXPECTED_ANSWER="<private-answer-l10>"
pnpm install
pnpm run build:all
```
This generates/copies offline files into `apps/web/public/downloads`.

## 3) Local verification
```bash
export CTF_FLAG_SALT="<strong-random-secret>"
export L02_EXPECTED_ANSWER="<private-answer-l02>"
export L04_EXPECTED_ANSWER="<private-answer-l04>"
export L05_EXPECTED_ANSWER="<private-answer-l05>"
export L08_EXPECTED_ANSWER="<private-answer-l08>"
export L10_EXPECTED_ANSWER="<private-answer-l10>"
pnpm run dev
```
Open:
- `http://localhost:3000`

API checks:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/level02
curl "http://localhost:3000/api/level04?action=token"
curl "http://localhost:3000/api/level05?action=oracle&plain=AAAA"
curl "http://localhost:3000/api/level08?action=logs&page=1" -H "x-audit-mode: enabled"
curl http://localhost:3000/api/level10
```

## 4) Deploy to Vercel
From repo root:
```bash
pnpm exec vercel
```

Set environment variable in Vercel project settings:
- `CTF_FLAG_SALT`
- `L02_EXPECTED_ANSWER`
- `L04_EXPECTED_ANSWER`
- `L05_EXPECTED_ANSWER`
- `L08_EXPECTED_ANSWER`
- `L10_EXPECTED_ANSWER`

For production deployment:
```bash
pnpm exec vercel --prod
```

## 5) Routing model
- `/` -> `apps/web/public/index.html` (via `vercel.json`)
- `/challenges/*` -> `apps/web/public/challenges/*`
- `/downloads/*` -> `apps/web/public/downloads/*`
- `/api/*` -> `api/[...route].ts`

## 6) Operational notes
- Changing `CTF_FLAG_SALT` rotates all flags deterministically.
- Keep one stable salt for one event run.
- Never commit real answer env values to git.
- Rate limits are in-memory and sufficient for educational challenge traffic.
