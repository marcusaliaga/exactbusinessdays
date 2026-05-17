const COUNTRY_REGIONS = {
  ca: {
    label: 'Canada',
    regions: {
      ab: 'Alberta', bc: 'British Columbia', mb: 'Manitoba', nb: 'New Brunswick', nl: 'Newfoundland and Labrador',
      ns: 'Nova Scotia', nt: 'Northwest Territories', nu: 'Nunavut', on: 'Ontario', pe: 'Prince Edward Island',
      qc: 'Quebec', sk: 'Saskatchewan', yt: 'Yukon'
    }
  },
  us: {
    label: 'United States',
    regions: {
      federal: 'Federal holidays', ca: 'California', tx: 'Texas', fl: 'Florida', ny: 'New York', pa: 'Pennsylvania',
      il: 'Illinois', oh: 'Ohio', ga: 'Georgia', nc: 'North Carolina', mi: 'Michigan'
    }
  },
  uk: {
    label: 'United Kingdom',
    regions: { england: 'England and Wales', scotland: 'Scotland', ni: 'Northern Ireland' }
  },
  au: {
    label: 'Australia',
    regions: { nsw: 'New South Wales', vic: 'Victoria', qld: 'Queensland', wa: 'Western Australia', sa: 'South Australia', tas: 'Tasmania', act: 'Australian Capital Territory', nt: 'Northern Territory' }
  }
};

const HOLIDAYS_2026 = {
  'ca-on': [
    ['2026-01-01', "New Year's Day"], ['2026-02-16', 'Family Day'], ['2026-04-03', 'Good Friday'], ['2026-05-18', 'Victoria Day'], ['2026-07-01', 'Canada Day'], ['2026-09-07', 'Labour Day'], ['2026-10-12', 'Thanksgiving Day'], ['2026-12-25', 'Christmas Day'], ['2026-12-28', 'Boxing Day, observed']
  ],
  'ca-qc': [
    ['2026-01-01', "New Year's Day"], ['2026-04-03', 'Good Friday'], ['2026-05-18', "National Patriots' Day"], ['2026-06-24', 'Saint-Jean-Baptiste Day'], ['2026-07-01', 'Canada Day'], ['2026-09-07', 'Labour Day'], ['2026-12-25', 'Christmas Day']
  ],
  'ca-default': [
    ['2026-01-01', "New Year's Day"], ['2026-04-03', 'Good Friday'], ['2026-05-18', 'Victoria Day'], ['2026-07-01', 'Canada Day'], ['2026-09-07', 'Labour Day'], ['2026-10-12', 'Thanksgiving Day'], ['2026-12-25', 'Christmas Day'], ['2026-12-28', 'Boxing Day, observed']
  ],
  'us-federal': [
    ['2026-01-01', "New Year's Day"], ['2026-01-19', 'Martin Luther King Jr. Day'], ['2026-02-16', "Washington's Birthday"], ['2026-05-25', 'Memorial Day'], ['2026-06-19', 'Juneteenth National Independence Day'], ['2026-07-03', 'Independence Day, observed'], ['2026-09-07', 'Labor Day'], ['2026-10-12', 'Columbus Day'], ['2026-11-11', 'Veterans Day'], ['2026-11-26', 'Thanksgiving Day'], ['2026-12-25', 'Christmas Day']
  ],
  'us-ca': [
    ['2026-01-01', "New Year's Day"], ['2026-01-19', 'Martin Luther King Jr. Day'], ['2026-02-16', "Presidents' Day"], ['2026-03-31', 'César Chávez Day'], ['2026-05-25', 'Memorial Day'], ['2026-06-19', 'Juneteenth National Independence Day'], ['2026-07-03', 'Independence Day, observed'], ['2026-09-07', 'Labor Day'], ['2026-11-11', 'Veterans Day'], ['2026-11-26', 'Thanksgiving Day'], ['2026-11-27', 'Day after Thanksgiving'], ['2026-12-25', 'Christmas Day']
  ],
  'us-default': [
    ['2026-01-01', "New Year's Day"], ['2026-01-19', 'Martin Luther King Jr. Day'], ['2026-02-16', "Presidents' Day"], ['2026-05-25', 'Memorial Day'], ['2026-06-19', 'Juneteenth National Independence Day'], ['2026-07-03', 'Independence Day, observed'], ['2026-09-07', 'Labor Day'], ['2026-11-11', 'Veterans Day'], ['2026-11-26', 'Thanksgiving Day'], ['2026-12-25', 'Christmas Day']
  ],
  'uk-england': [
    ['2026-01-01', "New Year's Day"], ['2026-04-03', 'Good Friday'], ['2026-04-06', 'Easter Monday'], ['2026-05-04', 'Early May bank holiday'], ['2026-05-25', 'Spring bank holiday'], ['2026-08-31', 'Summer bank holiday'], ['2026-12-25', 'Christmas Day'], ['2026-12-28', 'Boxing Day, substitute day']
  ],
  'uk-scotland': [
    ['2026-01-01', "New Year's Day"], ['2026-01-02', '2nd January'], ['2026-04-03', 'Good Friday'], ['2026-05-04', 'Early May bank holiday'], ['2026-05-25', 'Spring bank holiday'], ['2026-08-03', 'Summer bank holiday'], ['2026-11-30', "St Andrew's Day"], ['2026-12-25', 'Christmas Day'], ['2026-12-28', 'Boxing Day, substitute day']
  ],
  'uk-ni': [
    ['2026-01-01', "New Year's Day"], ['2026-03-17', "St Patrick's Day"], ['2026-04-03', 'Good Friday'], ['2026-04-06', 'Easter Monday'], ['2026-05-04', 'Early May bank holiday'], ['2026-05-25', 'Spring bank holiday'], ['2026-07-13', 'Battle of the Boyne, substitute day'], ['2026-08-31', 'Summer bank holiday'], ['2026-12-25', 'Christmas Day'], ['2026-12-28', 'Boxing Day, substitute day']
  ],
  'au-vic': [
    ['2026-01-01', "New Year's Day"], ['2026-01-26', 'Australia Day'], ['2026-03-09', 'Labour Day'], ['2026-04-03', 'Good Friday'], ['2026-04-06', 'Easter Monday'], ['2026-04-25', 'Anzac Day'], ['2026-06-08', "King's Birthday"], ['2026-11-03', 'Melbourne Cup Day'], ['2026-12-25', 'Christmas Day'], ['2026-12-28', 'Boxing Day, substitute day']
  ],
  'au-default': [
    ['2026-01-01', "New Year's Day"], ['2026-01-26', 'Australia Day'], ['2026-04-03', 'Good Friday'], ['2026-04-06', 'Easter Monday'], ['2026-04-25', 'Anzac Day'], ['2026-12-25', 'Christmas Day'], ['2026-12-28', 'Boxing Day, substitute day']
  ]
};

