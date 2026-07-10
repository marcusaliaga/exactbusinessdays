# ExactBusinessDays.com

A free business days, working days, public holidays, and deadline calculator.

## Build

```bash
npm run build
```

Run the complete local quality check with:

```bash
npm run generate:calendar
npm run build
npm run validate
```

## Structure

- `index.html` includes SEO metadata, Google Analytics, and schema.
- `public/` includes `robots.txt`, the 30-URL sitemap, Cloudflare Pages rules, IndexNow verification, and downloadable CSV data.
- `src/main.js` contains the calculator logic and page rendering.
- `src/calendar-data.js` contains the frozen 2026–2027 holiday calendars generated from the pinned data dependency.
- `src/styles.css` contains the locked desktop/mobile design.
- `scripts/build.js` copies the site into `dist/` for Cloudflare Pages.
- `scripts/validate-site.mjs` checks routes, metadata, schema, calendar coverage, source files, and client rendering.

## Current locked scope

- Calculator UI and mobile help sheet are preserved.
- Google Analytics Measurement ID: `G-D5L1V0ENRX`
- Holiday coverage includes 11 countries and 115 calendar selections for 2026 and 2027.
- U.S. coverage includes federal holidays, all 50 states, and Washington, DC.
- Germany includes all 16 federal states.
- The sitemap contains 30 useful, indexable pages; the CSV files are linked from the data hub.
