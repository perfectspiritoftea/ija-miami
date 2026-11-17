# IJA Miami community website

Static GitHub Pages website. Shared navigation and footer live in `site-shell.js`. Page-specific content remains in the five HTML pages.

## Pages

- `index.html`: Home
- `events.html`: Calendar feed and next-event countdown
- `donate.html`: Giving information (no unconfigured Zeffy forms)
- `membership.html`: IJA annual membership, with the supplied Zeffy embed
- `cemetery.html`: Cemetery records and maps

## Deployment

Upload all files including `.github/workflows/sync-calendar.yml` to the repository root. In GitHub Pages choose **GitHub Actions**. Add repository secret `GOOGLE_CALENDAR_ICS_URL` with the public Google Calendar iCal feed. Run the workflow. It generates `events.json` and deploys the site.

The site does not require a Node build or npm. `site-shell.js` is required for navigation/footer. Keep `assets/ija-symbol.svg`.

## Integrations

- Google Calendar: `scripts/sync_calendar.py` generates `events.json` on schedule.
- Zeffy: The only active form is the official annual membership embed in `membership.html`. Event-specific RSVP/sponsorship actions appear only if valid Zeffy URLs are included in Google Calendar event descriptions.
- Donations: No unconfigured Zeffy widgets or fake thermometer are shown.

## Caching

An old service worker caused risk of stale pages. The new site unregisters old service workers and relies on normal browser caching.

## Verification

Check the GitHub Actions deployment and visit `/events.json`, `/events.html`, `/membership.html` and `/cemetery.html` on the published site. The Zeffy embed and live calendar require online verification.
