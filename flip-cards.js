(() => {
  function initFlipCards() {
    if (window.__flipCardsInitialized) return;
    window.__flipCardsInitialized = true;

    document.querySelectorAll('.flip-card').forEach((card, index) => {
      const toggle = card.querySelector('.flip-card__toggle');
      if (!toggle) return;

      if (!card.id) card.id = `flip-card-${index + 1}`;
      toggle.setAttribute('aria-controls', card.id);
      toggle.setAttribute('aria-expanded', card.classList.contains('is-flipped') ? 'true' : 'false');

      toggle.addEventListener('click', () => {
        const isOpen = card.classList.toggle('is-flipped');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggle.textContent = isOpen ? 'Свернуть' : 'Подробнее';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlipCards, { once: true });
  } else {
    initFlipCards();
  }
})();
