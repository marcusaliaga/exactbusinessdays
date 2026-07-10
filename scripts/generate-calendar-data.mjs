import fs from 'node:fs';
import path from 'node:path';
import Holidays from 'date-holidays';

const root = process.cwd();
const years = [2026, 2027];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const sourceCatalog = {
  ca: {
    label: 'Canada',
    sourceName: 'Government of Canada public holidays',
    sourceUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/public-holidays.html',
    coverageNote: 'Provincial and territorial selections are planning baselines. Employer and sector rules can differ.'
  },
  us: {
    label: 'United States',
    sourceName: 'U.S. Office of Personnel Management federal holidays',
    sourceUrl: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/',
    secondarySourceName: 'Official U.S. state government directory',
    secondarySourceUrl: 'https://www.usa.gov/state-governments',
    coverageNote: 'State selections combine the federal calendar with applicable state-government observances. Private employers may use different schedules.'
  },
  uk: {
    label: 'United Kingdom',
    sourceName: 'GOV.UK bank holidays',
    sourceUrl: 'https://www.gov.uk/bank-holidays',
    coverageNote: 'Bank holidays do not automatically create paid leave for every worker.'
  },
  au: {
    label: 'Australia',
    sourceName: 'Fair Work Ombudsman public holidays',
    sourceUrl: 'https://www.fairwork.gov.au/employment-conditions/public-holidays/2026-public-holidays',
    coverageNote: 'Local show days and part-day holidays may not apply across an entire state or territory.'
  },
  de: {
    label: 'Germany',
    sourceName: 'German Federal Ministry of the Interior holiday overview',
    sourceUrl: 'https://www.bmi.bund.de/DE/themen/verfassung/staatliche-symbole/nationale-feiertage/nationale-feiertage-node.html',
    coverageNote: 'German public holidays vary by federal state and, in a few cases, by municipality.'
  },
  jp: {
    label: 'Japan',
    sourceName: 'Cabinet Office of Japan national holidays',
    sourceUrl: 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html',
    coverageNote: 'National holidays and statutory substitute holidays are included.'
  },
  fr: {
    label: 'France',
    sourceName: 'Service-Public.fr legal public holidays',
    sourceUrl: 'https://www.service-public.fr/particuliers/vosdroits/F2405',
    coverageNote: 'Alsace-Moselle has additional rules; employer and sector closures can differ.'
  },
  ie: {
    label: 'Ireland',
    sourceName: 'Workplace Relations Commission public holidays',
    sourceUrl: 'https://www.workplacerelations.ie/en/what_you_should_know/public-holidays/',
    coverageNote: 'The statutory holiday benefit does not always move to the next weekday when the calendar date falls on a weekend.'
  },
  nz: {
    label: 'New Zealand',
    sourceName: 'Employment New Zealand public holidays and anniversary dates',
    sourceUrl: 'https://www.employment.govt.nz/leave-and-holidays/public-holidays/public-holidays-and-anniversary-dates',
    coverageNote: 'Regional anniversary days are included. Mondayisation depends on the employee’s normal work pattern.'
  },
  sg: {
    label: 'Singapore',
    sourceName: 'Singapore Ministry of Manpower public holidays',
    sourceUrl: 'https://www.mom.gov.sg/employment-practices/public-holidays',
    coverageNote: 'Gazetted public holidays and published substitute days are included.'
  },
  nl: {
    label: 'Netherlands',
    sourceName: 'Government of the Netherlands official public holidays',
    sourceUrl: 'https://www.government.nl/faq/work/public-holidays-in-the-netherlands',
    coverageNote: 'An official public holiday is not automatically a statutory day off; collective agreements and employment contracts control.'
  }
};

const countryPlans = [
  { key: 'ca', code: 'CA', mode: 'states', defaultRegion: 'ON' },
  { key: 'us', code: 'US', mode: 'us', defaultRegion: 'federal' },
  { key: 'uk', code: 'GB', mode: 'uk', defaultRegion: 'england' },
  { key: 'au', code: 'AU', mode: 'states', defaultRegion: 'NSW' },
  { key: 'de', code: 'DE', mode: 'states', defaultRegion: 'BE' },
  { key: 'jp', code: 'JP', mode: 'national', defaultRegion: 'national' },
  { key: 'fr', code: 'FR', mode: 'fr', defaultRegion: 'national' },
  { key: 'ie', code: 'IE', mode: 'national', defaultRegion: 'national' },
  { key: 'nz', code: 'NZ', mode: 'states', defaultRegion: 'AUK' },
  { key: 'sg', code: 'SG', mode: 'national', defaultRegion: 'national' },
  { key: 'nl', code: 'NL', mode: 'national', defaultRegion: 'national' }
];

function regionPlans(plan) {
  const hd = new Holidays();
  if (plan.mode === 'national') return [{ key: 'national', code: null, label: 'National holidays' }];
  if (plan.mode === 'us') {
    const states = hd.getStates('US');
    return [
      { key: 'federal', code: null, label: 'Federal holidays' },
      ...Object.entries(states).map(([code, label]) => ({ key: code.toLowerCase(), code, label }))
    ];
  }
  if (plan.mode === 'uk') {
    return [
      { key: 'england', code: 'ENG', label: 'England and Wales' },
      { key: 'scotland', code: 'SCT', label: 'Scotland' },
      { key: 'ni', code: 'NIR', label: 'Northern Ireland' }
    ];
  }
  if (plan.mode === 'fr') {
    return [
      { key: 'national', code: null, label: 'Metropolitan France' },
      { key: 'alsace-moselle', code: '67', label: 'Alsace-Moselle' }
    ];
  }
  return Object.entries(hd.getStates(plan.code) || {}).map(([code, label]) => ({ key: code.toLowerCase(), code, label }));
}

