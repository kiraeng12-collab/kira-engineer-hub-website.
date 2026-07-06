# Google Search Console Setup

Use this when verifying `kiraengineerhub.com` in Google Search Console.

## Recommended Method

Choose **Domain property** in Google Search Console.

Google will provide a TXT value similar to:

```text
google-site-verification=PASTE_GOOGLE_TOKEN_HERE
```

Add that as a DNS TXT record at your domain provider.

## DNS Record

Type:

```text
TXT
```

Name / Host:

```text
@
```

Value:

```text
google-site-verification=YOUR_REAL_GOOGLE_TOKEN
```

TTL:

```text
Default or 30 minutes
```

## Important

- Do not replace your existing SPF email TXT record.
- Add the Google TXT record as a new record.
- DNS can take minutes or hours to update.
- After verification, submit:

```text
https://www.kiraengineerhub.com/sitemap.xml
```

## Current SEO Files

- `/robots.txt`
- `/sitemap.xml`
- `/site.webmanifest`
- `/.well-known/security.txt`

