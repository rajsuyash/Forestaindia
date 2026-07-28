# Foresta India

Marketing and lead-generation site for **Foresta India** — PassionFox Technologies Private Limited,
authorised India distributor for Foresta Living Forest systems (EnerSynk Group).

Live: https://forestaindia.com

## Stack

Astro 7 (static output) · Tailwind 4 · React 19 islands · MDX content collections · self-hosted Inter.

Static because the target host is Hostinger shared hosting, which has no Node runtime. Every route
is a real HTML file, so there is no SPA rewrite and no JS execution required for indexing.

## Commands

```bash
pnpm install
pnpm dev        # local dev at :4321
pnpm build      # → dist/
pnpm preview    # serve the production build
pnpm check      # astro check (TypeScript)
pnpm test       # enquiry validation, incl. TS↔PHP parity
pnpm verify     # check + test + build + post-build link/meta/alt gate
pnpm deploy     # verify, then rsync dist/ to Hostinger
pnpm format     # prettier
```

## Editing content

| What                                               | Where                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Contact details, legal entity, nav, form dropdowns | `site.config.ts`                                                 |
| Product specs and India positioning                | `src/data/systems.ts`                                            |
| Articles                                           | `src/content/insights/*.mdx`                                     |
| Colours, typography, component classes             | `src/styles/global.css`                                          |
| Images                                             | `src/assets/` (optimised at build); `public/` is served verbatim |

`site.config.ts` still contains `TODO` placeholders for the registered office address and optional
CIN/GSTIN. Fill those before launch — the footer and contact page hide the address block until it is
no longer a TODO.

## The contact form

`src/components/ContactForm.tsx` (browser) posts to `public/contact.php` (server).

Validation is written twice — `src/lib/enquiry.ts` for instant feedback, and mirrored inside
`contact.php` as the authority. `pnpm test` asserts the two stay in agreement; change one and that
test fails until you change the other.

Protections: honeypot field, sub-3-second submission rejection, and a per-IP rate limit of 5 per
hour. Both bot traps return success rather than an error, so a bot gets no signal to adapt.

**Credentials never live in this repo.** On the server, copy `secrets.example.php` to `secrets.php`
next to `contact.php` and set the SMTP password there. `.htaccess` denies direct access to it and
`scripts/deploy.sh` excludes it, so redeploying cannot overwrite or expose it.

## Deploying

Fill `.env` (copy from `.env.example`), then `pnpm deploy`.

Pushing to `main` also deploys via `.github/workflows/deploy.yml`, which needs these repo secrets:
`HOSTINGER_SSH_KEY`, `HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_PORT`,
`HOSTINGER_REMOTE_PATH`.

DNS note: the domain is registered at GoDaddy while hosting is Hostinger, so `forestaindia.com` must
have its A record pointed at the Hostinger site IP (or its nameservers moved) before the live smoke
tests will pass.

## Claims

Performance figures (700–800 tree equivalence, 87–89% removal efficiency, 14.4 m² footprint) are the
manufacturer's published specifications, reproduced from officialforesta.com. They live in
`src/data/systems.ts` and in the homepage hero. Do not alter them without written confirmation from
EnerSynk — these are the numbers that attract scrutiny in Indian government tenders.
