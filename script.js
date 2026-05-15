const form = document.querySelector('#lead-form');
const statusNode = document.querySelector('#form-status');

function loadMetrika() {
  if (document.querySelector('script[data-metrika-local]')) return;
  const script = document.createElement('script');
  script.src = '/metrika.js';
  script.async = true;
  script.dataset.metrikaLocal = 'true';
  document.head.appendChild(script);
}

function loadPremiumUi() {
  if (document.querySelector('link[data-premium-ui]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/premium-ui.css';
  link.dataset.premiumUi = 'true';
  document.head.appendChild(link);
}

function reachGoal(goalName, params = {}) {
  if (typeof window.sendMetricGoal === 'function') {
    window.sendMetricGoal(goalName, params);
  }
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
  const projectItems = document.querySelectorAll('.project-item[data-category]');

  if (!filterButtons.length || !projectItems.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');

      projectItems.forEach((item) => {
        const categories = item.dataset.category.split(' ');
        const shouldShow = filter === 'all' || categories.includes(filter);
        item.hidden = !shouldShow;
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
    contacts.innerHTML = `
      <a href="tel:+79137998808">+7 (913) 799-88-08</a>
      <a href="https://t.me/UsoltcevAG" target="_blank" rel="noreferrer">Telegram</a>
      <a href="https://wa.me/79137998808" target="_blank" rel="noreferrer">WhatsApp</a>
      <a href="mailto:i@usoltsev-top.ru">i@usoltsev-top.ru</a>
    `;

    const siteLinks = document.createElement('div');
    siteLinks.className = 'footer-site-links';
    siteLinks.innerHTML = `
      <a href="/projects/">Проекты</a>
      <a href="/services/remont-pod-klyuch/">Ремонт под ключ</a>
      <a href="/services/stroitelstvo-pod-klyuch/">Строительство</a>
      <a href="/services/komplektatsiya-obekta/">Комплектация</a>
      <a href="/contacts/">Контакты</a>
    `;

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
    links.innerHTML = `
      <a href="/privacy/">Политика обработки персональных данных</a>
      <a href="/personal-data-consent/">Согласие на обработку персональных данных</a>
      <a href="/marketing-consent/">Согласие на рекламно-информационные материалы</a>
      <a href="/terms/">Пользовательское соглашение</a>
      <a href="/requisites/">Реквизиты</a>
    `;
    footer.appendChild(links);
  });
}

function injectFinalCta() {
  document.querySelectorAll('main').forEach((main) => {
    if (main.querySelector('.site-final-cta')) return;
    const finalCta = document.createElement('section');
    finalCta.className = 'site-final-cta';
    finalCta.innerHTML = `
      <div class="container final-cta-inner">
        <div>
          <p class="final-cta-kicker">Следующий шаг</p>
          <h2 class="final-cta-title">Расскажите об объекте — подскажем, как довести его до готового пространства</h2>
          <p class="final-cta-text">Можно кратко: что есть сейчас, площадь, район, желаемый результат и сроки. Ответим, какой формат подойдёт: строительство, ремонт, комплектация или полный цикл.</p>
        </div>
        <div class="final-cta-actions">
          <a href="/contacts/">Оставить заявку</a>
          <a href="https://t.me/UsoltcevAG" target="_blank" rel="noreferrer">Telegram</a>
          <a href="tel:+79137998808">Позвонить</a>
        </div>
      </div>
    `;
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
    consents.innerHTML = `
      <label class="consent-line">
        <input type="checkbox" name="personal_data_consent" required>
        <span>Я даю <a href="/personal-data-consent/" target="_blank">согласие на обработку персональных данных</a> и соглашаюсь с <a href="/privacy/" target="_blank">Политикой обработки персональных данных</a>.</span>
      </label>
      <label class="consent-line">
        <input type="checkbox" name="marketing_consent" value="yes">
        <span>Согласен(на) получать рекламно-информационные материалы: предложения, новости и полезные материалы о строительстве, ремонте и комплектации объектов. <a href="/marketing-consent/" target="_blank">Подробнее</a>.</span>
      </label>
      <p class="legal-note">Данные используются для связи по вашей заявке и подготовки предварительного разбора объекта.</p>
    `;
    leadForm.insertBefore(consents, submitButton);
  });
}

function initCookieBanner() {
  if (localStorage.getItem('cookieConsentAccepted') === 'yes') return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <p>Мы используем cookie и сервисы аналитики, чтобы сайт работал корректно и помогал улучшать качество сервиса. Продолжая пользоваться сайтом, вы соглашаетесь с использованием cookie. Подробнее — в <a href="/privacy/">Политике обработки персональных данных</a>.</p>
    <button type="button">Хорошо</button>
  `;
  document.body.appendChild(banner);

  banner.querySelector('button').addEventListener('click', () => {
    localStorage.setItem('cookieConsentAccepted', 'yes');
    banner.remove();
  });
}

loadPremiumUi();
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
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Lead request failed');

      form.reset();
      reachGoal('lead_form_submit', payload);
      if (statusNode) statusNode.textContent = 'Спасибо, заявка отправлена. Мы свяжемся с вами и подскажем следующий шаг по проекту.';
      button.textContent = 'Заявка отправлена';
    } catch (error) {
      reachGoal('lead_form_error', { page: window.location.href });
      if (statusNode) statusNode.textContent = 'Не удалось отправить заявку. Напишите нам в Telegram или WhatsApp, либо попробуйте ещё раз.';
      button.disabled = false;
      button.textContent = 'Отправить заявку';
    }
  });
}
