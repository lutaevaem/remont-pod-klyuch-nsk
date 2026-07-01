const form = document.querySelector('#lead-form');
const statusNode = document.querySelector('#form-status');

function hasScriptBySrc(part) {
  return Array.from(document.scripts).some((script) => script.src && script.src.includes(part));
}

function hasStylesheetByHref(part) {
  return Array.from(document.styleSheets).some((sheet) => sheet.href && sheet.href.includes(part));
}

function loadStylesheet(href, marker) {
  if (document.querySelector(`link[data-style-marker="${marker}"]`) || hasStylesheetByHref(href)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.styleMarker = marker;
  document.head.appendChild(link);
}

function injectMobileInteractionStyles() {
  if (document.querySelector('#mobile-interaction-styles')) return;
  const style = document.createElement('style');
  style.id = 'mobile-interaction-styles';
  style.textContent = `
    .mobile-menu-button,
    .mobile-menu-panel { display: none; }

    .cookie-banner {
      position: fixed;
      left: max(18px, calc((100vw - 1180px) / 2));
      right: max(18px, calc((100vw - 1180px) / 2));
      bottom: 18px;
      z-index: 95;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: center;
      max-width: 920px;
      margin: 0 auto;
      padding: 16px 18px;
      border: 1px solid rgba(224,187,114,.30);
      border-radius: 24px;
      background: rgba(17,16,14,.94);
      color: #f7f1e8;
      box-shadow: 0 22px 80px rgba(0,0,0,.34);
      backdrop-filter: blur(18px);
      transition: opacity .22s ease, transform .22s ease;
    }
    .cookie-banner.is-hidden { opacity: 0; transform: translateY(12px); }
    .cookie-banner__copy b { display: block; color: #e0bb72; font-size: 13px; line-height: 1.1; margin-bottom: 5px; }
    .cookie-banner__copy p { margin: 0; color: #d8d0c3; font-size: 12px; line-height: 1.45; }
    .cookie-banner__actions { display: flex; gap: 9px; align-items: center; }
    .cookie-banner__actions a,
    .cookie-banner__actions button {
      display: inline-flex;
      min-height: 40px;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      border-radius: 999px;
      font: inherit;
      font-size: 12px;
      font-weight: 900;
      cursor: pointer;
      white-space: nowrap;
    }
    .cookie-banner__actions a { border: 1px solid rgba(224,187,114,.24); color: #f7f1e8; background: rgba(255,255,255,.045); }
    .cookie-banner__actions button { border: 0; color: #17120a; background: linear-gradient(135deg,#e0bb72,#caa15a); }

    @media (max-width: 760px) {
      .site-header {
        grid-template-columns: auto minmax(0,1fr) auto !important;
        align-items: center !important;
        position: sticky;
      }
      .mobile-menu-button {
        display: inline-grid;
        width: 38px;
        height: 38px;
        place-items: center;
        gap: 4px;
        padding: 9px;
        border: 1px solid rgba(224,187,114,.34);
        border-radius: 14px;
        background: rgba(255,255,255,.045);
        color: #e0bb72;
        cursor: pointer;
      }
      .mobile-menu-button span {
        display: block;
        width: 17px;
        height: 2px;
        border-radius: 999px;
        background: currentColor;
        transition: transform .2s ease, opacity .2s ease;
      }
      .mobile-menu-button.is-open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
      .mobile-menu-button.is-open span:nth-child(2) { opacity: 0; }
      .mobile-menu-button.is-open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
      .site-header > .brand { justify-self: start; }
      .site-header > .nav { display: none !important; }
      .mobile-menu-panel {
        grid-column: 1 / -1;
        margin-top: 2px;
        padding: 12px;
        border: 1px solid rgba(224,187,114,.24);
        border-radius: 22px;
        background:
          radial-gradient(circle at 12% 0%, rgba(224,187,114,.13), transparent 38%),
          rgba(18,16,13,.97);
        box-shadow: 0 18px 58px rgba(0,0,0,.30);
        transform: translateY(-4px);
        opacity: 0;
        transition: opacity .2s ease, transform .2s ease;
      }
      .mobile-menu-panel[hidden] { display: none !important; }
      .mobile-menu-panel.is-open { display: block; opacity: 1; transform: translateY(0); }
      .mobile-menu-panel__links { display: grid; gap: 7px; }
      .mobile-menu-panel__links a {
        display: flex;
        min-height: 44px;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        border: 1px solid rgba(224,187,114,.16);
        border-radius: 16px;
        background: rgba(255,255,255,.045);
        color: #f7f1e8;
        font-size: 13px;
        font-weight: 900;
      }
      .mobile-menu-panel__links a::after { content: '→'; color: #e0bb72; }
      .mobile-menu-panel__links a[aria-current='page'] {
        border-color: rgba(224,187,114,.42);
        background: rgba(224,187,114,.10);
        color: #e0bb72;
      }
      .mobile-menu-panel__actions {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 7px;
        margin-top: 10px;
      }
      .mobile-menu-panel__actions a {
        display: inline-flex;
        min-height: 38px;
        align-items: center;
        justify-content: center;
        padding: 0 8px;
        border-radius: 14px;
        background: linear-gradient(135deg,#e0bb72,#caa15a);
        color: #17120a;
        font-size: 10px;
        line-height: 1.05;
        font-weight: 900;
        text-align: center;
      }
      .cookie-banner {
        left: 10px;
        right: 10px;
        bottom: calc(70px + env(safe-area-inset-bottom));
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 14px;
        border-radius: 22px;
      }
      .cookie-banner__copy b { font-size: 13px; }
      .cookie-banner__copy p { font-size: 11px; line-height: 1.42; }
      .cookie-banner__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .cookie-banner__actions a,
      .cookie-banner__actions button { width: 100%; min-height: 38px; font-size: 11px; }
    }

    @media (max-width: 390px) {
      .mobile-menu-panel__actions { grid-template-columns: 1fr; }
      .mobile-menu-panel__actions a { min-height: 36px; }
    }
  `;
  document.head.appendChild(style);
}

function loadMobilePolish() {
  loadStylesheet('/mobile-polish.css?v=2', 'mobile-polish');
  injectMobileInteractionStyles();
}

function loadFavicon() {
  if (document.querySelector('script[data-site-favicon]') || hasScriptBySrc('/site-favicon.js')) return;
  const script = document.createElement('script');
  script.src = '/site-favicon.js';
  script.defer = true;
  script.dataset.siteFavicon = 'true';
  document.head.appendChild(script);
}

function initMobileMenu() {
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.nav');
  if (!header || !nav || header.querySelector('.mobile-menu-button')) return;

  const menuButton = document.createElement('button');
  menuButton.className = 'mobile-menu-button';
  menuButton.type = 'button';
  menuButton.setAttribute('aria-label', 'Открыть меню');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = '<span></span><span></span><span></span>';

  const panel = document.createElement('div');
  panel.className = 'mobile-menu-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Мобильное меню');

  const links = Array.from(nav.querySelectorAll('a')).map((link) => {
    const href = link.getAttribute('href') || '#';
    const current = link.getAttribute('aria-current') ? ' aria-current="page"' : '';
    return `<a href="${href}"${current}>${link.textContent.trim()}</a>`;
  }).join('');

  panel.innerHTML = `
    <div class="mobile-menu-panel__links">${links}</div>
    <div class="mobile-menu-panel__actions">
      <a href="tel:+79137998808">Позвонить</a>
      <a href="https://t.me/UsoltcevAG" target="_blank" rel="noreferrer">Telegram</a>
      <a href="https://wa.me/79137998808" target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  `;

  function closeMenu() {
    menuButton.classList.remove('is-open');
    panel.classList.remove('is-open');
    panel.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
  }

  function openMenu() {
    menuButton.classList.add('is-open');
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-menu-open');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.classList.contains('is-open');
    if (isOpen) closeMenu(); else openMenu();
  });

  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!menuButton.classList.contains('is-open')) return;
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  header.insertBefore(menuButton, header.firstElementChild);
  header.appendChild(panel);
}

