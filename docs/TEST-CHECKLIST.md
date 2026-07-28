# Testing the site before go-live

**Preview:** https://foresta.rajsuyash.com
Blocked from search engines (`noindex` + `robots.txt`), so it can't compete with the real domain.
Identical files to what's already sitting on `forestaindia.com`'s document root.

---

## Already verified — don't redo these

| Check | Result |
| --- | --- |
| All 15 pages return 200 over HTTPS | ✅ |
| `/no-such-page` → custom 404 | ✅ |
| Images load, optimised to WebP | ✅ |
| No horizontal scroll at 375px | ✅ |
| Mobile menu opens, closes, Escape works | ✅ |
| Form: empty submit shows field errors | ✅ |
| Form: bad email rejected | ✅ |
| Form: honeypot → silent accept, no mail | ✅ |
| Form: sub-3-second submit → silent accept | ✅ |
| `secrets.php` from the web → 403 | ✅ |
| GET on `contact.php` → 405 | ✅ |
| Unique title + meta description per page | ✅ |
| No dead internal links | ✅ |

---

## What YOU should check — content and judgement, not plumbing

I can verify that things work. I can't verify that they're *right for your business*.

### 1. Claims and numbers (highest priority)

Open **/product/** and read every specification. These came from officialforesta.com and will be
quoted back at you in tenders.

- [ ] 700–800 tree equivalence per CTRX
- [ ] 87–89% carbon removal efficiency
- [ ] 14.4 m² footprint → ~24,000 m² forest impact
- [ ] 130–150 trees (Liquid Tree), 2–3 trees (Liquid Tube)
- [ ] Harvest cycle every 2–3 days

On the **homepage**, the announcement image is EnerSynk's own graphic. It claims *"Generates Carbon
Credits — <16 credits per unit annually"* and *"Creates tradable ESG assets"*. Carbon credit claims
are regulated in India under the CCTS. Confirm in writing with EnerSynk before this faces a
government buyer, or ask me to swap the image.

### 2. Positioning

- [ ] **Footer + /about/** — "Authorised Distributor for India" wording acceptable to EnerSynk?
- [ ] **/product/** — the "Why it fits India" box on each system: does it match how you actually sell?
- [ ] **/insights/** — 9 articles on NCAP, CSR §135, BRSR, Smart Cities, industrial clusters. Skim
      at least two fully. They take positions (e.g. "tree planting alone won't work"). Make sure
      you're happy defending them to a municipal client.

### 3. Contact details

Currently in the site:

- Email: niravm@forestaindia.com
- Phone: +91 98202 17090
- Legal entity: PassionFox Technologies Private Limited
- Hours: Mon–Sat, 9:30am – 6:30pm IST

Still missing — the office address block is hidden until you provide it:

- [ ] Registered office address
- [ ] CIN (optional, footer)
- [ ] GSTIN (optional, footer)

All of it lives in `site.config.ts`. Send me the values, or edit that one file.

### 4. Submit a real enquiry

Go to **/contact/** and send one properly.

⚠️ It will currently arrive from Hostinger's mail server, not GoDaddy's, because `smtp_pass` is
still blank. Your own SPF and DMARC (`p=quarantine`) will probably push it to **spam**. Check the
spam folder for `niravm@forestaindia.com`. That's the expected behaviour until the password is set —
it is not a bug in the form.

---

## Test on a phone

Open the preview on an actual handset, not just a resized browser window.

- [ ] Hero text readable, buttons tappable
- [ ] Menu opens and closes
- [ ] Product comparison table scrolls sideways *inside its own box*, page doesn't
- [ ] Form is usable — dropdowns, keyboard doesn't obscure fields

---

## Then go live

1. Client changes the A record → `92.112.189.106` (see `CLIENT-DNS-INSTRUCTIONS.md`)
2. `dig +short forestaindia.com A` shows only that IP
3. hPanel → forestaindia.com → SSL → issue Let's Encrypt
   *(cannot be done earlier — Let's Encrypt validates by resolving the domain to this server)*
4. Site is live. The files are already there.

To push any content change afterwards: `pnpm deploy`.
