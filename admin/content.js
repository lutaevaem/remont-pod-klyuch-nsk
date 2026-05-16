document.addEventListener('DOMContentLoaded', () => {
  const contentForm = document.querySelector('#content-form');
  const contentList = document.querySelector('#content-list');
  const refreshContentButton = document.querySelector('#refresh-content');
  const resetContentButton = document.querySelector('#reset-content-form');
  const contentFormTitle = document.querySelector('#content-form-title');
  const statusNode = document.querySelector('#admin-status');
  let contentCache = [];
  let activePage = 'all';
  let client = null;

  const expectedContentFields = [
    { page: 'home', content_key: 'home.hero.kicker', label: 'Главная / Hero / География', field_type: 'text', value: 'Новосибирск и Новосибирский район', sort_order: 10 },
    { page: 'home', content_key: 'home.hero.title', label: 'Главная / Hero / Заголовок', field_type: 'textarea', value: 'Не просто ремонт под ключ. Пространство, доведённое до финала.', sort_order: 20 },
    { page: 'home', content_key: 'home.hero.lead', label: 'Главная / Hero / Основной текст', field_type: 'textarea', value: 'Подключаемся на нужном этапе: от строительства с нуля и визуальной концепции до ремонта, мебели, техники и финальной подготовки. Собираем проект в один управляемый процесс — без разрозненных подрядчиков и хвоста задач после ремонта.', sort_order: 30 },
    { page: 'home', content_key: 'home.hero.note', label: 'Главная / Hero / Акцент', field_type: 'textarea', value: 'Вы принимаете ключевые решения. Мы берём на себя маршрут, координацию, контроль и финальное качество результата.', sort_order: 40 },
    { page: 'home', content_key: 'home.hero.primary_button', label: 'Главная / Hero / Основная кнопка', field_type: 'text', value: 'Обсудить проект', sort_order: 50 },
    { page: 'home', content_key: 'home.hero.secondary_button', label: 'Главная / Hero / Вторая кнопка', field_type: 'text', value: 'Смотреть проекты', sort_order: 60 },
    { page: 'home', content_key: 'home.hero.signature', label: 'Главная / Hero / Подпись у фото', field_type: 'text', value: 'личная ответственность за проект', sort_order: 70 },

    { page: 'home', content_key: 'home.proof.item1.title', label: 'Главная / Верхняя карточка 1 / Заголовок', field_type: 'text', value: 'Единый контур', sort_order: 100 },
    { page: 'home', content_key: 'home.proof.item1.text', label: 'Главная / Верхняя карточка 1 / Краткий текст', field_type: 'textarea', value: 'Проект, работы и сдача связаны в одну систему.', sort_order: 110 },
    { page: 'home', content_key: 'home.proof.item1.details', label: 'Главная / Верхняя карточка 1 / Подробнее', field_type: 'textarea', value: 'Материалы, подрядчики, комплектация и финальная подготовка не живут отдельно — всё собирается в управляемый маршрут.', sort_order: 120 },
    { page: 'home', content_key: 'home.proof.item2.title', label: 'Главная / Верхняя карточка 2 / Заголовок', field_type: 'text', value: 'Любой этап', sort_order: 130 },
    { page: 'home', content_key: 'home.proof.item2.text', label: 'Главная / Верхняя карточка 2 / Краткий текст', field_type: 'textarea', value: 'Можно начать с участка, коробки, ремонта или финала.', sort_order: 140 },
    { page: 'home', content_key: 'home.proof.item2.details', label: 'Главная / Верхняя карточка 2 / Подробнее', field_type: 'textarea', value: 'Подключаемся там, где проекту нужна система: от первых решений до комплектации, клининга и готовности к жизни или запуску.', sort_order: 150 },
    { page: 'home', content_key: 'home.proof.item3.title', label: 'Главная / Верхняя карточка 3 / Заголовок', field_type: 'text', value: 'Финал без хвостов', sort_order: 160 },
    { page: 'home', content_key: 'home.proof.item3.text', label: 'Главная / Верхняя карточка 3 / Краткий текст', field_type: 'textarea', value: 'Объект доводится до состояния готовности.', sort_order: 170 },
    { page: 'home', content_key: 'home.proof.item3.details', label: 'Главная / Верхняя карточка 3 / Подробнее', field_type: 'textarea', value: 'Цель — не просто закончить работы, а собрать пространство, которым можно пользоваться, жить, сдавать или открывать для клиентов.', sort_order: 180 },

    { page: 'home', content_key: 'home.intro.item1.title', label: 'Главная / Сценарий 1 / Заголовок', field_type: 'text', value: 'Есть только идея', sort_order: 200 },
    { page: 'home', content_key: 'home.intro.item1.text', label: 'Главная / Сценарий 1 / Текст', field_type: 'textarea', value: 'Помогаем понять стартовую точку, последовательность решений и первый понятный шаг.', sort_order: 210 },
    { page: 'home', content_key: 'home.intro.item2.title', label: 'Главная / Сценарий 2 / Заголовок', field_type: 'text', value: 'Ремонт уже начат', sort_order: 220 },
    { page: 'home', content_key: 'home.intro.item2.text', label: 'Главная / Сценарий 2 / Текст', field_type: 'textarea', value: 'Собираем разрозненные задачи в маршрут: работы, материалы, сроки и контроль.', sort_order: 230 },
    { page: 'home', content_key: 'home.intro.item3.title', label: 'Главная / Сценарий 3 / Заголовок', field_type: 'text', value: 'Нужен завершённый вид', sort_order: 240 },
    { page: 'home', content_key: 'home.intro.item3.text', label: 'Главная / Сценарий 3 / Текст', field_type: 'textarea', value: 'Доводим объект до состояния, где всё выглядит собранно и готово к использованию.', sort_order: 250 },

    { page: 'home', content_key: 'home.projects.kicker', label: 'Главная / Проекты / Надзаголовок', field_type: 'text', value: 'Что можно увидеть заранее', sort_order: 300 },
    { page: 'home', content_key: 'home.projects.title', label: 'Главная / Проекты / Заголовок', field_type: 'textarea', value: 'Понятно, какой путь проходит объект', sort_order: 310 },
    { page: 'home', content_key: 'home.projects.text', label: 'Главная / Проекты / Текст', field_type: 'textarea', value: 'Показываем не только красивые кадры, а маршрут: с чего начали, что нужно было решить, какой объём взяли на себя и к какому результату пришли.', sort_order: 320 },
    { page: 'home', content_key: 'home.projects.card1.label', label: 'Главная / Проектная карточка 1 / Метка', field_type: 'text', value: 'Квартира', sort_order: 330 },
    { page: 'home', content_key: 'home.projects.card1.title', label: 'Главная / Проектная карточка 1 / Заголовок', field_type: 'text', value: 'Квартира до готовности к жизни', sort_order: 340 },
    { page: 'home', content_key: 'home.projects.card1.text', label: 'Главная / Проектная карточка 1 / Текст', field_type: 'textarea', value: 'От черновой отделки до мебели, техники, света, текстиля и финальной чистоты.', sort_order: 350 },
    { page: 'home', content_key: 'home.projects.card1.button', label: 'Главная / Проектная карточка 1 / Кнопка', field_type: 'text', value: 'Смотреть кейс', sort_order: 360 },
    { page: 'home', content_key: 'home.projects.card2.label', label: 'Главная / Проектная карточка 2 / Метка', field_type: 'text', value: 'Дом', sort_order: 370 },
    { page: 'home', content_key: 'home.projects.card2.title', label: 'Главная / Проектная карточка 2 / Заголовок', field_type: 'text', value: 'Дом от участка к пространству', sort_order: 380 },
    { page: 'home', content_key: 'home.projects.card2.text', label: 'Главная / Проектная карточка 2 / Текст', field_type: 'textarea', value: 'Помогаем пройти путь от первых решений до отделки и комплектации.', sort_order: 390 },
    { page: 'home', content_key: 'home.projects.card2.button', label: 'Главная / Проектная карточка 2 / Кнопка', field_type: 'text', value: 'Смотреть кейс', sort_order: 400 },
    { page: 'home', content_key: 'home.projects.card3.label', label: 'Главная / Проектная карточка 3 / Метка', field_type: 'text', value: 'Коммерция', sort_order: 410 },
    { page: 'home', content_key: 'home.projects.card3.title', label: 'Главная / Проектная карточка 3 / Заголовок', field_type: 'text', value: 'Помещение под запуск', sort_order: 420 },
    { page: 'home', content_key: 'home.projects.card3.text', label: 'Главная / Проектная карточка 3 / Текст', field_type: 'textarea', value: 'Планировка, ремонт, функциональность, визуальная целостность и готовность к работе.', sort_order: 430 },
    { page: 'home', content_key: 'home.projects.card3.button', label: 'Главная / Проектная карточка 3 / Кнопка', field_type: 'text', value: 'Смотреть кейс', sort_order: 440 },

    { page: 'home', content_key: 'home.services.kicker', label: 'Главная / Услуги / Надзаголовок', field_type: 'text', value: 'Форматы работы', sort_order: 500 },
    { page: 'home', content_key: 'home.services.title', label: 'Главная / Услуги / Заголовок', field_type: 'textarea', value: 'Три маршрута под разные стартовые точки', sort_order: 510 },
    { page: 'home', content_key: 'home.services.text', label: 'Главная / Услуги / Текст', field_type: 'textarea', value: 'Выбираем формат по состоянию объекта: построить, отремонтировать, укомплектовать или собрать полный цикл без разрыва между этапами.', sort_order: 520 },
    { page: 'home', content_key: 'home.services.card1.title', label: 'Главная / Услуга 1 / Заголовок', field_type: 'text', value: 'Ремонт под ключ', sort_order: 530 },
    { page: 'home', content_key: 'home.services.card1.text', label: 'Главная / Услуга 1 / Текст', field_type: 'textarea', value: 'От визуальной концепции и сметы до отделки, контроля этапов и финальной подготовки.', sort_order: 540 },
    { page: 'home', content_key: 'home.services.card2.title', label: 'Главная / Услуга 2 / Заголовок', field_type: 'text', value: 'Строительство под ключ', sort_order: 550 },
    { page: 'home', content_key: 'home.services.card2.text', label: 'Главная / Услуга 2 / Текст', field_type: 'textarea', value: 'Понятный путь от участка, идеи и коробки до дома, который можно довести до готовности.', sort_order: 560 },
    { page: 'home', content_key: 'home.services.card3.title', label: 'Главная / Услуга 3 / Заголовок', field_type: 'text', value: 'Комплектация объекта', sort_order: 570 },
    { page: 'home', content_key: 'home.services.card3.text', label: 'Главная / Услуга 3 / Текст', field_type: 'textarea', value: 'Мебель, техника, свет, текстиль, бытовые детали и всё, что делает пространство завершённым.', sort_order: 580 },

    { page: 'home', content_key: 'home.about.kicker', label: 'Главная / Подход / Надзаголовок', field_type: 'text', value: 'Подход', sort_order: 600 },
    { page: 'home', content_key: 'home.about.title', label: 'Главная / Подход / Заголовок', field_type: 'textarea', value: 'Проект должен быть управляемым, а финал — предсказуемым', sort_order: 610 },
    { page: 'home', content_key: 'home.about.text', label: 'Главная / Подход / Текст', field_type: 'textarea', value: 'Когда за ремонт, материалы, мебель, технику и финальную подготовку отвечают разные люди, клиент часто остаётся координатором всего процесса. Мы собираем эти части в один контур, чтобы объект двигался к понятному результату.', sort_order: 620 },
    { page: 'home', content_key: 'home.about.quote', label: 'Главная / Подход / Цитата', field_type: 'textarea', value: '«Задача не просто сделать красиво. Задача — довести пространство до состояния, где всё на своём месте и готово к жизни, сдаче или запуску».', sort_order: 630 },
    { page: 'home', content_key: 'home.about.principle1', label: 'Главная / Подход / Принцип 1', field_type: 'text', value: 'понятный маршрут', sort_order: 640 },
    { page: 'home', content_key: 'home.about.principle2', label: 'Главная / Подход / Принцип 2', field_type: 'text', value: 'контроль этапов', sort_order: 650 },
    { page: 'home', content_key: 'home.about.principle3', label: 'Главная / Подход / Принцип 3', field_type: 'text', value: 'связь работ и комплектации', sort_order: 660 },
    { page: 'home', content_key: 'home.about.principle4', label: 'Главная / Подход / Принцип 4', field_type: 'text', value: 'финальная ответственность', sort_order: 670 },

    { page: 'home', content_key: 'home.form.kicker', label: 'Главная / Форма / Надзаголовок', field_type: 'text', value: 'Начать с разбора', sort_order: 700 },
    { page: 'home', content_key: 'home.form.title', label: 'Главная / Форма / Заголовок', field_type: 'textarea', value: 'Расскажите, на каком этапе сейчас объект', sort_order: 710 },
    { page: 'home', content_key: 'home.form.text', label: 'Главная / Форма / Текст', field_type: 'textarea', value: 'Для предварительного разговора достаточно описать объект, площадь, район, текущую стадию и желаемый результат. Если есть фото или видео — они ускорят оценку.', sort_order: 720 },
    { page: 'home', content_key: 'home.form.button', label: 'Главная / Форма / Кнопка', field_type: 'text', value: 'Получить предварительный разбор', sort_order: 730 },
    { page: 'home', content_key: 'home.form.status', label: 'Главная / Форма / Подпись под кнопкой', field_type: 'textarea', value: 'Свяжемся, уточним вводные и подскажем, какой формат подойдёт вашему объекту.', sort_order: 740 },
  ];

  function setStatus(message, type = '') {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = `admin-status ${type}`.trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '\"': '&quot;' }[char]));
  }

  function initClient() {
    if (client) return true;
    const config = window.SUPABASE_CONFIG;
    if (!config || !window.supabase) return false;
    client = window.supabase.createClient(config.url, config.publishableKey);
    return true;
  }

  function pageLabel(page) {
    const labels = { home: 'Главная', projects: 'Проекты', renovation: 'Ремонт', construction: 'Строительство', furnishing: 'Комплектация', contacts: 'Контакты', global: 'Общее' };
    return labels[page] || page;
  }

  function missingExpectedFields() {
    const existingKeys = new Set(contentCache.map((item) => item.content_key));
    return expectedContentFields.filter((field) => !existingKeys.has(field.content_key));
  }

  function resetContentForm() {
    if (!contentForm) return;
    contentForm.reset();
    contentForm.elements.id.value = '';
    contentForm.elements.sort_order.value = 100;
    contentForm.elements.is_active.checked = true;
    contentFormTitle.textContent = 'Редактировать поле';
  }

  function fillContentForm(item) {
    contentFormTitle.textContent = 'Редактировать текст';
    Object.entries(item).forEach(([key, value]) => {
      const field = contentForm.elements[key];
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderMissingFieldsNotice() {
    const missing = missingExpectedFields();
    if (!missing.length || !(activePage === 'all' || activePage === 'home')) return '';
    return `
      <article class="content-admin-item">
        <div class="project-admin-meta"><span>Главная</span><span>Нужно добавить</span><span>${missing.length} полей</span></div>
        <h3>Недостающие редактируемые поля главной</h3>
        <p>В HTML эти блоки уже привязаны к админке, но записей ещё нет в базе. Нажмите кнопку, чтобы добавить их в список редактируемых текстов.</p>
        <div class="project-admin-actions">
          <button type="button" data-content-action="seed-home-fields">Добавить недостающие поля</button>
        </div>
      </article>
    `;
  }

  function renderContent() {
    if (!contentList) return;
    const items = activePage === 'all' ? contentCache : contentCache.filter((item) => item.page === activePage);
    const missingNotice = renderMissingFieldsNotice();
    if (!items.length && !missingNotice) {
      contentList.innerHTML = '<p>Текстов пока нет. Добавьте первое поле через форму слева или выполните seed SQL.</p>';
      return;
    }
    contentList.innerHTML = `${missingNotice}${items.map((item) => `
      <article class="content-admin-item">
        <div class="project-admin-meta">
          <span>${escapeHtml(pageLabel(item.page))}</span>
          <span>${escapeHtml(item.field_type || 'textarea')}</span>
          <span>${item.is_active ? 'Активно' : 'Выключено'}</span>
        </div>
        <h3>${escapeHtml(item.label)}</h3>
        <code>${escapeHtml(item.content_key)}</code>
        <p>${escapeHtml(item.value)}</p>
        <div class="project-admin-actions">
          <button type="button" data-content-action="edit" data-id="${item.id}">Редактировать</button>
          <button type="button" data-content-action="toggle" data-id="${item.id}">${item.is_active ? 'Выключить' : 'Включить'}</button>
          <button type="button" class="danger" data-content-action="delete" data-id="${item.id}">Удалить</button>
        </div>
      </article>
    `).join('')}`;
  }

  async function fetchContent() {
    if (!initClient()) return setStatus('Supabase ещё не подключён. Обновите страницу.', 'error');
    setStatus('Загружаем тексты сайта...');
    const { data, error } = await client
      .from('site_content')
      .select('*')
      .order('page', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) return setStatus(`Не удалось загрузить тексты. Проверь таблицу site_content. Ошибка: ${error.message}`, 'error');
    contentCache = data || [];
    renderContent();
    setStatus(`Тексты загружены. Полей в базе: ${contentCache.length}.`, 'success');
  }

  async function saveContent(event) {
    event.preventDefault();
    if (!initClient()) return setStatus('Supabase не подключён.', 'error');
    const formData = new FormData(contentForm);
    const id = formData.get('id');
    const payload = {
      page: formData.get('page'),
      content_key: formData.get('content_key'),
      label: formData.get('label'),
      field_type: formData.get('field_type'),
      value: formData.get('value'),
      sort_order: Number(formData.get('sort_order') || 100),
      is_active: formData.get('is_active') === 'on',
      updated_at: new Date().toISOString(),
    };
    setStatus('Сохраняем текст...');
    const request = id
      ? client.from('site_content').update(payload).eq('id', id)
      : client.from('site_content').insert(payload);
    const { error } = await request;
    if (error) return setStatus(`Ошибка сохранения текста: ${error.message}`, 'error');
    resetContentForm();
    await fetchContent();
    setStatus('Текст сохранён.', 'success');
  }

  async function seedHomeFields() {
    if (!initClient()) return setStatus('Supabase не подключён.', 'error');
    const missing = missingExpectedFields();
    if (!missing.length) return setStatus('Все поля главной уже есть в базе.', 'success');
    setStatus(`Добавляем недостающие поля главной: ${missing.length}...`);
    const payload = missing.map((field) => ({ ...field, is_active: true, updated_at: new Date().toISOString() }));
    const { error } = await client.from('site_content').insert(payload);
    if (error) return setStatus(`Не удалось добавить поля главной: ${error.message}`, 'error');
    await fetchContent();
    setStatus(`Добавлены недостающие поля главной: ${missing.length}.`, 'success');
  }

  async function handleContentAction(event) {
    const button = event.target.closest('button[data-content-action]');
    if (!button || !initClient()) return;
    if (button.dataset.contentAction === 'seed-home-fields') return seedHomeFields();
    const item = contentCache.find((entry) => String(entry.id) === String(button.dataset.id));
    if (!item) return;
    if (button.dataset.contentAction === 'edit') return fillContentForm(item);
    if (button.dataset.contentAction === 'toggle') {
      const { error } = await client.from('site_content').update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq('id', item.id);
      if (error) return setStatus(`Не удалось изменить активность: ${error.message}`, 'error');
      return fetchContent();
    }
    if (button.dataset.contentAction === 'delete') {
      if (!confirm(`Удалить текст «${item.label}»?`)) return;
      const { error } = await client.from('site_content').delete().eq('id', item.id);
      if (error) return setStatus(`Не удалось удалить текст: ${error.message}`, 'error');
      return fetchContent();
    }
  }

  document.querySelectorAll('[data-content-page]').forEach((button) => {
    button.addEventListener('click', () => {
      activePage = button.dataset.contentPage;
      document.querySelectorAll('[data-content-page]').forEach((item) => item.classList.toggle('active', item === button));
      renderContent();
    });
  });

  if (contentForm) contentForm.addEventListener('submit', saveContent);
  if (contentList) contentList.addEventListener('click', handleContentAction);
  if (refreshContentButton) refreshContentButton.addEventListener('click', fetchContent);
  if (resetContentButton) resetContentButton.addEventListener('click', resetContentForm);

  document.querySelector('[data-view="content"]')?.addEventListener('click', fetchContent);
});
