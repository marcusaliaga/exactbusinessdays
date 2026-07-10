import { CALENDAR_DATA } from './calendar-data.js';

const LEGACY_COUNTRY_REGIONS = {
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
      il: 'Illinois', oh: 'Ohio', ga: 'Georgia', nc: 'North Carolina', nj: 'New Jersey', mi: 'Michigan',
      va: 'Virginia', wa: 'Washington', az: 'Arizona', tn: 'Tennessee', ma: 'Massachusetts', in: 'Indiana',
      md: 'Maryland', mo: 'Missouri', co: 'Colorado'
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

const COUNTRY_REGIONS = Object.fromEntries(
  Object.entries(CALENDAR_DATA.countries).map(([countryKey, country]) => [
    countryKey,
    {
      label: country.label,
      regions: Object.fromEntries(Object.entries(country.regions).map(([regionKey, region]) => [regionKey, region.label]))
    }
  ])
);

const SUPPORTED_HOLIDAY_YEARS = CALENDAR_DATA.supportedYears;
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
    nj: [...base, relativeToEaster(year, -2, 'Good Friday'), electionDay],
    mi: [...base, dayAfterThanksgiving, holiday(year, 12, 24, 'Christmas Eve')],
    va: [...base, electionDay, dayAfterThanksgiving],
    wa: [...base, dayAfterThanksgiving],
    az: [...base, holiday(year, 2, 12, "Lincoln/Washington Presidents' Day")],
    tn: [...base, relativeToEaster(year, -2, 'Good Friday'), dayAfterThanksgiving],
    ma: [...base, holiday(year, 4, nthWeekday(year, 4, 1, 3), "Patriots' Day")],
    in: [...base, relativeToEaster(year, -2, 'Good Friday'), electionDay, dayAfterThanksgiving],
    md: [...base, dayAfterThanksgiving],
    mo: [...base, holiday(year, 5, 8, 'Truman Day'), dayAfterThanksgiving],
    co: [...base, holiday(year, 10, nthWeekday(year, 10, 1, 1), 'Frances Xavier Cabrini Day')]
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
  const countryData = CALENDAR_DATA.countries[country];
  const regionData = countryData?.regions[region] || countryData?.regions[countryData?.defaultRegion];
  return regionData?.holidays?.[year] || [];
}

