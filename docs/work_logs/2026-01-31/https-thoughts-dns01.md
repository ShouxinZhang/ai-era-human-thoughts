# HTTPS for thoughts.wudizhe.com (DNS-01)

## Business outcome
Enable stable HTTPS access for `thoughts.wudizhe.com` without relying on external HTTP reachability, so users can trust the site and browsers stop warning about insecure access.

## Timeline (UTC+8, CST)
- 2026-01-31 08:57:28 CST: Installed `acme.sh` on server.
- 2026-01-31 08:57:49 CST: Generated DNS-01 TXT challenge.
- 2026-01-31 09:00:45 CST: Started validation and certificate issuance.
- 2026-01-31 09:00:56 CST: Let’s Encrypt certificate issued successfully (ECC).
- 2026-01-31 09:01:08 CST: Installed cert to Nginx cert directory and reloaded Nginx.

## What changed (server)
- Certificate issued via `acme.sh` manual DNS-01.
- Certificate installed to:
  - `/etc/nginx/ssl/thoughts.wudizhe.com/fullchain.pem`
  - `/etc/nginx/ssl/thoughts.wudizhe.com/privkey.pem`
- Nginx site config created for `thoughts.wudizhe.com`:
  - HTTP (80) redirects to HTTPS (443)
  - HTTPS (443) reverse-proxies to `http://127.0.0.1:3000`

## Validation
- Server-side:
  - `curl -I https://thoughts.wudizhe.com` returns `200`.
  - `curl -I http://thoughts.wudizhe.com` returns `301` to HTTPS.

## Notes / gotchas
- Local developer machine DNS may be overridden by a proxy, causing `thoughts.wudizhe.com` to resolve to `198.18.x.x` and break HTTPS testing locally. Use a clean network or `--resolve` for verification.

## Next renewal
- Manual DNS-01 requires adding a new TXT record on each renewal (typically every ~60 days). Recommend switching to automated DNS-01 (AliDNS API) later to eliminate manual work.
