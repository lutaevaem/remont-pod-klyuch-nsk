async function initSiteSettings() {
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

  function phoneHref(phone) {
    return `tel:${String(phone || '').replace(/[^+\d]/g, '')}`;
  }

  function applyText(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  }

  function applyHref(selector, href) {
    if (!href) return;
    document.querySelectorAll(selector).forEach((node) => { node.href = href; });
  }

  try {
    const { data, error } = await client.from('site_settings').select('setting_key,value').eq('is_active', true);
    if (error || !data) return;
    const settings = Object.fromEntries(data.map((item) => [item.setting_key, item.value]));

    applyText('.brand b', settings.brand_name);
    applyText('.brand small', settings.brand_subtitle);
    applyText('.header-phone', settings.phone_display);
    applyText('.footer-contact-links a[href^="tel:"]', settings.phone_display);

    applyHref('.header-phone, a[href^="tel:"]', phoneHref(settings.phone_display));
    applyHref('a[href*="t.me"], a[href*="Telegram"]', settings.telegram_url);
    applyHref('a[href*="wa.me"], a[href*="WhatsApp"]', settings.whatsapp_url);
    applyHref('a[href^="mailto:"]', settings.email ? `mailto:${settings.email}` : null);

    if (settings.email) applyText('.footer-contact-links a[href^="mailto:"]', settings.email);
  } catch (error) {
    console.warn('Site settings loading failed:', error);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSiteSettings);
else initSiteSettings();