const LANDING_PAGES = {
  'business-days-calculator': {
    title: 'Business Days Calculator',
    metaTitle: 'Business Days Calculator | Exact Business Days',
    description: 'Use this free business days calculator to count workdays, skip weekends, exclude public holidays, and estimate deadline dates with clear assumptions.',
    eyebrow: 'Business days calculator',
    intro: 'Count business days between dates, add business days to a start date, subtract business days from a deadline, or see how many business days are left in the year. Choose weekends-only or a regional holiday calendar for a clearer, easier-to-review result.',
    cards: [
      ['Business days made clear', 'A business day usually means Monday through Friday. With holiday exclusion turned on, the calculator also skips public holidays for the selected country and region.'],
      ['Why exact counting matters', 'Adding calendar days is not the same as adding business days. A two-week period can contain 10 weekdays, 9 business days, or fewer if a public holiday falls inside it.'],
      ['Regional holiday support', 'Holiday calendars cover 2026 and 2027 for 11 countries, including every U.S. state and Washington, DC, every German state, and regional calendars where available.'],
      ['Did you know?', 'In the United States, Independence Day is tied to July 4, 1776, when the Continental Congress adopted the Declaration of Independence. That is why July 4 is one of the federal holidays this calculator can exclude.'],
      ['Check the assumptions', 'Every result shows whether public holidays were excluded and which calendar was used, so the calculation is easier to review before you copy or share it.']
    ]
  },
  'working-days-calculator': {
    title: 'Working Days Calculator',
    metaTitle: 'Working Days Calculator | Exact Business Days',
    description: 'Calculate working days between dates, add working days, subtract working days, and exclude weekends or regional public holidays.',
    eyebrow: 'Working days calculator',
    intro: 'Use this working days calculator to estimate weekdays and holiday-adjusted workdays for planning, office deadlines, shipping windows, and administrative date questions.',
    cards: [
      ['Working days vs. calendar days', 'Working days normally exclude Saturdays and Sundays. When holidays are turned on, selected public holidays are excluded as well.'],
      ['For work and planning', 'The calculator is useful for project timelines, office deadlines, HR planning, shipping estimates, payment terms, and administrative reminders.'],
      ['Choose a region', 'Select a country and region so the result can account for local public holidays instead of using a generic weekday count.'],
      ['Did you know?', 'Many countries use the phrase bank holiday or public holiday, but the practical question is often the same: should that date count as a working day for your deadline?'],
      ['Review before relying on it', 'Employers, contracts, industries, and local rules can treat holidays differently, so important deadlines should always be reviewed.']
    ]
  },
  'add-business-days': {
    title: 'Add Business Days',
    metaTitle: 'Add Business Days to a Date | Exact Business Days',
    description: 'Add business days to a start date and find the resulting deadline while excluding weekends and selected public holidays.',
    eyebrow: 'Add business days',
    intro: 'Choose the Add days tab to count forward from a start date by a set number of business days, skipping weekends and optional public holidays.',
    tab: 'add',
    cards: [
      ['Count forward accurately', 'Instead of adding calendar days, this mode moves forward only when the next day is a business day under the selected settings.'],
      ['Good for due dates', 'Use it for response deadlines, service windows, delivery estimates, contract periods, invoice terms, and internal workback plans.'],
      ['Holidays can change the answer', 'If a public holiday falls inside the period and holiday exclusion is enabled, the deadline moves to the next valid business day.'],
      ['Did you know?', 'Thanksgiving in the United States is observed on the fourth Thursday in November. If you add business days across that week, the holiday can change the final date.'],
      ['Simple assumptions', 'The result shows the date reached and how many public holidays were excluded from the calculation.']
    ]
  },
  'business-days-between-dates': {
    title: 'Business Days Between Dates',
    metaTitle: 'Business Days Between Dates | Exact Business Days',
    description: 'Count how many business days fall between two dates, with options for start-date inclusion and public holiday exclusion.',
    eyebrow: 'Business days between dates',
    intro: 'Use the Between dates tab to count the number of business days in a date range, with clear options for weekends, holidays, and the start date.',
    tab: 'between',
    cards: [
      ['Count a full date range', 'Enter a start date and an end date to count weekdays or holiday-adjusted business days inside the range.'],
      ['Include or exclude the start date', 'The start-date toggle lets you decide whether the first date can count as day one when it is a valid business day.'],
      ['See excluded holidays', 'When public holidays are enabled, the page lists the holidays that were removed from the calculation.'],
      ['Did you know?', 'A fixed holiday can be observed on a nearby weekday when it falls on a weekend. That is why observed holidays matter for business-day math.'],
      ['Useful for comparisons', 'This mode is helpful when checking elapsed work time, PTO spans, payroll periods, project schedules, and school or office deadlines.']
    ]
  },
  'canada/business-days': {
    title: 'Canada Business Days Calculator',
    metaTitle: 'Canada Business Days Calculator | Exact Business Days',
    description: 'Calculate Canadian business days with province and territory holiday options for 2026 and 2027.',
    eyebrow: 'Canada business days',
    intro: 'Calculate business days in Canada with provincial and territorial holiday options for 2026 and 2027. Use this page when a Canadian deadline needs more than a simple weekday count.',
    country: 'ca',
    region: 'on',
    cards: [
      ['Canadian regional calendars', 'Canada holiday rules vary by province and territory, so the calculator includes regional options instead of using only one national calendar.'],
      ['Supported regions', 'Select from Alberta, British Columbia, Manitoba, New Brunswick, Newfoundland and Labrador, Nova Scotia, Northwest Territories, Nunavut, Ontario, Prince Edward Island, Quebec, Saskatchewan, and Yukon.'],
      ['Common Canadian uses', 'Use it for Canadian shipping windows, invoice timing, payroll planning, office deadlines, school calendars, and contract review periods.'],
      ['Did you know?', 'Canada Day is tied to July 1, 1867, when the Constitution Act created the Dominion of Canada. In business-day calculations, its observed date can matter when July 1 falls on a weekend.'],
      ['Important note', 'Some holidays may be treated differently depending on employer, industry, city, contract, or whether the day is federally or provincially regulated.']
    ]
  },
  'us/business-days': {
    title: 'U.S. Business Days Calculator',
    metaTitle: 'U.S. Business Days Calculator | Exact Business Days',
    description: 'Calculate U.S. business days with federal holidays and all 50 state calendars plus Washington, DC for 2026 and 2027.',
    eyebrow: 'U.S. business days',
    intro: 'Calculate business days in the United States using federal holidays or a calendar for any of the 50 states and Washington, DC for 2026 and 2027.',
    country: 'us',
    region: 'federal',
    cards: [
      ['Federal and state options', 'Use the federal holiday calendar or choose a supported state when a state-level holiday calendar is more appropriate.'],
      ['Complete U.S. state coverage', 'Choose the federal calendar, any of the 50 states, or Washington, DC. State selections combine the federal baseline with applicable state-government observances.'],
      ['Useful for deadline planning', 'Use it for U.S. payment terms, service deadlines, HR timing, shipping windows, vendor timelines, and internal schedules.'],
      ['Did you know?', 'Juneteenth became a U.S. federal holiday in 2021. It marks June 19, 1865, when news of emancipation reached enslaved people in Galveston, Texas.'],
      ['Rules can vary', 'Business-day definitions can vary by organization, contract, industry, banking practice, and state holiday observance. Review important deadlines before relying on them.']
    ]
  },
  'uk/working-days': {
    title: 'UK Working Days Calculator',
    metaTitle: 'UK Working Days Calculator | Exact Business Days',
    description: 'Calculate UK working days with England and Wales, Scotland, and Northern Ireland bank holiday options for 2026 and 2027.',
    eyebrow: 'UK working days',
    intro: 'Calculate working days in the United Kingdom with bank holiday options for England and Wales, Scotland, and Northern Ireland.',
    country: 'uk',
    region: 'england',
    cards: [
      ['UK bank holiday regions', 'The United Kingdom does not use one identical bank holiday calendar everywhere, so the calculator separates England and Wales, Scotland, and Northern Ireland.'],
      ['Working-day planning', 'Use it for UK project planning, response periods, administrative deadlines, payment terms, school or office planning, and holiday-adjusted timelines.'],
      ['Holidays listed in the result', 'When bank holidays are excluded, the calculator shows which holidays were removed from the working-day count.'],
      ['Did you know?', 'Scotland has January 2 as a bank holiday, while England and Wales do not. That is a simple example of why UK regional calendars can produce different working-day counts.'],
      ['Check official context', 'Some deadlines depend on contracts, courts, banks, employers, or sector-specific rules, so important results should be reviewed before use.']
    ]
  },
  'australia/working-days': {
    title: 'Australia Working Days Calculator',
    metaTitle: 'Australia Working Days Calculator | Exact Business Days',
    description: 'Calculate Australian working days with state and territory public holiday options for 2026 and 2027.',
    eyebrow: 'Australia working days',
    intro: 'Calculate working days in Australia with state and territory public holiday options for 2026 and 2027.',
    country: 'au',
    region: 'nsw',
    cards: [
      ['State and territory holidays', 'Australian public holidays vary by state and territory, so the calculator includes regional options rather than relying on one national calendar.'],
      ['Supported regions', 'Select from New South Wales, Victoria, Queensland, Western Australia, South Australia, Tasmania, Australian Capital Territory, and Northern Territory.'],
      ['Useful planning cases', 'Use it for Australian work schedules, delivery estimates, payment terms, HR planning, administrative deadlines, project timelines, and time-off planning.'],
      ['Did you know?', 'Australia Day is a national public holiday, but several other public holidays differ by state or territory. That is why a regional selector matters.'],
      ['Review local rules', 'Public holiday treatment can vary by state, award, employer, industry, and contract, so important calculations should be checked before use.']
    ]
  },
  'us/state-business-days': {
    title: 'U.S. State Business Days Calculator',
    metaTitle: 'U.S. State Business Days Calculator | Exact Business Days',
    description: 'Calculate business days for all 50 U.S. state holiday calendars plus Washington, DC, with 2026 and 2027 coverage.',
    eyebrow: 'U.S. state business days',
    intro: 'Use this page when a U.S. business-day calculation needs a state calendar instead of only the federal holiday calendar. Select any state or Washington, DC, then count between dates or add and subtract business days.',
    country: 'us',
    region: 'ca',
    cards: [
      ['Why state calendars matter', 'Federal holidays are a helpful baseline, but some states observe additional holidays or treat certain dates differently for public offices, courts, schools, or state employees.'],
      ['All states included', 'The calculator supports all 50 states plus Washington, DC. These are planning calendars; courts, schools, private employers, and local governments may observe different closures.'],
      ['Good for U.S. planning', 'Use it for state-aware shipping windows, office closures, vendor timelines, HR planning, invoice timing, and internal deadline checks.'],
      ['Did you know?', 'Colorado observes Frances Xavier Cabrini Day, named for the first U.S. citizen canonized as a saint. State-specific holidays like this are one reason national weekday counts can miss context.'],
      ['Use with care', 'State calendars are not the same as every employer policy. Private businesses, banks, courts, and schools may use different closure rules.']
    ]
  },
  'business-days-in-2026': {
    title: 'Business Days in 2026',
    metaTitle: 'Business Days in 2026 | Exact Business Days',
    description: 'Calculate business days in 2026 by country and region, with weekend and public holiday options for planning deadlines and work schedules.',
    eyebrow: '2026 business days',
    intro: 'Calculate business days in 2026 for the selected country or region. Use the calculator to count a full year, a quarter, a month, or any custom 2026 date range.',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    cards: [
      ['Plan the year with dates, not guesses', 'A year can have different working-day totals depending on weekends, observed holidays, and the region you choose. This page is built for 2026 date planning.'],
      ['Use it for annual planning', 'Count business days for project calendars, HR schedules, school or office planning, payroll windows, contract periods, and shipping estimates.'],
      ['Cross-check holidays', 'When holiday exclusion is enabled, the result lists holidays that fall inside the selected range and are not on a weekend.'],
      ['Did you know?', 'In 2026, U.S. Independence Day falls on a Saturday, so many federal schedules observe it on Friday, July 3. Observed dates can change deadline math.'],
      ['Choose the right range', 'For a full-year estimate, set the start date to January 1, 2026 and the end date to December 31, 2026, then choose the country and region.']
    ]
  },
  'business-days-in-2027': {
    title: 'Business Days in 2027',
    metaTitle: 'Business Days in 2027 | Exact Business Days',
    description: 'Calculate business days in 2027 by country and region, including weekends and optional public holidays.',
    eyebrow: '2027 business days',
    intro: 'Calculate business days in 2027 for forward planning, future deadlines, payment windows, and holiday-adjusted work schedules.',
    startDate: '2027-01-01',
    endDate: '2027-12-31',
    cards: [
      ['Future-year planning', 'Use 2027 coverage when a deadline, contract period, project plan, or shipping estimate reaches into next year.'],
      ['Useful for add and subtract modes', 'The Add days and Subtract days tabs can cross holidays and weekends, which makes future-year holiday coverage useful for longer deadline windows.'],
      ['Regional differences still matter', 'A 2027 calculation can change when a state, province, territory, or UK region has a holiday that the national weekday count would miss.'],
      ['Did you know?', 'In 2027, Christmas Day falls on a Saturday. For many observed-holiday calendars, that can move the recognized day away from December 25.'],
      ['Built for review', 'Every result shows the selected calendar and the holidays excluded, so a future-year result is easier to check before sharing.']
    ]
  },
  'holiday-business-days': {
    title: 'Holiday Business Days Calculator',
    metaTitle: 'Holiday Business Days Calculator | Exact Business Days',
    description: 'Calculate business days with public holidays excluded, compare weekends-only and holiday-adjusted results, and review which holidays were skipped.',
    eyebrow: 'Holiday business days',
    intro: 'Use this page when public holidays are the reason a deadline is confusing. Turn holidays on or off, select a region, and see how the excluded-holiday list changes the answer.',
    cards: [
      ['Weekend-only vs. holiday-adjusted', 'Weekends-only counts skip Saturdays and Sundays. Holiday-adjusted counts also remove selected public holidays for the chosen country and region.'],
      ['When it matters most', 'Holiday-adjusted business days are especially useful around Christmas, New Year, Thanksgiving, Easter-related holidays, and regional civic holidays.'],
      ['See the excluded dates', 'The calculator lists the holidays excluded from the current range, so you can understand why the result changed.'],
      ['Did you know?', 'Juneteenth is sometimes called the United States’ second Independence Day because it commemorates the end of slavery in the United States after news reached Galveston, Texas in 1865.'],
      ['Not every workplace closes', 'A public holiday may not be a business closure for every employer, industry, or contract. Use the result as a planning guide and verify critical deadlines.']
    ]
  },
  'business-days-from-today': {
    title: 'Business Days From Today',
    metaTitle: 'Business Days From Today Calculator | Exact Business Days',
    description: 'Find the date 5, 10, 30, 60, or 90 business days from today while skipping weekends and selected public holidays.',
    eyebrow: 'Business days from today',
    intro: 'Start with today and add a custom number of business days. The quick-reference dates below update with the selected holiday calendar.',
    tab: 'add',
    today: true,
    cards: [
      ['Common deadline windows', 'Quickly check 5, 10, 15, 30, 60, or 90 business days from today, then enter any custom number in the calculator.'],
      ['Business days are not calendar days', 'Ten business days usually span about two calendar weeks, and public holidays can extend the period further.'],
      ['A live starting point', 'The start date is set to today when this page opens, provided today is inside the supported 2026–2027 calendar range.'],
      ['Regional results', 'Select a country and region before relying on the date because public-holiday calendars differ.'],
      ['Planning use only', 'Verify legal, payroll, court, banking, and contractual deadlines with the responsible organization.']
    ]
  },
  'business-days-vs-calendar-days': {
    title: 'Business Days vs. Calendar Days',
    metaTitle: 'Business Days vs. Calendar Days Explained | Exact Business Days',
    description: 'Understand the difference between business days and calendar days, with examples and a calculator for exact deadline dates.',
    eyebrow: 'Business days explained',
    intro: 'Calendar days include every date. Business days usually exclude Saturdays, Sundays, and—when required—public holidays. Use the calculator to see how that difference changes a real deadline.',
    cards: [
      ['Calendar days', 'A calendar-day count includes weekdays, weekends, and public holidays. Seven calendar days always span one full week.'],
      ['Business days', 'A business-day count normally includes Monday through Friday and may exclude public holidays for the selected jurisdiction.'],
      ['Example: ten days', 'Ten calendar days are always ten consecutive dates. Ten business days usually span 14 calendar days before public holidays are considered.'],
      ['Start-date rules matter', 'Some instructions count the starting day as day one; others begin on the following eligible business day. Use the Include start date option to match the rule.'],
      ['Read the actual wording', 'Contracts and regulations may define “business day” differently. Always use the definition in the controlling document for important deadlines.']
    ]
  },
  'business-days-by-month': {
    title: 'Business Days by Month',
    metaTitle: 'Business Days by Month 2026–2027 | Exact Business Days',
    description: 'See business days by month for 2026 and 2027 by country and region, with public holidays and weekdays shown separately.',
    eyebrow: 'Monthly business days',
    intro: 'Compare weekdays, weekday public holidays, and resulting business days for every month in 2026 and 2027 using the selected country and region.',
    cards: [
      ['Month-by-month totals', 'The table separates raw Monday-to-Friday weekdays from weekday public holidays and final business-day totals.'],
      ['Change the region', 'Use the calculator region selector, and the monthly table updates to that calendar.'],
      ['Download the full dataset', 'CSV downloads include monthly totals for every supported region and can be opened in Excel, Google Sheets, or data tools.'],
      ['Observed dates count', 'When an official observed date falls on a weekday, it is deducted from the weekday total.'],
      ['Planning baseline', 'Employer, school, court, bank, municipal, and contract calendars may differ from official public-holiday calendars.']
    ]
  },
  'germany/working-days': {
    title: 'Germany Working Days Calculator',
    metaTitle: 'Germany Working Days Calculator | Exact Business Days',
    description: 'Calculate working days in Germany with all 16 federal-state holiday calendars for 2026 and 2027.',
    eyebrow: 'Germany working days',
    intro: 'Calculate working days in Germany with public-holiday options for all 16 federal states. Some municipal holidays are not statewide, so check important local deadlines.',
    country: 'de', region: 'be',
    cards: [
      ['All German states', 'Choose Baden-Württemberg, Bavaria, Berlin, Brandenburg, Bremen, Hamburg, Hesse, Mecklenburg-Western Pomerania, Lower Saxony, North Rhine-Westphalia, Rhineland-Palatinate, Saarland, Saxony, Saxony-Anhalt, Schleswig-Holstein, or Thuringia.'],
      ['State differences', 'German public holidays vary by federal state, so the same date range can produce different working-day totals.'],
      ['Municipal exceptions', 'A few holidays apply only in specific municipalities. The calculator uses statewide planning calendars and explains this limitation.'],
      ['Official reference', 'Coverage is reviewed against information from Germany’s Federal Ministry of the Interior.'],
      ['Verify critical dates', 'Employment agreements, local rules, and organizational closures can affect actual working days.']
    ]
  },
  'japan/business-days': {
    title: 'Japan Business Days Calculator',
    metaTitle: 'Japan Business Days Calculator | Exact Business Days',
    description: 'Calculate business days in Japan using national holidays and substitute holidays for 2026 and 2027.',
    eyebrow: 'Japan business days',
    intro: 'Calculate business days in Japan using the Cabinet Office national-holiday calendar, including published substitute holidays for 2026 and 2027.',
    country: 'jp', region: 'national',
    cards: [
      ['National holidays', 'The Japan calendar includes statutory national holidays and substitute holidays published for 2026 and 2027.'],
      ['Golden Week planning', 'Several national holidays occur close together in late April and early May, making holiday-aware calculations especially useful.'],
      ['Official reference', 'The source link points to the Cabinet Office of Japan holiday schedule.'],
      ['Business practices differ', 'Company shutdowns, banking schedules, and industry practices may add non-working dates.'],
      ['Check high-stakes deadlines', 'Confirm legal, immigration, banking, and contractual dates with the relevant authority.']
    ]
  },
  'france/working-days': {
    title: 'France Working Days Calculator',
    metaTitle: 'France Working Days Calculator | Exact Business Days',
    description: 'Calculate working days in France with national and Alsace-Moselle public-holiday options for 2026 and 2027.',
    eyebrow: 'France working days',
    intro: 'Calculate working days in France using the general national calendar or the additional holiday rules for Alsace-Moselle.',
    country: 'fr', region: 'national',
    cards: [
      ['Two calendar options', 'Choose the general France calendar or Alsace-Moselle, which includes additional regional public holidays.'],
      ['Official reference', 'Coverage is reviewed against France’s Service-Public holiday guidance.'],
      ['Weekday holidays', 'Only public holidays falling on Monday through Friday reduce the business-day total.'],
      ['Workplace differences', 'Collective agreements, sectors, and employers can treat non-working dates differently.'],
      ['Planning use', 'Verify court, legal, payroll, and contractual deadlines with the relevant organization.']
    ]
  },
  'ireland/working-days': {
    title: 'Ireland Working Days Calculator',
    metaTitle: 'Ireland Working Days Calculator | Exact Business Days',
    description: 'Calculate working days in Ireland using statutory public holidays for 2026 and 2027.',
    eyebrow: 'Ireland working days',
    intro: 'Calculate working days in Ireland using statutory public holidays for 2026 and 2027.',
    country: 'ie', region: 'national',
    cards: [
      ['Irish public holidays', 'The calendar includes Ireland’s statutory public holidays for the supported years.'],
      ['Weekend nuance', 'Holiday-benefit rules do not always mean the next weekday becomes a public holiday when the date falls on a weekend.'],
      ['Official reference', 'Coverage links to Ireland’s Workplace Relations Commission guidance.'],
      ['Useful for planning', 'Estimate office schedules, invoice terms, response windows, and project timelines.'],
      ['Confirm formal deadlines', 'Employment terms, banks, courts, and contracts may use different definitions.']
    ]
  },
  'new-zealand/working-days': {
    title: 'New Zealand Working Days Calculator',
    metaTitle: 'New Zealand Working Days Calculator | Exact Business Days',
    description: 'Calculate New Zealand working days with national and regional anniversary holidays for 2026 and 2027.',
    eyebrow: 'New Zealand working days',
    intro: 'Calculate working days in New Zealand with national public holidays and regional anniversary-day options.',
    country: 'nz', region: 'auk',
    cards: [
      ['Regional anniversary days', 'Choose a region so the calendar can include the relevant anniversary-day observance.'],
      ['Mondayisation', 'Some holidays move to a Monday or Tuesday depending on the calendar and the employee’s normal work pattern.'],
      ['Official reference', 'Coverage links to Employment New Zealand public-holiday guidance.'],
      ['Regional planning', 'The selected region can change business-day totals even when national holidays are identical.'],
      ['Verify employment rules', 'Actual employee entitlements depend on work patterns and statutory rules.']
    ]
  },
  'singapore/business-days': {
    title: 'Singapore Business Days Calculator',
    metaTitle: 'Singapore Business Days Calculator | Exact Business Days',
    description: 'Calculate Singapore business days using gazetted public holidays and substitute days for 2026 and 2027.',
    eyebrow: 'Singapore business days',
    intro: 'Calculate business days in Singapore using gazetted public holidays and published substitute days for 2026 and 2027.',
    country: 'sg', region: 'national',
    cards: [
      ['Gazetted holidays', 'The calendar uses Singapore public holidays and published substitute days for the supported years.'],
      ['Official reference', 'Coverage links to the Ministry of Manpower public-holiday schedule.'],
      ['Weekend handling', 'Saturday and Sunday are excluded by the calculator before public holidays are considered.'],
      ['Practical planning', 'Estimate business response periods, shipment windows, office schedules, and invoice dates.'],
      ['Confirm formal rules', 'Contracts, banks, employers, and government services may define deadlines differently.']
    ]
  },
  'netherlands/working-days': {
    title: 'Netherlands Working Days Calculator',
    metaTitle: 'Netherlands Working Days Calculator | Exact Business Days',
    description: 'Calculate working days in the Netherlands using official public holidays for 2026 and 2027.',
    eyebrow: 'Netherlands working days',
    intro: 'Calculate working days in the Netherlands using the official public-holiday list for 2026 and 2027.',
    country: 'nl', region: 'national',
    cards: [
      ['Public holiday list', 'The calendar includes official Dutch public holidays, including Good Friday and Liberation Day.'],
      ['Not automatically a day off', 'In the Netherlands, an official public holiday is not automatically a statutory day off for every employee.'],
      ['Official reference', 'Coverage links to Government.nl guidance.'],
      ['Agreement matters', 'Collective labour agreements and employment contracts determine many actual days off.'],
      ['Use as a baseline', 'Use the result for planning, then confirm high-stakes dates with the relevant employer or authority.']
    ]
  },
  'data/business-days-2026-2027': {
    title: 'Business Days Data 2026–2027',
    metaTitle: 'Business Days Dataset 2026–2027 | Exact Business Days',
    description: 'Download free CSV data for 2026–2027 public holidays and monthly business-day totals across 11 countries and regional calendars.',
    eyebrow: 'Open business-day data',
    intro: 'Download machine-readable holiday and business-day data for every supported country and region. The files are free to use with attribution and include transparent source notes.',
    cards: [
      ['Four CSV downloads', 'Download individual holidays, monthly totals for 2026, monthly totals for 2027, or annual summaries.'],
      ['115 calendars', 'Coverage spans 11 countries and 115 national, state, province, territory, or regional calendar selections.'],
      ['Transparent sources', 'Each country links to an official government or employment-authority reference.'],
      ['Useful for research', 'The data can support planning sheets, dashboards, deadline tools, and reproducible comparisons.'],
      ['Corrections welcome', 'Holiday rules change. Check the data notes and official source before high-stakes use.']
    ]
  },
  'embed': {
    title: 'Embed the Business Days Calculator',
    metaTitle: 'Embed a Free Business Days Calculator | Exact Business Days',
    description: 'Add the free Exact Business Days calculator to your website with a simple responsive iframe embed.',
    eyebrow: 'Free calculator embed',
    intro: 'Add a compact, responsive business-days calculator to a resource page, intranet, or planning guide. No API key or account is required.',
    cards: [
      ['Simple iframe', 'Copy one small HTML snippet and paste it into a page that accepts iframe embeds.'],
      ['Responsive layout', 'The widget is designed to fit narrow and wide content areas.'],
      ['Visible attribution', 'The example includes a normal, visible source link so visitors can open the full calculator and review the methodology.'],
      ['No hidden SEO tricks', 'The embed uses ordinary visible attribution and does not require keyword-stuffed or hidden links.'],
      ['Free utility', 'The widget is provided for informational planning and remains subject to the site terms.']
    ]
  }
};
const ROUTES = ['about', 'privacy', 'terms', 'contact', 'methodology', 'holiday-data', ...Object.keys(LANDING_PAGES)];

