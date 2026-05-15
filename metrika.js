const METRIKA_COUNTER_ID = 109227622;

(function initMetricCounter(m, e, t, r, i, k, a) {
  if (typeof window.ym === 'function') return;

  m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
  m[i].l = 1 * new Date();

  for (let j = 0; j < document.scripts.length; j += 1) {
    if (document.scripts[j].src === r) return;
  }

  k = e.createElement(t);
  a = e.getElementsByTagName(t)[0];
  k.async = 1;
  k.src = r;
  a.parentNode.insertBefore(k, a);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=109227622', 'ym');

window.ym(METRIKA_COUNTER_ID, 'init', {
  ssr: true,
  webvisor: true,
  clickmap: true,
  ecommerce: 'dataLayer',
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce: true,
  trackLinks: true,
});

window.sendMetricGoal = function sendMetricGoal(goalName, params = {}) {
  if (typeof window.ym === 'function') {
    window.ym(METRIKA_COUNTER_ID, 'reachGoal', goalName, params);
  }
};

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  const text = (link.textContent || '').trim();

  if (href.startsWith('tel:')) window.sendMetricGoal('phone_click', { href, text });
  if (href.includes('t.me') || text.toLowerCase().includes('telegram')) window.sendMetricGoal('telegram_click', { href, text });
  if (href.includes('wa.me') || text.toLowerCase().includes('whatsapp')) window.sendMetricGoal('whatsapp_click', { href, text });
  if (href.includes('/contacts/')) window.sendMetricGoal('contacts_click', { href, text });
  if (href.includes('/projects/')) window.sendMetricGoal('projects_click', { href, text });
});
