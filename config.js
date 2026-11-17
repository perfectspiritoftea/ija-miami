/*
 * IJA MIAMI — PUBLIC WEBSITE CONFIGURATION
 * Only the verified annual membership Zeffy form is enabled.
 * Do not store private donor information, credentials or API keys in this file.
 * Google Calendar is synced by GitHub Actions using GOOGLE_CALENDAR_ICS_URL.
 */
window.IJA_CONFIG = {
  zeffy: { membership: 'https://www.zeffy.com/en-US/ticketing/ija-annual-fees' },
  calendar: {
    // Optional. Link for visitors to open IJA's PUBLIC Google Calendar.
    publicUrl: 'https://calendar.google.com/calendar/u/0?cid=YzJiZGM1YWM2NWRlZTBjYmE5ZGQ4MDljZDliYWYxZTE5MWI4NjdmMmI4MzFlNTYyNTZlNGM1OTZjZDc5NmEzZEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
    timeZone: 'America/New_York'
  },
  socials: {
    youtube: '', // Add verified IJA YouTube channel; otherwise show existing search link
    facebook: 'https://www.facebook.com/p/Islamic-Jaffaria-Association-IJA-Miami-100064573394767/',
    instagram: ''
  }
};
