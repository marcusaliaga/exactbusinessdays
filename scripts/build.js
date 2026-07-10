import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const site = 'https://exactbusinessdays.com';
const lastModified = '2026-07-10';

const page = (route, title, description, kind = 'WebPage') => ({
  route,
  title,
  description,
  kind,
  canonical: `${site}${route === '/' ? '/' : `${route}/`}`
});

const pages = [
  page('/', 'Business Days Calculator | Exact Business Days', 'Count business days, working days, weekdays, public holidays, and deadline dates with clear assumptions.', 'WebApplication'),
  page('/working-days-calculator', 'Working Days Calculator | Exact Business Days', 'Calculate working days between dates, add working days, subtract working days, and exclude weekends or regional public holidays.'),
  page('/add-business-days', 'Add Business Days to a Date | Exact Business Days', 'Add business days to a start date and find the resulting deadline while excluding weekends and selected public holidays.'),
  page('/business-days-between-dates', 'Business Days Between Dates | Exact Business Days', 'Count how many business days fall between two dates, with options for start-date inclusion and public holiday exclusion.'),
  page('/business-days-from-today', 'Business Days From Today Calculator | Exact Business Days', 'Find the date 5, 10, 30, 60, or 90 business days from today while skipping weekends and selected public holidays.'),
  page('/business-days-vs-calendar-days', 'Business Days vs. Calendar Days Explained | Exact Business Days', 'Understand the difference between business days and calendar days, with examples and a calculator for exact deadline dates.'),
  page('/business-days-by-month', 'Business Days by Month 2026–2027 | Exact Business Days', 'See business days by month for 2026 and 2027 by country and region, with public holidays and weekdays shown separately.'),
  page('/business-days-in-2026', 'Business Days in 2026 | Exact Business Days', 'Calculate business days in 2026 by country and region, with weekend and public holiday options for planning deadlines and work schedules.'),
  page('/business-days-in-2027', 'Business Days in 2027 | Exact Business Days', 'Calculate business days in 2027 by country and region, including weekends and optional public holidays.'),
  page('/holiday-business-days', 'Holiday Business Days Calculator | Exact Business Days', 'Calculate business days with public holidays excluded, compare weekends-only and holiday-adjusted results, and review which holidays were skipped.'),
  page('/canada/business-days', 'Canada Business Days Calculator | Exact Business Days', 'Calculate Canadian business days with province and territory holiday options for 2026 and 2027.'),
  page('/us/business-days', 'U.S. Business Days Calculator | Exact Business Days', 'Calculate U.S. business days with federal holidays and all 50 state calendars plus Washington, DC for 2026 and 2027.'),
  page('/us/state-business-days', 'U.S. State Business Days Calculator | Exact Business Days', 'Calculate business days for all 50 U.S. state holiday calendars plus Washington, DC, with 2026 and 2027 coverage.'),
  page('/uk/working-days', 'UK Working Days Calculator | Exact Business Days', 'Calculate UK working days with England and Wales, Scotland, and Northern Ireland bank holiday options for 2026 and 2027.'),
  page('/australia/working-days', 'Australia Working Days Calculator | Exact Business Days', 'Calculate Australian working days with state and territory public holiday options for 2026 and 2027.'),
  page('/germany/working-days', 'Germany Working Days Calculator | Exact Business Days', 'Calculate working days in Germany with all 16 federal-state holiday calendars for 2026 and 2027.'),
  page('/japan/business-days', 'Japan Business Days Calculator | Exact Business Days', 'Calculate business days in Japan using national holidays and substitute holidays for 2026 and 2027.'),
  page('/france/working-days', 'France Working Days Calculator | Exact Business Days', 'Calculate working days in France with national and Alsace-Moselle public-holiday options for 2026 and 2027.'),
  page('/ireland/working-days', 'Ireland Working Days Calculator | Exact Business Days', 'Calculate working days in Ireland using statutory public holidays for 2026 and 2027.'),
  page('/new-zealand/working-days', 'New Zealand Working Days Calculator | Exact Business Days', 'Calculate New Zealand working days with national and regional anniversary holidays for 2026 and 2027.'),
  page('/singapore/business-days', 'Singapore Business Days Calculator | Exact Business Days', 'Calculate Singapore business days using gazetted public holidays and substitute days for 2026 and 2027.'),
  page('/netherlands/working-days', 'Netherlands Working Days Calculator | Exact Business Days', 'Calculate working days in the Netherlands using official public holidays for 2026 and 2027.'),
  page('/data/business-days-2026-2027', 'Business Days Dataset 2026–2027 | Exact Business Days', 'Download free CSV data for 2026–2027 public holidays and monthly business-day totals across 11 countries and regional calendars.', 'Dataset'),
  page('/embed', 'Embed a Free Business Days Calculator | Exact Business Days', 'Add the free Exact Business Days calculator to your website with a simple responsive iframe embed.'),
  page('/methodology', 'How Exact Business Days Calculates Working Days | Exact Business Days', 'Learn the calculation method used by Exact Business Days, including weekends, public holidays, regional calendars, date ranges, and important limitations.'),
  page('/holiday-data', 'Holiday Data Coverage | Exact Business Days', 'See which countries, regions, and years are currently supported by the Exact Business Days holiday calendar.'),
  page('/about', 'About Exact Business Days | Exact Business Days', 'Learn about Exact Business Days, a free business-day and working-day calculator with clear assumptions.'),
  page('/privacy', 'Privacy Policy | Exact Business Days', 'Read the privacy policy for Exact Business Days.'),
  page('/terms', 'Terms of Use | Exact Business Days', 'Read the terms of use for Exact Business Days.'),
  page('/contact', 'Contact | Exact Business Days', 'Contact Exact Business Days with feedback, corrections, or supported-region suggestions.')
];

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