function routeToPage() {
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '').toLowerCase();
  return ROUTES.includes(path) ? path : 'calculator';
}

function isValidDateValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (['between', 'add', 'subtract', 'left'].includes(mode)) state.tab = mode;

  const start = params.get('start');
  if (start && isValidDateValue(start)) state.startDate = start;

  const end = params.get('end');
  if (end && isValidDateValue(end)) state.endDate = end;

  const days = Number(params.get('days'));
  if (Number.isFinite(days) && days >= 0) state.days = Math.min(9999, Math.floor(days));

  const country = params.get('country');
  if (country && COUNTRY_REGIONS[country]) state.country = country;

  const region = params.get('region');
  if (region && COUNTRY_REGIONS[state.country].regions[region]) state.region = region;

  const holidays = params.get('holidays');
  if (holidays === '0' || holidays === 'false') state.excludeHolidays = false;
  if (holidays === '1' || holidays === 'true') state.excludeHolidays = true;

  const includeStart = params.get('includeStart');
  if (includeStart === '0' || includeStart === 'false') state.includeStart = false;
  if (includeStart === '1' || includeStart === 'true') state.includeStart = true;

  state.embed = params.get('embed') === '1';
}

function calculationUrl() {
  const params = new URLSearchParams();
  params.set('mode', state.tab);
  params.set('start', state.startDate);
  if (state.tab === 'between') params.set('end', state.endDate);
  if (state.tab === 'add' || state.tab === 'subtract') params.set('days', String(state.days));
  params.set('country', state.country);
  params.set('region', state.region);
  params.set('holidays', state.excludeHolidays ? '1' : '0');
  if (state.tab === 'between') params.set('includeStart', state.includeStart ? '1' : '0');
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function defaultStartDate() {
  const today = new Date();
  const year = today.getFullYear();
  return SUPPORTED_HOLIDAY_YEARS.includes(year) ? today.toISOString().slice(0, 10) : `${MIN_HOLIDAY_YEAR}-01-01`;
}

let state = {
  page: routeToPage(),
  tab: 'between',
  startDate: defaultStartDate(),
  endDate: '2026-12-31',
  days: 10,
  includeStart: true,
  country: 'ca',
  region: 'on',
  excludeHolidays: true,
  embed: false,
  help: null,
  toast: null
};

function applyLandingDefaults(page) {
  const landing = LANDING_PAGES[page];
  if (!landing) return;
  if (landing.tab) state.tab = landing.tab;
  if (landing.today) state.startDate = defaultStartDate();
  if (landing.startDate) state.startDate = landing.startDate;
  if (landing.endDate) state.endDate = landing.endDate;
  if (landing.country) state.country = landing.country;
  if (landing.region) state.region = landing.region;
}
applyLandingDefaults(state.page);
applyQueryParams();

function setRoute(page) {
  state.page = page;
  applyLandingDefaults(page);
  const path = page === 'calculator' ? '/' : `/${page}/`;
  history.pushState({}, '', path);
  render();
}
window.addEventListener('popstate', () => { state.page = routeToPage(); applyLandingDefaults(state.page); applyQueryParams(); render(); });

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

function isBusinessDayFor(date, country, region, excludeHolidays = true) {
  if (isWeekend(date)) return false;
  if (!excludeHolidays) return true;
  return !new Set(holidaysForYear(date.getUTCFullYear(), country, region).map(([holidayDate]) => holidayDate)).has(toKey(date));
}

function moveBusinessDaysFor(startValue, amount, country, region) {
  let cursor = toDate(startValue);
  let moved = 0;
  while (moved < amount) {
    cursor = addDays(cursor, 1);
    if (isBusinessDayFor(cursor, country, region, true)) moved += 1;
  }
  return toKey(cursor);
}
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

function resultText() {
  const result = currentResult();
  const region = COUNTRY_REGIONS[state.country].regions[state.region];
  const country = COUNTRY_REGIONS[state.country].label;
  return `${result.title}. ${result.body} ${result.note} Calendar: ${region}, ${country}. Calculated with ExactBusinessDays.com.`;
}

function copyText(value, message) {
  const done = () => { state.toast = message; render(); window.setTimeout(() => { state.toast = null; render(); }, 2200); };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done));
  } else {
    fallbackCopy(value, done);
  }
}

