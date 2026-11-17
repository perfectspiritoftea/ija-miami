/* IJA Miami prayer times — TheShia API, Jafari (Qom) method.
 * Include on the homepage after the CSS. The script replaces .prayer-strip if present,
 * or inserts the panel after .hero if the strip does not exist.
 */
(() => {
  'use strict';
  const ZONE = 'America/New_York';
  // Approximate coordinates of IJA Miami in Hialeah Gardens; adjust if needed.
  const LAT = 25.87;
  const LNG = -80.34;
  const API = 'https://theshia.org/api/v1/prayer-times';
  const FIELDS = [
    ['fajr', 'Fajr'],
    ['sunrise', 'Sunrise'],
    ['dhuhr', 'Dhuhr'],
    ['asr', 'Asr'],
    ['maghrib', 'Maghrib'],
    ['isha', 'Isha']
  ];
  const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const dateFmt = new Intl.DateTimeFormat('en-CA', {timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
  const clockFmt = new Intl.DateTimeFormat('en-US', {timeZone:ZONE,hour:'numeric',minute:'2-digit',hour12:true});
  const longDateFmt = new Intl.DateTimeFormat('en-US', {timeZone:ZONE,weekday:'long',month:'long',day:'numeric'});
  const dateParts = (d) => Object.fromEntries(dateFmt.formatToParts(d).filter(x => x.type !== 'literal').map(x => [x.type,x.value]));
  const isoDay = (d) => {const p=dateParts(d);return `${p.year}-${p.month}-${p.day}`;};
  const dayAfter = (date) => {
    const [y,m,d]=date.split('-').map(Number);
    return new Date(Date.UTC(y,m-1,d+1)).toISOString().slice(0,10);
  };
  const panel = document.createElement('section');
  panel.className = 'ija-prayer-times';
  panel.setAttribute('aria-label', "Today's prayer times at IJA Miami");
  panel.innerHTML = `<div class="ija-prayer-inner"><div class="ija-prayer-heading"><div><p class="ija-prayer-eyebrow">Miami · Jafari calculation</p><h2>Today's prayer times</h2><p class="ija-prayer-date" data-prayer-date></p></div><span class="ija-prayer-next" data-prayer-next aria-live="polite">Loading times…</span></div><div class="ija-prayer-grid" data-prayer-grid aria-live="off"></div><p class="ija-prayer-note" data-prayer-note>Calculated times for Miami. Congregational prayer times may differ.</p></div>`;
  const existing = document.querySelector('.prayer-strip');
  const hero = document.querySelector('.hero');
  if (existing) existing.replaceWith(panel);
  else if (hero) hero.insertAdjacentElement('afterend',panel);
  else document.querySelector('main')?.prepend(panel);
  const grid=panel.querySelector('[data-prayer-grid]');
  const nextText=panel.querySelector('[data-prayer-next]');
  const dateText=panel.querySelector('[data-prayer-date]');
  const note=panel.querySelector('[data-prayer-note]');
  let dataByDate = new Map();
  let loading = null;
  const cachePrefix='ija-prayers-jafari-v1-';
  const normalize = (payload, day) => {
    // TheShia single-method response: { meta, days: [{date,fajr,...}] }.
    // Support wrapped variants defensively without guessing times.
    const candidates = [
      ...(Array.isArray(payload?.days) ? payload.days : []),
      ...(Array.isArray(payload?.results) ? payload.results.flatMap(r => r.days || []) : []),
      ...(Array.isArray(payload?.data?.days) ? payload.data.days : []),
      ...(Array.isArray(payload?.data?.results) ? payload.data.results.flatMap(r => r.days || []) : [])
    ];
    if (payload?.date === day) candidates.push(payload);
    const row=candidates.find(r => r?.date === day);
    if (!row) throw new Error('Prayer day not present in API response');
    const result={date:day};
    for (const [key] of FIELDS) {
      const raw=row[key];
      const parsed=new Date(raw);
      if (typeof raw !== 'string' || !Number.isFinite(parsed.getTime())) throw new Error(`Missing or invalid ${key} instant`);
      result[key]=parsed.getTime();
    }
    return result;
  };
  const fetchDay = async (day) => {
    const cacheKey=cachePrefix+day;
    try {
      const stored=JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (stored && Date.now()-stored.savedAt < 6*3600000 && stored.value?.date === day) return stored.value;
    } catch (_) {}
    const url=new URL(API);
    for (const [key,value] of Object.entries({lat:LAT,lng:LNG,method:'Jafari',date:day,tz:ZONE})) url.searchParams.set(key,String(value));
    const response=await fetch(url.toString(),{mode:'cors',cache:'default'});
    if (!response.ok) throw new Error(`Prayer API returned ${response.status}`);
    const value=normalize(await response.json(),day);
    try {sessionStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),value}));} catch (_) {}
    return value;
  };
  function render() {
    const now=new Date();
    const today=isoDay(now);
    const todayData=dataByDate.get(today);
    dateText.textContent=longDateFmt.format(now);
    if (!todayData) return;
    const tomorrow=dataByDate.get(dayAfter(today));
    const nextToday=PRAYERS.find(key=>todayData[key]>now.getTime());
    const nextKey=nextToday || (tomorrow ? 'fajr' : null);
    const nextInstant=nextToday ? todayData[nextToday] : tomorrow?.fajr;
    const isTomorrow=!nextToday && !!tomorrow;
    grid.replaceChildren();
    for (const [key,label] of FIELDS) {
      const cell=document.createElement('div');
      cell.className='ija-prayer-cell';
      if (nextToday === key) cell.classList.add('ija-prayer-cell-next');
      const title=document.createElement('span');title.className='ija-prayer-name';title.textContent=label;
      const time=document.createElement('strong');time.className='ija-prayer-time';time.textContent=clockFmt.format(todayData[key]);
      cell.append(title,time);
      if (nextToday === key) {
        const tag=document.createElement('span');tag.className='ija-prayer-tag';tag.textContent='Next prayer';cell.append(tag);
      }
      grid.append(cell);
    }
    if (nextKey && nextInstant) {
      const name=FIELDS.find(([key])=>key===nextKey)?.[1];
      nextText.textContent=`Next: ${name} ${isTomorrow?'tomorrow ':''}at ${clockFmt.format(nextInstant)}`;
    } else nextText.textContent='Prayer times for today';
    note.textContent='Calculated with the Jafari (Qom) method · America/New_York. Congregational times may differ.';
  }
  async function refresh() {
    if (loading) return loading;
    const today=isoDay(new Date());
    const tomorrow=dayAfter(today);
    loading=(async()=>{
      const responses=await Promise.allSettled([fetchDay(today),fetchDay(tomorrow)]);
      for (const r of responses) if (r.status==='fulfilled') dataByDate.set(r.value.date,r.value);
      if (!dataByDate.has(today)) {
        nextText.textContent='Times temporarily unavailable';
        grid.replaceChildren();
        note.textContent='Please check the official IJA prayer timetable.';
        const a=document.createElement('a');a.href='https://www.ijamiami.org/namaz-timings';a.textContent='View prayer timetable ↗';a.target='_blank';a.rel='noopener noreferrer';note.append(' ',a);
      } else render();
    })().finally(()=>{loading=null;});
    return loading;
  }
  refresh();
  // Highlight moves to the next prayer without an API request every minute.
  let lastDay=isoDay(new Date());
  window.setInterval(()=>{
    const day=isoDay(new Date());
    if(day!==lastDay){lastDay=day;refresh();}else render();
  },30000);
})();
