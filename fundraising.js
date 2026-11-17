/* Render only Zeffy's own thermometer, never a simulated amount/goal. */
(() => {
  const zeffy = window.IJA_CONFIG?.zeffy || {};
  const panels = document.querySelectorAll('[data-thermometer]');
  for (const panel of panels) {
    let url = '';
    let external = false;
    if (zeffy.thermometerUseSnippet === true) {
      url = './zeffy-thermometer.html';
    } else if (typeof zeffy.thermometerEmbedUrl === 'string' && window.IJA?.isZeffyUrl?.(zeffy.thermometerEmbedUrl)) {
      url = zeffy.thermometerEmbedUrl;
      external = true;
    }
    if (!url) continue;
    panel.classList.add('thermometer-connected');
    panel.querySelector('.thermometer-placeholder')?.remove();
    const frame = document.createElement('iframe');
    frame.title = 'Live fundraising progress from Zeffy';
    frame.className = 'thermometer-embed';
    frame.src = url;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('allow','payment');
    frame.setAttribute('scrolling','auto');
    frame.height = panel.dataset.thermometerContext === 'home' ? '300' : '360';
    if (external) frame.setAttribute('data-external-embed','true');
    panel.querySelector('.embed-kicker')?.insertAdjacentElement('afterend', frame);
    if (window.IJA?.isZeffyUrl?.(zeffy.liveThermometerUrl)) {
      const link = document.createElement('a');
      link.className = 'inline-link';
      link.href = zeffy.liveThermometerUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open Zeffy live campaign ↗';
      panel.append(link);
    }
  }
})();
