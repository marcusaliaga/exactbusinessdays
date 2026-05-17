
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

type Tab = 'between' | 'add' | 'subtract' | 'left';
type Holiday = { name: string; date: string };
type Region = { label: string; holidays: Holiday[] };
type Country = { label: string; regions: Record<string, Region> };

const holidayData: Record<string, Country> = {
  ca: { label: 'Canada', regions: {
    ab:{label:'Alberta',holidays:[['New Year\'s Day','2026-01-01'],['Family Day','2026-02-16'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['Canada Day','2026-07-01'],['Labour Day','2026-09-07'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    bc:{label:'British Columbia',holidays:[['New Year\'s Day','2026-01-01'],['Family Day','2026-02-16'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['Canada Day','2026-07-01'],['B.C. Day','2026-08-03'],['Labour Day','2026-09-07'],['National Day for Truth and Reconciliation','2026-09-30'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    mb:{label:'Manitoba',holidays:[['New Year\'s Day','2026-01-01'],['Louis Riel Day','2026-02-16'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['Canada Day','2026-07-01'],['Labour Day','2026-09-07'],['National Day for Truth and Reconciliation','2026-09-30'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    nb:{label:'New Brunswick',holidays:[['New Year\'s Day','2026-01-01'],['Family Day','2026-02-16'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['Canada Day','2026-07-01'],['New Brunswick Day','2026-08-03'],['Labour Day','2026-09-07'],['National Day for Truth and Reconciliation','2026-09-30'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25'],['Boxing Day, observed','2026-12-28']].map(([name,date])=>({name,date}))},
    nl:{label:'Newfoundland and Labrador',holidays:[['New Year\'s Day','2026-01-01'],['Good Friday','2026-04-03'],['Memorial Day','2026-07-01'],['Canada Day','2026-07-01'],['Labour Day','2026-09-07'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    ns:{label:'Nova Scotia',holidays:[['New Year\'s Day','2026-01-01'],['Nova Scotia Heritage Day','2026-02-16'],['Good Friday','2026-04-03'],['Canada Day','2026-07-01'],['Labour Day','2026-09-07'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    on:{label:'Ontario',holidays:[['New Year\'s Day','2026-01-01'],['Family Day','2026-02-16'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['Canada Day','2026-07-01'],['Labour Day','2026-09-07'],['Thanksgiving Day','2026-10-12'],['Christmas Day','2026-12-25'],['Boxing Day, observed','2026-12-28']].map(([name,date])=>({name,date}))},
    pe:{label:'Prince Edward Island',holidays:[['New Year\'s Day','2026-01-01'],['Islander Day','2026-02-16'],['Good Friday','2026-04-03'],['Canada Day','2026-07-01'],['Labour Day','2026-09-07'],['National Day for Truth and Reconciliation','2026-09-30'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    qc:{label:'Quebec',holidays:[['New Year\'s Day','2026-01-01'],['Good Friday','2026-04-03'],['National Patriots\' Day','2026-05-18'],['Saint-Jean-Baptiste Day','2026-06-24'],['Canada Day','2026-07-01'],['Labour Day','2026-09-07'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    sk:{label:'Saskatchewan',holidays:[['New Year\'s Day','2026-01-01'],['Family Day','2026-02-16'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['Canada Day','2026-07-01'],['Saskatchewan Day','2026-08-03'],['Labour Day','2026-09-07'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    nt:{label:'Northwest Territories',holidays:[['New Year\'s Day','2026-01-01'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['National Indigenous Peoples Day','2026-06-22'],['Canada Day','2026-07-01'],['Civic Holiday','2026-08-03'],['Labour Day','2026-09-07'],['National Day for Truth and Reconciliation','2026-09-30'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    nu:{label:'Nunavut',holidays:[['New Year\'s Day','2026-01-01'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['Canada Day','2026-07-01'],['Nunavut Day','2026-07-09'],['Civic Holiday','2026-08-03'],['Labour Day','2026-09-07'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    yt:{label:'Yukon',holidays:[['New Year\'s Day','2026-01-01'],['Heritage Day','2026-02-20'],['Good Friday','2026-04-03'],['Victoria Day','2026-05-18'],['National Indigenous Peoples Day','2026-06-22'],['Canada Day','2026-07-01'],['Discovery Day','2026-08-17'],['Labour Day','2026-09-07'],['Thanksgiving Day','2026-10-12'],['Remembrance Day','2026-11-11'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))}
  }},
  us: { label: 'United States', regions: {
    federal:{label:'Federal',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Washington\'s Birthday','2026-02-16'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Columbus Day','2026-10-12'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    ca:{label:'California',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Presidents\' Day','2026-02-16'],['Cesar Chavez Day','2026-03-31'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Columbus Day','2026-10-12'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    tx:{label:'Texas',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Presidents\' Day','2026-02-16'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Eve','2026-12-24'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    fl:{label:'Florida',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Memorial Day','2026-05-25'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    ny:{label:'New York',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Lincoln\'s Birthday','2026-02-12'],['Presidents\' Day','2026-02-16'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Columbus Day','2026-10-12'],['Election Day','2026-11-03'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    pa:{label:'Pennsylvania',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Presidents\' Day','2026-02-16'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Columbus Day','2026-10-12'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    il:{label:'Illinois',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Lincoln\'s Birthday','2026-02-12'],['Presidents\' Day','2026-02-16'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Columbus Day','2026-10-12'],['Election Day','2026-11-03'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    oh:{label:'Ohio',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Presidents\' Day','2026-02-16'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Columbus Day','2026-10-12'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    ga:{label:'Georgia',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['State Holiday','2026-04-27'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Columbus Day','2026-10-12'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    nc:{label:'North Carolina',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Good Friday','2026-04-03'],['Memorial Day','2026-05-25'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Eve','2026-12-24'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))},
    mi:{label:'Michigan',holidays:[['New Year\'s Day','2026-01-01'],['Martin Luther King Jr. Day','2026-01-19'],['Presidents\' Day','2026-02-16'],['Memorial Day','2026-05-25'],['Juneteenth National Independence Day','2026-06-19'],['Independence Day, observed','2026-07-03'],['Labor Day','2026-09-07'],['Veterans Day','2026-11-11'],['Thanksgiving Day','2026-11-26'],['Day after Thanksgiving','2026-11-27'],['Christmas Eve','2026-12-24'],['Christmas Day','2026-12-25']].map(([name,date])=>({name,date}))}
  }},
  uk: { label: 'United Kingdom', regions: {
    eng:{label:'England and Wales',holidays:[['New Year\'s Day','2026-01-01'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['Early May bank holiday','2026-05-04'],['Spring bank holiday','2026-05-25'],['Summer bank holiday','2026-08-31'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    sct:{label:'Scotland',holidays:[['New Year\'s Day','2026-01-01'],['2 January','2026-01-02'],['Good Friday','2026-04-03'],['Early May bank holiday','2026-05-04'],['Spring bank holiday','2026-05-25'],['Summer bank holiday','2026-08-03'],['St Andrew\'s Day','2026-11-30'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    ni:{label:'Northern Ireland',holidays:[['New Year\'s Day','2026-01-01'],['St Patrick\'s Day','2026-03-17'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['Early May bank holiday','2026-05-04'],['Spring bank holiday','2026-05-25'],['Battle of the Boyne, substitute day','2026-07-13'],['Summer bank holiday','2026-08-31'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))}
  }},
  au: { label: 'Australia', regions: {
    nsw:{label:'New South Wales',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['King\'s Birthday','2026-06-08'],['Labour Day','2026-10-05'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    vic:{label:'Victoria',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Labour Day','2026-03-09'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['King\'s Birthday','2026-06-08'],['Melbourne Cup Day','2026-11-03'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    qld:{label:'Queensland',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['Labour Day','2026-05-04'],['King\'s Birthday','2026-10-05'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    wa:{label:'Western Australia',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Labour Day','2026-03-02'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['Western Australia Day','2026-06-01'],['King\'s Birthday','2026-09-28'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    sa:{label:'South Australia',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Adelaide Cup Day','2026-03-09'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['King\'s Birthday','2026-06-08'],['Labour Day','2026-10-05'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    tas:{label:'Tasmania',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Eight Hours Day','2026-03-09'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['King\'s Birthday','2026-06-08'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    act:{label:'Australian Capital Territory',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Canberra Day','2026-03-09'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['Reconciliation Day','2026-06-01'],['King\'s Birthday','2026-06-08'],['Labour Day','2026-10-05'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))},
    nt:{label:'Northern Territory',holidays:[['New Year\'s Day','2026-01-01'],['Australia Day','2026-01-26'],['Good Friday','2026-04-03'],['Easter Monday','2026-04-06'],['ANZAC Day','2026-04-25'],['May Day','2026-05-04'],['King\'s Birthday','2026-06-08'],['Picnic Day','2026-08-03'],['Christmas Day','2026-12-25'],['Boxing Day, substitute day','2026-12-28']].map(([name,date])=>({name,date}))}
  }}
};

const iso = (date: Date) => date.toISOString().slice(0, 10);
const parse = (value: string) => new Date(`${value}T00:00:00Z`);
const fmt = (value: string | Date) => new Intl.DateTimeFormat('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'UTC'}).format(typeof value === 'string' ? parse(value) : value);
const shortFmt = (value: string | Date) => new Intl.DateTimeFormat('en-US', { year:'numeric', month:'short', day:'numeric', timeZone:'UTC'}).format(typeof value === 'string' ? parse(value) : value);
const addDays = (date: Date, days: number) => { const d = new Date(date); d.setUTCDate(d.getUTCDate()+days); return d; };
const isWeekend = (d: Date) => [0,6].includes(d.getUTCDay());
const inRange = (d:string, a:string, b:string) => d >= (a < b ? a : b) && d <= (a < b ? b : a);

function Info({text}:{text:string}) {
  const [open, setOpen] = useState(false);
  return <span className="infoWrap">
    <button className="infoIcon" type="button" aria-label="More information" onClick={(e)=>{e.stopPropagation(); setOpen(!open)}} onBlur={()=>setTimeout(()=>setOpen(false),120)}>i</button>
    {open && <span className="tip">{text}</span>}
  </span>;
}

function App() {
  const [tab,setTab]=useState<Tab>('between');
  const [start,setStart]=useState('2026-05-17');
  const [end,setEnd]=useState('2026-12-31');
  const [amount,setAmount]=useState(10);
  const [includeStart,setIncludeStart]=useState(true);
  const [country,setCountry]=useState('ca');
  const [region,setRegion]=useState('on');
  const [excludeHolidays,setExcludeHolidays]=useState(true);
  const [path,setPath]=useState(window.location.pathname);

  const regions = holidayData[country].regions;
  const selectedRegion = regions[region] || Object.values(regions)[0];
  const countryLabel = holidayData[country].label;
  const regionLabel = selectedRegion.label;
  const holidays = selectedRegion.holidays;

  const setCountrySafe=(c:string)=>{ setCountry(c); setRegion(Object.keys(holidayData[c].regions)[0]); };
  const isHoliday = (d:Date) => excludeHolidays && holidays.some(h => h.date === iso(d));
  const isBusiness = (d:Date) => !isWeekend(d) && !isHoliday(d);

  const result = useMemo(()=>{
    const notes:string[] = ['Weekends are excluded.'];
    const usedHolidays: Holiday[] = [];
    const pushHoliday=(d:Date)=>{ const h = holidays.find(x=>x.date===iso(d)); if(h && !usedHolidays.find(u=>u.date===h.date)) usedHolidays.push(h); };
    let resultText=''; let sub=''; let detail=''; let calendarWarn=false;

    if(tab==='between' || tab==='left'){
      const from = parse(start);
      const to = tab==='left' ? parse(`${start.slice(0,4)}-12-31`) : parse(end);
      let count=0; let d=new Date(from);
      if(!includeStart && tab==='between') d=addDays(d,1);
      while(d<=to){ if(isBusiness(d)){count++} else if(excludeHolidays && !isWeekend(d)){pushHoliday(d)}; d=addDays(d,1); }
      resultText = tab==='left' ? `${count} business days remaining` : `${count} business days`;
      sub = tab==='left' ? `From ${fmt(start)} through ${fmt(to)}, excluding weekends${excludeHolidays?' and selected public holidays':''}.` : `Between ${fmt(start)} and ${fmt(to)}${includeStart ? ', including the start date' : ''}.`;
      detail = excludeHolidays ? `${count + usedHolidays.length} weekdays before excluding ${usedHolidays.length} public holidays for ${regionLabel}, ${countryLabel}.` : `Public holidays are currently not excluded.`;
    } else {
      const direction = tab==='add' ? 1 : -1;
      let d=parse(start); let moved=0;
      while(moved<Math.max(0,amount)){ d=addDays(d,direction); if(isBusiness(d)){moved++} else if(excludeHolidays && !isWeekend(d)){pushHoliday(d)}; if(d.getUTCFullYear()!==2026) calendarWarn=true; }
      resultText = fmt(d);
      sub = `${amount} business days ${tab==='add'?'after':'before'} ${fmt(start)}.`;
      detail = excludeHolidays ? `Weekends and selected public holidays for ${regionLabel}, ${countryLabel} are excluded.` : `Weekends are excluded. Public holidays are currently not excluded.`;
    }
    notes.push(excludeHolidays ? `Public holidays are excluded for ${regionLabel}, ${countryLabel}.` : 'Public holidays are not excluded.');
    notes.push('Holiday data currently covers 2026.');
    notes.push('Business holiday rules can vary by employer, industry, city, and contract.');
    const list = excludeHolidays ? holidays.filter(h => (tab==='left' ? inRange(h.date,start,`${start.slice(0,4)}-12-31`) : tab==='between' ? inRange(h.date,start,end) : true)).filter(h => !isWeekend(parse(h.date))) : [];
    return {resultText, sub, detail, notes, list, calendarWarn};
  },[tab,start,end,amount,includeStart,country,region,excludeHolidays]);

  const nav=(p:string)=>{ history.pushState(null,'',p); setPath(p); window.scrollTo(0,0); };
  window.onpopstate=()=>setPath(window.location.pathname);

  const Header = () => <header className="topbar"><button className="brand" onClick={()=>nav('/')}><span className="logo">EBD</span><span><strong>Exact Business Days</strong><small>Free deadline calculator</small></span></button><nav><button onClick={()=>nav('/')} className={path==='/'?'active':''}>Calculator</button><button onClick={()=>nav('/about')} className={path==='/about'?'active':''}>About</button><button onClick={()=>nav('/contact')} className={path==='/contact'?'active':''}>Contact</button></nav></header>;
  const LegalPage=({kind}:{kind:string})=> <><Header/><main className="simple"><p className="eyebrow">{kind}</p><h1>{kind==='privacy'?'Privacy Policy':kind==='terms'?'Terms of Use':kind==='contact'?'Contact':'About Exact Business Days'}</h1><section className="card text">{kind==='about' && <><p>Exact Business Days is a simple free utility for counting business days, working days, weekdays, and deadline dates.</p><p>The goal is to keep the tool fast, clear, and easy to use. Every result shows what was included, what was excluded, and which assumptions were used.</p><p>The current version includes 2026 regional holiday calendars for Canada, the United States, the United Kingdom, and Australia.</p></>}{kind==='privacy' && <><p>Exact Business Days is currently a simple calculator site. We do not require user accounts, and we do not ask visitors to submit personal information to use the calculator.</p><p>Basic technical information may be processed by hosting, security, and analytics providers to keep the site available, secure, and working properly.</p><p>Last updated: May 17, 2026.</p></>}{kind==='terms' && <><p>Exact Business Days is provided as a free informational tool. The calculator is intended to help users estimate business days, working days, weekdays, and deadline dates.</p><p>Results should be reviewed before being used for legal, financial, payroll, contractual, shipping, or other time-sensitive decisions. Rules can vary by jurisdiction, organization, and context.</p><p>Last updated: May 17, 2026.</p></>}{kind==='contact' && <><p>Have feedback, a correction, or a region you want supported next?</p><p>For now, please contact the site owner directly through the domain owner or project administrator. A dedicated contact form or email address will be added in a future update.</p></>}</section></main><Footer/></>;

  if(path==='/about') return <LegalPage kind="about"/>;
  if(path==='/privacy') return <LegalPage kind="privacy"/>;
  if(path==='/terms') return <LegalPage kind="terms"/>;
  if(path==='/contact') return <LegalPage kind="contact"/>;

  return <><Header/><main className="home"><section className="hero"><p className="eyebrow">Free business day tool</p><h1>Business Days Calculator</h1><p className="lead">Count business days, working days, weekdays, public holidays, and deadline dates in seconds. Fast, clear, and free to use.</p></section>
    <section className="calculator">
      <div className="tabs">{(['between','add','subtract','left'] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={tab===t?'active':''}>{t==='between'?'Between dates':t==='add'?'Add days':t==='subtract'?'Subtract days':'Left this year'} <Info text={t==='between'?'Count how many business days are between two dates.':t==='add'?'Pick a start date, then count forward by a number of business days.':t==='subtract'?'Pick a deadline date, then count backward by a number of business days.':'See how many business days are left from the start date until December 31.'}/></button>)}</div>
      <div className="formGrid">
        <label><span>Start date</span><input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label>
        {tab==='between' && <label><span>End date</span><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label>}
        {(tab==='add'||tab==='subtract') && <label><span>Number of business days to {tab==='add'?'add':'subtract'} <Info text={`Enter how many business days you want to ${tab==='add'?'add after':'subtract before'} the start date.`}/></span><input type="number" min="0" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label>}
        {tab==='between' && <label className="check"><input type="checkbox" checked={includeStart} onChange={e=>setIncludeStart(e.target.checked)}/><span>Include start date <Info text="When this is on, the start date can count as the first business day. It only counts if it is not a weekend or skipped holiday."/></span></label>}
        {(tab==='left') && <HolidayToggle excludeHolidays={excludeHolidays} setExcludeHolidays={setExcludeHolidays}/>} 
        <label><span>Country <Info text="Choose the country whose public holiday calendar should be used."/></span><select value={country} onChange={e=>setCountrySafe(e.target.value)}>{Object.entries(holidayData).map(([key,c])=><option value={key} key={key}>{c.label}</option>)}</select></label>
        <label><span>Region <Info text="Choose the state, province, territory, or UK region. Holidays can be different depending on the region."/></span><select value={region} onChange={e=>setRegion(e.target.value)}>{Object.entries(regions).map(([key,r])=><option value={key} key={key}>{r.label}</option>)}</select></label>
        {tab!=='left' && <HolidayToggle excludeHolidays={excludeHolidays} setExcludeHolidays={setExcludeHolidays}/>} 
      </div>
      <Result result={result}/>
    </section>
    <InfoCards/>
  </main><Footer/></>;
}

function HolidayToggle({excludeHolidays,setExcludeHolidays}:{excludeHolidays:boolean;setExcludeHolidays:(b:boolean)=>void}){
  return <div className="holidayToggle" role="group" aria-label="Holiday counting mode">
    <span>Weekends only</span>
    <button type="button" className={excludeHolidays?'switch on':'switch'} onClick={()=>setExcludeHolidays(!excludeHolidays)} aria-pressed={excludeHolidays}><span/></button>
    <span>Weekends + holidays</span>
    <Info text="Weekends are always skipped. Turn on holidays if weekday public holidays should also be skipped. Example: if Christmas is on a Wednesday, that Wednesday will not count as a business day."/>
  </div>
}
function Result({result}:{result:any}){ return <><div className="result"><p>Result</p><h2>{result.resultText}</h2><div>{result.sub}</div><small>{result.detail}</small></div>{result.calendarWarn && <div className="notice">Calendar note: Holiday data is currently available for 2026 only. Dates outside 2026 may not exclude all public holidays yet.</div>}<section className="card"><h3>Included in this calculation</h3><ul>{result.notes.map((n:string)=><li key={n}>{n}</li>)}</ul></section>{result.list.length>0 && <section className="card"><h3>Holidays excluded</h3><div className="holidayList">{result.list.map((h:Holiday)=><div key={h.date}><span>{h.name}</span><strong>{shortFmt(h.date)}</strong></div>)}</div></section>}</> }
function InfoCards(){return <section className="infoCards"><article><h3>What can this calculator do?</h3><p>Use it to count business days between two dates, add business days to a start date, subtract business days from a deadline, or see how many business days are left in the year.</p></article><article><h3>What is counted as a business day?</h3><p>A business day usually means Monday through Friday, excluding selected public holidays. Exact rules can vary by country, region, employer, contract, and industry.</p></article><article><h3>Why use a calculator instead of guessing?</h3><p>Deadline math is easy to miscount, especially when weekends, holidays, date ranges, and start-date rules are involved. This tool makes the assumptions visible.</p></article><article><h3>Supported holiday calendars</h3><p>Holiday support currently includes 2026 calendars for Canada, the United States, the United Kingdom, and Australia, with regional options included.</p></article></section>}
function Footer(){return <footer><div><strong>Exact Business Days</strong><p>Fast business-day and working-day calculations with clear assumptions.</p></div><nav><button onClick={()=>history.pushState(null,'','/about')||location.reload()}>About</button><button onClick={()=>history.pushState(null,'','/privacy')||location.reload()}>Privacy</button><button onClick={()=>history.pushState(null,'','/terms')||location.reload()}>Terms</button><button onClick={()=>history.pushState(null,'','/contact')||location.reload()}>Contact</button></nav></footer>}

createRoot(document.getElementById('root')!).render(<App />);