let state = {
  page: routeToPage(),
  tab: 'between',
  startDate: '2026-05-17',
  endDate: '2026-12-31',
  days: 10,
  includeStart: true,
  country: 'ca',
  region: 'on',
  excludeHolidays: true,
  help: null
};

const helpText = {
  between: 'Count how many business days are between two dates.',
  add: 'Pick a start date, then count forward by a number of business days.',
  subtract: 'Pick a deadline date, then count backward by a number of business days.',
  left: 'See how many business days are left from the start date until December 31.',
  includeStart: 'When this is on, the start date can count as day one. It only counts if it is a weekday and not a selected holiday.',
  country: 'Choose the country whose holiday calendar should be used.',
  region: 'Choose the state, province, territory, or UK region. Holidays can be different depending on the region.',
  holidays: 'Weekends are always skipped. Turn this on if public holidays should be skipped too. For example, Christmas on a Wednesday would not count as a business day.',
  numberAdd: 'Enter how many business days you want to add. Weekends and selected holidays are skipped.',
  numberSubtract: 'Enter how many business days you want to subtract. Weekends and selected holidays are skipped.'
};

function routeToPage() {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  return ['about', 'privacy', 'terms', 'contact'].includes(path) ? path : 'calculator';
}

function setRoute(page) {
  state.page = page;
  const path = page === 'calculator' ? '/' : `/${page}`;
  history.pushState({}, '', path);
  render();
}
window.addEventListener('popstate', () => { state.page = routeToPage(); render(); });

const $ = (id) => document.getElementById(id);
const toDate = (value) => new Date(`${value}T00:00:00Z`);
const toKey = (date) => date.toISOString().slice(0, 10);
const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const fmtShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
function formatDate(value) { return fmt.format(toDate(value)); }
function isWeekend(date) { const day = date.getUTCDay(); return day === 0 || day === 6; }
function addDays(date, amount) { const next = new Date(date); next.setUTCDate(next.getUTCDate() + amount); return next; }
function holidayList() {
  const key = `${state.country}-${state.region}`;
  return HOLIDAYS_2026[key] || HOLIDAYS_2026[`${state.country}-default`] || [];
}
function holidaySet() { return new Set(holidayList().map(([date]) => date)); }
function isHoliday(date) { return state.excludeHolidays && holidaySet().has(toKey(date)); }
function isBusinessDay(date) { return !isWeekend(date) && !isHoliday(date); }
function inCalendarRange(date) { return date.getUTCFullYear() === 2026; }

