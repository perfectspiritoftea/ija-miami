# IJA Miami | Community hub

A minimal, mobile-first community website for IJA Miami, with:

- **Google Calendar:** automatically synced public events with a live countdown to the next event, a short list on the home page and a full Events page.
- **Zeffy:** event-specific RSVP and sponsor links, donation/membership actions and a **native, live Zeffy fundraising thermometer** on the home and Donations pages.
- **Community services:** marriage, burial/funeral assistance, youth/family services, social media and prayer links.

This is a GitHub Pages-ready, static website. No build framework, custom server, database, Google API key or Zeffy API key is required. Personal donor data stays in Zeffy. The website only displays events intentionally published on a public Google Calendar.

## 1. Upload to GitHub

1. Create a public GitHub repository, such as `ija-miami-website`, or open your existing site repository.
2. Upload **all files and directories in this package to the repository root**, including the hidden `.github/workflows/sync-calendar.yml` file. In particular `index.html`, `events.html`, `donate.html`, `.github`, `assets`, `config.js` and `scripts` must be preserved. Do not upload the ZIP file itself.
3. Commit the files to the `main` branch.
4. Under **Settings > Pages > Build and deployment > Source**, select **GitHub Actions**. This replaces the older “Deploy from a branch” setting used for the first prototype. The packaged workflow publishes the site after each push and approximately every 30 minutes when scheduled runs execute.
5. Go to the **Actions** tab, open **Publish IJA website and sync Google Calendar**, and click **Run workflow** for the first deploy. Its deployed URL appears in **Settings > Pages**.

Important: **Do not continue using branch deployment** for the automated calendar. GitHub Actions creates the updated calendar file during publishing; branch deployment would show the placeholder `events.json`.

## 2. Connect the Google Calendar (no API keys)

Use a dedicated calendar for **public IJA community events only**, not anyone's personal calendar.

1. In Google Calendar on a computer, select the intended IJA calendar. Go to **Settings and sharing**.
2. Under **Access permissions for events**, choose **Make available to public**, including event details. Only publish information suitable for everyone to read.
3. Under **Integrate calendar**, copy **Public address in iCal format**. It should resemble `https://calendar.google.com/calendar/ical/.../public/basic.ics`. Do **not** use the private or secret iCal address.
4. In your GitHub repository, go to **Settings > Secrets and variables > Actions > New repository secret**. Create a secret named exactly `GOOGLE_CALENDAR_ICS_URL`, with the full public `.ics` address as its value.
5. Under **Actions**, run the packaged workflow again. The site will now show upcoming events, with a countdown that ticks every second. On the Events page, a longer list appears.
6. Edit `config.js` and set `calendar.publicUrl` to the official **public calendar view URL** so people can open the full Google Calendar. This is different from the ICS feed URL. If omitted, the website uses the existing IJA events page as a fallback.

**How updates work:** GitHub Actions fetches the public Google Calendar at each deployment (roughly every 30 minutes; scheduled GitHub runs can be delayed), expands recurring events, and publishes `events.json` as part of the site. Browsers refresh the feed while open. The live countdown calculates time in the visitor’s browser using published event timestamps. Time formatting uses `America/New_York` for Miami, including daylight saving time.

The `events.json` in the repository is initially a *connection pending* placeholder. The published workflow replaces it at deploy time after the secret is set. No calendar authentication is shipped to visitors.

### Add RSVPs and event sponsorship in Google Calendar

For each Google Calendar event, add these lines to its **description** (using the exact labels and a public Zeffy URL):

```
RSVP: https://www.zeffy.com/en-US/ticketing/YOUR-EVENT-RSVP-FORM
SPONSOR: https://www.zeffy.com/en-US/ticketing/YOUR-EVENT-SPONSOR-FORM
```

The site displays **RSVP** and **Sponsor** next to each event. The event-specific links override generic fallback forms in `config.js`. If a link is missing, a generic form is used when configured; otherwise the button explains what needs to be connected. This applies to recurring event occurrences as well. Use distinct Zeffy forms or sponsorship tiers if you want separate event reports and sponsor tracking.

The calendar parser limits event records to 30 upcoming events across a 120-day window, including recurring occurrences. The home page shows 3 and the Events page shows 15. Adjust the script if IJA needs more. Cancelled events are omitted.

## 3. Connect Zeffy payments and native fundraising thermometer

Edit `config.js`: add **public** Zeffy URLs for `zeffy.donation`, `zeffy.membership`, `zeffy.sponsor`, and optionally `zeffy.eventRsvp`.