function fallbackCopy(value, done) {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  done();
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
  return `<div class="result-panel" aria-live="polite"><div class="result-header"><span>Result</span><div class="result-actions"><button type="button" data-copy-result>Copy result</button><button type="button" data-copy-link>Copy link</button></div></div><h2>${result.title}</h2><p>${result.body}</p><small>${result.note}</small>${state.toast ? `<div class="copy-toast">${state.toast}</div>` : ''}</div>${warning ? '<div class="note">Calendar note: Holiday data currently covers 2026 and 2027. Dates outside this range may not exclude all public holidays yet.</div>' : ''}`;
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
  return `<section class="info-grid" aria-label="Business day calculator information"><article><h3>What can this business days calculator do?</h3><p>Use it to count business days between two dates, add business days to a start date, subtract business days from a deadline, or see how many business days are left in the year.</p></article><article><h3>What counts as a business day?</h3><p>A business day usually means Monday through Friday. When holiday exclusion is turned on, selected public holidays for the chosen country and region are skipped too.</p></article><article><h3>Why use a working days calculator?</h3><p>Deadline math is easy to miscount, especially when weekends, holidays, date ranges, and start-date rules are involved. This tool shows the assumptions used in the result.</p></article><article><h3>Supported holiday calendars</h3><p>Holiday support includes 2026 and 2027 calendars for 11 countries and 115 regional selections, including all U.S. states and all German states.</p></article><article><h3>Common uses</h3><p>People use business-day calculations for shipping estimates, payroll timing, invoice due dates, project deadlines, contract review periods, school deadlines, and time-off planning.</p></article><article><h3>Important note</h3><p>Business-day rules can vary by employer, industry, contract, city, or jurisdiction. Review the result before using it for legal, financial, payroll, or time-sensitive decisions.</p></article></section>`;
}
function footer() {
  return `<footer><div><strong>Exact Business Days</strong><p>Fast business-day and working-day calculations with clear assumptions.</p></div><nav aria-label="Footer navigation"><button data-route="about">About</button><button data-route="privacy">Privacy</button><button data-route="terms">Terms</button><button data-route="contact">Contact</button></nav></footer>`;
}
function landingHero(page) {
  return `<section class="hero"><div class="eyebrow">${page.eyebrow}</div><h1>${page.title}</h1><p>${page.intro}</p></section>`;
}
function landingCards(page) {
  return `<section class="info-grid" aria-label="${esc(page.title)} information">${page.cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join('')}</section>`;
}
function faqItems(page) {
  const regionPhrase = page.country ? 'the selected country and region' : 'the selected country or region';
  return [
    [`What is included in the ${page.title.toLowerCase()}?`, `The calculator excludes weekends and can also exclude public holidays for ${regionPhrase}. The result shows the assumption used in the calculation.`],
    ['Are public holidays excluded automatically?', 'Public holidays are excluded when the Weekends + holidays option is turned on. You can switch to Weekends only if you want a weekday-only count.'],
    ['Can I share or copy the result?', 'Yes. Use Copy result for the plain answer, or Copy link to share the same calculation settings with someone else.'],
    ['Should I use this for legal or payroll deadlines?', 'Use the calculator as a helpful planning tool, but review important deadlines because business-day rules can vary by employer, contract, industry, city, and jurisdiction.']
  ];
}

