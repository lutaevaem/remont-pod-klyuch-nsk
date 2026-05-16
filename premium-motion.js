(() => {
  function initPremiumMotion() {
    if (window.__premiumMotionInitialized) return;
    window.__premiumMotionInitialized = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const revealSelectors = [
      '.section > .container',
      '.section-head',
      '.difference-grid article',
      '.project-card',
      '.service-card',
      '.proof-card',
      '.about-card',
      '.featured-project',
      '.page-cta-card',
      '.lead-form',
      '.quote-card',
      '.contact-card',
      '.site-final-cta',
      '.rich-text',
    ];

    function matchesRevealSelector(node) {
      return revealSelectors.some((selector) => node.matches?.(selector));
    }

    function applyRevealToNode(node) {
      if (!(node instanceof HTMLElement)) return;
      if (node.dataset.reveal) return;
      if (node.closest('.hero')) return;
      if (!matchesRevealSelector(node)) return;
      node.dataset.reveal = node.matches('.project-card, .service-card, .difference-grid article, .proof-card, .contact-card') ? 'card' : 'soft';
    }

    function markRevealNodes(root = document) {
      if (root instanceof HTMLElement) applyRevealToNode(root);

      revealSelectors.forEach((selector) => {
        root.querySelectorAll?.(selector).forEach((node) => applyRevealToNode(node));
      });

      document.querySelectorAll('.project-grid-premium, .services-grid, .difference-grid, .route-grid, .proof-grid').forEach((grid) => {
        Array.from(grid.children).forEach((child, index) => {
          if (!child.dataset.reveal) return;
          child.style.setProperty('--reveal-delay', `${Math.min(index * 70, 360)}ms`);
        });
      });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    function observeRevealNodes(root = document) {
      if (root instanceof HTMLElement && root.dataset.reveal && !root.classList.contains('is-visible')) {
        observer.observe(root);
      }

      root.querySelectorAll?.('[data-reveal]').forEach((node) => {
        if (node.classList.contains('is-visible')) return;
        observer.observe(node);
      });
    }

    function initHero() {
      document.querySelectorAll('.hero').forEach((hero) => {
        requestAnimationFrame(() => hero.classList.add('is-visible'));
      });
    }

    markRevealNodes();
    document.documentElement.classList.add('motion-ready');
    observeRevealNodes();
    initHero();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          markRevealNodes(node);
          observeRevealNodes(node);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumMotion, { once: true });
  } else {
    initPremiumMotion();
  }
})();
