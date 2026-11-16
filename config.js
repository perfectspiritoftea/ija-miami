/*
 * IJA Miami hub configuration. Review all links and contact details before publishing.
 * Paste PUBLIC Zeffy campaign URLs only. Never put Zeffy API keys in this file.
 * Example public URL: https://www.zeffy.com/en-US/donation-form/your-campaign-id
 */
window.IJA_CONFIG = {
  zeffy: {
    membership: "",     // Membership registration and renewals
    donation: "",       // Donation form (enable monthly and one-time options in Zeffy)
    sponsor: "",        // Sponsorship campaign (or event's sponsor ticket tier)
    eventRsvp: ""       // General registration link until event-specific URLs are configured
  },
  socials: {
    youtube: "", // Confirm official IJA YouTube channel before publishing
    facebook: "https://www.facebook.com/p/Islamic-Jaffaria-Association-IJA-Miami-100064573394767/",
    instagram: ""       // Confirm official handle before enabling
  },
  // Optional. Only include CONFIRMED upcoming events. Dates use local Miami time.
  // Provide rsvpUrl and sponsorUrl from the corresponding Zeffy event campaign.
  events: [
    /* Example (remove comment after confirming details):
    {
      id: "sample-2027",
      title: "Community gathering",
      date: "2027-01-30T18:30:00-05:00",
      kind: "Community",
      location: "IJA Miami",
      description: "Gather with our community.",
      rsvpUrl: "https://www.zeffy.com/en-US/ticketing/...",
      sponsorUrl: "https://www.zeffy.com/en-US/ticketing/..."
    }
    */
  ]
};
