# Pointing forestaindia.com (GoDaddy) at the Hostinger site

## The situation

| | Where it lives |
| --- | --- |
| Domain registration | GoDaddy |
| DNS (nameservers) | GoDaddy — `ns57.domaincontrol.com`, `ns58.domaincontrol.com` |
| **Email** | **GoDaddy** — MX `smtp.secureserver.net`, `mailstore1.secureserver.net` |
| Website hosting | Hostinger — Business Web Hosting plan |
| Current A record | `76.223.105.230`, `13.248.243.5` (GoDaddy parking) |

The complication is email. `niravm@forestaindia.com` is your lead inbox and it is on GoDaddy, with
SPF and **DMARC set to `p=quarantine`**. Any DNS change that disturbs the mail records will send
enquiries to spam or bounce them outright.

---

## Recommended: Route B — change only the A record

Keep GoDaddy nameservers. Change one record. Email, SPF and DMARC are never touched, so there is no
window in which mail can break.

### Step 1 — Add the domain in Hostinger (do this first)

hPanel → **Websites** → **Add Website** → enter `forestaindia.com`.

Hostinger will create the document root and show you the **IP address to point to**. Copy it.

Do not reuse the IP from `rajsuyash.com` — that domain resolves to Hostinger's CDN edge
(`84.32.84.63`, `2.57.91.163`), which is not necessarily the address assigned to a new site.
Use whatever hPanel displays for `forestaindia.com`.

### Step 2 — Update the A records at GoDaddy

GoDaddy → **My Products** → `forestaindia.com` → **DNS** → **Manage Zones**.

Edit these two, leave everything else alone:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | *(the Hostinger IP from Step 1)* | 600 |
| A or CNAME | `www` | same IP, or CNAME → `forestaindia.com` | 600 |

Delete the second parking A record (`13.248.243.5`) so only the Hostinger IP remains. Two A records
pointing to different servers will load-balance visitors between your site and a parking page.

### Step 3 — Do NOT touch these

These are your email. Leave them exactly as they are:

```
MX    @        0   smtp.secureserver.net
MX    @        10  mailstore1.secureserver.net
TXT   @        "v=spf1 include:spf.em.secureserver.net ?all"
TXT   _dmarc   "v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;"
```

### Step 4 — Wait, then verify

TTL is 600s, so propagation is usually minutes, occasionally up to a few hours.

```bash
dig +short forestaindia.com A          # should show only the Hostinger IP
curl -sI https://forestaindia.com | head -3
dig +short forestaindia.com MX         # must be UNCHANGED — secureserver.net
```

### Step 5 — SSL

In hPanel → Websites → forestaindia.com → **SSL**, issue the free Let's Encrypt certificate once
DNS resolves. The `.htaccess` in this repo already forces HTTPS, so the site will fail to load over
plain HTTP until the certificate exists. Issue it before announcing the site.

---

## Alternative: Route A — move nameservers to Hostinger

Simpler long term (Hostinger manages the A record and CDN for you, and it's how your other domains
are set up), but you **must recreate the mail records** in Hostinger's DNS or email stops.

At GoDaddy, set nameservers to:

```
ns1.dns-parking.com
ns2.dns-parking.com
```

Then in hPanel → Domains → DNS Zone for forestaindia.com, add all four of these **before** the
nameserver change propagates:

```
MX    @        smtp.secureserver.net         priority 0
MX    @        mailstore1.secureserver.net   priority 10
TXT   @        v=spf1 include:spf.em.secureserver.net ?all
TXT   _dmarc   v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
```

Only choose this route if you are comfortable with a brief risk to mail delivery. Route B has no
such risk, which is why it's the recommendation.

---

## The contact form and SPF

Worth understanding, because it is easy to get wrong:

The website runs on Hostinger. The mailbox is on GoDaddy. Your SPF record authorises **only**
GoDaddy's servers to send as `@forestaindia.com`.

So the enquiry form must authenticate **outbound through GoDaddy SMTP**
(`smtpout.secureserver.net:465`), which is how `public/contact.php` is configured. If it instead
used Hostinger's SMTP or bare PHP `mail()` from the Hostinger box, every lead notification would
fail SPF and hit your own DMARC `p=quarantine` policy — landing enquiries in spam.

Set `smtp_pass` in `secrets.php` on the server to the mailbox password for `niravm@forestaindia.com`.

If GoDaddy blocks SMTP relay on your mail plan, the alternative is to add Hostinger to your SPF:

```
v=spf1 include:spf.em.secureserver.net include:_spf.mail.hostinger.com ?all
```

Try GoDaddy SMTP first — it needs no DNS change at all.
