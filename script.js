const form = document.querySelector('#lead-form');
const statusNode = document.querySelector('#form-status');

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
    });
  });
}

initProjectFilters();

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.utm = collectUtm();
    payload.page = window.location.href;

    button.disabled = true;
    button.textContent = 'Отправляем...';
    statusNode.textContent = 'Отправляем заявку. Это займёт несколько секунд.';

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Lead request failed');

      form.reset();
      statusNode.textContent = 'Спасибо, заявка отправлена. Мы свяжемся с вами и подскажем следующий шаг по проекту.';
      button.textContent = 'Заявка отправлена';
    } catch (error) {
      statusNode.textContent = 'Не удалось отправить заявку. Напишите нам в Telegram или WhatsApp, либо попробуйте ещё раз.';
      button.disabled = false;
      button.textContent = 'Отправить заявку';
    }
  });
}