function loadHomeProjects() {
  if (!document.querySelector('#projects-preview .project-grid-premium')) return;
  if (document.querySelector('script[data-home-projects]') || hasScriptBySrc('/home-projects.js')) return;
  const script = document.createElement('script');
  script.src = '/home-projects.js';
  script.defer = true;
  script.dataset.homeProjects = 'true';
  document.head.appendChild(script);
}

function loadMetrika() {
  if (document.querySelector('script[data-metrika-local]') || hasScriptBySrc('/metrika.js')) return;
  const script = document.createElement('script');
  script.src = '/metrika.js';
  script.async = true;
  script.dataset.metrikaLocal = 'true';
  document.head.appendChild(script);
}

function loadSupabasePublic() {
  if (!document.querySelector('script[data-supabase-cdn]') && !hasScriptBySrc('@supabase/supabase-js')) {
    const supabaseScript = document.createElement('script');
    supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    supabaseScript.dataset.supabaseCdn = 'true';
    document.head.appendChild(supabaseScript);
  }
  if (!document.querySelector('script[data-supabase-config]') && !hasScriptBySrc('supabase-config.js')) {
    const configScript = document.createElement('script');
    configScript.src = '/supabase-config.js';
    configScript.dataset.supabaseConfig = 'true';
    document.head.appendChild(configScript);
  }
  if (!document.querySelector('script[data-site-content]') && !hasScriptBySrc('/site-content.js')) {
    const contentScript = document.createElement('script');
    contentScript.src = '/site-content.js';
    contentScript.defer = true;
    contentScript.dataset.siteContent = 'true';
    document.head.appendChild(contentScript);
  }
  if (!document.querySelector('script[data-site-seo]') && !hasScriptBySrc('/site-seo.js')) {
    const seoScript = document.createElement('script');
    seoScript.src = '/site-seo.js';
    seoScript.defer = true;
    seoScript.dataset.siteSeo = 'true';
    document.head.appendChild(seoScript);
  }
}

