/* Shared navigation, social links and safe Zeffy actions. */
(() => {
  const config = window.IJA_CONFIG || {};
  const zeffy = config.zeffy || {};
  const zeffyKinds = {
    membership: ['Membership form not connected', 'Add the public IJA Zeffy membership form URL in config.js.'],
    donation: ['Donation form not connected', 'Add the public IJA Zeffy donation campaign URL in config.js.'],
    sponsor: ['Sponsorship form not connected', 'Add the public Zeffy event sponsorship URL in config.js, or an event-specific SPONSOR link in the Google Calendar description.'],
    eventRsvp: ['Event registration not connected', 'Add an RSVP Zeffy link to the Google Calendar event description or the general RSVP form URL in config.js.']
  };
  window.IJA = window.IJA || {};
  window.IJA.isZeffyUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' && ['zeffy.com', 'www.zeffy.com'].includes(parsed.hostname.toLowerCase());
    } catch (_) { return false; }
  };
  window.IJA.openZeffy = (type, preferred = '') => {
    const url = window.IJA.isZeffyUrl(preferred) ? preferred : zeffy[type];
    if (window.IJA.isZeffyUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      openNotice(type);
    }
  };

  const dialog = document.getElementById('zeffy-dialog');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogDescription = document.getElementById('dialog-description');
  const dialogClose = document.getElementById('dialog-close');
  const dialogDone = document.getElementById('dialog-done');
  let lastFocus = null;
  function openNotice(type) {
    if (!dialog) return;
    lastFocus = document.activeElement;
    const [title, description] = zeffyKinds[type] || ['Link not connected', 'An IJA public Zeffy link must be added.'];
    dialogTitle.textContent = title;
    dialogDescription.textContent = description;
    dialog.hidden = false;
    document.body.classList.add('modal-open');
    dialogClose.focus();
  }
  function closeNotice() {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocus?.focus?.();
  }
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-zeffy]');
    if (!action) return;
    event.preventDefault();
    window.IJA.openZeffy(action.dataset.zeffy, action.dataset.zeffyUrl || '');
  });
  dialogClose?.addEventListener('click', closeNotice);
  dialogDone?.addEventListener('click', closeNotice);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeNotice(); });
  document.addEventListener('keydown', (event) => {
    if (!dialog || dialog.hidden) return;
    if (event.key === 'Escape') { closeNotice(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [dialogClose, dialogDone];
    if (event.shiftKey && document.activeElement === focusable[0]) {
      event.preventDefault(); focusable[1].focus();
    } else if (!event.shiftKey && document.activeElement === focusable[1]) {
      event.preventDefault(); focusable[0].focus();
    }
  });
  const menuButton = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (menuButton && menu) {
    const setMenu = (open) => {
      menu.hidden = !open;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    menuButton.addEventListener('click', () => setMenu(menu.hidden));
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) { setMenu(false); menuButton.focus(); }
    });
  }
  for (const [key, id] of [['youtube','youtube-link'], ['facebook','facebook-link'],['instagram','instagram-link']]) {
    const link = document.getElementById(id);
    const url = config.socials?.[key];
    if (!link) continue;
    try {
      if (new URL(url).protocol === 'https:') {
        link.href = url;
        link.hidden = false;
        if (key === 'youtube') link.firstChild.nodeValue = 'IJA on YouTube ';
      }
    } catch (_) {}
  }
  document.querySelectorAll('#copyright-year').forEach(node => node.textContent = new Date().getFullYear());
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }
})();
