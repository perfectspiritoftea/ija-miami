# IJA Miami community hub — membership integration

This version adds a dedicated `membership.html` page with the official Zeffy annual fees embed and its iframe fallback. It removes all other unconfigured Zeffy buttons, thermometers and setup dialogs. Event-specific Zeffy RSVP or sponsorship links will only appear if a verified Zeffy URL is present in a Google Calendar event.

## Deploy
Upload all files to the GitHub repository root, including `.github/workflows/sync-calendar.yml`. GitHub Pages must use **GitHub Actions** as its publishing source. Trigger the workflow or commit to `main`. The workflow includes `membership.html` in the published artifact.

## Membership
Public form: https://www.zeffy.com/en-US/ticketing/ija-annual-fees
Embedded in `membership.html` using Zeffy's official v2 embed script with iframe fallback. The form can also be opened directly if third-party scripts are blocked. No Zeffy API keys are used.

## Other giving forms
No general donation, fundraising thermometer, or sponsorship placeholders are published. Those can be added when actual Zeffy campaign links and embeds are provided.

## Calendar
Keep the existing GitHub Actions secret `GOOGLE_CALENDAR_ICS_URL`. The scheduled calendar sync is unchanged.
