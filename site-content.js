document.addEventListener('DOMContentLoaded', async () => {
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

  const config = window.SUPABASE_CONFIG;
  const client = window.supabase.createClient(config.url, config.publishableKey);

  const textBindings = {
    '/': {
      'home.hero.kicker': '.hero .eyebrow',
      'home.hero.title': '.hero h1',
      'home.hero.lead': '.hero .hero-lead',
      'home.hero.note': '.hero .hero-note',
      'home.hero.primary_button': '.hero-actions .btn-primary',
      'home.hero.secondary_button': '.hero-actions .btn-secondary',
      'home.proof.item1.title': '.hero-proof > div:nth-child(1) b',
      'home.proof.item1.text': '.hero-proof > div:nth-child(1) span',
      'home.proof.item2.title': '.hero-proof > div:nth-child(2) b',
      'home.proof.item2.text': '.hero-proof > div:nth-child(2) span',
      'home.proof.item3.title': '.hero-proof > div:nth-child(3) b',
      'home.proof.item3.text': '.hero-proof > div:nth-child(3) span',
      'home.projects.kicker': '#projects-preview .section-head .eyebrow',
      'home.projects.title': '#projects-preview .section-head h2',
      'home.projects.text': '#projects-preview .section-head p',
      'home.services.kicker': '#services .section-head .eyebrow',
      'home.services.title': '#services .section-head h2',
      'home.services.text': '#services .section-head p',
      'home.about.kicker': '#about .eyebrow',
      'home.about.title': '#about h2',
      'home.about.quote': '#about .quote-card',
      'home.form.kicker': '#contacts .contact-grid .eyebrow',
      'home.form.title': '#contacts .contact-grid h2',
      'home.form.text': '#contacts .contact-grid p',
    },
    '/projects/': {
      'projects.hero.kicker': '.hero .eyebrow',
      'projects.hero.title': '.hero h1',
      'projects.hero.lead': '.hero .hero-lead',
      'projects.hero.note': '.hero .hero-note',
      'projects.filters.kicker': '.section-head .eyebrow',
      'projects.filters.title': '.section-head h2',
      'projects.filters.text': '.section-head p',
      'projects.cta.title': '.page-cta-card h2',
      'projects.cta.text': '.page-cta-card p',
      'projects.cta.button': '.page-cta-card .btn-primary',
    },
    '/services/remont-pod-klyuch/': {
      'renovation.hero.kicker': '.hero .eyebrow',
      'renovation.hero.title': '.hero h1',
      'renovation.hero.lead': '.hero .hero-lead',
      'renovation.hero.note': '.hero .hero-note',
      'renovation.hero.primary_button': '.hero-actions .btn-primary',
      'renovation.visual.title': '.service-visual-band h3',
      'renovation.visual.text': '.service-visual-band p',
      'renovation.client_change.kicker': '.split .eyebrow',
      'renovation.client_change.title': '.split h2',
      'renovation.cta.title': '.page-cta-card h2',
      'renovation.cta.text': '.page-cta-card p',
    },
    '/services/stroitelstvo-pod-klyuch/': {
      'construction.hero.kicker': '.hero .eyebrow',
      'construction.hero.title': '.hero h1',
      'construction.hero.lead': '.hero .hero-lead',
      'construction.hero.note': '.hero .hero-note',
      'construction.hero.primary_button': '.hero-actions .btn-primary',
      'construction.visual.title': '.service-visual-band h3',
      'construction.visual.text': '.service-visual-band p',
      'construction.stages.kicker': '.split .eyebrow',
      'construction.stages.title': '.split h2',
      'construction.cta.title': '.page-cta-card h2',
      'construction.cta.text': '.page-cta-card p',
    },
    '/services/komplektatsiya-obekta/': {
      'furnishing.hero.kicker': '.hero .eyebrow',
      'furnishing.hero.title': '.hero h1',
      'furnishing.hero.lead': '.hero .hero-lead',
      'furnishing.hero.note': '.hero .hero-note',
      'furnishing.hero.primary_button': '.hero-actions .btn-primary',
      'furnishing.visual.title': '.service-visual-band h3',
      'furnishing.visual.text': '.service-visual-band p',
      'furnishing.goal.kicker': '.split .eyebrow',
      'furnishing.goal.title': '.split h2',
      'furnishing.cta.title': '.page-cta-card h2',
      'furnishing.cta.text': '.page-cta-card p',
    },
    '/contacts/': {
      'contacts.hero.kicker': '.hero .eyebrow',
      'contacts.hero.title': '.hero h1',
      'contacts.hero.lead': '.hero .hero-lead',
      'contacts.intro.item1.title': '.difference-grid article:nth-child(1) h2',
      'contacts.intro.item1.text': '.difference-grid article:nth-child(1) p',
      'contacts.intro.item2.title': '.difference-grid article:nth-child(2) h2',
      'contacts.intro.item2.text': '.difference-grid article:nth-child(2) p',
      'contacts.intro.item3.title': '.difference-grid article:nth-child(3) h2',
      'contacts.intro.item3.text': '.difference-grid article:nth-child(3) p',
      'contacts.form.kicker': '.contact-grid .eyebrow',
      'contacts.form.title': '.contact-grid h2',
      'contacts.form.text': '.contact-grid p',
      'contacts.form.note': '.quote-card',
    },
  };

  const imageBindings = {
    '/': {
      'home.hero.alexander': '.portrait-placeholder',
      'home.about.alexander': '.about-photo, .founder-photo',
    },
    '/services/remont-pod-klyuch/': { 'renovation.visual.main': '.service-visual-band' },
    '/services/stroitelstvo-pod-klyuch/': { 'construction.visual.main': '.service-visual-band' },
    '/services/komplektatsiya-obekta/': { 'furnishing.visual.main': '.service-visual-band' },
    '/contacts/': { 'contacts.hero.background': '.hero' },
  };

  function currentPathKey() {
    let path = window.location.pathname;
    if (!path.endsWith('/')) path += '/';
    if (path === '//') path = '/';
    return path;
  }

  function applyNodeText(node, value) {
    if (!node || !value) return;
    node.textContent = value;
  }

  function applyText(contentMap) {
    document.querySelectorAll('[data-content-key]').forEach((node) => {
      applyNodeText(node, contentMap[node.dataset.contentKey]);
    });

    const bindings = textBindings[currentPathKey()] || {};
    Object.entries(bindings).forEach(([key, selector]) => {
      const value = contentMap[key];
      if (!value) return;
      document.querySelectorAll(selector).forEach((node) => applyNodeText(node, value));
    });

    if (contentMap['global.brand.name']) {
      document.querySelectorAll('.brand b').forEach((node) => applyNodeText(node, contentMap['global.brand.name']));
    }
    if (contentMap['global.brand.subtitle']) {
      document.querySelectorAll('.brand small').forEach((node) => applyNodeText(node, contentMap['global.brand.subtitle']));
    }
    if (contentMap['global.phone']) {
      document.querySelectorAll('.header-phone, .footer-contact-links a[href^="tel:"]').forEach((node) => applyNodeText(node, contentMap['global.phone']));
    }
  }

  function setBackground(node, imageUrl) {
    node.style.backgroundImage = `linear-gradient(90deg, rgba(247,242,233,.92) 0%, rgba(247,242,233,.74) 42%, rgba(247,242,233,.18) 100%), url('${imageUrl}')`;
    node.style.backgroundSize = 'cover';
    node.style.backgroundPosition = 'center';
  }

  function applyImages(imageMap) {
    document.querySelectorAll('[data-image-key]').forEach((node) => {
      const image = imageMap[node.dataset.imageKey];
      if (!image?.image_url) return;
      if (node.tagName === 'IMG') {
        node.src = image.image_url;
        node.alt = image.label || node.alt || '';
      } else {
        setBackground(node, image.image_url);
      }
    });

    const bindings = imageBindings[currentPathKey()] || {};
    Object.entries(bindings).forEach(([key, selector]) => {
      const image = imageMap[key];
      if (!image?.image_url) return;
      document.querySelectorAll(selector).forEach((node) => setBackground(node, image.image_url));
    });
  }

  try {
    const [{ data: contentData, error: contentError }, { data: imageData, error: imageError }] = await Promise.all([
      client.from('site_content').select('content_key,value').eq('is_active', true),
      client.from('site_images').select('image_key,image_url,label').eq('is_active', true),
    ]);

    if (contentError) throw contentError;
    if (imageError) throw imageError;

    const contentMap = Object.fromEntries((contentData || []).map((item) => [item.content_key, item.value]));
    const imageMap = Object.fromEntries((imageData || []).map((item) => [item.image_key, item]));

    applyText(contentMap);
    applyImages(imageMap);
  } catch (error) {
    console.warn('Site content loading failed:', error);
  }
});
