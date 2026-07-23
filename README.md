# ISIT Europe — Website

Homepage of the **European network of Institutes for Sustainable IT**.

The network brings together three non-profit organisations working to reduce the environmental and social footprint of digital technology:

- 🇧🇪 [ISIT Belgium](https://isit-be.org)
- 🇫🇷 [INR France](https://institutnr.org)
- 🇨🇭 [ISIT Switzerland](https://isit-ch.org)

## Languages

Available in five languages — root is English (default for `x-default`):

| Language | URL | `hreflang` |
| --- | --- | --- |
| 🇬🇧 English | <https://isit-europe.org/> | `en` |
| 🇫🇷 Français | <https://isit-europe.org/fr/> | `fr` |
| 🇩🇪 Deutsch | <https://isit-europe.org/de/> | `de` |
| 🇮🇹 Italiano | <https://isit-europe.org/it/> | `it` |
| 🇪🇸 Español | <https://isit-europe.org/es/> | `es` |

Each translation lives in its own subdirectory with full `hreflang` cross-references, localised Open Graph / Twitter Card / JSON-LD metadata, and an in-page language switcher (`.lang-switcher`).

### Automatic language redirect

Requests to `/` are redirected (`302`) to the matching language subdirectory based on the browser `Accept-Language` header — no IP geolocation, no cookies. Search-engine crawlers are excluded from the redirect so every language URL is indexed independently. The `Vary: Accept-Language` response header tells shared caches to vary by language. Users can always override the choice via the switcher.

## Project structure

```
isit-europe/
├── index.html                        # Main page (EN, default)
├── legal-notices.html                # Legal notices & privacy policy (EN)
├── accessibility-declaration.html    # Accessibility statement (EN, WCAG 2.1 AA)
├── fr/                                # French version
│   ├── index.html
│   ├── legal-notices.html
│   └── declaration-accessibilite.html  # RGAA-structured, French legal recourse
├── de/                                # German version
│   ├── index.html
│   ├── legal-notices.html
│   └── barrierefreiheitserklaerung.html
├── it/                                # Italian version
│   ├── index.html
│   ├── legal-notices.html
│   └── dichiarazione-di-accessibilita.html
├── es/                                # Spanish version
│   ├── index.html
│   ├── legal-notices.html
│   └── declaracion-de-accesibilidad.html
├── pages/
│   ├── monitoring.html               # Self-hosted uptime/SEO/eco-design dashboard (noindex, client-side only)
│   └── monitoring.js                 # Dashboard logic (external, CSP script-src 'self')
├── robots.txt                        # Search engine directives
├── sitemap.xml                       # XML sitemap (all 5 languages, reciprocal hreflang alternates)
├── .htaccess                         # Apache: HTTPS, security headers, cache, gzip/brotli, language auto-redirect, CSP
├── css/
│   └── stylesheet.css                # Main stylesheet (includes self-hosted font declarations)
├── js/
│   └── matomo.js                     # Cookieless Matomo analytics loader (external, CSP script-src 'self')
├── fonts/                            # Self-hosted Open Sans (GDPR compliant, no Google Fonts)
│   ├── open-sans-400-latin.woff2
│   ├── open-sans-400-latin-ext.woff2
│   ├── open-sans-800-latin.woff2
│   └── open-sans-800-latin-ext.woff2
├── logos-resized/                    # Aspect-ratio-correct partner logos for the homepage strip (AVIF/WebP/PNG)
│   ├── isit-be.{avif,webp,png}
│   ├── inr-fr.{avif,webp,png}
│   └── isit-ch.{avif,webp,png}
└── medias/                           # Full-size organisation logos and favicon
    ├── isit-be.png
    ├── inr-fr.png
    ├── isit-ch.png
    └── favicon.png
```

## Technical choices

### Architecture
- **Static HTML** — no CMS, no build step, no server-side runtime
- **JavaScript kept minimal and external** — no framework; the only scripts are `js/matomo.js` (analytics loader) and `pages/monitoring.js` (internal dashboard), both same-origin files, never inline (required by the CSP below)
- **Self-hosted fonts** — Open Sans served locally, no request to Google Fonts (GDPR)
- **Zero cookies** — Matomo runs in `disableCookies` mode; no cookie of any kind is set, no third-party tracker beyond the self-hosted Matomo instance
- **Preloaded critical fonts** — `<link rel="preload" as="font" crossorigin>` for LCP

### Security headers (`.htaccess`)
- `Strict-Transport-Security` (HSTS, 2 years, includeSubDomains, preload)
- `Content-Security-Policy` — `default-src 'self'`, `script-src 'self' https://analytic.institutnr.org:8443`, `connect-src 'self' https://analytic.institutnr.org:8443`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`. All scripts must be external same-origin files (or the explicitly allow-listed Matomo host) — inline `<script>` blocks are blocked and will silently fail; this bit the team once already (Matomo and the monitoring dashboard were dead in production until the policy was relaxed from `script-src 'none'`), watch for it when adding new scripts.
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — geolocation, microphone, camera, payment, usb, interest-cohort all disabled
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Powered-By` and `Server` headers stripped

### Performance
- HTTP/HTTPS redirect (`301`)
- gzip + brotli compression
- 1-year `immutable` cache on PNG, CSS, woff2
- HTML served `no-cache, must-revalidate`
- Images: `width` / `height` attributes (no CLS), `fetchpriority="high"`, `decoding="async"`
- PNG logos quantised to 128 colours, ~7-25 KB each

### Mobile
- `viewport` with `width=device-width, initial-scale=1.0`
- `font-size: 16px` to suppress iOS form zoom
- `-webkit-text-size-adjust: 100%`
- `touch-action: manipulation` (no 300 ms tap delay)
- Touch targets ≥ 44 px on every interactive element (logos, language switcher)
- Responsive flex layout, breakpoint at 782 px

### SEO
- Canonical URL on every page
- `hreflang` alternates (`en`, `fr`, `de`, `it`, `es`, `x-default`) on every page **and** in `sitemap.xml`
- Open Graph + Twitter Card with localised `og:locale`
- Schema.org JSON-LD (`Organization` for homepages, `WebPage` for legal pages)
- One `<h1>` per page, meta description 120–160 chars, title ≤ 70 chars

### GDPR
- No personal data collected, no form, no cookie, no third-party request
- Privacy policy translated into five languages, with the full GDPR rights enumeration (access, rectification, erasure, restriction, portability, objection)
- Dedicated DPO contact (`dpo@institutnr.org`)
- CNIL (French data-protection authority) reference

## Deployment

This site is a static HTML project. Deploy to any web server or static hosting platform (Apache, Nginx, GitHub Pages, Netlify, etc.).

For **Apache** (recommended): the `.htaccess` file handles HTTPS redirection, security headers, compression, caching and Accept-Language auto-redirect. Required modules: `mod_rewrite`, `mod_headers`, `mod_expires`, `mod_deflate` (and optionally `mod_brotli`).

For **Nginx / GitHub Pages / Netlify**: port the `.htaccess` directives to the corresponding configuration mechanism (Nginx `server` block, Netlify `_headers` + `_redirects`).

## Legal notices

Each language ships its own legal-notices page:

- [EN](./legal-notices.html) — [FR](./fr/legal-notices.html) — [DE](./de/legal-notices.html) — [IT](./it/legal-notices.html) — [ES](./es/legal-notices.html)

## Accessibility

Target: WCAG 2.1 level AA. Current status is **partial conformance**, based on an internal manual review (semantic structure, colour contrast, keyboard navigation, alt text, focus visibility) — not a formal third-party RGAA audit against the full 106-criteria grid, so no compliance percentage is claimed.

- [EN](./accessibility-declaration.html) — [FR](./fr/declaration-accessibilite.html) *(full RGAA structure incl. Défenseur des droits recourse)* — [DE](./de/barrierefreiheitserklaerung.html) — [IT](./it/dichiarazione-di-accessibilita.html) — [ES](./es/declaracion-de-accesibilidad.html)

## Monitoring

[`pages/monitoring.html`](./pages/monitoring.html) is a self-hosted, client-side dashboard that runs same-origin `fetch()` checks (SEO, eco-design, page/asset availability) directly in the browser — no build, no backend. It is deliberately `noindex, nofollow` and disallowed in `robots.txt`, since it is an operational tool, not public content.

It **must be served over HTTP(S)** (deployed site, or a local static server such as `python3 -m http.server`) — opening the file directly (`file://`) breaks every check, since `fetch()` cannot resolve same-origin relative paths without a real origin.

## Contributing

Contributions are welcome, **via pull request only** — direct pushes to `main` are not accepted. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow: fork, branch, follow the project's code standards, sign your commits (Developer Certificate of Origin), then open a PR.

## Licence

© ISIT Europe — Institut du Numérique Responsable (INR France), ISIT Belgium, ISIT Switzerland.
All rights reserved unless otherwise stated.
