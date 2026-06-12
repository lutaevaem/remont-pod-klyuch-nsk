const form = document.querySelector('#lead-form');
const statusNode = document.querySelector('#form-status');

function hasScriptBySrc(part) {
  return Array.from(document.scripts).some((script) => script.src && script.src.includes(part));
}

function loadFavicon() {
  if (document.querySelector('script[data-site-favicon]') || hasScriptBySrc('/site-favicon.js')) return;
  const script = document.createElement('script');
  script.src = '/site-favicon.js';
  script.defer = true;
  script.dataset.siteFavicon = 'true';
  document.head.appendChild(script);
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

function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.project-filters button[data-filter]');
  if (!filterButtons.length) return;
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      const projectItems = document.querySelectorAll('.project-item[data-category]');
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      projectItems.forEach((item) => {
        const categories = item.dataset.category.split(' ');
        item.hidden = !(filter === 'all' || categories.includes(filter));
      });
      reachGoal('project_filter_click', { filter });
    });
  });
}

function initCookieBanner() {
  if (localStorage.getItem('cookieConsentAccepted') === 'yes') return;
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `<p>Мы используем cookie и сервисы аналитики, чтобы сайт работал корректно и помогал улучшать качество сервиса. Продолжая пользоваться сайтом, вы соглашаетесь с использованием cookie. Подробнее — в <a href="/privacy/">Политике обработки персональных данных</a>.</p><button type="button">Хорошо</button>`;
  document.body.appendChild(banner);
  banner.querySelector('button').addEventListener('click', () => {
    localStorage.setItem('cookieConsentAccepted', 'yes');
    banner.remove();
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

loadFavicon();
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
