document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('motion-ready');

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

  function markRevealNodes(root = document) {
    revealSelectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach((node) => {
        if (node.dataset.reveal) return;
        if (node.closest('.hero')) return;
        node.dataset.reveal = node.matches('.project-card, .service-card, .difference-grid article, .proof-card, .contact-card') ? 'card' : 'soft';
      });
    });

    document.querySelectorAll('.project-grid-premium, .services-grid, .difference-grid').forEach((grid) => {
      Array.from(grid.children).forEach((child, index) => {
        if (!child.dataset.reveal) return;
        child.style.setProperty('--reveal-delay', `${Math.min(index * 75, 420)}ms`);
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  function observeRevealNodes(root = document) {
    root.querySelectorAll('[data-reveal]').forEach((node) => {
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
  observeRevealNodes();
  initHero();

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        markRevealNodes(node);
        observeRevealNodes(node);
        if (node.matches?.('[data-reveal]')) observer.observe(node);
      });
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
});