function additions(country, region, year) {
  const list = [];
  if (country === 'uk' && region === 'scotland' && year === 2026) {
    list.push(['2026-06-15', 'World Cup bank holiday']);
  }
  if (country === 'nl') {
    list.push(
      [year === 2026 ? '2026-04-03' : '2027-03-26', 'Good Friday'],
      [`${year}-05-05`, 'Liberation Day']
    );
  }
  return list;
}

function holidaysFor(plan, region, year) {
  const hd = region.code
    ? new Holidays(plan.code, region.code, { languages: ['en'] })
    : new Holidays(plan.code, { languages: ['en'] });
  const records = hd.getHolidays(year)
    .filter(item => item.type === 'public')
    .map(item => [item.date.slice(0, 10), item.name]);
  records.push(...additions(plan.key, region.key, year));

  const byDate = new Map();
  for (const [date, name] of records) {
    const names = byDate.get(date) || [];
    if (!names.includes(name)) names.push(name);
    byDate.set(date, names);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, names]) => [date, names.join(' / ')]);
}

function weekdaysInMonth(year, monthIndex) {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  let total = 0;
  for (let day = 1; day <= last; day += 1) {
    const weekday = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
    if (weekday !== 0 && weekday !== 6) total += 1;
  }
  return total;
}

function businessDayRows(countryKey, country, regionKey, region, year) {
  return monthNames.map((month, monthIndex) => {
    const weekdays = weekdaysInMonth(year, monthIndex);
    const holidayWeekdays = new Set(
      region.holidays[year]
        .filter(([date]) => Number(date.slice(5, 7)) === monthIndex + 1)
        .filter(([date]) => {
          const day = new Date(`${date}T00:00:00Z`).getUTCDay();
          return day !== 0 && day !== 6;
        })
        .map(([date]) => date)
    ).size;
    return {
      country_key: countryKey,
      country: country.label,
      region_key: regionKey,
      region: region.label,
      year,
      month_number: monthIndex + 1,
      month,
      weekdays,
      public_holidays_on_weekdays: holidayWeekdays,
      business_days: weekdays - holidayWeekdays
    };
  });
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows, columns) {
  return [columns.join(','), ...rows.map(row => columns.map(column => csvEscape(row[column])).join(','))].join('\n') + '\n';
}

const calendarData = { supportedYears: years, generatedAt: '2026-07-10', countries: {} };
const holidayRows = [];
const monthlyRows = [];
const summaryRows = [];

for (const plan of countryPlans) {
  const source = sourceCatalog[plan.key];
  const regions = {};
  for (const region of regionPlans(plan)) {
    const holidays = Object.fromEntries(years.map(year => [year, holidaysFor(plan, region, year)]));
    regions[region.key] = { label: region.label, holidays };
    for (const year of years) {
      for (const [date, holidayName] of holidays[year]) {
        holidayRows.push({ country_key: plan.key, country: source.label, region_key: region.key, region: region.label, year, date, holiday: holidayName });
      }
      const rows = businessDayRows(plan.key, source, region.key, regions[region.key], year);
      monthlyRows.push(...rows);
      summaryRows.push({
        country_key: plan.key,
        country: source.label,
        region_key: region.key,
        region: region.label,
        year,
        weekdays: rows.reduce((sum, row) => sum + row.weekdays, 0),
        public_holidays_on_weekdays: rows.reduce((sum, row) => sum + row.public_holidays_on_weekdays, 0),
        business_days: rows.reduce((sum, row) => sum + row.business_days, 0)
      });
    }
  }
  calendarData.countries[plan.key] = {
    ...source,
    defaultRegion: plan.defaultRegion.toLowerCase(),
    regions
  };
}

const srcDir = path.join(root, 'src');
const dataDir = path.join(root, 'public', 'data');
fs.mkdirSync(srcDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(srcDir, 'calendar-data.js'), `// Generated by scripts/generate-calendar-data.mjs. Do not edit manually.\nexport const CALENDAR_DATA = ${JSON.stringify(calendarData, null, 2)};\n`);
fs.writeFileSync(path.join(dataDir, 'holidays-2026-2027.csv'), toCsv(holidayRows, ['country_key', 'country', 'region_key', 'region', 'year', 'date', 'holiday']));
fs.writeFileSync(path.join(dataDir, 'business-days-by-month-2026.csv'), toCsv(monthlyRows.filter(row => row.year === 2026), ['country_key', 'country', 'region_key', 'region', 'year', 'month_number', 'month', 'weekdays', 'public_holidays_on_weekdays', 'business_days']));
fs.writeFileSync(path.join(dataDir, 'business-days-by-month-2027.csv'), toCsv(monthlyRows.filter(row => row.year === 2027), ['country_key', 'country', 'region_key', 'region', 'year', 'month_number', 'month', 'weekdays', 'public_holidays_on_weekdays', 'business_days']));
fs.writeFileSync(path.join(dataDir, 'business-days-summary-2026-2027.csv'), toCsv(summaryRows, ['country_key', 'country', 'region_key', 'region', 'year', 'weekdays', 'public_holidays_on_weekdays', 'business_days']));

console.log(`Generated ${holidayRows.length} holiday records and ${summaryRows.length} annual summaries.`);