function landingFaq(page) {
  const items = faqItems(page);
  return `<section class="faq-section" aria-label="Frequently asked questions"><h2>Frequently asked questions</h2>${items.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}</section>`;
}

function sourceSection(page) {
  if (!page.country) return '';
  const country = CALENDAR_DATA.countries[page.country];
  return `<section class="source-card"><h2>Holiday calendar source</h2><p>${esc(country.coverageNote)}</p><p><a href="${esc(country.sourceUrl)}" rel="noopener noreferrer" target="_blank">${esc(country.sourceName)}</a></p><small>Calendar data prepared July 10, 2026 for the 2026 and 2027 supported years.</small></section>`;
}

function monthlyTotals(year, country, region) {
  const holidayDates = new Set(holidaysForYear(year, country, region).map(([date]) => date));
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    let weekdays = 0;
    let weekdayHolidays = 0;
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(Date.UTC(year, index, day));
      if (!isWeekend(date)) {
        weekdays += 1;
        if (holidayDates.has(toKey(date))) weekdayHolidays += 1;
      }
    }
    return { month, weekdays, weekdayHolidays, businessDays: weekdays - weekdayHolidays };
  });
}

function businessDaysByMonthSection() {
  const country = COUNTRY_REGIONS[state.country].label;
  const region = COUNTRY_REGIONS[state.country].regions[state.region];
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });
  const table = (year) => `<div class="data-table-wrap"><h3>${year}</h3><table class="data-table"><thead><tr><th>Month</th><th>Weekdays</th><th>Weekday holidays</th><th>Business days</th></tr></thead><tbody>${monthlyTotals(year, state.country, state.region).map(row => `<tr><td>${monthName.format(new Date(Date.UTC(year, row.month - 1, 1)))}</td><td>${row.weekdays}</td><td>${row.weekdayHolidays}</td><td><strong>${row.businessDays}</strong></td></tr>`).join('')}</tbody></table></div>`;
  return `<section class="source-card"><h2>Monthly totals for ${esc(region)}, ${esc(country)}</h2><p>Business days equal Monday-to-Friday weekdays minus the public holidays that fall on a weekday.</p><div class="year-tables">${SUPPORTED_HOLIDAY_YEARS.map(table).join('')}</div><p><a href="/data/business-days-by-month-2026.csv" download>Download all regions for 2026 (CSV)</a> · <a href="/data/business-days-by-month-2027.csv" download>Download all regions for 2027 (CSV)</a></p></section>`;
}

