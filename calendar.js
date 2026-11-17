/* Public calendar JSON, updated by the GitHub Actions Google Calendar sync. */
(() => {
  const containers = [...document.querySelectorAll('[data-calendar-feed]')];
  const nextPanels = [...document.querySelectorAll('[data-next-event]')];
  if (!containers.length && !nextPanels.length) return;
  const cfg = window.IJA_CONFIG || {};
  const tz = cfg.calendar?.timeZone || 'America/New_York';
  const fallbackCalendarUrl = 'https://www.ijamiami.org/new-events-1';
  const configuredCalendarUrl = cfg.calendar?.publicUrl;
  const fallbackFrames = [...document.querySelectorAll('[data-calendar-fallback]')];
  for (const link of document.querySelectorAll('[data-calendar-public-link]')) {
    try {
      if (new URL(configuredCalendarUrl).protocol === 'https:') link.href = configuredCalendarUrl;
      else link.href = fallbackCalendarUrl;
    } catch (_) { link.href = fallbackCalendarUrl; }
  }
  let upcoming = [];
  let source = 'unavailable';
  let previousNextId = undefined;

  function formatDate(value, opts) {
    return new Intl.DateTimeFormat('en-US', {timeZone:tz, ...opts}).format(new Date(value));
  }
  function eventStartsInFuture(event) { return new Date(event.start).getTime() > Date.now(); }
  function setEmpty(container, heading, description) {
    container.replaceChildren();
    const box = document.createElement('div'); box.className = 'event-placeholder';
    const title = document.createElement('strong'); title.textContent = heading;
    const copy = document.createElement('p'); copy.textContent = description;
    const link = document.createElement('a');
    link.className = 'text-arrow';
    link.textContent = 'Open the full calendar ↗';
    link.href = (typeof configuredCalendarUrl === 'string' && configuredCalendarUrl.startsWith('https://calendar.google.com/')) ? configuredCalendarUrl : fallbackCalendarUrl;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    box.append(title, copy, link); container.append(box);
  }
  function addZeffyButton(container, label, type, preferredUrl = '') {
    if (!window.IJA?.isZeffyUrl?.(preferredUrl)) return;
    const action = document.createElement('button'); action.type = 'button';
    action.textContent = label + ' ↗';
    action.dataset.zeffy = type;
    action.dataset.zeffyUrl = preferredUrl;
    container.append(action);
  }
  function renderEvent(container, item) {
    const article = document.createElement('article'); article.className = 'event-item';
    const row = document.createElement('div'); row.className = 'event-item-head';
    const when = document.createElement('div'); when.className = 'event-date';
    const number = document.createElement('strong'); number.textContent = formatDate(item.start, {day:'numeric'});
    const month = document.createElement('span'); month.textContent = formatDate(item.start, {month:'short'});
    when.append(number, month);
    const info = document.createElement('div'); info.className = 'event-info';
    const title = document.createElement('h3'); title.textContent = item.title;
    const meta = document.createElement('p');
    const day = formatDate(item.start,{weekday:'short',month:'short',day:'numeric'});
    const time = item.allDay ? 'All day' : formatDate(item.start,{hour:'numeric',minute:'2-digit'});
    const place = item.location || 'IJA Miami';
    meta.textContent = [day,time,place].join(' · ');
    const actions = document.createElement('div'); actions.className = 'event-actions';
    addZeffyButton(actions, 'RSVP', 'eventRsvp', item.rsvpUrl);
    addZeffyButton(actions, 'Sponsor', 'sponsor', item.sponsorUrl);
    info.append(title,meta,actions); row.append(when,info); article.append(row); container.append(article);
  }
  function renderFeeds() {
    const now=Date.now();
    upcoming = upcoming.filter(event => new Date(event.start).getTime() >= now - 60000);
    containers.forEach(container => {
      container.replaceChildren();
      if (source !== 'google_calendar') {
        setEmpty(container,'Explore upcoming events','Open the IJA calendar to see the latest programs and gatherings.');
        return;
      }
      const visible = upcoming.filter(eventStartsInFuture).slice(0, Number(container.dataset.limit) || 3);
      if (!visible.length) {
        setEmpty(container,'No upcoming events listed','Check the full calendar for new announcements and updates.');
        return;
      }
      visible.forEach(event => renderEvent(container,event));
    });
    fallbackFrames.forEach(frame => { frame.hidden = source === 'google_calendar'; });
  }
  function refreshNext() {
    const next = upcoming.find(eventStartsInFuture);
    const nextId = next ? next.id + ':' + next.start : '__none__';
    if (nextId !== previousNextId) {
      previousNextId = nextId;
      nextPanels.forEach(panel => {
        const title = panel.querySelector('[data-next-title]');
        const meta = panel.querySelector('[data-next-meta]');
        const countdown = panel.querySelector('[data-countdown-wrap]');
        const sponsor = panel.querySelector('[data-next-sponsor]');
        if (!next) {
          title.textContent = 'Explore the community calendar';
          meta.textContent = source === 'google_calendar' ? 'No upcoming event is listed. Check the calendar for updates.' : 'Find the latest programs and gatherings in IJA’s calendar.';
          countdown.hidden = true;
          if (sponsor) sponsor.dataset.zeffyUrl = '';
        } else {
          title.textContent = next.title;
          meta.textContent = (next.allDay ? formatDate(next.start,{weekday:'long',month:'long',day:'numeric'})+' · All day' : formatDate(next.start,{weekday:'long',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'})) + (next.location ? ' · '+next.location : '');
          countdown.hidden = false;
          if (sponsor) sponsor.dataset.zeffyUrl = window.IJA?.isZeffyUrl?.(next.sponsorUrl) ? next.sponsorUrl : '';
        }
      });
    }
    if (!next) return;
    let remaining = Math.max(0, Math.floor((new Date(next.start).getTime() - Date.now()) / 1000));
    const days = Math.floor(remaining / 86400); remaining %= 86400;
    const hours = Math.floor(remaining / 3600); remaining %= 3600;
    const minutes = Math.floor(remaining / 60); const seconds = remaining % 60;
    // Compact format is deliberate: the countdown is information, not decoration.
    const output = `${days}d  ${String(hours).padStart(2,'0')}h  ${String(minutes).padStart(2,'0')}m  ${String(seconds).padStart(2,'0')}s`;
    nextPanels.forEach(panel => {
      const timer = panel.querySelector('[data-countdown]');
      timer.textContent = output;
      timer.setAttribute('aria-label', `Time until ${next.title}: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
    });
  }
  async function fetchEvents() {
    try {
      const response = await fetch('./events.json',{cache:'no-store'});
      if (!response.ok) throw new Error('Unable to load public events JSON');
      const data = await response.json();
      if (!Array.isArray(data.events)) throw new Error('Invalid events payload');
      source = data.source === 'google_calendar' ? 'google_calendar' : 'unavailable';
      upcoming = data.events.filter(item => item && typeof item.title==='string' && typeof item.start==='string' && Number.isFinite(new Date(item.start).getTime()))
        .sort((a,b)=>new Date(a.start)-new Date(b.start));
      previousNextId = undefined;
      renderFeeds(); refreshNext();
    } catch (error) {
      // Preserve previously loaded events if a refresh fails.
      if (!upcoming.length) { source = 'unavailable'; renderFeeds(); refreshNext(); }
      console.warn('Public event calendar unavailable:',error.message);
    }
  }
  fetchEvents();
  window.setInterval(() => {const before=previousNextId;refreshNext();if (before !== previousNextId) renderFeeds();},1000);
  window.setInterval(fetchEvents, 15*60*1000);
})();
