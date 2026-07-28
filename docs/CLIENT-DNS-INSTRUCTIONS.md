# Going live — forestaindia.com

**Domain:** owned by the client, registered at GoDaddy
**Hosting:** Hostinger Business (site created, PHP 8.3, temp URL `purple-cod-864391.hostingersite.com`)
**Target A record:** `92.112.189.106` ← confirmed from hPanel, verified as a Hostinger LiteSpeed server

---

## What actually needs to change

Only **one** record. Everything else on the domain is already correct or must be left alone.

| Record | Now | Needs to be |
| --- | --- | --- |
| `A` @ | `76.223.105.230` **and** `13.248.243.5` (GoDaddy parking) | `92.112.189.106`, single record |
| `CNAME` www | `forestaindia.com` | ✅ already correct — no change |
| `MX`, `TXT`, `_dmarc` | GoDaddy email records | ⛔ do not touch |

---

## PART A — Send this to the client

*(Copy everything below the line.)*

---

Hi Nirav,

The website is built and ready to go live. It needs one small change in your GoDaddy account —
about two minutes.

**Two options. The first is easier for you.**

### Option 1 — Let us do it (recommended)

GoDaddy can give us permission to manage just the domain settings, without sharing your password
and without any access to your emails or billing.

1. Log in to GoDaddy.
2. Open **Account Settings → Delegate Access** — https://account.godaddy.com/access
3. Click **Invite to Access**
4. Enter: **rajsuyash@gmail.com**
5. Permission level: **Products, Domains & Purchase**
6. Click **Invite**

We'll make the change and confirm when the site is live. You can revoke access anytime from the
same page.

### Option 2 — Do it yourself

1. Log in to GoDaddy → **My Products**
2. Find **forestaindia.com** → click **DNS**
3. You'll see a list of records. Look for rows where **Type** is `A` and **Name** is `@`.
   **There are currently two of them.**
4. **Edit the first one** and set its **Value** to:

   ```
   92.112.189.106
   ```

   Set **TTL** to `600 seconds` (or the shortest option offered).

5. **Delete the second `A` record for `@`** — the one pointing to `13.248.243.5`.

   This step matters. If both remain, visitors get sent randomly to either the new website or a
   blank parking page, and it will look like the site is broken half the time.

6. Save.

That's everything. The `www` record is already set up correctly and needs no change.

---

### ⚠️ Please do not change these — your email depends on them

Your `@forestaindia.com` email runs on GoDaddy through the records below. If any are edited or
deleted, **email will stop arriving** and messages sent to you may be lost permanently.

| Type | Name | Leave exactly as it is |
| --- | --- | --- |
| MX | `@` | `smtp.secureserver.net` |
| MX | `@` | `mailstore1.secureserver.net` |
| TXT | `@` | `v=spf1 include:spf.em.secureserver.net ?all` |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; ...` |

**Only the `A` record for `@` changes. Nothing else.**

If GoDaddy offers to "change your nameservers" or "point the domain to Hostinger automatically" —
please decline. That route replaces all your DNS at once and would take your email down with it.

---

### What to expect

- Takes about **10–30 minutes** to take effect, occasionally a few hours.
- During that window some people may see the new site and others the old page. Normal, and it
  settles by itself.
- We'll then install the security certificate (the padlock / `https://`) and confirm it's live.
- **Your email is unaffected** and keeps working throughout.

Thanks,
Suyash

---

## PART B — Your checklist after the client acts

```bash
# 1. Should show ONLY 92.112.189.106
dig +short forestaindia.com A

# 2. MUST still show secureserver.net — if this is ever empty, the client's email is down
dig +short forestaindia.com MX

# 3. Then issue SSL in hPanel (Websites → forestaindia.com → SSL → Let's Encrypt)
#    The site's .htaccess forces HTTPS, so it won't load until the certificate exists.

# 4. Deploy
pnpm deploy
```

### If the client is slow

The site can be deployed and reviewed on the temporary Hostinger URL right now — no DNS needed.
Deploy first, send Nirav the temp link to approve the content, then have him make the A record
change once he's happy. Nothing about the DNS step changes.
