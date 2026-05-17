import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";

type Mode = "between" | "add" | "subtract" | "remaining";
type Page = "home" | "about" | "privacy" | "terms" | "contact";

const BASE_URL = "https://exactbusinessdays.com";

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

function setMeta(page: Page) {
  const titles: Record<Page, string> = {
    home: "Business Days Calculator | Exact Business Days",
    about: "About | Exact Business Days",
    privacy: "Privacy Policy | Exact Business Days",
    terms: "Terms of Use | Exact Business Days",
    contact: "Contact | Exact Business Days",
  };

  const descriptions: Record<Page, string> = {
    home: "Use Exact Business Days to count business days, working days, weekdays, and deadline dates. Fast, simple, and free.",
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

function Calculator() {
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
        note: "Weekends are excluded. Public holidays will be added in the next version.",
      };
    }

    if (mode === "add") {
      const safeAmount = Math.max(0, amount || 0);
      const target = addBusinessDays(start, safeAmount);
      return {
        headline: formatDate(target),
        detail: `${safeAmount.toLocaleString()} business days after ${formatDate(start)}.`,
        note: "The start date is not counted as day one when adding business days.",
      };
    }

    if (mode === "subtract") {
      const safeAmount = Math.max(0, amount || 0);
      const target = addBusinessDays(start, -safeAmount);
      return {
        headline: formatDate(target),
        detail: `${safeAmount.toLocaleString()} business days before ${formatDate(start)}.`,
        note: "The calculator moves backward through weekdays and skips weekends.",
      };
    }

    const endYear = parseDate(endOfYearIso());
    if (!endYear) return null;
    const days = countBusinessDays(start, endYear, true);
    return {
      headline: `${Math.max(0, days).toLocaleString()} business days remaining`,
      detail: `From ${formatDate(start)} through ${formatDate(endYear)}, excluding weekends.`,
      note: "Public holidays will be added once regional calendars are connected.",
    };
  }, [mode, startDate, endDate, amount, includeStart]);

  return (
    <section className="calculator-card" aria-label="Business days calculator">
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
            Number of business days
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
          Include start date
        </label>
      </div>

      <div className="result" aria-live="polite">
        <p className="result-label">Result</p>
        <h2>{result?.headline ?? "Choose dates to calculate"}</h2>
        <p>{result?.detail ?? "Your exact business-day answer will appear here."}</p>
        <small>{result?.note}</small>
      </div>

      <div className="assumptions">
        <h3>Included in this calculation</h3>
        <ul>
          <li>Weekends are excluded.</li>
          <li>Public holidays are not yet excluded in this first MVP update.</li>
          <li>Dates are handled consistently using UTC to avoid time-zone drift.</li>
          <li>Country, state, and province holiday calendars are the next product update.</li>
        </ul>
      </div>
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
          Count business days, working days, weekdays, and deadline dates in seconds.
          Built for quick answers, clear assumptions, and future regional holiday support.
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
            In this first version, a business day means Monday through Friday. Public holiday calendars
            by country, state, and province are planned for the next functional update.
          </p>
        </article>

        <article>
          <h2>Why use a calculator instead of guessing?</h2>
          <p>
            Deadline math is easy to miscount, especially when weekends, date ranges, and start-date rules
            are involved. This tool makes the assumptions visible so the result is easier to verify.
          </p>
        </article>

        <article>
          <h2>Upcoming regional calendars</h2>
          <p>
            The next version will begin with Canada, the United States, the United Kingdom, and Australia,
            including selected state and province holiday rules.
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
        weekdays, and deadline dates.
      </p>
      <p>
        The goal is to keep the tool fast, clear, and easy to use. Every result should explain what was
        included, what was excluded, and which assumptions were used.
      </p>
      <p>
        The current version excludes weekends. Regional public holiday support is planned next, beginning
        with Canada, the United States, the United Kingdom, and Australia.
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
      <p>Last updated: May 17, 2026.</p>
    </TextPage>
  );
}

function TermsPage() {
  return (
    <TextPage title="Terms of Use" eyebrow="Terms">
      <p>
        Exact Business Days is provided as a free informational tool. The calculator is intended to help
        users estimate business days, working days, weekdays, and deadline dates.
      </p>
      <p>
        Results should be reviewed before being used for legal, financial, payroll, contractual, shipping,
        or other time-sensitive decisions. Rules can vary by jurisdiction, organization, and context.
      </p>
      <p>We may update, improve, or change the site at any time.</p>
      <p>Last updated: May 17, 2026.</p>
    </TextPage>
  );
}

function ContactPage() {
  return (
    <TextPage title="Contact" eyebrow="Contact">
      <p>Have feedback, a correction, or a region you want supported next?</p>
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
