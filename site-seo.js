async function initSiteSeo() {
  function waitForSupabase(retries = 80) {
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

  const ready = await waitForSupabase();
  if (!ready) return;
  const client = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.publishableKey);
  let pagePath = window.location.pathname;
  if (!pagePath.endsWith('/')) pagePath += '/';
  if (pagePath === '//') pagePath = '/';

  function ensureMeta(selector, createAttrs) {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      Object.entries(createAttrs).forEach(([key, value]) => node.setAttribute(key, value));
      document.head.appendChild(node);
    }
    return node;
  }

  function ensureLink(rel) {
    let node = document.head.querySelector(`link[rel="${rel}"]`);
    if (!node) {
      node = document.createElement('link');
      node.rel = rel;
      document.head.appendChild(node);
    }
    return node;
  }

  try {
    const { data, error } = await client
      .from('site_seo')
      .select('*')
      .eq('page_path', pagePath)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return;

    if (data.seo_title) document.title = data.seo_title;
    if (data.seo_description) ensureMeta('meta[name="description"]', { name: 'description' }).setAttribute('content', data.seo_description);
    if (data.canonical_url) ensureLink('canonical').href = data.canonical_url;

    const robots = data.is_indexed ? 'index, follow' : 'noindex, nofollow';
    ensureMeta('meta[name="robots"]', { name: 'robots' }).setAttribute('content', robots);

    if (data.h1) document.querySelector('.hero h1') && (document.querySelector('.hero h1').textContent = data.h1);
    if (data.og_title || data.seo_title) ensureMeta('meta[property="og:title"]', { property: 'og:title' }).setAttribute('content', data.og_title || data.seo_title);
    if (data.og_description || data.seo_description) ensureMeta('meta[property="og:description"]', { property: 'og:description' }).setAttribute('content', data.og_description || data.seo_description);
    if (data.og_image) ensureMeta('meta[property="og:image"]', { property: 'og:image' }).setAttribute('content', data.og_image);
  } catch (error) {
    console.warn('Site SEO loading failed:', error);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSiteSeo);
else initSiteSeo();