function waitForSupabasePublic(retries = 80) {
  return new Promise((resolve) => {
    const tick = () => {
      if (window.SUPABASE_CONFIG && window.supabase?.createClient) return resolve(true);
      retries -= 1;
      if (retries <= 0) return resolve(false);
      setTimeout(tick, 100);
    };
    tick();
  });
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message || 'Request timeout')), timeoutMs)),
  ]);
}

function reachGoal(goalName, params = {}) {
  if (typeof window.sendMetricGoal === 'function') window.sendMetricGoal(goalName, params);
}

function collectUtm() {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  return keys.reduce((acc, key) => {
    if (params.get(key)) acc[key] = params.get(key);
    return acc;
  }, {});
}

function applyProjectFilter(filter) {
  const dynamicProjectItems = document.querySelectorAll(
    '#dynamic-featured-project .project-item[data-category], #dynamic-projects .project-item[data-category]'
  );
  const projectItems = dynamicProjectItems.length
    ? dynamicProjectItems
    : document.querySelectorAll('#static-featured-project.project-fallback[data-category], #static-project-cards .project-item[data-category]');

  if (dynamicProjectItems.length) {
    document.querySelectorAll('.local-case-card, .project-fallback').forEach((item) => {
      item.hidden = true;
      item.classList.add('project-filter-hidden');
    });
  }

  projectItems.forEach((item) => {
    const categories = item.dataset.category.split(' ').filter(Boolean);
    const shouldHide = !(filter === 'all' || categories.includes(filter));
    item.hidden = shouldHide;
    item.classList.toggle('project-filter-hidden', shouldHide);
  });
}

window.applyProjectFilter = applyProjectFilter;

function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.project-filters button[data-filter]');
  if (!filterButtons.length) return;
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      applyProjectFilter(filter);
      reachGoal('project_filter_click', { filter });
    });
  });
}

