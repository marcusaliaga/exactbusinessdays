import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";

type Mode = "between" | "add" | "subtract" | "remaining";
type Page = "home" | "about" | "privacy" | "terms" | "contact";

type Holiday = {
  date: string;
  name: string;
};

type Region = {
  name: string;
  holidays: Holiday[];
};

type Country = {
  name: string;
  regions: Record<string, Region>;
};

const BASE_URL = "https://exactbusinessdays.com";

const US_FEDERAL_2026: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-19", name: "Martin Luther King Jr. Day" },
  { date: "2026-02-16", name: "Washington's Birthday" },
  { date: "2026-05-25", name: "Memorial Day" },
  { date: "2026-06-19", name: "Juneteenth National Independence Day" },
  { date: "2026-07-03", name: "Independence Day, observed" },
  { date: "2026-09-07", name: "Labor Day" },
  { date: "2026-10-12", name: "Columbus Day" },
  { date: "2026-11-11", name: "Veterans Day" },
  { date: "2026-11-26", name: "Thanksgiving Day" },
  { date: "2026-12-25", name: "Christmas Day" },
];

const CANADA_FEDERAL_2026: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-05-18", name: "Victoria Day" },
  { date: "2026-07-01", name: "Canada Day" },
  { date: "2026-09-07", name: "Labour Day" },
  { date: "2026-09-30", name: "National Day for Truth and Reconciliation" },
  { date: "2026-10-12", name: "Thanksgiving Day" },
  { date: "2026-11-11", name: "Remembrance Day" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-28", name: "Boxing Day, observed" },
];

const UK_ENGLAND_WALES_2026: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-05-04", name: "Early May bank holiday" },
  { date: "2026-05-25", name: "Spring bank holiday" },
  { date: "2026-08-31", name: "Summer bank holiday" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-28", name: "Boxing Day, substitute day" },
];

const UK_SCOTLAND_2026: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-02", name: "2nd January" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-05-04", name: "Early May bank holiday" },
  { date: "2026-05-25", name: "Spring bank holiday" },
  { date: "2026-08-03", name: "Summer bank holiday" },
  { date: "2026-11-30", name: "St Andrew's Day" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-28", name: "Boxing Day, substitute day" },
];

const UK_NORTHERN_IRELAND_2026: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-03-17", name: "St Patrick's Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-05-04", name: "Early May bank holiday" },
  { date: "2026-05-25", name: "Spring bank holiday" },
  { date: "2026-07-13", name: "Battle of the Boyne, substitute day" },
  { date: "2026-08-31", name: "Summer bank holiday" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-28", name: "Boxing Day, substitute day" },
];

const AU_NATIONAL_2026: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-26", name: "Australia Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-04-25", name: "Anzac Day" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-28", name: "Boxing Day, substitute day" },
];

