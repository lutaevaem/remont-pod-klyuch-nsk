document.addEventListener('DOMContentLoaded', () => {
  const listNode = document.querySelector('#site-image-list');
  const refreshButton = document.querySelector('#refresh-site-images');
  const statusNode = document.querySelector('#admin-status');
  let client = null;
  let imageSlots = [];

  function setStatus(message, type = '') {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = `admin-status ${type}`.trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  function initClient() {
    if (client) return true;
    const config = window.SUPABASE_CONFIG;
    if (!config || !window.supabase) return false;
    client = window.supabase.createClient(config.url, config.publishableKey);
    return true;
  }

  function renderSlots() {
    if (!listNode) return;
    if (!imageSlots.length) {
      listNode.innerHTML = '<p>Слотов изображений пока нет. Выполните SQL для создания site_images.</p>';
      return;
    }

    listNode.innerHTML = imageSlots.map((slot) => `
      <article class="site-image-card" data-slot-id="${slot.id}">
        <div class="site-image-preview ${slot.image_url ? 'has-image' : ''}">
          ${slot.image_url ? `<img src="${escapeHtml(slot.image_url)}" alt="${escapeHtml(slot.label)}">` : '<span>Изображение не загружено</span>'}
        </div>
        <div class="site-image-info">
          <div class="project-admin-meta">
            <span>${escapeHtml(slot.page_label || slot.page)}</span>
            <span>${escapeHtml(slot.recommended_size || 'Размер уточняется')}</span>
            <span>${slot.is_active ? 'Активно' : 'Выключено'}</span>
          </div>
          <h3>${escapeHtml(slot.label)}</h3>
          <code>${escapeHtml(slot.image_key)}</code>
          <p>${escapeHtml(slot.description || '')}</p>
          <div class="image-recommendations">
            <b>Рекомендуемый размер:</b> ${escapeHtml(slot.recommended_size || 'не указан')}<br>
            <b>Кадрирование:</b> ${escapeHtml(slot.crop_hint || 'важные детали держать ближе к центру')}
          </div>
          <label class="site-image-upload">Загрузить новое изображение<input type="file" accept="image/*" data-upload-image="${slot.id}"></label>
          <div class="project-admin-actions">
            <button type="button" data-image-action="toggle" data-id="${slot.id}">${slot.is_active ? 'Выключить' : 'Включить'}</button>
            ${slot.image_url ? `<button type="button" class="danger" data-image-action="remove" data-id="${slot.id}">Удалить изображение</button>` : ''}
          </div>
        </div>
      </article>
    `).join('');
  }

  async function fetchSlots() {
    if (!initClient()) return setStatus('Supabase ещё не подключён. Обновите страницу.', 'error');
    setStatus('Загружаем изображения сайта...');
    const { data, error } = await client
      .from('site_images')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) return setStatus(`Не удалось загрузить изображения сайта. Проверь таблицу site_images. Ошибка: ${error.message}`, 'error');
    imageSlots = data || [];
    renderSlots();
    setStatus(`Изображения сайта загружены. Слотов: ${imageSlots.length}.`, 'success');
  }

  async function uploadImage(slotId, file) {
    const slot = imageSlots.find((item) => String(item.id) === String(slotId));
    if (!slot) return;
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const safeName = `${slot.image_key}-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`.replace(/[^a-zA-Z0-9_.-]/g, '-');
    const path = `${slot.page}/${safeName}`;
    const { error } = await client.storage.from('site-images').upload(path, file, { upsert: true });
    if (error) return setStatus(`Не удалось загрузить изображение: ${error.message}`, 'error');
    const { data } = client.storage.from('site-images').getPublicUrl(path);
    const { error: updateError } = await client.from('site_images').update({ image_url: data.publicUrl, updated_at: new Date().toISOString() }).eq('id', slot.id);
    if (updateError) return setStatus(`Изображение загружено, но не сохранилось в слоте: ${updateError.message}`, 'error');
    await fetchSlots();
    setStatus('Изображение сохранено.', 'success');
  }

  async function handleListClick(event) {
    const upload = event.target.closest('input[data-upload-image]');
    if (upload && upload.files?.[0]) {
      await uploadImage(upload.dataset.uploadImage, upload.files[0]);
      upload.value = '';
      return;
    }

    const button = event.target.closest('button[data-image-action]');
    if (!button || !initClient()) return;
    const slot = imageSlots.find((item) => String(item.id) === String(button.dataset.id));
    if (!slot) return;

    if (button.dataset.imageAction === 'toggle') {
      const { error } = await client.from('site_images').update({ is_active: !slot.is_active, updated_at: new Date().toISOString() }).eq('id', slot.id);
      if (error) return setStatus(`Не удалось изменить активность: ${error.message}`, 'error');
      return fetchSlots();
    }

    if (button.dataset.imageAction === 'remove') {
      const { error } = await client.from('site_images').update({ image_url: null, updated_at: new Date().toISOString() }).eq('id', slot.id);
      if (error) return setStatus(`Не удалось удалить изображение из слота: ${error.message}`, 'error');
      return fetchSlots();
    }
  }

  if (listNode) {
    listNode.addEventListener('click', handleListClick);
    listNode.addEventListener('change', handleListClick);
  }
  if (refreshButton) refreshButton.addEventListener('click', fetchSlots);
  document.querySelector('[data-view="images"]')?.addEventListener('click', fetchSlots);
});