function quickDatesSection() {
  const offsets = [5, 10, 15, 30, 60, 90];
  const country = COUNTRY_REGIONS[state.country].label;
  const region = COUNTRY_REGIONS[state.country].regions[state.region];
  return `<section class="source-card"><h2>Common dates from ${esc(formatDate(state.startDate))}</h2><p>These dates skip weekends and public holidays for ${esc(region)}, ${esc(country)}.</p><div class="quick-date-grid">${offsets.map(days => `<div><strong>${days} business days</strong><span>${esc(formatDate(moveBusinessDaysFor(state.startDate, days, state.country, state.region)))}</span></div>`).join('')}</div></section>`;
}

function dataHubSection() {
  const sourceRows = Object.values(CALENDAR_DATA.countries).map(country => `<tr><td>${esc(country.label)}</td><td>${Object.keys(country.regions).length}</td><td><a href="${esc(country.sourceUrl)}" rel="noopener noreferrer" target="_blank">Official source</a></td><td>${esc(country.coverageNote)}</td></tr>`).join('');
  return `<section class="source-card"><h2>Download the data</h2><div class="download-grid">
    <a href="/data/holidays-2026-2027.csv" download><strong>Holiday dates</strong><span>All 2026–2027 holiday records</span></a>
    <a href="/data/business-days-by-month-2026.csv" download><strong>Monthly totals: 2026</strong><span>Every supported region</span></a>
    <a href="/data/business-days-by-month-2027.csv" download><strong>Monthly totals: 2027</strong><span>Every supported region</span></a>
    <a href="/data/business-days-summary-2026-2027.csv" download><strong>Annual summaries</strong><span>Weekdays, holidays, and business days</span></a>
  </div><h2>Coverage and official references</h2><div class="data-table-wrap"><table class="data-table source-table"><thead><tr><th>Country</th><th>Calendars</th><th>Reference</th><th>Coverage note</th></tr></thead><tbody>${sourceRows}</tbody></table></div><p class="data-note">Prepared July 10, 2026. This is a planning dataset, not legal advice. Official rules, employer schedules, local observances, and later government changes can alter the dates that apply to a specific situation.</p></section>`;
}

