# ISIT Europe — Website

Homepage of the **European network of Institutes for Sustainable IT**.

The network brings together three non-profit organisations working to reduce the environmental and social footprint of digital technology:

- 🇧🇪 [ISIT Belgium](https://isit-be.org)
- 🇫🇷 [INR France](https://institutnr.org)
- 🇨🇭 [ISIT Switzerland](https://isit-ch.org)

## Project structure

```
isit-europe/
├── index.html          # Main page
├── legal-notices.html  # Legal notices & privacy policy
├── robots.txt          # Search engine directives
├── sitemap.xml         # XML sitemap
├── .htaccess           # Apache config (HTTPS redirect, security headers)
├── css/
│   └── stylesheet.css  # Main stylesheet (includes self-hosted font declarations)
├── fonts/              # Self-hosted Open Sans (GDPR compliant, no Google Fonts)
│   ├── open-sans-400-latin.woff2
│   ├── open-sans-400-latin-ext.woff2
│   ├── open-sans-800-latin.woff2
│   └── open-sans-800-latin-ext.woff2
└── medias/             # Organisation logos
    ├── isit-be.png
    ├── inr-fr.png
    └── inr-ch.png
```

## Technical choices

- **Static HTML** — no CMS, no JavaScript, no dependencies
- **Self-hosted fonts** — Open Sans served locally, no requests to Google Fonts (GDPR)
- **Zero cookies** — no analytics, no tracking, no third-party requests
- **Security headers** via `.htaccess`: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **HTTPS enforced** via 301 redirect

## Deployment

This site is a static HTML project. Deploy to any web server or static hosting platform (Apache, Nginx, GitHub Pages, Netlify, etc.).

For Apache: the `.htaccess` file handles HTTPS redirection and security headers (`mod_headers` and `mod_rewrite` required).

## Legal notices

See [legal-notices.html](./legal-notices.html) — fill in the placeholder fields before going live:
- Publisher address and SIRET number
- Publication director name
- Hosting provider details

## Licence

© ISIT Europe — Institut du Numérique Responsable (INR France), ISIT Belgium, ISIT Switzerland.  
All rights reserved unless otherwise stated.