function initCookieBanner() {
  if (localStorage.getItem('cookieConsentAccepted') === 'yes') return;
  if (document.querySelector('.cookie-banner')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <div class="cookie-banner__copy">
      <b>Используем cookie</b>
      <p>Они помогают сайту работать корректно и улучшать сервис. Продолжая пользоваться сайтом, вы соглашаетесь с политикой обработки данных.</p>
    </div>
    <div class="cookie-banner__actions">
      <a href="/privacy/">Подробнее</a>
      <button type="button">Хорошо</button>
    </div>
  `;
  document.body.appendChild(banner);
  banner.querySelector('button').addEventListener('click', () => {
    localStorage.setItem('cookieConsentAccepted', 'yes');
    banner.classList.add('is-hidden');
    setTimeout(() => banner.remove(), 240);
  });
}

function normalizeLeadPayload(payload) {
  return {
    name: payload.name || null,
    phone: payload.phone || null,
    email: payload.email || null,
    object_type: payload.object_type || payload.type || null,
    work_format: payload.work_format || payload.format || payload.service || null,
    area_location_comment: payload.area_location_comment || payload.comment || payload.message || null,
    page_url: payload.page || window.location.href,
    utm: payload.utm || {},
    personal_data_consent: Boolean(payload.personal_data_consent),
    marketing_consent: Boolean(payload.marketing_consent),
    status: 'new',
  };
}

async function saveLeadWithSupabaseClient(leadPayload) {
  const ready = await waitForSupabasePublic();
  if (!ready) throw new Error('Supabase is not ready');
  const client = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.publishableKey);
  const { error } = await client.from('leads').insert(leadPayload);
  if (error) throw error;
}

async function saveLeadWithRest(leadPayload) {
  if (!window.SUPABASE_CONFIG?.url || !window.SUPABASE_CONFIG?.publishableKey) throw new Error('Supabase config is not ready');
  const response = await fetch(`${window.SUPABASE_CONFIG.url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: window.SUPABASE_CONFIG.publishableKey,
      Authorization: `Bearer ${window.SUPABASE_CONFIG.publishableKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(leadPayload),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `REST insert failed: ${response.status}`);
  }
}

async function saveLeadToSupabase(payload) {
  const leadPayload = normalizeLeadPayload(payload);
  try {
    await withTimeout(saveLeadWithSupabaseClient(leadPayload), 8000, 'Supabase client request timeout');
  } catch (clientError) {
    console.warn('Supabase client lead insert failed, trying REST fallback:', clientError);
    await withTimeout(saveLeadWithRest(leadPayload), 8000, 'Supabase REST request timeout');
  }
}

loadMobilePolish();
loadFavicon();
initMobileMenu();
loadSupabasePublic();
loadHomeProjects();
loadMetrika();
initProjectFilters();
initCookieBanner();

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const initialButtonText = button.textContent || 'Отправить заявку';
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.personal_data_consent = formData.get('personal_data_consent') === 'on';
    payload.marketing_consent = formData.get('marketing_consent') === 'yes';
    payload.utm = collectUtm();
    payload.page = window.location.href;
    button.disabled = true;
    button.textContent = 'Отправляем...';
    if (statusNode) statusNode.textContent = 'Отправляем заявку. Это займёт несколько секунд.';
    try {
      await saveLeadToSupabase(payload);
      form.reset();
      reachGoal('lead_form_submit', payload);
      if (statusNode) statusNode.textContent = 'Спасибо, заявка отправлена. Мы свяжемся с вами и подскажем следующий шаг по проекту.';
      button.textContent = 'Заявка отправлена';
      setTimeout(() => {
        button.disabled = false;
        button.textContent = initialButtonText;
      }, 4000);
    } catch (error) {
      console.warn('Lead submit failed:', error);
      reachGoal('lead_form_error', { page: window.location.href, error: error.message });
      if (statusNode) statusNode.textContent = `Не удалось отправить заявку: ${error.message}. Напишите нам в Telegram или WhatsApp, либо попробуйте ещё раз.`;
      button.disabled = false;
      button.textContent = initialButtonText;
    }
  });
}