function countBetween() {
  let start = toDate(state.startDate);
  const end = toDate(state.endDate);
  if (start > end) [start, state.endDate] = [end, state.startDate];
  let count = 0;
  let cursor = new Date(start);
  if (!state.includeStart) cursor = addDays(cursor, 1);
  while (cursor <= end) {
    if (isBusinessDay(cursor)) count += 1;
    cursor = addDays(cursor, 1);
  }
  return count;
}
function moveBusinessDays(direction) {
  let cursor = toDate(state.startDate);
  let moved = 0;
  while (moved < Number(state.days || 0)) {
    cursor = addDays(cursor, direction);
    if (isBusinessDay(cursor)) moved += 1;
  }
  return toKey(cursor);
}
function leftThisYear() {
  const oldEnd = state.endDate;
  state.endDate = '2026-12-31';
  const count = countBetween();
  state.endDate = oldEnd;
  return count;
}
function excludedHolidaysForCurrentResult() {
  if (!state.excludeHolidays) return [];
  let from = toDate(state.startDate);
  let to = toDate(state.endDate);
  if (state.tab === 'add') to = toDate(moveBusinessDays(1));
  if (state.tab === 'subtract') { to = toDate(state.startDate); from = toDate(moveBusinessDays(-1)); }
  if (state.tab === 'left') to = toDate('2026-12-31');
  if (from > to) [from, to] = [to, from];
  return holidayList().filter(([date]) => {
    const d = toDate(date);
    return d >= from && d <= to && !isWeekend(d);
  });
}

function currentResult() {
  const region = COUNTRY_REGIONS[state.country].regions[state.region];
  const country = COUNTRY_REGIONS[state.country].label;
  const excluded = excludedHolidaysForCurrentResult();
  if (state.tab === 'add') {
    const result = moveBusinessDays(1);
    return { title: formatDate(result), body: `${state.days} business days after ${formatDate(state.startDate)}.`, note: holidayNote(region, country, excluded) };
  }
  if (state.tab === 'subtract') {
    const result = moveBusinessDays(-1);
    return { title: formatDate(result), body: `${state.days} business days before ${formatDate(state.startDate)}.`, note: holidayNote(region, country, excluded) };
  }
  if (state.tab === 'left') {
    return { title: `${leftThisYear()} business days remaining`, body: `From ${formatDate(state.startDate)} through Thursday, December 31, 2026, excluding weekends${state.excludeHolidays ? ' and selected public holidays' : ''}.`, note: holidayNote(region, country, excluded) };
  }
  return { title: `${countBetween()} business days`, body: `Between ${formatDate(state.startDate)} and ${formatDate(state.endDate)}, ${state.includeStart ? 'including' : 'not including'} the start date.`, note: holidayNote(region, country, excluded) };
}
function holidayNote(region, country, excluded) {
  if (!state.excludeHolidays) return 'Weekends are excluded. Public holidays are currently not excluded.';
  return `${excluded.length} public holiday${excluded.length === 1 ? '' : 's'} ${excluded.length ? 'are' : 'would be'} excluded for ${region}, ${country}.`;
}