function headingFor(pageData) {
  return pageData.title.replace(/ \| Exact Business Days$/, '');
}

function renderInitialContent(pageData) {
  return `<main><section class="hero"><p class="eyebrow">Exact Business Days</p><h1>${escapeHtml(headingFor(pageData))}</h1><p class="lead">${escapeHtml(pageData.description)}</p></section></main>`;
}

function breadcrumbItems(pageData) {
  if (pageData.route === '/') return [];
  return [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
    { '@type': 'ListItem', position: 2, name: headingFor(pageData), item: pageData.canonical }
  ];
}

function structuredData(pageData) {
  const graph = [
    { '@type': 'WebSite', '@id': `${site}/#website`, url: `${site}/`, name: 'Exact Business Days' },
    { '@type': 'WebPage', '@id': `${pageData.canonical}#webpage`, url: pageData.canonical, name: headingFor(pageData), description: pageData.description, isPartOf: { '@id': `${site}/#website` }, dateModified: lastModified }
  ];
  const breadcrumbs = breadcrumbItems(pageData);
  if (breadcrumbs.length) graph.push({ '@type': 'BreadcrumbList', itemListElement: breadcrumbs });
  if (pageData.kind === 'WebApplication') {
    graph.push({ '@type': 'WebApplication', name: 'Exact Business Days', url: `${site}/`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', isAccessibleForFree: true, description: pageData.description });
  }
  if (pageData.kind === 'Dataset') {
    graph.push({
      '@type': 'Dataset',
      name: 'Exact Business Days holiday and business-day data 2026–2027',
      description: pageData.description,
      url: pageData.canonical,
      creator: { '@type': 'Organization', name: 'Exact Business Days', url: `${site}/` },
      temporalCoverage: '2026-01-01/2027-12-31',
      spatialCoverage: 'Canada, United States, United Kingdom, Australia, Germany, Japan, France, Ireland, New Zealand, Singapore, Netherlands',
      dateModified: lastModified,
      license: `${site}/terms/`,
      distribution: [
        ['Holiday dates 2026–2027', '/data/holidays-2026-2027.csv'],
        ['Monthly business days 2026', '/data/business-days-by-month-2026.csv'],
        ['Monthly business days 2027', '/data/business-days-by-month-2027.csv'],
        ['Annual summaries 2026–2027', '/data/business-days-summary-2026-2027.csv']
      ].map(([name, suffix]) => ({ '@type': 'DataDownload', name, encodingFormat: 'text/csv', contentUrl: `${site}${suffix}` }))
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function renderHtml(template, pageData) {
  return template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(pageData.title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(pageData.description)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${escapeHtml(pageData.canonical)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(pageData.title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(pageData.description)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(pageData.canonical)}" />`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${structuredData(pageData)}</script>`)
    .replace('<div id="app"></div>', `<div id="app">${renderInitialContent(pageData)}</div>`);
}

function renderSitemap() {
  const urls = pages.map(pageData => `  <url><loc>${pageData.canonical}</loc><lastmod>${lastModified}</lastmod></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

copyDir(publicDir, dist);

const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const pageData of pages) {
  const destination = pageData.route === '/' ? dist : path.join(dist, pageData.route.replace(/^\//, ''));
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'index.html'), renderHtml(template, pageData));
}

fs.mkdirSync(path.join(dist, 'src'), { recursive: true });
for (const file of ['main.js', 'calendar-data.js', 'styles.css']) {
  fs.copyFileSync(path.join(root, 'src', file), path.join(dist, 'src', file));
}
fs.writeFileSync(path.join(dist, 'sitemap.xml'), renderSitemap());

console.log(`Build complete. Generated ${pages.length} indexable pages in dist.`);
