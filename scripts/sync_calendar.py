#!/usr/bin/env python3
"""Sync PUBLIC Google Calendar iCal events to events.json for GitHub Pages.

This intentionally runs on GitHub Actions. Browser code never receives a
Google API key, calendar fetch credential or private calendar URL.
"""

import hashlib
import json
import os
import re
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from icalendar import Calendar
import recurring_ical_events

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'events.json'
ZONE = ZoneInfo('America/New_York')
MAX_EVENTS = 30
WINDOW_DAYS = 120
PUBLIC_CALENDAR_URL = (
    'https://calendar.google.com/calendar/ical/'
    'c2bdc5ac65dee0cba9dd809cd9baf1e191b867f2b831e56256e4c596cd796a3d'
    '@group.calendar.google.com/public/basic.ics'
)  # Supplied public IJA calendar; a repository secret can override it.


def validate_calendar_url(raw):
    parsed = urlsplit(raw)
    if parsed.scheme != 'https' or parsed.hostname != 'calendar.google.com':
        raise ValueError('Use the PUBLIC Google Calendar iCal URL from calendar.google.com.')
    if '/public/' not in parsed.path or not parsed.path.endswith('.ics'):
        raise ValueError('The calendar must be public. Use its public iCal address, not a private/secret address.')
    if parsed.username or parsed.password:
        raise ValueError('Calendar URL must not contain credentials.')
    return raw


def valid_zeffy_url(candidate):
    candidate = candidate.rstrip('.,);>\"\'')
    try:
        parsed = urlsplit(candidate)
    except ValueError:
        return ''
    if parsed.scheme != 'https' or (parsed.hostname or '').lower() not in ('zeffy.com', 'www.zeffy.com'):
        return ''
    return candidate


def extract_campaign_links(description):
    # Recommended event description lines:
    # RSVP: https://www.zeffy.com/en-US/ticketing/...
    # SPONSOR: https://www.zeffy.com/en-US/ticketing/...
    result = {'rsvpUrl': '', 'sponsorUrl': ''}
    for line in description.splitlines():
        match = re.match(r'^\s*(RSVP|REGISTER|TICKETS|SPONSOR|SPONSORSHIP)\s*:\s*(https://\S+)', line, re.I)
        if not match:
            continue
        url = valid_zeffy_url(match.group(2))
        if not url:
            continue
        key = 'sponsorUrl' if match.group(1).upper() in ('SPONSOR','SPONSORSHIP') else 'rsvpUrl'
        result[key] = url
    return result


def normalize_start(value):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=ZONE)
        return value.astimezone(timezone.utc), False
    if isinstance(value, date):
        value = datetime.combine(value, time(0, 0), tzinfo=ZONE)
        return value.astimezone(timezone.utc), True
    raise ValueError('Unrecognized calendar event date')


def extract_event(component):
    start_value = component.decoded('DTSTART')
    start_utc, is_all_day = normalize_start(start_value)
    title = str(component.get('SUMMARY', '')).strip()
    if not title:
        return None
    uid = str(component.get('UID', ''))
    key = hashlib.sha256((uid + start_utc.isoformat()).encode('utf-8')).hexdigest()[:16]
    description = str(component.get('DESCRIPTION', ''))
    return {
        'id': key,
        'title': title[:180],
        'start': start_utc.isoformat().replace('+00:00', 'Z'),
        'allDay': is_all_day,
        'location': str(component.get('LOCATION', '')).strip()[:160],
        **extract_campaign_links(description)
    }


def main():
    raw_url = os.environ.get('GOOGLE_CALENDAR_ICS_URL', '').strip() or PUBLIC_CALENDAR_URL
    url = validate_calendar_url(raw_url)
    request = Request(url, headers={'User-Agent': 'IJA-Miami-public-calendar-sync/1.0'})
    with urlopen(request, timeout=30) as response:
        ics_bytes = response.read(8_000_001)
    if len(ics_bytes) > 8_000_000:
        raise ValueError('Public calendar exceeded the 8 MB safety limit.')
    calendar = Calendar.from_ical(ics_bytes)
    now = datetime.now(timezone.utc)
    # Include events which started within the previous hour for program visibility.
    start = now - timedelta(hours=1)
    end = now + timedelta(days=WINDOW_DAYS)
    occurrences = recurring_ical_events.of(calendar).between(start, end)
    events = []
    seen = set()
    for component in occurrences:
        if str(component.get('STATUS', '')).upper() == 'CANCELLED':
            continue
        record = extract_event(component)
        if record is None or record['id'] in seen:
            continue
        seen.add(record['id'])
        events.append(record)
    events.sort(key=lambda event: event['start'])
    events = events[:MAX_EVENTS]

    # Do not rewrite events.json on every run just because the poll time changed.
    previous = None
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding='utf-8'))
        except (ValueError, OSError):
            pass
    payload = {
        'source': 'google_calendar',
        'updatedAt': now.isoformat().replace('+00:00', 'Z'),
        'timeZone': 'America/New_York',
        'events': events
    }
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Synced {len(events)} public events to {OUTPUT.name}.')
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as fh:
            fh.write(f'### IJA Google Calendar\n\nSync succeeded: **{len(events)} public upcoming events**.\n\n')


def safe_sync():
    try:
        main()
    except Exception as error:
        # Publish a visitor-friendly fallback, not setup instructions or invented events.
        print(f'::warning title=Google Calendar sync failed::{type(error).__name__}: {error}')
        payload = {
            'source': 'unavailable',
            'updatedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'timeZone': 'America/New_York',
            'events': []
        }
        OUTPUT.write_text(json.dumps(payload, indent=2) + '\n', encoding='utf-8')
        summary = os.environ.get('GITHUB_STEP_SUMMARY')
        if summary:
            with open(summary, 'a', encoding='utf-8') as fh:
                fh.write('### IJA Google Calendar\n\n**Sync failed.** The site will show a link and Google Calendar preview instead of event cards.\n\n')
                fh.write('Check public calendar visibility and the public iCal address. See the calendar-sync step log.\n\n')


if __name__ == '__main__':
    safe_sync()
