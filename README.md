# IndieCredit

Effortless records for indie game studios and freelancers in Nova Scotia.

Every step of a freelance job (agreement → delivery → invoice) becomes a record, so at tax time
(for example Nova Scotia's Digital Media Tax Credit) the records are ready for an accountant.
AI does the organizing; human reviewers check records before anything is filed.

**IndieCredit does not file taxes or give tax advice.** All demo data is fictional.

> Built in a few hours for the Tribe hackathon. It is a demo, not a finished product: see
> [What's real vs. simulated](#whats-real-vs-simulated).

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add your key
npm run dev                  # http://localhost:3000
```

Requires Node 20+.

## Environment variable

| Name | Required | What it does |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No | Enables live AI (`claude-haiku-5-5` via the Anthropic Messages API) in `/api/ai`. |
| `GEMINI_API_KEY` | No | Alternative: live AI via Google Gemini (`gemini-flash-latest`, with two fallback models if it is overloaded). Used when no Anthropic key is set. |

Without a key, or if a call fails or times out, the app falls back to realistic canned responses
and shows a **Simulated AI** badge. With a working key the badge reads **Live AI**.

## Demo flow (about 3 minutes)

1. **New Job**: click *Create agreement*, tick the residency box, then *Studio approves* and *Freelancer approves*.
2. **Project**: *Mark delivered*, *Check against agreement* → *Approve change order*, then *Generate invoice*.
3. **Inbox**: *Extract record* from Leo's forwarded invoice email.
4. **Records**: see everything in one table; filter by engagement.
5. **Claim Readiness**: Maya's engagement is fully green; Leo's shows 2 gaps. *Ask freelancer* drafts a request,
   *Send to human review* moves to Reviewed, *Export accountant package* downloads the CSV.

Use **Reset demo** (top right) to return to the starting data. State lives in React + `localStorage`; there is no database.

## What's real vs. simulated

**Real (when `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` is set)**

- AI agreement drafting from a messy request (New Job)
- AI scope check and change-order draft against the approved agreement (Project)
- AI extraction of date, amount, payer, payee and deliverable from a pasted email (Inbox)
- Records timeline, claim-readiness checklist logic and the CSV accountant export (these run locally, no AI)

**Simulated**

- Human review (status flips from *Pending review* to *Reviewed* after a few seconds)
- Integrations: email forwarding, Discord, and sending the "Ask freelancer" message (it is a template draft you copy)
- "Mark as received" on a freelancer request
- Auth and accounts: both approval buttons are clicked by the presenter
- Payments: invoices are records only; no money moves
- The studio, freelancers and all amounts

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. At <https://vercel.com/new>, import the repo. Framework preset: **Next.js** (auto-detected); leave build settings at their defaults.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` (optional).
4. Click **Deploy**.

Or from the terminal: `npx vercel --prod`, then `npx vercel env add GEMINI_API_KEY production` (or `ANTHROPIC_API_KEY`) and redeploy.

## Structure

```
app/api/ai/route.ts   AI route with canned fallback
app/*/page.tsx        the five screens
lib/seed.ts           fictional demo data
lib/canned.ts         simulated AI responses
lib/store.tsx         React context + localStorage state
lib/readiness.ts      claim-readiness checklist rules
```
