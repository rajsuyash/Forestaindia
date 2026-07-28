# Going live — what happens, and who does what

**Site:** forestaindia.com
**Domain:** owned by the client, registered at GoDaddy
**Hosting:** your Hostinger Business account
**Client contact:** Nirav — niravm@forestaindia.com

> Before sending Part B, replace `<IP ADDRESS>` with the real IP, and check that
> `rajsuyash@gmail.com` is the address you want Delegate Access sent to.

---

## PART A — Do this yourself first (5 minutes)

You cannot send the client anything useful until you have the IP address.

1. Log in to **hPanel** (hpanel.hostinger.com).
2. **Websites** → **Add Website**.
3. Enter `forestaindia.com`. Choose **Empty website** (do not install WordPress).
4. Hostinger creates the site and shows an **IP address**. **Copy it.**
5. Paste that IP into Part B below, where it says `<IP ADDRESS>`.

Do not use the IP from any of your other domains. Each site gets its own.

Once the client has made his change and the domain resolves:

6. hPanel → **Websites → forestaindia.com → SSL** → issue the free **Let's Encrypt** certificate.
7. Send me the SSH details and I'll deploy the site.

---

## PART B — Send this to the client

*(Copy everything below the line. Replace `<IP ADDRESS>` first.)*

---

Hi Nirav,

The website is built and ready. To make it live, we need one small change in your GoDaddy account —
it takes about two minutes.

**You have two options. Option 1 is easier.**

### Option 1 — Let us do it for you (recommended)

GoDaddy lets you give us permission to manage the domain's settings, without sharing your password
and without giving us access to your emails or billing.

1. Log in to GoDaddy.
2. Go to **Account Settings → Delegate Access**
   (or open: https://account.godaddy.com/access)
3. Click **Invite to Access**.
4. Enter our email: **rajsuyash@gmail.com**
5. Choose the permission level: **Products, Domains & Purchase**
6. Click **Invite**.

We'll receive the invitation, make the change, and confirm when the site is live. Nothing else is
needed from you.

You can remove our access at any time from the same screen.

### Option 2 — Make the change yourself

1. Log in to GoDaddy.
2. Go to **My Products**.
3. Find **forestaindia.com** and click **DNS** (or **Manage DNS**).
4. You'll see a list of records. Find the row where:
   - **Type** is `A`
   - **Name** is `@`
5. Click the pencil / **Edit** icon on that row.
6. Change the **Value** to:

   ```
   <IP ADDRESS>
   ```

7. Set **TTL** to `600 seconds` (or "1 Hour" if 600 isn't offered).
8. Click **Save**.

**If you see a second `A` record with the name `@`** (there is currently one pointing to
`13.248.243.5`), delete it. Two of them will make the website load inconsistently — visitors would
randomly see either the new site or a blank parking page.

**If there is an `A` or `CNAME` record named `www`**, point it to the same IP address, or set it as
a CNAME with the value `forestaindia.com`.

---

### ⚠️ Important — please do not change these

Your email (`@forestaindia.com`) runs on GoDaddy and depends on the records below. If any of them
are edited or deleted, **your email will stop working** and messages sent to you may be lost.

| Type | Name | Leave it as |
| --- | --- | --- |
| MX | `@` | `smtp.secureserver.net` |
| MX | `@` | `mailstore1.secureserver.net` |
| TXT | `@` | `v=spf1 include:spf.em.secureserver.net ?all` |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; ...` |

**Only the `A` record needs to change. Nothing else.**

---

### What happens next

- The change usually takes **10–30 minutes** to take effect, occasionally a few hours.
- During that window the site may appear to load for some people and not others. This is normal and
  resolves on its own.
- Once it's live we'll install the security certificate (the padlock / `https://`) and confirm.
- Your email will keep working throughout — it is not affected by this change.

Let us know once you've done it, or accept the Delegate Access invitation and we'll handle it.

Thanks,
Suyash

---

## PART C — Your checklist after the client acts

```bash
# 1. Confirm the A record now points to Hostinger (and only Hostinger)
dig +short forestaindia.com A

# 2. Confirm email records are untouched — this MUST still show secureserver.net
dig +short forestaindia.com MX

# 3. Once DNS resolves, issue SSL in hPanel, then deploy
pnpm deploy
```

If step 2 ever comes back empty or different, stop and restore the MX records immediately — that
means the client's email is down.
