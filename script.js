const form = document.querySelector('#lead-form');
const statusNode = document.querySelector('#form-status');

function hasScriptBySrc(part) {
  return Array.from(document.scripts).some((script) => script.src && script.src.includes(part));
}

function appendScript(src, dataName, defer = true) {
  if (hasScriptBySrc(src)) return;
  const script = document.createElement('script');
  script.src = src;
  script.defer = defer;
  if (dataName) script.dataset[dataName] = 'true';
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

function getPageKind() {
  const path = window.location.pathname;
  const legalPaths = ['/privacy/', '/personal-data-consent/', '/marketing-consent/', '/terms/', '/requisites/'];
  if (path === '/' || path === '/index.html') return 'home';
  if (legalPaths.includes(path)) return 'legal';
  if (path === '/contacts/' || path === '/contacts') return 'contacts';
  return 'default';
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

function injectFooterStructure() {
  document.querySelectorAll('.footer-grid').forEach((footer) => {
    if (footer.querySelector('.footer-contact-links')) return;
    const currentTopLink = footer.querySelector(':scope > a');
    const contacts = document.createElement('div');
    contacts.className = 'footer-contact-links';
    contacts.innerHTML = `<a href="tel:+79137998808">+7 (913) 799-88-08</a><a href="https://t.me/UsoltcevAG" target="_blank" rel="noreferrer">Telegram</a><a href="https://wa.me/79137998808" target="_blank" rel="noreferrer">WhatsApp</a><a href="mailto:i@usoltsev-top.ru">i@usoltsev-top.ru</a>`;
    const siteLinks = document.createElement('div');
    siteLinks.className = 'footer-site-links';
    siteLinks.innerHTML = `<a href="/projects/">Проекты</a><a href="/services/remont-pod-klyuch/">Ремонт под ключ</a><a href="/services/stroitelstvo-pod-klyuch/">Строительство</a><a href="/services/komplektatsiya-obekta/">Комплектация</a><a href="/contacts/">Контакты</a>`;
    if (currentTopLink) currentTopLink.replaceWith(contacts);
    else footer.appendChild(contacts);
    footer.appendChild(siteLinks);
  });
}

function injectLegalFooterLinks() {
  document.querySelectorAll('.footer-grid').forEach((footer) => {
    if (footer.querySelector('.legal-footer-links')) return;
    const links = document.createElement('div');
    links.className = 'legal-footer-links';
    links.innerHTML = `<a href="/privacy/">Политика обработки персональных данных</a><a href="/personal-data-consent/">Согласие на обработку персональных данных</a><a href="/marketing-consent/">Согласие на рекламно-информационные материалы</a><a href="/terms/">Пользовательское соглашение</a><a href="/requisites/">Реквизиты</a>`;
    footer.appendChild(links);
  });
}

function injectFinalCta() {
  const kind = getPageKind();
  if (kind === 'home' || kind === 'legal' || kind === 'contacts') return;
  document.querySelectorAll('main').forEach((main) => {
    if (main.querySelector('.site-final-cta')) return;
    const finalCta = document.createElement('section');
    finalCta.className = 'site-final-cta';
    finalCta.innerHTML = `<div class="container final-cta-inner"><div><p class="final-cta-kicker">Следующий шаг</p><h2 class="final-cta-title">Расскажите об объекте — подскажем, как довести его до готового пространства</h2><p class="final-cta-text">Можно кратко: что есть сейчас, площадь, район, желаемый результат и сроки. Ответим, какой формат подойдёт: строительство, ремонт, комплектация или полный цикл.</p></div><div class="final-cta-actions"><a href="/contacts/">Оставить заявку</a><a href="https://t.me/UsoltcevAG" target="_blank" rel="noreferrer">Telegram</a><a href="tel:+79137998808">Позвонить</a></div></div>`;
    main.appendChild(finalCta);
  });
}

function injectFormConsents() {
  document.querySelectorAll('.lead-form').forEach((leadForm) => {
    if (leadForm.querySelector('.legal-consents')) return;
    const submitButton = leadForm.querySelector('button[type="submit"]');
    if (!submitButton) return;
    const consents = document.createElement('div');
    consents.className = 'legal-consents';
    consents.innerHTML = `<label class="consent-line"><input type="checkbox" name="personal_data_consent" required><span>Я даю <a href="/personal-data-consent/" target="_blank">согласие на обработку персональных данных</a> и соглашаюсь с <a href="/privacy/" target="_blank">Политикой обработки персональных данных</a>.</span></label><label class="consent-line"><input type="checkbox" name="marketing_consent" value="yes"><span>Согласен(на) получать рекламно-информационные материалы: предложения, новости и полезные материалы о строительстве, ремонте и комплектации объектов. <a href="/marketing-consent/" target="_blank">Подробнее</a>.</span></label><p class="legal-note">Данные используются для связи по вашей заявке и подготовки предварительного разбора объекта.</p>`;
    leadForm.insertBefore(consents, submitButton);
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

loadSupabasePublic();
loadMetrika();
initProjectFilters();
injectFooterStructure();
injectLegalFooterLinks();
injectFinalCta();
injectFormConsents();
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