const EMBED_CODE = `<iframe src="https://exactbusinessdays.com/?embed=1" title="Business Days Calculator" loading="lazy" style="width:100%;height:960px;border:0;border-radius:18px" referrerpolicy="strict-origin-when-cross-origin"></iframe>\n<p><a href="https://exactbusinessdays.com/">Business Days Calculator by Exact Business Days</a></p>`;

function embedSection() {
  return `<section class="source-card"><h2>Preview</h2><div class="embed-preview"><iframe src="/?embed=1" title="Business Days Calculator preview" loading="lazy"></iframe></div><h2>Copy this embed code</h2><pre class="code-block"><code>${esc(EMBED_CODE)}</code></pre><button class="copy-code" type="button" data-copy-embed>Copy embed code</button><p class="data-note">Keep the attribution visible and place the widget only on pages where it is useful to readers. The calculator does not create legal, payroll, or contractual advice.</p></section>`;
}

function specialLandingSection() {
  if (state.page === 'business-days-from-today') return quickDatesSection();
  if (state.page === 'business-days-by-month') return businessDaysByMonthSection();
  if (state.page === 'data/business-days-2026-2027') return dataHubSection();
  if (state.page === 'embed') return embedSection();
  return '';
}

function internalLinks() {
  return `<section class="info-grid" aria-label="Popular business day calculator pages">
    <article>
      <h3>Popular calculators</h3>
      <p>Choose a focused calculator page for common business-day and working-day questions.</p>
      <ul class="link-list">
        <li><a href="/">Business Days Calculator</a></li>
        <li><a href="/working-days-calculator/">Working Days Calculator</a></li>
        <li><a href="/add-business-days/">Add Business Days</a></li>
        <li><a href="/business-days-between-dates/">Business Days Between Dates</a></li>
        <li><a href="/holiday-business-days/">Holiday Business Days</a></li>
        <li><a href="/business-days-from-today/">Business Days From Today</a></li>
        <li><a href="/business-days-vs-calendar-days/">Business Days vs. Calendar Days</a></li>
      </ul>
    </article>
    <article>
      <h3>Planning by year</h3>
      <p>Use a year-focused page when you are checking annual schedules or future deadline windows.</p>
      <ul class="link-list">
        <li><a href="/business-days-in-2026/">Business Days in 2026</a></li>
        <li><a href="/business-days-in-2027/">Business Days in 2027</a></li>
        <li><a href="/us/state-business-days/">U.S. State Business Days</a></li>
        <li><a href="/business-days-by-month/">Business Days by Month</a></li>
      </ul>
    </article>
    <article>
      <h3>Calculators by country</h3>
      <p>Use a country page when regional public holidays matter for your deadline or planning calculation.</p>
      <ul class="link-list">
        <li><a href="/canada/business-days/">Canada Business Days</a></li>
        <li><a href="/us/business-days/">U.S. Business Days</a></li>
        <li><a href="/uk/working-days/">UK Working Days</a></li>
        <li><a href="/australia/working-days/">Australia Working Days</a></li>
        <li><a href="/germany/working-days/">Germany Working Days</a></li>
        <li><a href="/japan/business-days/">Japan Business Days</a></li>
        <li><a href="/france/working-days/">France Working Days</a></li>
        <li><a href="/ireland/working-days/">Ireland Working Days</a></li>
        <li><a href="/new-zealand/working-days/">New Zealand Working Days</a></li>
        <li><a href="/singapore/business-days/">Singapore Business Days</a></li>
        <li><a href="/netherlands/working-days/">Netherlands Working Days</a></li>
      </ul>
    </article>
    <article>
      <h3>Trust and data</h3>
      <p>Review how calculations are handled and which holiday calendars are currently covered.</p>
      <ul class="link-list">
        <li><a href="/methodology/">Calculation Methodology</a></li>
        <li><a href="/holiday-data/">Holiday Data Coverage</a></li>
        <li><a href="/data/business-days-2026-2027/">Download Business Days Data</a></li>
        <li><a href="/embed/">Embed the Calculator</a></li>
      </ul>
    </article>
  </section>`;
}
function landingPage(page) {
  const calculator = ['data/business-days-2026-2027', 'embed'].includes(state.page) ? '' : form();
  return `<main>${landingHero(page)}${calculator}${specialLandingSection()}${sourceSection(page)}${landingCards(page)}${landingFaq(page)}${internalLinks()}</main>`;
}
function staticPage(title, eyebrow, paragraphs) {
  return `<main class="page"><section class="static-page"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><div class="content-card">${paragraphs.map(p => `<p>${p}</p>`).join('')}</div></section></main>`;
}
function pageContent() {
  if (state.embed) return `<main class="embed-shell">${form()}<p class="embed-credit"><a href="https://exactbusinessdays.com/" target="_blank" rel="noopener">Open the full Exact Business Days calculator</a></p></main>`;
  if (state.page === 'about') return staticPage('About Exact Business Days', 'About', ['Exact Business Days is a simple free utility for counting business days, working days, weekdays, public holidays, and deadline dates.', 'The goal is to keep the tool fast, clear, and easy to use. Every result shows what was included, what was excluded, and which assumptions were used.', 'The current version includes 2026 and 2027 calendars for 11 countries and 115 regional selections, including all 50 U.S. states plus Washington, DC and all 16 German states.']);
  if (state.page === 'privacy') return staticPage('Privacy Policy', 'Privacy', ['Exact Business Days is currently a simple calculator site. We do not require user accounts, and we do not ask visitors to submit personal information to use the calculator.', 'Basic technical information may be processed by hosting, security, and analytics providers to keep the site available, secure, and working properly.', 'Last updated: May 17, 2026.']);
  if (state.page === 'terms') return staticPage('Terms of Use', 'Terms', ['Exact Business Days is provided as a free informational tool. The calculator is intended to help users estimate business days, working days, weekdays, and deadline dates.', 'Results should be reviewed before being used for legal, financial, payroll, contractual, shipping, or other time-sensitive decisions. Rules can vary by jurisdiction, organization, and context.', 'Last updated: May 17, 2026.']);
  if (state.page === 'contact') return staticPage('Contact', 'Contact', ['Have feedback, a holiday correction, or a region you want supported next?', 'For now, please contact the site owner directly through the domain owner or project administrator. A dedicated contact form or email address will be added in a future update.']);
  if (state.page === 'methodology') return staticPage('How Exact Business Days Calculates Working Days', 'Methodology', ['Exact Business Days counts business days by moving through each calendar date in the selected range or direction and checking whether that date is eligible to count.', 'Saturdays and Sundays are excluded by default. When Weekends + holidays is selected, public holidays from the selected country and region are excluded too.', 'The Include start date option controls whether the first date can count as day one when it is itself a valid business day. Add days and Subtract days move forward or backward until the requested number of eligible business days has been reached.', 'Holiday calendars are generated for 2026 and 2027, cross-checked against the linked government sources, and frozen into the site build so calculations do not depend on a third-party API at runtime.', 'Observed dates and substitute holidays are included where the source calendar provides them. Weekend holidays remain in the data for transparency but do not reduce a Monday-to-Friday total unless an observed weekday is also listed.', 'Business-day definitions can vary by employer, contract, industry, bank, court, city, province, state, territory, or country. Use the result as a planning tool and review important legal, payroll, financial, shipping, or contractual deadlines before relying on them.']);
  if (state.page === 'holiday-data') return `<main class="page"><section class="static-page"><div class="eyebrow">Holiday data</div><h1>Holiday Data Coverage</h1><div class="content-card"><p>Exact Business Days supports 2026 and 2027 holiday calendars for 11 countries and 115 national or regional selections.</p><p>The United States includes the federal calendar, all 50 states, and Washington, DC. Germany includes all 16 federal states. Canada, the United Kingdom, Australia, France, and New Zealand include regional choices where relevant.</p><p>Japan, Ireland, Singapore, and the Netherlands use national calendars. Some holidays, local observances, employer closures, and employee entitlements can differ from the planning calendar shown here.</p><p>Data was prepared July 10, 2026. Review the official sources and coverage notes below before high-stakes use.</p></div></section>${dataHubSection()}</main>`;
  if (LANDING_PAGES[state.page]) return landingPage(LANDING_PAGES[state.page]);
  return `<main>${hero()}${form()}${infoCards()}${internalLinks()}</main>`;
}
function helpSheet() {
  if (!state.help) return '';
  return `<div class="help-overlay" data-close-help="true"><div class="help-sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><h3>${helpTitle[state.help] || 'Help'}</h3><p>${helpText[state.help]}</p><button class="sheet-close" data-close-help="true">Got it</button></div></div>`;
}
function pageMeta() {
  if (LANDING_PAGES[state.page]) {
    const page = LANDING_PAGES[state.page];
    return { title: page.metaTitle, description: page.description, canonical: `https://exactbusinessdays.com/${state.page}/` };
  }
  const staticMeta = {
    about: ['About Exact Business Days | Exact Business Days', 'Learn about Exact Business Days, a free business-day and working-day calculator with clear assumptions.'],
    privacy: ['Privacy Policy | Exact Business Days', 'Read the privacy policy for Exact Business Days.'],
    terms: ['Terms of Use | Exact Business Days', 'Read the terms of use for Exact Business Days.'],
    contact: ['Contact | Exact Business Days', 'Contact Exact Business Days with feedback, corrections, or supported-region suggestions.'],
    methodology: ['How Exact Business Days Calculates Working Days | Exact Business Days', 'Learn the calculation method used by Exact Business Days, including weekends, public holidays, regional calendars, date ranges, and important limitations.'],
    'holiday-data': ['Holiday Data Coverage | Exact Business Days', 'See which countries, regions, and years are currently supported by the Exact Business Days holiday calendar.']
  };
  if (staticMeta[state.page]) return { title: staticMeta[state.page][0], description: staticMeta[state.page][1], canonical: `https://exactbusinessdays.com/${state.page}/` };
  return { title: 'Business Days Calculator | Exact Business Days', description: 'Count business days, working days, weekdays, public holidays, and deadline dates with clear assumptions.', canonical: 'https://exactbusinessdays.com/' };
}
function setMetaTag(selector, attr, value) {
  const tag = document.querySelector(selector);
  if (tag) tag.setAttribute(attr, value);
}
function updateMeta() {
  const meta = pageMeta();
  document.title = meta.title;
  setMetaTag('meta[name="description"]', 'content', meta.description);
  setMetaTag('link[rel="canonical"]', 'href', meta.canonical);
  setMetaTag('meta[property="og:title"]', 'content', meta.title);
  setMetaTag('meta[property="og:description"]', 'content', meta.description);
  setMetaTag('meta[property="og:url"]', 'content', meta.canonical);
}
function render() {
  updateMeta();
  document.body.classList.toggle('embed-mode', state.embed);
  $('app').innerHTML = state.embed ? `${pageContent()}${helpSheet()}` : `${nav()}${pageContent()}${footer()}${helpSheet()}`;
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
  const country = $('country'); if (country) country.addEventListener('change', () => { state.country = country.value; state.region = CALENDAR_DATA.countries[state.country].defaultRegion; render(); });
  const region = $('region'); if (region) region.addEventListener('change', () => { state.region = region.value; render(); });
  const holidays = $('excludeHolidays'); if (holidays) holidays.addEventListener('change', () => { state.excludeHolidays = holidays.checked; render(); });
  const copyResult = document.querySelector('[data-copy-result]');
  if (copyResult) copyResult.addEventListener('click', () => copyText(resultText(), 'Result copied.'));
  const copyLink = document.querySelector('[data-copy-link]');
  if (copyLink) copyLink.addEventListener('click', () => copyText(calculationUrl(), 'Share link copied.'));
  const copyEmbed = document.querySelector('[data-copy-embed]');
  if (copyEmbed) copyEmbed.addEventListener('click', () => copyText(EMBED_CODE, 'Embed code copied.'));
}

render();
