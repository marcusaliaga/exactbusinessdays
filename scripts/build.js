import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

const pages = {
  '/': {
    title: 'Business Days Calculator | Exact Business Days',
    description: 'Count business days, working days, weekdays, public holidays, and deadline dates with clear assumptions.',
    canonical: 'https://exactbusinessdays.com/'
  },
  '/working-days-calculator': {
    title: 'Working Days Calculator | Exact Business Days',
    description: 'Calculate working days between dates, add working days, subtract working days, and exclude weekends or regional public holidays.',
    canonical: 'https://exactbusinessdays.com/working-days-calculator/'
  },
  '/add-business-days': {
    title: 'Add Business Days to a Date | Exact Business Days',
    description: 'Add business days to a start date and find the resulting deadline while excluding weekends and selected public holidays.',
    canonical: 'https://exactbusinessdays.com/add-business-days/'
  },
  '/business-days-between-dates': {
    title: 'Business Days Between Dates | Exact Business Days',
    description: 'Count how many business days fall between two dates, with options for start-date inclusion and public holiday exclusion.',
    canonical: 'https://exactbusinessdays.com/business-days-between-dates/'
  },
  '/canada/business-days': {
    title: 'Canada Business Days Calculator | Exact Business Days',
    description: 'Calculate Canadian business days with province and territory holiday options for 2026 and 2027.',
    canonical: 'https://exactbusinessdays.com/canada/business-days/'
  },
  '/us/business-days': {
    title: 'U.S. Business Days Calculator | Exact Business Days',
    description: 'Calculate U.S. business days with federal holidays and 20 selected state holiday options for 2026 and 2027.',
    canonical: 'https://exactbusinessdays.com/us/business-days/'
  },
  '/us/state-business-days': {
    title: 'U.S. State Business Days Calculator | Exact Business Days',
    description: 'Calculate business days for supported U.S. state holiday calendars, with 2026 and 2027 coverage for federal holidays and 20 selected states.',
    canonical: 'https://exactbusinessdays.com/us/state-business-days/'
  },
  '/business-days-in-2026': {
    title: 'Business Days in 2026 | Exact Business Days',
    description: 'Calculate business days in 2026 by country and region, with weekend and public holiday options for planning deadlines and work schedules.',
    canonical: 'https://exactbusinessdays.com/business-days-in-2026/'
  },
  '/business-days-in-2027': {
    title: 'Business Days in 2027 | Exact Business Days',
    description: 'Calculate business days in 2027 by country and region, including weekends and optional public holidays.',
    canonical: 'https://exactbusinessdays.com/business-days-in-2027/'
  },
  '/holiday-business-days': {
    title: 'Holiday Business Days Calculator | Exact Business Days',
    description: 'Calculate business days with public holidays excluded, compare weekends-only and holiday-adjusted results, and review which holidays were skipped.',
    canonical: 'https://exactbusinessdays.com/holiday-business-days/'
  },
  '/uk/working-days': {
    title: 'UK Working Days Calculator | Exact Business Days',
    description: 'Calculate UK working days with England and Wales, Scotland, and Northern Ireland bank holiday options for 2026 and 2027.',
    canonical: 'https://exactbusinessdays.com/uk/working-days/'
  },
  '/australia/working-days': {
    title: 'Australia Working Days Calculator | Exact Business Days',
    description: 'Calculate Australian working days with state and territory public holiday options for 2026 and 2027.',
    canonical: 'https://exactbusinessdays.com/australia/working-days/'
  },

  '/methodology': {
    title: 'How Exact Business Days Calculates Working Days | Exact Business Days',
    description: 'Learn the calculation method used by Exact Business Days, including weekends, public holidays, regional calendars, date ranges, and important limitations.',
    canonical: 'https://exactbusinessdays.com/methodology/'
  },
  '/holiday-data': {
    title: 'Holiday Data Coverage | Exact Business Days',
    description: 'See which countries, regions, and years are currently supported by the Exact Business Days holiday calendar.',
    canonical: 'https://exactbusinessdays.com/holiday-data/'
  },
  '/about': {
    title: 'About Exact Business Days | Exact Business Days',
    description: 'Learn about Exact Business Days, a free business-day and working-day calculator with clear assumptions.',
    canonical: 'https://exactbusinessdays.com/about/'
  },
  '/privacy': {
    title: 'Privacy Policy | Exact Business Days',
    description: 'Read the privacy policy for Exact Business Days.',
    canonical: 'https://exactbusinessdays.com/privacy/'
  },
  '/terms': {
    title: 'Terms of Use | Exact Business Days',
    description: 'Read the terms of use for Exact Business Days.',
    canonical: 'https://exactbusinessdays.com/terms/'
  },
  '/contact': {
    title: 'Contact | Exact Business Days',
    description: 'Contact Exact Business Days with feedback, corrections, or supported-region suggestions.',
    canonical: 'https://exactbusinessdays.com/contact/'
  }
};

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInitialContent(page) {
  const heading = page.title.replace(/ \| Exact Business Days$/, '');
  return `<main><section class="hero"><p class="eyebrow">Exact Business Days</p><h1>${escapeHtml(heading)}</h1><p class="lead">${escapeHtml(page.description)}</p></section></main>`;
}

function renderHtml(template, page) {
  return template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${escapeHtml(page.canonical)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(page.canonical)}" />`)
    .replace('<div id="app"></div>', `<div id="app">${renderInitialContent(page)}</div>`);
}

copyDir(publicDir, dist);

const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
fs.writeFileSync(path.join(dist, 'index.html'), renderHtml(template, pages['/']));
for (const [route, page] of Object.entries(pages)) {
  if (route === '/') continue;
  const routeDir = path.join(dist, route.replace(/^\//, ''));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), renderHtml(template, page));
}

fs.mkdirSync(path.join(dist, 'src'), { recursive: true });
for (const file of ['main.js', 'styles.css']) {
  fs.copyFileSync(path.join(root, 'src', file), path.join(dist, 'src', file));
}

console.log('Build complete. Output written to dist.');
