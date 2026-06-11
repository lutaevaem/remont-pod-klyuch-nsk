(() => {
  function createLightbox() {
    let lightbox = document.querySelector('.case-lightbox');
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.className = 'case-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.innerHTML = `
      <div class="case-lightbox__top">
        <p class="case-lightbox__title"></p>
        <button class="case-lightbox__close" type="button" aria-label="Закрыть фото">×</button>
      </div>
      <div class="case-lightbox__image-wrap"><img class="case-lightbox__image" alt=""></div>
      <p class="case-lightbox__caption"></p>
    `;
    document.body.appendChild(lightbox);
    return lightbox;
  }

  function initCaseGallery() {
    const cards = document.querySelectorAll('[data-lightbox-title]');
    if (!cards.length) return;

    const lightbox = createLightbox();
    const title = lightbox.querySelector('.case-lightbox__title');
    const image = lightbox.querySelector('.case-lightbox__image');
    const caption = lightbox.querySelector('.case-lightbox__caption');
    const close = lightbox.querySelector('.case-lightbox__close');

    function open(card) {
      const img = card.querySelector('img');
      if (!img) return;
      const nextTitle = card.dataset.lightboxTitle || img.alt || 'Фото проекта';
      const nextCaption = card.dataset.lightboxCaption || '';
      title.textContent = nextTitle;
      image.src = img.currentSrc || img.src;
      image.alt = nextTitle;
      caption.textContent = nextCaption;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      close.focus({ preventScroll: true });
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      image.removeAttribute('src');
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => open(card));
    });

    close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCaseGallery, { once: true });
  } else {
    initCaseGallery();
  }
})();
