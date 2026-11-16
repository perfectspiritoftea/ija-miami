# IJA Miami Community Hub

A mobile-first community website prototype for IJA Miami. Designed as a lightweight static site that can be published directly with GitHub Pages.

## Publish with GitHub Pages

1. Create a new GitHub repository named `ija-miami-website` (or another name). Make it **public** if using GitHub Free.
2. Extract the `ija-miami-github-ready.zip` archive on your computer. **Upload the files INSIDE the extracted folder**, including `index.html`, `config.js`, `styles.css`, `app.js`, `manifest.webmanifest`, `service-worker.js`, the `assets` folder, and `.nojekyll`, to the **root** of your repository. Do **not** upload the ZIP alone.
3. Commit the uploaded files on the `main` branch.
4. Open **Settings > Pages** in the GitHub repository.
5. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/(root)**. Click **Save**.
6. Once deployment finishes, open the site's **Visit site** link in Settings > Pages. For a repository named `ija-miami-website`, the default address will usually be `https://YOUR-USERNAME.github.io/ija-miami-website/`.

This website needs no build system or JavaScript framework. All resource links are relative, so it works on GitHub Pages project URLs.

## Set up the real integrations before public launch

Edit `config.js` to insert **public** Zeffy campaign links for `membership`, `donation`, `sponsor`, and `eventRsvp`. In the same file, add verified official YouTube and Instagram links and confirmed upcoming events. Do not commit Zeffy API keys, donor lists or other private data.

The site links out to Zeffy forms; it does not process payments or read/write CRM records itself. Marriage and funeral enquiries link to existing IJA services rather than saving sensitive information in the public website.

## What to review

- Confirm organizational approval and all published addresses, phone numbers, Friday prayer times, and services.
- Confirm the official social accounts and event details. The default YouTube action is a search link, not a verified official channel.
- Confirm Zeffy forms work for the correct campaign, including registration receipts and sponsorship tiers.
- Review the website on mobile and desktop before sharing the link.
- GitHub Pages sites are public on the internet, even if the repository is private on a plan that allows private repositories.

## Local preview

From the folder containing `index.html`, run:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Files

- `index.html`: page structure
- `styles.css`: visual design and mobile layout
- `app.js`: menu, Zeffy actions, and events display
- `config.js`: public Zeffy links, social links, confirmed events
- `assets/`: icons
- `manifest.webmanifest`, `service-worker.js`: optional install-to-home-screen and offline support
- `.nojekyll`: tells GitHub Pages to serve the files as-is

## Status

Design prototype only. External integration links must be confirmed before launch. No live Zeffy transactions were tested. Visual design draws on Taste Skill, Hallmark, Impeccable and Vercel guidelines.
