# ExactBusinessDays.com

A free business days, working days, public holidays, and deadline calculator.

## Build

```bash
npm run build
```

## Structure

- `index.html` includes SEO metadata, Google Analytics, and schema.
- `public/` includes `robots.txt`, `sitemap.xml`, and Cloudflare Pages `_redirects`.
- `src/main.js` contains the calculator logic and page rendering.
- `src/styles.css` contains the locked desktop/mobile design.
- `scripts/build.js` copies the site into `dist/` for Cloudflare Pages.

## Current locked scope

- Calculator UI and mobile help sheet are preserved.
- Google Analytics Measurement ID: `G-D5L1V0ENRX`
- Sitemap includes homepage, About, Contact, Privacy, and Terms.