function combine(...groups: Holiday[][]): Holiday[] {
  const map = new Map<string, string>();
  for (const group of groups) {
    for (const holiday of group) {
      if (!map.has(holiday.date)) {
        map.set(holiday.date, holiday.name);
      }
    }
  }
  return Array.from(map.entries())
    .map(([date, name]) => ({ date, name }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const HOLIDAY_DATA: Record<string, Country> = {
  ca: {
    name: "Canada",
    regions: {
      federal: { name: "Federal", holidays: CANADA_FEDERAL_2026 },
      ab: {
        name: "Alberta",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Family Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-08-03", name: "Heritage Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      bc: {
        name: "British Columbia",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Family Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-08-03", name: "British Columbia Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-09-30", name: "National Day for Truth and Reconciliation" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      mb: {
        name: "Manitoba",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Louis Riel Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-09-30", name: "National Day for Truth and Reconciliation" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      nb: {
        name: "New Brunswick",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Family Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-08-03", name: "New Brunswick Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
            { date: "2026-12-28", name: "Boxing Day, observed" },
          ]
        ),
      },
      nl: {
        name: "Newfoundland and Labrador",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-07-01", name: "Memorial Day and Canada Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      nt: {
        name: "Northwest Territories",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-06-22", name: "National Indigenous Peoples Day, observed" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-08-03", name: "Civic Holiday" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-09-30", name: "National Day for Truth and Reconciliation" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      ns: {
        name: "Nova Scotia",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Nova Scotia Heritage Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-09-30", name: "National Day for Truth and Reconciliation" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
            { date: "2026-12-28", name: "Boxing Day, observed" },
          ]
        ),
      },
      nu: {
        name: "Nunavut",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-07-09", name: "Nunavut Day" },
            { date: "2026-08-03", name: "Civic Holiday" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-09-30", name: "National Day for Truth and Reconciliation" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      on: {
        name: "Ontario",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Family Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-12-25", name: "Christmas Day" },
            { date: "2026-12-28", name: "Boxing Day, observed" },
          ]
        ),
      },
      pe: {
        name: "Prince Edward Island",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Islander Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
            { date: "2026-12-28", name: "Boxing Day, observed" },
          ]
        ),
      },
      qc: {
        name: "Quebec",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "National Patriots' Day" },
            { date: "2026-06-24", name: "Saint-Jean-Baptiste Day" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      sk: {
        name: "Saskatchewan",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-16", name: "Family Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-08-03", name: "Saskatchewan Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
      yt: {
        name: "Yukon",
        holidays: combine(
          [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-02-20", name: "Yukon Heritage Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-05-18", name: "Victoria Day" },
            { date: "2026-06-22", name: "National Indigenous Peoples Day, observed" },
            { date: "2026-07-01", name: "Canada Day" },
            { date: "2026-08-17", name: "Discovery Day" },
            { date: "2026-09-07", name: "Labour Day" },
            { date: "2026-09-30", name: "National Day for Truth and Reconciliation" },
            { date: "2026-10-12", name: "Thanksgiving Day" },
            { date: "2026-11-11", name: "Remembrance Day" },
            { date: "2026-12-25", name: "Christmas Day" },
          ]
        ),
      },
    },
  },
  us: {
    name: "United States",
    regions: {
      federal: { name: "Federal", holidays: US_FEDERAL_2026 },
      ca: { name: "California", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-03-31", name: "Cesar Chavez Day" },
        { date: "2026-11-27", name: "Day after Thanksgiving" },
      ]) },
      tx: { name: "Texas", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-03-02", name: "Texas Independence Day" },
        { date: "2026-04-21", name: "San Jacinto Day" },
        { date: "2026-08-27", name: "Lyndon B. Johnson Day" },
        { date: "2026-11-27", name: "Day after Thanksgiving" },
      ]) },
      fl: { name: "Florida", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-04-03", name: "Good Friday" },
        { date: "2026-11-27", name: "Day after Thanksgiving" },
      ]) },
      ny: { name: "New York", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-02-12", name: "Lincoln's Birthday" },
        { date: "2026-11-03", name: "Election Day" },
      ]) },
      pa: { name: "Pennsylvania", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-04-03", name: "Good Friday" },
        { date: "2026-11-03", name: "Election Day" },
        { date: "2026-11-27", name: "Day after Thanksgiving" },
      ]) },
      il: { name: "Illinois", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-02-12", name: "Lincoln's Birthday" },
        { date: "2026-03-02", name: "Casimir Pulaski Day" },
        { date: "2026-11-03", name: "Election Day" },
        { date: "2026-11-27", name: "Day after Thanksgiving" },
      ]) },
      oh: { name: "Ohio", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-11-27", name: "Day after Thanksgiving" },
      ]) },
      ga: { name: "Georgia", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-04-03", name: "Good Friday" },
        { date: "2026-11-27", name: "State Holiday" },
      ]) },
      nc: { name: "North Carolina", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-04-03", name: "Good Friday" },
        { date: "2026-11-27", name: "Day after Thanksgiving" },
        { date: "2026-12-24", name: "Christmas Eve" },
      ]) },
      nj: { name: "New Jersey", holidays: combine(US_FEDERAL_2026, [
        { date: "2026-04-03", name: "Good Friday" },
        { date: "2026-11-03", name: "Election Day" },
        { date: "2026-11-27", name: "Day after Thanksgiving" },
      ]) },
    },
  },
  uk: {
    name: "United Kingdom",
    regions: {
      england_wales: { name: "England and Wales", holidays: UK_ENGLAND_WALES_2026 },
      scotland: { name: "Scotland", holidays: UK_SCOTLAND_2026 },
      northern_ireland: { name: "Northern Ireland", holidays: UK_NORTHERN_IRELAND_2026 },
    },
  },
  au: {
    name: "Australia",
    regions: {
      national: { name: "National", holidays: AU_NATIONAL_2026 },
      act: { name: "Australian Capital Territory", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-03-09", name: "Canberra Day" },
        { date: "2026-04-04", name: "Easter Saturday" },
        { date: "2026-04-05", name: "Easter Sunday" },
        { date: "2026-04-27", name: "Anzac Day, observed" },
        { date: "2026-05-25", name: "Reconciliation Day" },
        { date: "2026-06-08", name: "King's Birthday" },
        { date: "2026-10-05", name: "Labour Day" },
      ]) },
      nsw: { name: "New South Wales", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-04-04", name: "Easter Saturday" },
        { date: "2026-04-05", name: "Easter Sunday" },
        { date: "2026-04-27", name: "Anzac Day, observed" },
        { date: "2026-06-08", name: "King's Birthday" },
        { date: "2026-10-05", name: "Labour Day" },
      ]) },
      nt: { name: "Northern Territory", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-05-04", name: "May Day" },
        { date: "2026-06-08", name: "King's Birthday" },
        { date: "2026-08-03", name: "Picnic Day" },
      ]) },
      qld: { name: "Queensland", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-04-04", name: "Easter Saturday" },
        { date: "2026-04-05", name: "Easter Sunday" },
        { date: "2026-05-04", name: "Labour Day" },
        { date: "2026-10-05", name: "King's Birthday" },
      ]) },
      sa: { name: "South Australia", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-03-09", name: "Adelaide Cup Day" },
        { date: "2026-04-04", name: "Easter Saturday" },
        { date: "2026-06-08", name: "King's Birthday" },
        { date: "2026-10-05", name: "Labour Day" },
        { date: "2026-12-24", name: "Christmas Eve" },
      ]) },
      tas: { name: "Tasmania", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-03-09", name: "Eight Hours Day" },
        { date: "2026-06-08", name: "King's Birthday" },
        { date: "2026-11-02", name: "Recreation Day" },
      ]) },
      vic: { name: "Victoria", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-03-09", name: "Labour Day" },
        { date: "2026-04-04", name: "Easter Saturday" },
        { date: "2026-04-05", name: "Easter Sunday" },
        { date: "2026-06-08", name: "King's Birthday" },
        { date: "2026-11-03", name: "Melbourne Cup Day" },
      ]) },
      wa: { name: "Western Australia", holidays: combine(AU_NATIONAL_2026, [
        { date: "2026-03-02", name: "Labour Day" },
        { date: "2026-04-27", name: "Anzac Day, observed" },
        { date: "2026-06-01", name: "Western Australia Day" },
        { date: "2026-09-28", name: "King's Birthday" },
      ]) },
    },
  },
};

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatHolidayDate(iso: string): string {
  const date = parseDate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getHolidaySet(countryCode: string, regionCode: string): Map<string, Holiday> {
  const country = HOLIDAY_DATA[countryCode];
  const region = country?.regions[regionCode];
  const map = new Map<string, Holiday>();
  for (const holiday of region?.holidays ?? []) {
    map.set(holiday.date, holiday);
  }
  return map;
}

function isHoliday(date: Date, holidayMap: Map<string, Holiday>): boolean {
  return holidayMap.has(isoDate(date));
}

function countDays(start: Date, end: Date, includeStart: boolean, holidayMap: Map<string, Holiday>, excludeHolidays: boolean) {
  const s = new Date(start);
  const e = new Date(end);
  const isReversed = s > e;
  if (isReversed) {
    const result = countDays(e, s, includeStart, holidayMap, excludeHolidays);
    return {
      ...result,
      weekdays: -result.weekdays,
      businessDays: -result.businessDays,
    };
  }

  let weekdays = 0;
  let businessDays = 0;
  const excluded = new Map<string, Holiday>();
  let current = new Date(s);

  while (current <= e) {
    const isStart = isoDate(current) === isoDate(s);
    const countThisDate = includeStart || !isStart;

    if (countThisDate && !isWeekend(current)) {
      weekdays++;
      const holiday = holidayMap.get(isoDate(current));
      if (excludeHolidays && holiday) {
        excluded.set(holiday.date, holiday);
      } else {
        businessDays++;
      }
    }

    current = addCalendarDays(current, 1);
  }

  return {
    weekdays,
    businessDays,
    excludedHolidays: Array.from(excluded.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

function addBusinessDays(start: Date, amount: number, holidayMap: Map<string, Holiday>, excludeHolidays: boolean): Date {
  const direction = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  let current = new Date(start);

  while (remaining > 0) {
    current = addCalendarDays(current, direction);
    if (!isWeekend(current) && !(excludeHolidays && isHoliday(current, holidayMap))) {
      remaining--;
    }
  }

  return current;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function endOfYearIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-12-31`;
}

function hasOutside2026(start?: Date | null, end?: Date | null): boolean {
  const dates = [start, end].filter(Boolean) as Date[];
  return dates.some((date) => date.getUTCFullYear() !== 2026);
}

function setMeta(page: Page) {
  const titles: Record<Page, string> = {
    home: "Business Days Calculator | Exact Business Days",
    about: "About | Exact Business Days",
    privacy: "Privacy Policy | Exact Business Days",
    terms: "Terms of Use | Exact Business Days",
    contact: "Contact | Exact Business Days",
  };

  const descriptions: Record<Page, string> = {
    home: "Use Exact Business Days to count business days, working days, weekdays, public holidays, and deadline dates. Fast, simple, and free.",
    about: "Learn about Exact Business Days, a simple free calculator for business days, working days, and deadline dates.",
    privacy: "Read the privacy policy for Exact Business Days.",
    terms: "Read the terms of use for Exact Business Days.",
    contact: "Contact Exact Business Days with questions, feedback, or corrections.",
  };

  const path = page === "home" ? "/" : `/${page}`;
  document.title = titles[page];

  const desc = document.querySelector("meta[name='description']");
  if (desc) desc.setAttribute("content", descriptions[page]);

  const canonical = document.querySelector("link[rel='canonical']");
  if (canonical) canonical.setAttribute("href", `${BASE_URL}${path}`);
}

function useRoute(): [Page, (page: Page) => void] {
  const initialPath = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  const initialPage: Page =
    initialPath === "about" || initialPath === "privacy" || initialPath === "terms" || initialPath === "contact"
      ? initialPath
      : "home";

  const [page, setPageState] = useState<Page>(initialPage);
  React.useEffect(() => setMeta(page), [page]);

  React.useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
      const nextPage: Page =
        path === "about" || path === "privacy" || path === "terms" || path === "contact" ? path : "home";
      setPageState(nextPage);
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setPage = (nextPage: Page) => {
    const path = nextPage === "home" ? "/" : `/${nextPage}`;
    window.history.pushState({}, "", path);
    setPageState(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return [page, setPage];
}

function Header({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => setPage("home")} aria-label="Go to homepage">
        <span className="brand-mark">EBD</span>
        <span>
          <strong>Exact Business Days</strong>
          <small>Free deadline calculator</small>
        </span>
      </button>

      <nav aria-label="Main navigation">
        <button className={page === "home" ? "nav-active" : ""} onClick={() => setPage("home")}>
          Calculator
        </button>
        <button className={page === "about" ? "nav-active" : ""} onClick={() => setPage("about")}>
          About
        </button>
        <button className={page === "contact" ? "nav-active" : ""} onClick={() => setPage("contact")}>
          Contact
        </button>
      </nav>
    </header>
  );
}

function InfoTip({ text, label = "More information" }: { text: string; label?: string }) {
  return (
    <span
      className="info-tooltip"
      tabIndex={0}
      role="button"
      aria-label={label}
    >
      i
      <span className="tooltip-text" role="tooltip">
        {text}
      </span>
    </span>
  );
}

function Calculator() {
  const [mode, setMode] = useState<Mode>("between");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(endOfYearIso());
  const [amount, setAmount] = useState(10);
  const [includeStart, setIncludeStart] = useState(true);
  const [countryCode, setCountryCode] = useState("ca");
  const [regionCode, setRegionCode] = useState("on");
  const [excludeHolidays, setExcludeHolidays] = useState(true);

  const country = HOLIDAY_DATA[countryCode];
  const region = country.regions[regionCode];
  const holidayMap = useMemo(() => getHolidaySet(countryCode, regionCode), [countryCode, regionCode]);

  function handleCountryChange(value: string) {
    setCountryCode(value);
    const firstRegion = Object.keys(HOLIDAY_DATA[value].regions)[0];
    setRegionCode(firstRegion);
  }

  const result = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start) return null;

    if (mode === "between") {
      if (!end) return null;
      const calculation = countDays(start, end, includeStart, holidayMap, excludeHolidays);
      const holidayCount = calculation.excludedHolidays.length;
      return {
        headline: `${Math.abs(calculation.businessDays).toLocaleString()} business days`,
        detail: `Between ${formatDate(start)} and ${formatDate(end)}${includeStart ? ", including the start date" : ", excluding the start date"}.`,
        note: excludeHolidays
          ? `${Math.abs(calculation.weekdays).toLocaleString()} weekdays before excluding ${holidayCount.toLocaleString()} public ${holidayCount === 1 ? "holiday" : "holidays"} for ${region.name}, ${country.name}.`
          : "Weekends are excluded. Public holidays are currently not excluded.",
        excludedHolidays: calculation.excludedHolidays,
        outside2026: hasOutside2026(start, end),
      };
    }

    if (mode === "add") {
      const safeAmount = Math.max(0, amount || 0);
      const target = addBusinessDays(start, safeAmount, holidayMap, excludeHolidays);
      return {
        headline: formatDate(target),
        detail: `${safeAmount.toLocaleString()} business days after ${formatDate(start)}.`,
        note: excludeHolidays
          ? `Weekends and selected public holidays for ${region.name}, ${country.name} are excluded.`
          : "Weekends are excluded. Public holidays are currently not excluded.",
        excludedHolidays: [],
        outside2026: hasOutside2026(start, target),
      };
    }

    if (mode === "subtract") {
      const safeAmount = Math.max(0, amount || 0);
      const target = addBusinessDays(start, -safeAmount, holidayMap, excludeHolidays);
      return {
        headline: formatDate(target),
        detail: `${safeAmount.toLocaleString()} business days before ${formatDate(start)}.`,
        note: excludeHolidays
          ? `Weekends and selected public holidays for ${region.name}, ${country.name} are excluded.`
          : "Weekends are excluded. Public holidays are currently not excluded.",
        excludedHolidays: [],
        outside2026: hasOutside2026(start, target),
      };
    }

    const endYear = parseDate(endOfYearIso());
    if (!endYear) return null;
    const calculation = countDays(start, endYear, true, holidayMap, excludeHolidays);
    return {
      headline: `${Math.max(0, calculation.businessDays).toLocaleString()} business days remaining`,
      detail: `From ${formatDate(start)} through ${formatDate(endYear)}, excluding weekends${excludeHolidays ? " and selected public holidays" : ""}.`,
      note: excludeHolidays
        ? `${calculation.excludedHolidays.length.toLocaleString()} public ${calculation.excludedHolidays.length === 1 ? "holiday is" : "holidays are"} excluded for ${region.name}, ${country.name}.`
        : "Public holidays are currently not excluded.",
      excludedHolidays: calculation.excludedHolidays,
      outside2026: hasOutside2026(start, endYear),
    };
  }, [mode, startDate, endDate, amount, includeStart, holidayMap, excludeHolidays, country.name, region.name]);

  return (
    <section className="calculator-card" aria-label="Business days calculator">
      <div className="tabs" role="tablist" aria-label="Calculator mode">
        <button className={mode === "between" ? "active" : ""} onClick={() => setMode("between")}>
          <span className="tab-copy">
            Between dates
            <InfoTip text="Count how many business days are between two dates." label="What does Between dates mean?" />
          </span>
        </button>
        <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>
          <span className="tab-copy">
            Add days
            <InfoTip text="Pick a start date, then add a number of business days. The calculator gives you the final date." label="What does Add days mean?" />
          </span>
        </button>
        <button className={mode === "subtract" ? "active" : ""} onClick={() => setMode("subtract")}>
          <span className="tab-copy">
            Subtract days
            <InfoTip text="Pick a deadline date, then count backward by a number of business days." label="What does Subtract days mean?" />
          </span>
        </button>
        <button className={mode === "remaining" ? "active" : ""} onClick={() => setMode("remaining")}>
          <span className="tab-copy">
            Left this year
            <InfoTip text="See how many business days are left from the start date until December 31." label="What does Left this year mean?" />
          </span>
        </button>
      </div>

      <div className="form-grid">
        <label>
          Start date
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>

        {mode === "between" && (
          <label>
            End date
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
        )}

        {(mode === "add" || mode === "subtract") && (
          <label>
            <span className="field-label">
              Number of business days
              <InfoTip text="Enter how many workdays you want to add or subtract. Weekends and selected public holidays are skipped." label="What does number of business days mean?" />
            </span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>
        )}

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={includeStart}
            onChange={(event) => setIncludeStart(event.target.checked)}
            disabled={mode !== "between"}
          />
          <span className="checkbox-copy">
            Include start date
            <InfoTip text="When this is on, the start date counts as day one, as long as it is a business day." label="What does include start date mean?" />
          </span>
        </label>
      </div>

      <div className="form-grid region-grid">
        <label>
          <span className="field-label">
            Country
            <InfoTip text="Choose the country whose holiday calendar should be used." label="What does country mean?" />
          </span>
          <select value={countryCode} onChange={(event) => handleCountryChange(event.target.value)}>
            {Object.entries(HOLIDAY_DATA).map(([code, option]) => (
              <option key={code} value={code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">
            Region
            <InfoTip text="Choose the state, province, territory, or UK region. Holidays can be different depending on the region." label="What does region mean?" />
          </span>
          <select value={regionCode} onChange={(event) => setRegionCode(event.target.value)}>
            {Object.entries(country.regions).map(([code, option]) => (
              <option key={code} value={code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={excludeHolidays}
            onChange={(event) => setExcludeHolidays(event.target.checked)}
          />
          <span className="checkbox-copy">
            Exclude public holidays
            <InfoTip text="Turn this on if holidays should not count as workdays. Example: if Christmas is on a Friday, that Friday will be skipped." label="What does exclude public holidays mean?" />
          </span>
        </label>
      </div>

      <div className="result" aria-live="polite">
        <p className="result-label">Result</p>
        <h2>{result?.headline ?? "Choose dates to calculate"}</h2>
        <p>{result?.detail ?? "Your exact business-day answer will appear here."}</p>
        <small>{result?.note}</small>
      </div>

      {result?.outside2026 && (
        <div className="notice">
          <strong>Calendar note:</strong> Holiday data is currently available for 2026 only. Dates outside 2026 may not exclude all public holidays yet.
        </div>
      )}

      <div className="assumptions">
        <h3>Included in this calculation</h3>
        <ul>
          <li>Weekends are excluded.</li>
          <li>{excludeHolidays ? `Public holidays are excluded for ${region.name}, ${country.name}.` : "Public holidays are not excluded."}</li>
          <li>Holiday data currently covers 2026.</li>
          <li>Business holiday rules can vary by employer, industry, city, and contract.</li>
        </ul>
      </div>

      {excludeHolidays && result?.excludedHolidays && result.excludedHolidays.length > 0 && (
        <div className="holiday-list">
          <h3>Holidays excluded</h3>
          <ul>
            {result.excludedHolidays.map((holiday) => (
              <li key={holiday.date}>
                <span>{holiday.name}</span>
                <strong>{formatHolidayDate(holiday.date)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">ExactBusinessDays.com</p>
        <h1>Business Days Calculator</h1>
        <p className="lede">
          Count business days, working days, weekdays, public holidays, and deadline dates in seconds.
          Fast, clear, and free to use.
        </p>
      </section>

      <Calculator />

      <section className="content-grid">
        <article>
          <h2>What can this calculator do?</h2>
          <p>
            Use it to count business days between two dates, add business days to a start date,
            subtract business days from a deadline, or see how many business days are left in the year.
          </p>
        </article>

        <article>
          <h2>What is counted as a business day?</h2>
          <p>
            A business day usually means Monday through Friday, excluding selected public holidays.
            Exact rules can vary by country, region, employer, contract, and industry.
          </p>
        </article>

        <article>
          <h2>Why use a calculator instead of guessing?</h2>
          <p>
            Deadline math is easy to miscount, especially when weekends, holidays, date ranges,
            and start-date rules are involved. This tool makes the assumptions visible.
          </p>
        </article>

        <article>
          <h2>Supported holiday calendars</h2>
          <p>
            Holiday support currently includes 2026 calendars for Canada, the United States,
            the United Kingdom, and Australia, with regional options included.
          </p>
        </article>
      </section>
    </>
  );
}

function TextPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="text-page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="text-card">{children}</div>
    </section>
  );
}

function AboutPage() {
  return (
    <TextPage title="About Exact Business Days" eyebrow="About">
      <p>
        Exact Business Days is a simple free utility for counting business days, working days,
        weekdays, public holidays, and deadline dates.
      </p>
      <p>
        The goal is to keep the tool fast, clear, and easy to use. Every result should explain what was
        included, what was excluded, and which assumptions were used.
      </p>
      <p>
        The current version includes selected 2026 public holiday calendars for Canada, the United States,
        the United Kingdom, and Australia.
      </p>
    </TextPage>
  );
}

function PrivacyPage() {
  return (
    <TextPage title="Privacy Policy" eyebrow="Privacy">
      <p>
        Exact Business Days is currently a simple calculator site. We do not require user accounts,
        and we do not ask visitors to submit personal information to use the calculator.
      </p>
      <p>
        Basic technical information may be processed by hosting, security, and analytics providers to keep
        the site available, secure, and working properly.
      </p>
      <p>
        If analytics or advertising are added later, this policy will be updated to explain what tools are
        used and how visitors can manage privacy choices.
      </p>
      <p>
        Last updated: May 17, 2026.
      </p>
    </TextPage>
  );
}

function TermsPage() {
  return (
    <TextPage title="Terms of Use" eyebrow="Terms">
      <p>
        Exact Business Days is provided as a free informational tool. The calculator is intended to help
        users estimate business days, working days, weekdays, public holidays, and deadline dates.
      </p>
      <p>
        Results should be reviewed before being used for legal, financial, payroll, contractual, shipping,
        or other time-sensitive decisions. Rules can vary by jurisdiction, organization, contract, and context.
      </p>
      <p>
        We may update, improve, or change the site at any time.
      </p>
      <p>
        Last updated: May 17, 2026.
      </p>
    </TextPage>
  );
}

function ContactPage() {
  return (
    <TextPage title="Contact" eyebrow="Contact">
      <p>
        Have feedback, a correction, or a region you want supported next?
      </p>
      <p>
        For now, please contact the site owner directly through the domain owner or project administrator.
        A dedicated contact form or email address will be added in a future update.
      </p>
      <p>
        Suggested feedback topics include public holiday rules, regional business-day conventions,
        accessibility issues, or calculator behavior that should be clearer.
      </p>
    </TextPage>
  );
}

function Footer({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <footer className="site-footer">
      <div>
        <strong>Exact Business Days</strong>
        <p>Fast business-day and working-day calculations with clear assumptions.</p>
      </div>

      <nav aria-label="Footer navigation">
        <button onClick={() => setPage("about")}>About</button>
        <button onClick={() => setPage("privacy")}>Privacy</button>
        <button onClick={() => setPage("terms")}>Terms</button>
        <button onClick={() => setPage("contact")}>Contact</button>
      </nav>
    </footer>
  );
}

function App() {
  const [page, setPage] = useRoute();

  return (
    <main>
      <Header page={page} setPage={setPage} />

      {page === "home" && <HomePage />}
      {page === "about" && <AboutPage />}
      {page === "privacy" && <PrivacyPage />}
      {page === "terms" && <TermsPage />}
      {page === "contact" && <ContactPage />}

      <Footer setPage={setPage} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
