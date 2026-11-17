/* Shared navigation, social links and safe Zeffy actions. */
(() => {
  const config = window.IJA_CONFIG || {};
  const zeffy = config.zeffy || {};
  window.IJA = window.IJA || {};
  window.IJA.isZeffyUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' && ['zeffy.com', 'www.zeffy.com'].includes(parsed.hostname.toLowerCase());
    } catch (_) { return false; }
  };
  // Event-specific Zeffy links are shown only when a verified URL exists.
  window.IJA.openZeffy = (type, preferred = '') => {
    if (window.IJA.isZeffyUrl(preferred)) window.open(preferred, '_blank', 'noopener,noreferrer');
  };
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-zeffy-url]');
    if (!action) return;
    event.preventDefault();
    window.IJA.openZeffy('', action.dataset.zeffyUrl);
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
