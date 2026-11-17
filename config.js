/*
 * IJA MIAMI — PUBLIC WEBSITE CONFIGURATION
 * Add public Zeffy form links, and verified social accounts only.
 * Do not store private donor information, credentials or API keys in this file.
 * Google Calendar is synced by GitHub Actions using GOOGLE_CALENDAR_ICS_URL.
 */
window.IJA_CONFIG = {
  zeffy: {
    membership: '',         // Zeffy public membership form
    donation: '',           // Zeffy public donation form with a fundraising goal
    sponsor: '',            // General sponsor form (event-specific links take priority)
    eventRsvp: '',          // Optional generic RSVP form
    liveThermometerUrl: '', // Optional public "Live thermometer" link from Zeffy

    /* To show the actual live Zeffy progress widget on the site:
     * 1. In Zeffy, create/select a campaign and set a Fundraising goal.
     * 2. Campaign > Share > More ways to share > Embed > Thermometer.
     * 3. Paste Zeffy's official HTML embed into zeffy-thermometer.html,
     *    between the clearly marked comments.
     * 4. Change thermometerUseSnippet to true below.
     * If Zeffy gives an iframe URL, you can instead paste that URL into
     * thermometerEmbedUrl and leave thermometerUseSnippet false.
     */
    thermometerUseSnippet: false,
    thermometerEmbedUrl: ''
  },
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
