document.addEventListener('DOMContentLoaded', async () => {
  const config = window.SUPABASE_CONFIG;
  if (!config || !window.supabase) return;

  const client = window.supabase.createClient(config.url, config.publishableKey);

  function applyText(contentMap) {
    document.querySelectorAll('[data-content-key]').forEach((node) => {
      const key = node.dataset.contentKey;
      const value = contentMap[key];
      if (!value) return;
      node.textContent = value;
    });
  }

  function applyImages(imageMap) {
    document.querySelectorAll('[data-image-key]').forEach((node) => {
      const key = node.dataset.imageKey;
      const image = imageMap[key];
      if (!image?.image_url) return;

      if (node.tagName === 'IMG') {
        node.src = image.image_url;
        node.alt = image.label || node.alt || '';
        return;
      }

      node.style.backgroundImage = `linear-gradient(90deg, rgba(247,242,233,.92) 0%, rgba(247,242,233,.74) 42%, rgba(247,242,233,.18) 100%), url('${image.image_url}')`;
      node.style.backgroundSize = 'cover';
      node.style.backgroundPosition = 'center';
    });
  }

  try {
    const [{ data: contentData }, { data: imageData }] = await Promise.all([
      client.from('site_content').select('content_key,value').eq('is_active', true),
      client.from('site_images').select('image_key,image_url,label').eq('is_active', true),
    ]);

    const contentMap = Object.fromEntries((contentData || []).map((item) => [item.content_key, item.value]));
    const imageMap = Object.fromEntries((imageData || []).map((item) => [item.image_key, item]));

    applyText(contentMap);
    applyImages(imageMap);
  } catch (error) {
    console.warn('Site content loading failed:', error);
  }
});
