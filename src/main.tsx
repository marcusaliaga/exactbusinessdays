import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";

type Mode = "between" | "add" | "subtract" | "remaining";

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

function countBusinessDays(start: Date, end: Date, includeStart = true): number {
  const s = new Date(start);
  const e = new Date(end);
  if (s > e) return -countBusinessDays(e, s, includeStart);

  let count = 0;
  let current = new Date(s);

  while (current <= e) {
    const isStart = isoDate(current) === isoDate(s);
    if (!isWeekend(current) && (includeStart || !isStart)) count++;
    current = addCalendarDays(current, 1);
  }

  return count;
}

function addBusinessDays(start: Date, amount: number): Date {
  const direction = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  let current = new Date(start);

  while (remaining > 0) {
    current = addCalendarDays(current, direction);
    if (!isWeekend(current)) remaining--;
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

function App() {
  const [mode, setMode] = useState<Mode>("between");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(endOfYearIso());
  const [amount, setAmount] = useState(10);
  const [includeStart, setIncludeStart] = useState(true);

  const result = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start) return null;

    if (mode === "between") {
      if (!end) return null;
      const days = countBusinessDays(start, end, includeStart);
      return {
        headline: `${Math.abs(days).toLocaleString()} business days`,
        detail: `Between ${formatDate(start)} and ${formatDate(end)}${includeStart ? ", including the start date" : ", excluding the start date"}.`,
      };
    }

    if (mode === "add") {
      const target = addBusinessDays(start, Math.max(0, amount));
      return {
        headline: formatDate(target),
        detail: `${amount.toLocaleString()} business days after ${formatDate(start)}.`,
      };
    }

    if (mode === "subtract") {
      const target = addBusinessDays(start, -Math.max(0, amount));
      return {
        headline: formatDate(target),
        detail: `${amount.toLocaleString()} business days before ${formatDate(start)}.`,
      };
    }

    const endYear = parseDate(endOfYearIso());
    if (!endYear) return null;
    const days = countBusinessDays(start, endYear, true);
    return {
      headline: `${Math.max(0, days).toLocaleString()} business days remaining`,
      detail: `From ${formatDate(start)} through ${formatDate(endYear)}, excluding weekends.`,
    };
  }, [mode, startDate, endDate, amount, includeStart]);

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">ExactBusinessDays.com</p>
        <h1>Business Days Calculator</h1>
        <p className="lede">
          Count business days, working days, deadlines, and weekdays between dates.
          Holiday calendars by country, state, and province will be added next.
        </p>
      </section>

      <section className="calculator" aria-label="Business days calculator">
        <div className="tabs" role="tablist" aria-label="Calculator mode">
          <button className={mode === "between" ? "active" : ""} onClick={() => setMode("between")}>
            Between dates
          </button>
          <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>
            Add days
          </button>
          <button className={mode === "subtract" ? "active" : ""} onClick={() => setMode("subtract")}>
            Subtract days
          </button>
          <button className={mode === "remaining" ? "active" : ""} onClick={() => setMode("remaining")}>
            Left this year
          </button>
        </div>

        <div className="form-grid">
          <label>
            Start date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          {mode === "between" && (
            <label>
              End date
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          )}

          {(mode === "add" || mode === "subtract") && (
            <label>
              Number of business days
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
          )}

          <label className="checkbox">
            <input
              type="checkbox"
              checked={includeStart}
              onChange={(e) => setIncludeStart(e.target.checked)}
              disabled={mode !== "between"}
            />
            Include start date
          </label>
        </div>

        <div className="result" aria-live="polite">
          <p className="result-label">Result</p>
          <h2>{result?.headline ?? "Choose dates to calculate"}</h2>
          <p>{result?.detail ?? "Your exact business-day answer will appear here."}</p>
        </div>

        <div className="assumptions">
          <h3>Included in this calculation</h3>
          <ul>
            <li>Weekends are excluded.</li>
            <li>Public holidays are not yet excluded in this first technical preview.</li>
            <li>Dates are handled consistently using UTC to avoid time-zone drift.</li>
          </ul>
        </div>
      </section>

      <section className="content">
        <h2>What is a business day?</h2>
        <p>
          A business day is usually a weekday from Monday to Friday, excluding weekends
          and, in many cases, public holidays. ExactBusinessDays.com is being built to
          make deadline calculations faster, clearer, and easier to verify.
        </p>

        <h2>What comes next?</h2>
        <p>
          The next version will add country and regional public holidays, including
          options for Canada, the United States, the United Kingdom, and Australia.
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
