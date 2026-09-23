# TRUEPAIR Matrimonial Platform

Private matrimonial and matchmaking platform built with Next.js and InsForge.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and supply project-specific secrets.
3. Link the InsForge project, then apply pending migrations.
4. Run `npm run dev` and open `http://localhost:3000`.

## Required checks

- `npm run lint` checks code quality.
- `npm run typecheck` checks TypeScript.
- `npm test` runs the automated security checks.
- `npm run build` creates the production build.

## Security model

- The browser never receives the InsForge admin key.
- Database tables are not directly accessible to anonymous/authenticated InsForge roles.
- Sensitive routes require a signed HTTP-only session and enforce ownership or administrator access.
- Profile photos, payment evidence, and identity documents use private storage; permitted photo viewers receive expiring links.
- Passwords are bcrypt hashes; the application has no shared or fallback passwords.
- Signed-in members can change their password; this invalidates other sessions.
- Membership changes and invoices are created only after server-side payment verification.

Do not place account credentials, live keys, or customer data in this repository. Email and WhatsApp delivery require separate provider configuration and intentionally remain disabled until those integrations are added. Card payments, coupons, top-up packs, family delegation, consultant management, and CMS publishing are shown as unavailable until their complete server-side workflows exist.
