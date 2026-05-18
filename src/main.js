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
      il: 'Illinois', oh: 'Ohio', ga: 'Georgia', nc: 'North Carolina', nj: 'New Jersey'
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

const SUPPORTED_HOLIDAY_YEARS = [2026, 2027];
const MIN_HOLIDAY_YEAR = Math.min(...SUPPORTED_HOLIDAY_YEARS);
const MAX_HOLIDAY_YEAR = Math.max(...SUPPORTED_HOLIDAY_YEARS);

const pad2 = (value) => String(value).padStart(2, '0');
const iso = (year, month, day) => `${year}-${pad2(month)}-${pad2(day)}`;
const holiday = (year, month, day, name) => [iso(year, month, day), name];
const dayOfWeek = (year, month, day) => new Date(`${iso(year, month, day)}T00:00:00Z`).getUTCDay();

function addDateParts(year, month, day, amount) {
  const date = new Date(`${iso(year, month, day)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
}

function observedFixed(year, month, day, name) {
  const dow = dayOfWeek(year, month, day);
  const observed = dow === 6 ? addDateParts(year, month, day, -1) : dow === 0 ? addDateParts(year, month, day, 1) : [year, month, day];
  return [iso(...observed), observed[0] === year && observed[1] === month && observed[2] === day ? name : `${name}, observed`];
}

function christmasHoliday(year, label = 'Christmas Day') {
  if (dayOfWeek(year, 12, 25) === 6) return [iso(year, 12, 27), `${label}, observed`];
  if (dayOfWeek(year, 12, 25) === 0) return [iso(year, 12, 27), `${label}, observed`];
  return holiday(year, 12, 25, label);
}

function boxingHoliday(year, label = 'Boxing Day') {
  const christmasDow = dayOfWeek(year, 12, 25);
  const boxingDow = dayOfWeek(year, 12, 26);
  if (christmasDow === 5 || christmasDow === 6 || boxingDow === 6 || boxingDow === 0) return [iso(year, 12, 28), `${label}, observed`];
  return holiday(year, 12, 26, label);
}

function nthWeekday(year, month, weekday, n) {
  let day = 1;
  while (dayOfWeek(year, month, day) !== weekday) day += 1;
  return day + (n - 1) * 7;
}

function lastWeekday(year, month, weekday) {
  const date = new Date(Date.UTC(year, month, 0));
  let day = date.getUTCDate();
  while (dayOfWeek(year, month, day) !== weekday) day -= 1;
  return day;
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function relativeToEaster(year, offset, name) {
  const date = easterSunday(year);
  date.setUTCDate(date.getUTCDate() + offset);
  return [date.toISOString().slice(0, 10), name];
}

function mondayBeforeMay25(year) {
  const date = new Date(Date.UTC(year, 4, 24));
  while (date.getUTCDay() !== 1) date.setUTCDate(date.getUTCDate() - 1);
  return date.getUTCDate();
}

function baseCanada(year) {
  return [
    observedFixed(year, 1, 1, "New Year's Day"),
    relativeToEaster(year, -2, 'Good Friday'),
    observedFixed(year, 7, 1, 'Canada Day'),
    holiday(year, 9, nthWeekday(year, 9, 1, 1), 'Labour Day'),
    christmasHoliday(year),
  ];
}

function canadaHolidays(year, region) {
  const familyDay = holiday(year, 2, nthWeekday(year, 2, 1, 3), 'Family Day');
  const victoriaDay = holiday(year, 5, mondayBeforeMay25(year), 'Victoria Day');
  const thanksgiving = holiday(year, 10, nthWeekday(year, 10, 1, 2), 'Thanksgiving Day');
  const remembrance = observedFixed(year, 11, 11, 'Remembrance Day');
  const truth = holiday(year, 9, 30, 'National Day for Truth and Reconciliation');
  const common = baseCanada(year);
  const withBoxing = [...common, boxingHoliday(year)];
  const map = {
    ab: [...common, familyDay, victoriaDay, thanksgiving, remembrance],
    bc: [...common, familyDay, victoriaDay, holiday(year, 8, nthWeekday(year, 8, 1, 1), 'British Columbia Day'), truth, thanksgiving, remembrance],
    mb: [...common, holiday(year, 2, nthWeekday(year, 2, 1, 3), 'Louis Riel Day'), victoriaDay, holiday(year, 9, 30, 'Orange Shirt Day'), thanksgiving],
    nb: [...common, familyDay, holiday(year, 8, nthWeekday(year, 8, 1, 1), 'New Brunswick Day'), remembrance],
    nl: [...common, holiday(year, 7, 1, 'Memorial Day'), holiday(year, 7, 12, "Orangemen's Day"), remembrance],
    ns: [...common, holiday(year, 2, nthWeekday(year, 2, 1, 3), 'Heritage Day'), holiday(year, 8, nthWeekday(year, 8, 1, 1), 'Natal Day'), remembrance],
    nt: [...common, victoriaDay, holiday(year, 6, 21, 'National Indigenous Peoples Day'), holiday(year, 8, nthWeekday(year, 8, 1, 1), 'Civic Holiday'), truth, thanksgiving, remembrance],
    nu: [...common, victoriaDay, holiday(year, 7, 9, 'Nunavut Day'), holiday(year, 8, nthWeekday(year, 8, 1, 1), 'Civic Holiday'), thanksgiving, remembrance],
    on: [...withBoxing, familyDay, victoriaDay, thanksgiving],
    pe: [...withBoxing, holiday(year, 2, nthWeekday(year, 2, 1, 3), 'Islander Day'), truth, remembrance],
    qc: [observedFixed(year, 1, 1, "New Year's Day"), relativeToEaster(year, -2, 'Good Friday'), holiday(year, 5, mondayBeforeMay25(year), "National Patriots' Day"), holiday(year, 6, 24, 'Saint-Jean-Baptiste Day'), observedFixed(year, 7, 1, 'Canada Day'), holiday(year, 9, nthWeekday(year, 9, 1, 1), 'Labour Day'), christmasHoliday(year)],
    sk: [...common, familyDay, victoriaDay, holiday(year, 8, nthWeekday(year, 8, 1, 1), 'Saskatchewan Day'), thanksgiving, remembrance],
    yt: [...common, victoriaDay, holiday(year, 6, 21, 'National Indigenous Peoples Day'), holiday(year, 8, nthWeekday(year, 8, 1, 3), 'Discovery Day'), truth, thanksgiving, remembrance]
  };
  return map[region] || [...withBoxing, victoriaDay, thanksgiving];
}

function usFederalHolidays(year) {
  return [
    observedFixed(year, 1, 1, "New Year's Day"),
    holiday(year, 1, nthWeekday(year, 1, 1, 3), 'Martin Luther King Jr. Day'),
    holiday(year, 2, nthWeekday(year, 2, 1, 3), "Washington's Birthday"),
    holiday(year, 5, lastWeekday(year, 5, 1), 'Memorial Day'),
    observedFixed(year, 6, 19, 'Juneteenth National Independence Day'),
    observedFixed(year, 7, 4, 'Independence Day'),
    holiday(year, 9, nthWeekday(year, 9, 1, 1), 'Labor Day'),
    holiday(year, 10, nthWeekday(year, 10, 1, 2), 'Columbus Day'),
    observedFixed(year, 11, 11, 'Veterans Day'),
    holiday(year, 11, nthWeekday(year, 11, 4, 4), 'Thanksgiving Day'),
    christmasHoliday(year)
  ];
}

function usDefaultHolidays(year) {
  return usFederalHolidays(year)
    .filter(([, name]) => name !== 'Columbus Day')
    .map(([date, name]) => [date, name === "Washington's Birthday" ? "Presidents' Day" : name]);
}

function usHolidays(year, region) {
  const base = region === 'federal' ? usFederalHolidays(year) : usDefaultHolidays(year);
  const dayAfterThanksgiving = holiday(year, 11, nthWeekday(year, 11, 4, 4) + 1, 'Day after Thanksgiving');
  const electionDay = holiday(year, 11, nthWeekday(year, 11, 2, 1), 'Election Day');
  const map = {
    federal: base,
    ca: [...base, holiday(year, 3, 31, 'César Chávez Day'), dayAfterThanksgiving],
    tx: base,
    fl: base,
    ny: [...base, holiday(year, 2, 12, "Lincoln's Birthday"), electionDay],
    pa: [...base, dayAfterThanksgiving],
    il: [...base, holiday(year, 2, 12, "Lincoln's Birthday"), holiday(year, 3, nthWeekday(year, 3, 1, 1), 'Casimir Pulaski Day'), dayAfterThanksgiving],
    oh: base,
    ga: [...base, holiday(year, 4, nthWeekday(year, 4, 1, 4), 'State Holiday')],
    nc: [...base, dayAfterThanksgiving, holiday(year, 12, 24, 'Christmas Eve')],
    nj: [...base, relativeToEaster(year, -2, 'Good Friday'), electionDay]
  };
  return map[region] || base;
}

function ukHolidays(year, region) {
  const common = [
    observedFixed(year, 1, 1, "New Year's Day"),
    relativeToEaster(year, -2, 'Good Friday'),
    holiday(year, 5, nthWeekday(year, 5, 1, 1), 'Early May bank holiday'),
    holiday(year, 5, lastWeekday(year, 5, 1), 'Spring bank holiday'),
    christmasHoliday(year),
    boxingHoliday(year, 'Boxing Day')
  ];
  if (region === 'scotland') return [...common, observedFixed(year, 1, 2, '2nd January'), holiday(year, 8, nthWeekday(year, 8, 1, 1), 'Summer bank holiday'), observedFixed(year, 11, 30, "St Andrew's Day")];
  if (region === 'ni') return [...common, relativeToEaster(year, 1, 'Easter Monday'), holiday(year, 3, 17, "St Patrick's Day"), holiday(year, 7, 12, 'Battle of the Boyne'), holiday(year, 8, lastWeekday(year, 8, 1), 'Summer bank holiday')];
  return [...common, relativeToEaster(year, 1, 'Easter Monday'), holiday(year, 8, lastWeekday(year, 8, 1), 'Summer bank holiday')];
}

function australiaBaseHolidays(year) {
  return [
    observedFixed(year, 1, 1, "New Year's Day"),
    observedFixed(year, 1, 26, 'Australia Day'),
    relativeToEaster(year, -2, 'Good Friday'),
    relativeToEaster(year, 1, 'Easter Monday'),
    observedFixed(year, 4, 25, 'Anzac Day'),
    christmasHoliday(year),
    boxingHoliday(year, 'Boxing Day')
  ];
}

function australiaHolidays(year, region) {
  const base = australiaBaseHolidays(year);
  const kingsBirthday = holiday(year, 6, nthWeekday(year, 6, 1, 2), "King's Birthday");
  const map = {
    nsw: [...base, kingsBirthday, holiday(year, 10, nthWeekday(year, 10, 1, 1), 'Labour Day')],
    vic: [...base, holiday(year, 3, nthWeekday(year, 3, 1, 2), 'Labour Day'), kingsBirthday, holiday(year, 11, nthWeekday(year, 11, 2, 1), 'Melbourne Cup Day')],
    qld: [...base, holiday(year, 5, nthWeekday(year, 5, 1, 1), 'Labour Day'), holiday(year, 10, nthWeekday(year, 10, 1, 1), "King's Birthday")],
    wa: [...base, holiday(year, 3, nthWeekday(year, 3, 1, 1), 'Labour Day'), holiday(year, 6, nthWeekday(year, 6, 1, 1), 'Western Australia Day'), holiday(year, 9, lastWeekday(year, 9, 1), "King's Birthday")],
    sa: [...base, holiday(year, 3, nthWeekday(year, 3, 1, 2), 'Adelaide Cup Day'), kingsBirthday, holiday(year, 10, nthWeekday(year, 10, 1, 1), 'Labour Day')],
    tas: [...base, holiday(year, 3, nthWeekday(year, 3, 1, 2), 'Eight Hours Day'), kingsBirthday, holiday(year, 11, nthWeekday(year, 11, 1, 1), 'Recreation Day')],
    act: [...base, holiday(year, 3, nthWeekday(year, 3, 1, 2), 'Canberra Day'), holiday(year, 5, lastWeekday(year, 5, 1), 'Reconciliation Day'), kingsBirthday, holiday(year, 10, nthWeekday(year, 10, 1, 1), 'Labour Day')],
    nt: [...base, holiday(year, 5, nthWeekday(year, 5, 1, 1), 'May Day'), kingsBirthday, holiday(year, 8, nthWeekday(year, 8, 1, 1), 'Picnic Day')]
  };
  return map[region] || base;
}

function holidaysForYear(year, country, region) {
  if (!SUPPORTED_HOLIDAY_YEARS.includes(year)) return [];
  const calendars = { ca: canadaHolidays, us: usHolidays, uk: ukHolidays, au: australiaHolidays };
  const list = calendars[country] ? calendars[country](year, region) : [];
  return Array.from(new Map(list.sort(([a], [b]) => a.localeCompare(b)).map(item => [item[0], item])).values());
}

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

const helpTitle = {
  between: 'Between Dates',
  add: 'Add Days',
  subtract: 'Subtract Days',
  left: 'Left This Year',
  includeStart: 'Include start date',
  country: 'Country',
  region: 'Region',
  holidays: 'Weekends and holidays',
  numberAdd: 'Number of business days to add',
  numberSubtract: 'Number of business days to subtract'
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
  return holidaysForYear(toDate(state.startDate).getUTCFullYear(), state.country, state.region);
}
function holidayListForRange(from, to) {
  const startYear = from.getUTCFullYear();
  const endYear = to.getUTCFullYear();
  const list = [];
  for (let year = startYear; year <= endYear; year += 1) {
    list.push(...holidaysForYear(year, state.country, state.region));
  }
  return Array.from(new Map(list.sort(([a], [b]) => a.localeCompare(b)).map(item => [item[0], item])).values())
    .filter(([date]) => { const d = toDate(date); return d >= from && d <= to; });
}
function holidaySetForYear(year) { return new Set(holidaysForYear(year, state.country, state.region).map(([date]) => date)); }
function isHoliday(date) { return state.excludeHolidays && holidaySetForYear(date.getUTCFullYear()).has(toKey(date)); }
function isBusinessDay(date) { return !isWeekend(date) && !isHoliday(date); }
function inCalendarRange(date) { const year = date.getUTCFullYear(); return year >= MIN_HOLIDAY_YEAR && year <= MAX_HOLIDAY_YEAR; }
function endOfYearDate(value) { return `${toDate(value).getUTCFullYear()}-12-31`; }
function calculationRange() {
  let from = toDate(state.startDate);
  let to = state.tab === 'between' ? toDate(state.endDate) : toDate(state.startDate);
  if (state.tab === 'add') to = toDate(moveBusinessDays(1));
  if (state.tab === 'subtract') { to = toDate(state.startDate); from = toDate(moveBusinessDays(-1)); }
  if (state.tab === 'left') to = toDate(endOfYearDate(state.startDate));
  if (from > to) [from, to] = [to, from];
  return { from, to };
}
function rangeWithinCalendar(from, to) {
  for (let year = from.getUTCFullYear(); year <= to.getUTCFullYear(); year += 1) {
    if (!SUPPORTED_HOLIDAY_YEARS.includes(year)) return false;
  }
  return true;
}

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
  state.endDate = endOfYearDate(state.startDate);
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
  if (state.tab === 'left') to = toDate(endOfYearDate(state.startDate));
  if (from > to) [from, to] = [to, from];
  return holidayListForRange(from, to).filter(([date]) => !isWeekend(toDate(date))); 
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
    return { title: `${leftThisYear()} business days remaining`, body: `From ${formatDate(state.startDate)} through ${formatDate(endOfYearDate(state.startDate))}, excluding weekends${state.excludeHolidays ? ' and selected public holidays' : ''}.`, note: holidayNote(region, country, excluded) };
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
  const t = (key, label) => `<div class="tab-item ${state.tab === key ? 'active' : ''}"><button type="button" class="tab-label" data-tab="${key}">${label}</button>${InfoButton(key === 'left' ? 'left' : key)}</div>`;
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
  const { from, to } = calculationRange();
  const warning = !rangeWithinCalendar(from, to);
  return `<div class="result-panel"><span>Result</span><h2>${result.title}</h2><p>${result.body}</p><small>${result.note}</small></div>${warning ? '<div class="note">Calendar note: Holiday data currently covers 2026 and 2027. Dates outside this range may not exclude all public holidays yet.</div>' : ''}`;
}
function assumptions() {
  const region = COUNTRY_REGIONS[state.country].regions[state.region];
  const country = COUNTRY_REGIONS[state.country].label;
  return `<div class="assumptions"><h3>Included in this calculation</h3><ul><li>Weekends are excluded.</li><li>${state.excludeHolidays ? `Public holidays are excluded for ${region}, ${country}.` : 'Public holidays are not excluded.'}</li><li>Holiday data currently covers 2026 and 2027.</li><li>Business holiday rules can vary by employer, industry, city, and contract.</li></ul></div>`;
}
function holidayTable() {
  const holidays = excludedHolidaysForCurrentResult();
  if (!state.excludeHolidays || holidays.length === 0) return '';
  return `<div class="holiday-list"><h3>Holidays excluded</h3>${holidays.map(([date, name]) => `<div><span>${name}</span><strong>${fmtShort.format(toDate(date))}</strong></div>`).join('')}</div>`;
}
function infoCards() {
  return `<section class="info-grid" aria-label="Business day calculator information"><article><h3>What can this business days calculator do?</h3><p>Use it to count business days between two dates, add business days to a start date, subtract business days from a deadline, or see how many business days are left in the year.</p></article><article><h3>What counts as a business day?</h3><p>A business day usually means Monday through Friday. When holiday exclusion is turned on, selected public holidays for the chosen country and region are skipped too.</p></article><article><h3>Why use a working days calculator?</h3><p>Deadline math is easy to miscount, especially when weekends, holidays, date ranges, and start-date rules are involved. This tool shows the assumptions used in the result.</p></article><article><h3>Supported holiday calendars</h3><p>Holiday support currently includes 2026 and 2027 calendars for Canada, the United States, the United Kingdom, and Australia, with regional options included.</p></article><article><h3>Common uses</h3><p>People use business-day calculations for shipping estimates, payroll timing, invoice due dates, project deadlines, contract review periods, school deadlines, and time-off planning.</p></article><article><h3>Important note</h3><p>Business-day rules can vary by employer, industry, contract, city, or jurisdiction. Review the result before using it for legal, financial, payroll, or time-sensitive decisions.</p></article></section>`;
}
function footer() {
  return `<footer><div><strong>Exact Business Days</strong><p>Fast business-day and working-day calculations with clear assumptions.</p></div><nav aria-label="Footer navigation"><button data-route="about">About</button><button data-route="privacy">Privacy</button><button data-route="terms">Terms</button><button data-route="contact">Contact</button></nav></footer>`;
}
function staticPage(title, eyebrow, paragraphs) {
  return `<main class="page"><section class="static-page"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><div class="content-card">${paragraphs.map(p => `<p>${p}</p>`).join('')}</div></section></main>`;
}
function pageContent() {
  if (state.page === 'about') return staticPage('About Exact Business Days', 'About', ['Exact Business Days is a simple free utility for counting business days, working days, weekdays, public holidays, and deadline dates.', 'The goal is to keep the tool fast, clear, and easy to use. Every result shows what was included, what was excluded, and which assumptions were used.', 'The current version includes 2026 and 2027 regional holiday calendars for Canada, the United States, the United Kingdom, and Australia.']);
  if (state.page === 'privacy') return staticPage('Privacy Policy', 'Privacy', ['Exact Business Days is currently a simple calculator site. We do not require user accounts, and we do not ask visitors to submit personal information to use the calculator.', 'Basic technical information may be processed by hosting, security, and analytics providers to keep the site available, secure, and working properly.', 'Last updated: May 17, 2026.']);
  if (state.page === 'terms') return staticPage('Terms of Use', 'Terms', ['Exact Business Days is provided as a free informational tool. The calculator is intended to help users estimate business days, working days, weekdays, and deadline dates.', 'Results should be reviewed before being used for legal, financial, payroll, contractual, shipping, or other time-sensitive decisions. Rules can vary by jurisdiction, organization, and context.', 'Last updated: May 17, 2026.']);
  if (state.page === 'contact') return staticPage('Contact', 'Contact', ['Have feedback, a holiday correction, or a region you want supported next?', 'For now, please contact the site owner directly through the domain owner or project administrator. A dedicated contact form or email address will be added in a future update.']);
  return `<main>${hero()}${form()}${infoCards()}</main>`;
}
function helpSheet() {
  if (!state.help) return '';
  return `<div class="help-overlay" data-close-help="true"><div class="help-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><h3>${helpTitle[state.help] || 'Help'}</h3><p>${helpText[state.help]}</p><button class="sheet-close" data-close-help="true">Got it</button></div></div>`;
}
function render() {
  document.title = state.page === 'calculator' ? 'Business Days Calculator | Exact Business Days' : `${state.page.charAt(0).toUpperCase() + state.page.slice(1)} | Exact Business Days`;
  $('app').innerHTML = `${nav()}${pageContent()}${footer()}${helpSheet()}`;
  bind();
}
function bind() {
  document.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => setRoute(el.dataset.route)));
  document.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { state.tab = el.dataset.tab; state.help = null; render(); }));
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