For the fundraising thermometer, **do not build a separate manually updated progress bar**. Zeffy's live thermometer is the source of truth and displays both the target and amount raised.

1. In Zeffy open the donation or peer-to-peer campaign, edit it and set the **Fundraising goal**.
2. On the campaign, choose **Share > More ways to share > Embed > Thermometer**. Copy Zeffy's exact native **Thermometer** embed HTML. If the option is unavailable, confirm your campaign is eligible and has a goal.
3. Open `zeffy-thermometer.html`. Paste the native code between `START` and `END` comment markers. Commit the file.
4. In `config.js`, set `zeffy.thermometerUseSnippet: true`.
5. Republish. The exact Zeffy widget will appear on both the home page fundraising section and the Donations page. It is automatically updated by Zeffy. No goal or progress number is duplicated in site code.

**Alternative:** If Zeffy provides a direct HTTPS iframe embed URL on `zeffy.com`, set `zeffy.thermometerEmbedUrl` to that URL and keep `thermometerUseSnippet: false`. The native HTML-snippet method is preferred because it preserves Zeffy's official embed requirements.

For an optional **Live thermometer** page, set `zeffy.liveThermometerUrl` to Zeffy's published live campaign URL. This is a distinct page feature and may not be the same as a standalone thermometer embed.

**Before connecting Zeffy:** visitors see a clearly labeled placeholder. The site does not invent a fundraising amount, goal, campaign or donor record.

## 4. Final review before launch

- Verify all contact numbers, prayer times, funeral/burial information and addresses against IJA's official sources.
- Verify the official YouTube channel and Instagram handle before adding these in `config.js`.
- Confirm the Google Calendar has only **public** events, with no confidential attendee data, and correctly handles recurring events and all-day events.
- Confirm each Zeffy RSVP link, event sponsorship tier, donation campaign, and membership form is owned by IJA before adding it. Do not place private API keys, payment details or donor data in this repository.
- Review the Donations page after embedding Zeffy's native snippet on mobile and desktop; Zeffy controls the widget's live appearance.
- GitHub Pages deployments are public. Set your real IJA domain under **Settings > Pages > Custom domain** only after verifying the prototype.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Mobile-first home, next event, upcoming events, fundraising, services |
| `events.html` | Full events list and countdown |
| `donate.html` | Donations, native fundraising thermometer and giving options |
| `config.js` | Public Zeffy links, social links, public calendar view URL |
| `zeffy-thermometer.html` | Exact Zeffy-native embed snippet pasted by IJA |
| `calendar.js` | Frontend events and live countdown |
| `fundraising.js` | Zeffy-native thermometer frames |
| `app.js` | Shared navigation and Zeffy link actions |
| `scripts/sync_calendar.py` | Converts public Google Calendar ICS to event JSON |
| `.github/workflows/sync-calendar.yml` | Scheduled calendar refresh and direct GitHub Pages deploy |
| `events.json` | Initial placeholder; replaced in published artifact by GitHub Actions |
| `styles.css`, `assets/` | Design system and icons |
| `manifest.webmanifest`, `service-worker.js` | Install-to-home-screen and offline behavior |

## Preview locally

Run `python3 -m http.server 8000` from the extracted folder and open `http://localhost:8000`.

The local prototype has no live Google Calendar or Zeffy data until IJA provides the public calendar URL and campaign snippets. To test the calendar display locally, you can temporarily create sample entries in `events.json`. Do not commit invented events as if they were real.

## Design rationale

This revision retains the quieter, editorial IJA visual identity from the previous prototype. The calendar and fundraising sections have generous spacing, minimal interface chrome and direct calls to action. Taste Skill guides typography and hierarchy, Hallmark avoids stock AI-dashboard composition, Impeccable guides critique and Vercel web guidelines inform mobile usability.

## IJA Calendar supplied November 2026

The site public calendar link is now configured in `config.js`.

For GitHub Actions, set the repository secret `GOOGLE_CALENDAR_ICS_URL` to:

`https://calendar.google.com/calendar/ical/c2bdc5ac65dee0cba9dd809cd9baf1e191b867f2b831e56256e4c596cd796a3d@group.calendar.google.com/public/basic.ics`

The provided Google Calendar link identifies the calendar but does not prove that the public iCal feed is accessible. In Google Calendar Settings and sharing, enable public event visibility for the dedicated IJA events calendar and confirm the public iCal feed works before deployment. Do not use a private/secret iCal address.

Zeffy campaign URLs and the fundraising thermometer still need to be configured separately.
