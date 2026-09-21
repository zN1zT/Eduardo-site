/* ES Consultoria — interações */
(() => {
  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];

  /* ---------- nav + barra de progresso de leitura ---------- */
  const nav = $('.nav');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 24);
    $('.totop').classList.toggle('on', scrollY > 700);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  const burger = $('.nav-burger'), links = $('.nav-links');
  burger?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  /* seção ativa */
  const navAs = $$('.nav-links a[href^="#"]');
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, {rootMargin:'-38% 0px -55% 0px'});
  $$('section[id]').forEach(s => io.observe(s));

  /* ---------- reveal ---------- */
  const rv = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } });
  }, {threshold:.14});
  $$('.rv').forEach(el => rv.observe(el));

  /* ---------- number ticker (contagem suave ao entrar em cena) ---------- */
  const fmt = n => n.toLocaleString('pt-BR');
  const tick = el => {
    const target = +el.dataset.count, suf = el.dataset.suffix || '', dur = 1900, t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(Math.round(target * e)) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const tObs = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { tick(e.target); tObs.unobserve(e.target); } });
  }, {threshold:.6});
  $$('[data-count]').forEach(el => tObs.observe(el));

  /* ---------- trajetória: progresso acompanha a rolagem ---------- */
  const timeline = $('.tl');
  if (timeline) {
    const careerItems = $$('.tl-item', timeline);
    const updateCareer = () => {
      const rect = timeline.getBoundingClientRect();
      const start = innerHeight * .74;
      const end = innerHeight * .32;
      const travel = Math.max(1, rect.height + (start - end));
      const progress = Math.max(0, Math.min(1, (start - rect.top) / travel));
      timeline.style.setProperty('--tl-progress', progress.toFixed(4));

      careerItems.forEach((item, index) => {
        const point = .04 + index * (.74 / Math.max(1, careerItems.length - 1));
        item.classList.toggle('active', progress >= point);
      });
    };

    addEventListener('scroll', updateCareer, { passive:true });
    addEventListener('resize', updateCareer);
    updateCareer();
  }

  /* ---------- marquee de normas: duplica para loop infinito ---------- */
  $$('.normas-track').forEach(track => {
    track.innerHTML += track.innerHTML;
    track.setAttribute('aria-hidden', 'true');
  });

  /* ---------- abas de clientes por nicho ---------- */
  const tabs = $$('.tab');
  const panes = $$('.logos-grid');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t); });
    panes.forEach(p => { p.hidden = (p.id !== t.dataset.pane); });
  }));

  /* ---------- lightbox da galeria ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt="">';
  lb.addEventListener('click', () => lb.classList.remove('on'));
  document.body.appendChild(lb);
  $$('.gal figure').forEach(f => f.addEventListener('click', () => {
    lb.querySelector('img').src = f.querySelector('img').src;
    lb.classList.add('on');
  }));

  /* ---------- to-top ---------- */
  $('.totop')?.addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));
})();
