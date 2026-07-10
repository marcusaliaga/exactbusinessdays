import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CALENDAR_DATA } from '../src/calendar-data.js';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(Object.keys(CALENDAR_DATA.countries).length === 11, 'Expected 11 supported countries.');
check(Object.keys(CALENDAR_DATA.countries.us.regions).length === 52, 'Expected U.S. federal + 50 states + Washington, DC.');
check(Object.keys(CALENDAR_DATA.countries.de.regions).length === 16, 'Expected all 16 German states.');
check(Object.keys(CALENDAR_DATA.countries.ca.regions).length === 13, 'Expected all Canadian provinces and territories.');
check(CALENDAR_DATA.countries.uk.defaultRegion === 'england', 'UK default region must exist.');

let calendarCount = 0;
let holidayCount = 0;
for (const [countryKey, country] of Object.entries(CALENDAR_DATA.countries)) {
  check(Boolean(country.regions[country.defaultRegion]), `${countryKey}: default region does not exist.`);
  check(/^https:\/\//.test(country.sourceUrl), `${countryKey}: official source URL missing.`);
  for (const [regionKey, region] of Object.entries(country.regions)) {
    calendarCount += 1;
    for (const year of CALENDAR_DATA.supportedYears) {
      const holidays = region.holidays[year];
      check(Array.isArray(holidays) && holidays.length > 0, `${countryKey}/${regionKey}/${year}: no holidays.`);
      for (const [date, name] of holidays || []) {
        holidayCount += 1;
        check(date.startsWith(`${year}-`) && !Number.isNaN(new Date(`${date}T00:00:00Z`).getTime()), `${countryKey}/${regionKey}: invalid date ${date}.`);
        check(Boolean(name), `${countryKey}/${regionKey}/${date}: missing holiday name.`);
      }
    }
  }
}
check(calendarCount === 115, `Expected 115 regional calendars, found ${calendarCount}.`);
check(holidayCount === 3156, `Expected 3156 holiday records, found ${holidayCount}.`);

const hasHoliday = (country, region, year, date) => CALENDAR_DATA.countries[country].regions[region].holidays[year].some(item => item[0] === date);
check(hasHoliday('us', 'federal', 2026, '2026-07-03'), 'U.S. 2026 Independence Day observed date missing.');
check(hasHoliday('jp', 'national', 2026, '2026-05-04'), 'Japan 2026 Greenery Day missing.');
check(hasHoliday('de', 'be', 2026, '2026-10-03'), 'Germany 2026 Unity Day missing.');
check(hasHoliday('sg', 'national', 2026, '2026-02-17'), 'Singapore 2026 Chinese New Year missing.');

const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
check(urls.length === 30, `Expected 30 sitemap URLs, found ${urls.length}.`);

const titles = new Set();
const canonicals = new Set();
for (const url of urls) {
  const pathname = new URL(url).pathname;
  const htmlPath = pathname === '/' ? path.join(dist, 'index.html') : path.join(dist, pathname, 'index.html');
  check(fs.existsSync(htmlPath), `Missing rendered page for ${pathname}.`);
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="(.*?)"/i)?.[1];
  const h1 = html.match(/<h1>(.*?)<\/h1>/)?.[1];
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  check(Boolean(title), `${pathname}: title missing.`);
  check(Boolean(canonical), `${pathname}: canonical missing.`);
  check(Boolean(h1), `${pathname}: crawlable H1 missing.`);
  check(canonical === url, `${pathname}: canonical does not match sitemap URL.`);
  check(!titles.has(title), `${pathname}: duplicate title ${title}.`);
  check(!canonicals.has(canonical), `${pathname}: duplicate canonical ${canonical}.`);
  titles.add(title);
  canonicals.add(canonical);
  try { JSON.parse(jsonLd); } catch { failures.push(`${pathname}: invalid JSON-LD.`); }
}

for (const file of ['holidays-2026-2027.csv', 'business-days-by-month-2026.csv', 'business-days-by-month-2027.csv', 'business-days-summary-2026-2027.csv']) {
  const filePath = path.join(dist, 'data', file);
  check(fs.existsSync(filePath) && fs.statSync(filePath).size > 1000, `Missing or empty data file: ${file}.`);
}

const app = { innerHTML: '' };
globalThis.document = {
  body: { classList: { toggle() {} } },
  getElementById(id) { return id === 'app' ? app : null; },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
globalThis.history = { pushState() {} };
globalThis.window = {
  location: { pathname: '/', search: '', origin: 'https://exactbusinessdays.com' },
  addEventListener() {},
  matchMedia() { return { matches: false }; },
  setTimeout() {}
};

const runtimeRoutes = ['/', '/us/state-business-days/', '/germany/working-days/', '/japan/business-days/', '/business-days-by-month/', '/data/business-days-2026-2027/', '/embed/', '/holiday-data/'];
for (const [index, route] of runtimeRoutes.entries()) {
  window.location.pathname = route;
  window.location.search = '';
  app.innerHTML = '';
  try {
    await import(`${pathToFileURL(path.join(root, 'src', 'main.js')).href}?validation=${index}`);
    check(app.innerHTML.includes('<h1>') && !app.innerHTML.includes('undefined'), `${route}: client render is incomplete.`);
  } catch (error) {
    failures.push(`${route}: client render failed (${error.message}).`);
  }
}

window.location.pathname = '/';
window.location.search = '?embed=1';
app.innerHTML = '';
try {
  await import(`${pathToFileURL(path.join(root, 'src', 'main.js')).href}?validation=embed`);
  check(app.innerHTML.includes('embed-shell') && !app.innerHTML.includes('site-header'), 'Embed mode did not render compactly.');
} catch (error) {
  failures.push(`Embed mode failed (${error.message}).`);
}

if (failures.length) {
  console.error(`Validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validated ${urls.length} pages, ${calendarCount} calendars, ${holidayCount} holiday records, CSV downloads, structured data, and client rendering.`);
