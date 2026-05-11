# ISIT Europe — Website

Homepage of the **European network of Institutes for Sustainable IT**.

The network brings together three non-profit organisations working to reduce the environmental and social footprint of digital technology:

- 🇧🇪 [ISIT Belgium](https://isit-be.org)
- 🇫🇷 [INR France](https://institutnr.org)
- 🇨🇭 [ISIT Switzerland](https://isit-ch.org)

## Languages

Available in four languages — root is English (default for `x-default`):

| Language | URL | `hreflang` |
| --- | --- | --- |
| 🇬🇧 English | <https://isit-europe.org/> | `en` |
| 🇫🇷 Français | <https://isit-europe.org/fr/> | `fr` |
| 🇩🇪 Deutsch | <https://isit-europe.org/de/> | `de` |
| 🇮🇹 Italiano | <https://isit-europe.org/it/> | `it` |

Each translation lives in its own subdirectory with full `hreflang` cross-references, localised Open Graph / Twitter Card / JSON-LD metadata, and an in-page language switcher (`.lang-switcher`).

### Automatic language redirect

Requests to `/` are redirected (`302`) to the matching language subdirectory based on the browser `Accept-Language` header — no IP geolocation, no cookies. Search-engine crawlers are excluded from the redirect so every language URL is indexed independently. The `Vary: Accept-Language` response header tells shared caches to vary by language. Users can always override the choice via the switcher.

## Project structure

```
isit-europe/
├── index.html               # Main page (EN, default)
├── legal-notices.html       # Legal notices & privacy policy (EN)
├── fr/                      # French version
│   ├── index.html
│   └── legal-notices.html
├── de/                      # German version
│   ├── index.html
│   └── legal-notices.html
├── it/                      # Italian version
│   ├── index.html
│   └── legal-notices.html
├── robots.txt               # Search engine directives
├── sitemap.xml              # XML sitemap (all 4 languages, hreflang alternates)
├── .htaccess                # Apache: HTTPS, security headers, cache, gzip/brotli, language auto-redirect
├── css/
│   └── stylesheet.css       # Main stylesheet (includes self-hosted font declarations)
├── fonts/                   # Self-hosted Open Sans (GDPR compliant, no Google Fonts)
│   ├── open-sans-400-latin.woff2
│   ├── open-sans-400-latin-ext.woff2
│   ├── open-sans-800-latin.woff2
│   └── open-sans-800-latin-ext.woff2
└── medias/                  # Organisation logos (uniform 200 px height, quantised PNG, transparent background)
    ├── isit-be.png
    ├── inr-fr.png
    ├── isit-ch.png
    └── favicon.png
```

## Technical choices

### Architecture
- **Static HTML** — no CMS, no JavaScript, no build step, no runtime dependency
- **Self-hosted fonts** — Open Sans served locally, no request to Google Fonts (GDPR)
- **Zero cookies** — no analytics, no tracking, no third-party request
- **Preloaded critical fonts** — `<link rel="preload" as="font" crossorigin>` for LCP

### Security headers (`.htaccess`)
- `Strict-Transport-Security` (HSTS, 2 years, includeSubDomains, preload)
- `Content-Security-Policy` — `default-src 'self'`, `script-src 'none'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`
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
- `hreflang` alternates (`en`, `fr`, `de`, `it`, `x-default`) on every page **and** in `sitemap.xml`
- Open Graph + Twitter Card with localised `og:locale`
- Schema.org JSON-LD (`Organization` for homepages, `WebPage` for legal pages)
- One `<h1>` per page, meta description 120–160 chars, title ≤ 70 chars

### GDPR
- No personal data collected, no form, no cookie, no third-party request
- Privacy policy translated into the four languages, with the full GDPR rights enumeration (access, rectification, erasure, restriction, portability, objection)
- Dedicated DPO contact (`dpo@institutnr.org`)
- CNIL (French data-protection authority) reference

## Deployment

This site is a static HTML project. Deploy to any web server or static hosting platform (Apache, Nginx, GitHub Pages, Netlify, etc.).

For **Apache** (recommended): the `.htaccess` file handles HTTPS redirection, security headers, compression, caching and Accept-Language auto-redirect. Required modules: `mod_rewrite`, `mod_headers`, `mod_expires`, `mod_deflate` (and optionally `mod_brotli`).

For **Nginx / GitHub Pages / Netlify**: port the `.htaccess` directives to the corresponding configuration mechanism (Nginx `server` block, Netlify `_headers` + `_redirects`).

## Legal notices

Each language ships its own legal-notices page:

- [EN](./legal-notices.html) — [FR](./fr/legal-notices.html) — [DE](./de/legal-notices.html) — [IT](./it/legal-notices.html)

## Licence

© ISIT Europe — Institut du Numérique Responsable (INR France), ISIT Belgium, ISIT Switzerland.
All rights reserved unless otherwise stated.