function esc(value) { return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function InfoButton(key) {
  return `<button type="button" class="info-button" data-help="${key}" data-tip="${esc(helpText[key])}" aria-label="More information">i</button>`;
}
function nav() {
  const item = (page, label) => `<button class="nav-link ${state.page === page ? 'active' : ''}" data-route="${page}">${label}</button>`;
  return `<header class="site-header"><div class="brand"><div class="logo">EBD</div><div><strong>Exact Business Days</strong><span>Free deadline calculator</span></div></div><nav>${item('calculator','Calculator')}${item('about','About')}${item('contact','Contact')}</nav></header>`;
}
function hero() {
  return `<section class="hero"><div class="eyebrow">Free business day tool</div><h1>Business Days Calculator</h1><p>Count business days, working days, weekdays, public holidays, and deadline dates in seconds. Fast, clear, and free to use.</p></section>`;
}
function tabs() {
  const t = (key, label) => `<button class="tab ${state.tab === key ? 'active' : ''}" data-tab="${key}">${label} ${InfoButton(key === 'left' ? 'left' : key)}</button>`;
  return `<div class="tabs">${t('between','Between dates')}${t('add','Add days')}${t('subtract','Subtract days')}${t('left','Left this year')}</div>`;
}
function dateField(id, label, value) {
  return `<label class="field"><span>${label}</span><input id="${id}" type="date" value="${value}" /></label>`;
}
function numberField() {
  if (state.tab === 'between' || state.tab === 'left') return '';
  const mode = state.tab === 'add' ? 'add' : 'subtract';
  return `<label class="field"><span>Number of business days to ${mode} ${InfoButton(mode === 'add' ? 'numberAdd' : 'numberSubtract')}</span><input id="days" type="number" min="0" step="1" value="${state.days}" /></label>`;
}
function selectField(id, label, options, value, helpKey) {
  const opts = Object.entries(options).map(([key, val]) => `<option value="${key}" ${key === value ? 'selected' : ''}>${val}</option>`).join('');
  return `<label class="field"><span>${label} ${InfoButton(helpKey)}</span><select id="${id}">${opts}</select></label>`;
}
function includeStartBox() {
  if (state.tab === 'add' || state.tab === 'subtract') return '';
  if (state.tab === 'left') return '';
  return `<label class="check-card"><input id="includeStart" type="checkbox" ${state.includeStart ? 'checked' : ''} /><span>Include start date ${InfoButton('includeStart')}</span></label>`;
}
function holidayToggle() {
  return `<label class="holiday-toggle"><span>Weekends only</span><input id="excludeHolidays" type="checkbox" ${state.excludeHolidays ? 'checked' : ''} /><b></b><span>Weekends + holidays ${InfoButton('holidays')}</span></label>`;
}
function form() {
  const country = COUNTRY_REGIONS[state.country];
  let fields = '';
  fields += dateField('startDate', state.tab === 'subtract' ? 'Deadline date' : 'Start date', state.startDate);
  if (state.tab === 'between') fields += dateField('endDate', 'End date', state.endDate);
  fields += numberField();
  fields += includeStartBox();
  fields += selectField('country', 'Country', Object.fromEntries(Object.entries(COUNTRY_REGIONS).map(([k,v]) => [k,v.label])), state.country, 'country');
  fields += selectField('region', 'Region', country.regions, state.region, 'region');
  fields += holidayToggle();
  return `<section class="calculator-card">${tabs()}<div class="form-grid">${fields}</div>${resultPanel()}${assumptions()}${holidayTable()}</section>`;
}
function resultPanel() {
  const result = currentResult();
  const warning = !inCalendarRange(toDate(state.startDate)) || !inCalendarRange(toDate(state.endDate));
  return `<div class="result-panel"><span>Result</span><h2>${result.title}</h2><p>${result.body}</p><small>${result.note}</small></div>${warning ? '<div class="note">Calendar note: Holiday data is currently available for 2026 only. Dates outside 2026 may not exclude all public holidays yet.</div>' : ''}`;
}
function assumptions() {
  const region = COUNTRY_REGIONS[state.country].regions[state.region];
  const country = COUNTRY_REGIONS[state.country].label;
  return `<div class="assumptions"><h3>Included in this calculation</h3><ul><li>Weekends are excluded.</li><li>${state.excludeHolidays ? `Public holidays are excluded for ${region}, ${country}.` : 'Public holidays are not excluded.'}</li><li>Holiday data currently covers 2026.</li><li>Business holiday rules can vary by employer, industry, city, and contract.</li></ul></div>`;
}
function holidayTable() {
  const holidays = excludedHolidaysForCurrentResult();
  if (!state.excludeHolidays || holidays.length === 0) return '';
  return `<div class="holiday-list"><h3>Holidays excluded</h3>${holidays.map(([date, name]) => `<div><span>${name}</span><strong>${fmtShort.format(toDate(date))}</strong></div>`).join('')}</div>`;
}
function infoCards() {
  return `<section class="info-grid"><article><h3>What can this calculator do?</h3><p>Use it to count business days between two dates, add business days to a start date, subtract business days from a deadline, or see how many business days are left in the year.</p></article><article><h3>What is counted as a business day?</h3><p>A business day usually means Monday through Friday, excluding selected public holidays. Exact rules can vary by country, region, employer, contract, and industry.</p></article><article><h3>Why use a calculator instead of guessing?</h3><p>Deadline math is easy to miscount, especially when weekends, holidays, date ranges, and start-date rules are involved. This tool makes the assumptions visible.</p></article><article><h3>Supported holiday calendars</h3><p>Holiday support currently includes 2026 calendars for Canada, the United States, the United Kingdom, and Australia, with regional options included.</p></article></section>`;
}
function footer() {
  return `<footer><div><strong>Exact Business Days</strong><p>Fast business-day and working-day calculations with clear assumptions.</p></div><nav><button data-route="about">About</button><button data-route="privacy">Privacy</button><button data-route="terms">Terms</button><button data-route="contact">Contact</button></nav></footer>`;
}
function staticPage(title, eyebrow, paragraphs) {
  return `<main class="page"><section class="static-page"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><div class="content-card">${paragraphs.map(p => `<p>${p}</p>`).join('')}</div></section></main>`;
}
function pageContent() {
  if (state.page === 'about') return staticPage('About Exact Business Days', 'About', ['Exact Business Days is a simple free utility for counting business days, working days, weekdays, and deadline dates.', 'The goal is to keep the tool fast, clear, and easy to use. Every result shows what was included, what was excluded, and which assumptions were used.', 'The current version includes 2026 regional holiday calendars for Canada, the United States, the United Kingdom, and Australia.']);
  if (state.page === 'privacy') return staticPage('Privacy Policy', 'Privacy', ['Exact Business Days is currently a simple calculator site. We do not require user accounts, and we do not ask visitors to submit personal information to use the calculator.', 'Basic technical information may be processed by hosting, security, and analytics providers to keep the site available, secure, and working properly.', 'Last updated: May 17, 2026.']);
  if (state.page === 'terms') return staticPage('Terms of Use', 'Terms', ['Exact Business Days is provided as a free informational tool. The calculator is intended to help users estimate business days, working days, weekdays, and deadline dates.', 'Results should be reviewed before being used for legal, financial, payroll, contractual, shipping, or other time-sensitive decisions. Rules can vary by jurisdiction, organization, and context.', 'Last updated: May 17, 2026.']);
  if (state.page === 'contact') return staticPage('Contact', 'Contact', ['Have feedback, a correction, or a region you want supported next?', 'For now, please contact the site owner directly through the domain owner or project administrator. A dedicated contact form or email address will be added in a future update.']);
  return `<main>${hero()}${form()}${infoCards()}</main>`;
}
function helpSheet() {
  if (!state.help) return '';
  return `<div class="help-overlay" data-close-help="true"><div class="help-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><h3>Quick explanation</h3><p>${helpText[state.help]}</p><button class="sheet-close" data-close-help="true">Got it</button></div></div>`;
}
function render() {
  document.title = state.page === 'calculator' ? 'Business Days Calculator | Exact Business Days' : `${state.page.charAt(0).toUpperCase() + state.page.slice(1)} | Exact Business Days`;
  $('app').innerHTML = `${nav()}${pageContent()}${footer()}${helpSheet()}`;
  bind();
}
function bind() {
  document.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => setRoute(el.dataset.route)));
  document.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', (event) => { if (event.target.matches('.info-button')) return; state.tab = el.dataset.tab; render(); }));
  document.querySelectorAll('.info-button').forEach(button => button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (window.matchMedia('(max-width: 760px)').matches) { state.help = button.dataset.help; render(); }
  }));
  document.querySelectorAll('[data-close-help]').forEach(el => el.addEventListener('click', (event) => { if (event.target.dataset.closeHelp) { state.help = null; render(); }}));
  ['startDate','endDate'].forEach(id => { const el = $(id); if (el) el.addEventListener('change', () => { state[id] = el.value; render(); }); });
  const days = $('days'); if (days) days.addEventListener('input', () => { state.days = Math.max(0, Number(days.value || 0)); render(); });
  const include = $('includeStart'); if (include) include.addEventListener('change', () => { state.includeStart = include.checked; render(); });
  const country = $('country'); if (country) country.addEventListener('change', () => { state.country = country.value; state.region = Object.keys(COUNTRY_REGIONS[state.country].regions)[0]; render(); });
  const region = $('region'); if (region) region.addEventListener('change', () => { state.region = region.value; render(); });
  const holidays = $('excludeHolidays'); if (holidays) holidays.addEventListener('change', () => { state.excludeHolidays = holidays.checked; render(); });
}

render();
