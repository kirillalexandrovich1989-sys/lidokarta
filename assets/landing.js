(() => {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Мобильное меню: полноэкранная панель, пункты появляются по очереди
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      const items = [...menu.children];
      const step = Math.min(60, 400 / items.length);
      items.forEach((el, i) => { el.style.transitionDelay = `${i * step}ms`; });
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('open')));
    } else {
      menu.classList.remove('open');
      [...menu.children].forEach((el) => { el.style.transitionDelay = '0ms'; });
      setTimeout(() => { if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 300);
    }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // Секции поднимаются и проявляются один раз
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // Слоган: слова загораются по одному, пересекая линию на 70% высоты экрана
  const tagline = document.querySelector('[data-words]');
  if (tagline) {
    const words = tagline.innerHTML.split(/\s+/).filter(Boolean);
    tagline.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const spans = [...tagline.querySelectorAll('.w')];
    if (reduce) {
      spans.forEach((s) => s.classList.add('on'));
    } else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const line = window.innerHeight * 0.7;
        // Слова одной строки пересекают линию вместе, поэтому разводим их задержкой
        let n = 0;
        spans.forEach((s) => {
          if (!s.classList.contains('on') && s.getBoundingClientRect().top < line) {
            s.style.transitionDelay = `${n++ * 70}ms`;
            s.classList.add('on');
          }
        });
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
    }
  }
})();
