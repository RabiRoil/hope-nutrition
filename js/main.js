/* ============================================
   Hope Nutrition — JavaScript v3
  Orchestrated load, parallax, magnetic hover,
  scroll reveals, tilt, SVG draw-in
   ============================================ */

(() => {
  'use strict';

  /* ---- helpers ---- */
  const qs  = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const isMobile = () => window.innerWidth < 768 || matchMedia('(pointer: coarse)').matches;
  let ticking = false;
  let scrollY = 0;

  /* ========== PAGE LOAD ORCHESTRATION ========== */
  function orchestrateLoad() {
    document.body.classList.add('is-loading');

    window.addEventListener('load', () => {
      // short delay so the CSS transition is visible
      requestAnimationFrame(() => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');

        // Stagger hero children
        qsa('.hero__content > *').forEach((el, i) => {
          el.style.transitionDelay = `${0.15 + i * 0.12}s`;
          el.classList.add('reveal-in');
        });

        // Reveal hero visual separately
        const visual = qs('.hero__visual');
        if (visual) {
          visual.style.transitionDelay = '0.6s';
          visual.classList.add('reveal-in');
        }
      });
    });
  }

  /* ========== MOBILE NAV ========== */
  function initNav() {
    const header = qs('.header');
    const nav = qs('.nav');
    const toggle = qs('.nav-toggle');
    const drawer = qs('.nav__drawer');
    if (!header || !nav || !toggle || !drawer) return;

    /* Create backdrop element */
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    function closeMenu() {
      toggle.classList.remove('active');
      nav.classList.remove('nav--open');
      header.classList.remove('header--menu-open');
      backdrop.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openMenu() {
      toggle.classList.add('active');
      nav.classList.add('nav--open');
      header.classList.add('header--menu-open');
      backdrop.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', () => {
      nav.classList.contains('nav--open') ? closeMenu() : openMenu();
    });

    qsa('.nav__link', drawer).forEach(link =>
      link.addEventListener('click', closeMenu)
    );

    /* Close on mobile CTA click */
    const mobileCta = qs('.nav__mobile-cta', drawer);
    if (mobileCta) mobileCta.addEventListener('click', closeMenu);

    /* Close on backdrop click */
    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
        closeMenu();
        toggle.focus();
      }
    });

    drawer.setAttribute('aria-hidden', 'true');
  }

  /* ========== HEADER SCROLL ========== */
  function initHeader() {
    const header = qs('.header');
    if (!header) return header;

    /* Expose header height as CSS custom property */
    const setHeaderH = () => document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    setHeaderH();
    window.addEventListener('resize', setHeaderH, { passive: true });

    const update = () => header.classList.toggle('header--scrolled', scrollY > 50);
    window.addEventListener('scroll', () => { scrollY = window.scrollY; if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } }, { passive: true });
    scrollY = window.scrollY;
    update();
    return header;
  }

  /* ========== SCROLL REVEAL ========== */
  function initScrollReveal() {
    const els = qsa('.fade-up');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // cascading delay among siblings that fire together
          const delay = i * 0.08;
          e.target.style.transitionDelay = `${delay}s`;
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => io.observe(el));
  }

  /* ========== PARALLAX LAYERS ========== */
  function initParallax() {
    if (isMobile()) return;

    const items = qsa('[data-parallax]');
    const blobs = qsa('.hero__blob');
    const badges = qsa('.hero__float-badge');

    // Cache each element's static top so transforms don't feed back
    const origins = items.map(el => {
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY + rect.height / 2;
    });

    function tick() {
      const sy = window.scrollY;

      items.forEach((el, idx) => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const center = origins[idx] - sy;
        const offset = (center - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });

      blobs.forEach((b, i) => {
        const speeds = [0.035, -0.025, 0.02];
        b.style.transform = `translateY(${sy * (speeds[i] || 0.02)}px) scale(${1 + sy * 0.00008})`;
      });

      badges.forEach((b, i) => {
        const base = i === 0 ? -12 : 12;
        const floatY = Math.sin(Date.now() / 2000 + i * 1.5) * 10;
        b.style.transform = `translateY(${sy * 0.04 + floatY}px)`;
      });

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ========== MAGNETIC BUTTONS ========== */
  function initMagneticButtons() {
    if (isMobile()) return;

    qsa('.btn--primary, .btn--white, .btn--accent').forEach(btn => {
      let currentX = 0, currentY = 0, targetX = 0, targetY = 0, raf;

      const animate = () => {
        currentX = lerp(currentX, targetX, 0.15);
        currentY = lerp(currentY, targetY, 0.15);
        btn.style.transform = `translate(${currentX}px, ${currentY}px)`;
        if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
          raf = requestAnimationFrame(animate);
        }
      };

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        targetX = x * 0.25;
        targetY = y * 0.25;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(animate);
      });

      btn.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(animate);
      });
    });
  }

  /* ========== TILT CARDS ========== */
  function initTiltCards() {
    if (isMobile()) return;

    qsa('.pillar-card, .service-block, .testimonial-card, .booklet-feature').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -10; // degrees — stronger 3D tilt
        const tiltY = (x - 0.5) * 10;
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px) translateY(-4px)`;

        // spotlight glow
        card.style.setProperty('--glow-x', `${x * 100}%`);
        card.style.setProperty('--glow-y', `${y * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ========== SVG DRAW-IN ========== */
  function initSvgDraw() {
    const paths = qsa('.hero__illustration path, .hero__illustration line, .hero__illustration polyline, .hero__illustration circle, .about__illustration path, .about__illustration line');
    if (!paths.length) return;

    paths.forEach(p => {
      if (p.tagName === 'circle' || !p.getTotalLength) return;
      try {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        p.classList.add('svg-draw');
      } catch (_) { /* some paths don't support getTotalLength */ }
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          qsa('.svg-draw', e.target).forEach((p, i) => {
            p.style.transitionDelay = `${i * 0.04}s`;
            p.classList.add('svg-draw--visible');
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    const wrappers = qsa('.hero__illustration, .about__illustration');
    wrappers.forEach(w => io.observe(w));
  }

  /* ========== SMOOTH SCROLL PROGRESS ========== */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ========== CURSOR TRAIL (desktop) ========== */
  function initCursorGlow() {
    if (isMobile()) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });

    let cursorActive = true;
    document.addEventListener('visibilitychange', () => { cursorActive = !document.hidden; });

    const move = () => {
      if (cursorActive) {
        cx = lerp(cx, tx, 0.12);
        cy = lerp(cy, ty, 0.12);
        glow.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      }
      requestAnimationFrame(move);
    };
    requestAnimationFrame(move);
  }

  /* ========== TEXT SPLIT REVEAL ========== */
  function initTextReveal() {
    qsa('[data-split]').forEach(el => {
      const text = el.textContent;
      const words = text.split(' ');
      el.innerHTML = words.map((w, i) =>
        `<span class="word" style="--word-i:${i}"><span class="word__inner">${w}</span></span>`
      ).join(' ');
      el.classList.add('split-ready');
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('split-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    qsa('.split-ready').forEach(el => io.observe(el));
  }

  /* ========== TESTIMONIALS SLIDER ========== */
  function initTestimonials() {
    const testimonials = qsa('.testimonial');
    const dots = qsa('.slider-dot');
    if (!testimonials.length) return;

    let current = 0;
    let interval;

    function show(idx) {
      testimonials.forEach(t => { t.style.display = 'none'; t.style.opacity = '0'; t.style.transform = 'translateY(16px)'; });
      dots.forEach(d => d.classList.remove('active'));

      current = ((idx % testimonials.length) + testimonials.length) % testimonials.length;
      const t = testimonials[current];
      t.style.display = 'block';
      void t.offsetWidth; // reflow
      t.style.transition = 'opacity 0.6s cubic-bezier(.33,1,.68,1), transform 0.6s cubic-bezier(.33,1,.68,1)';
      t.style.opacity = '1';
      t.style.transform = 'translateY(0)';
      if (dots[current]) dots[current].classList.add('active');
    }

    function auto() { interval = setInterval(() => show(current + 1), 5000); }
    function reset() { clearInterval(interval); auto(); }

    show(0);
    auto();
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); reset(); }));
  }

  /* ========== SMOOTH SCROLL ========== */
  function initSmoothScroll(header) {
    qsa('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = qs(id);
        if (!target) return;
        e.preventDefault();
        const offset = header ? header.offsetHeight : 0;
        const pos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      });
    });
  }

  /* ========== ACTIVE NAV ========== */
  function initActiveNav(header) {
    const sections = qsa('section[id]');
    const links = qsa('.nav__link[href^="#"]');
    if (!sections.length || !header) return;

    const update = () => {
      const pos = window.scrollY + header.offsetHeight + 100;
      sections.forEach(s => {
        if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) {
          links.forEach(l => {
            l.classList.toggle('nav__link--active', l.getAttribute('href') === `#${s.id}`);
          });
        }
      });
    };
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ========== SECTION REVEAL BORDERS ========== */
  function initSectionBorders() {
    qsa('.section').forEach(sec => {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { sec.classList.add('section--visible'); io.unobserve(sec); }
      }, { threshold: 0.1 });
      io.observe(sec);
    });
  }

  /* ========== 3D HERO MOUSE PERSPECTIVE ========== */
  function init3DScene() {
    if (isMobile()) return;

    const scene = qs('[data-scene-3d]');
    if (!scene) return;

    const hero = qs('.hero');
    if (!hero) return;

    let currentX = 0, currentY = 0, targetX = 0, targetY = 0;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = y * -3;   // subtle rotateX
      targetY = x * 3;    // subtle rotateY
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    const float3dEls = qsa('.float3d');
    let sceneVisible = true;

    const sceneIO = new IntersectionObserver(([entry]) => {
      sceneVisible = entry.isIntersecting;
    }, { threshold: 0 });
    sceneIO.observe(hero);

    function animate() {
      if (!sceneVisible) { requestAnimationFrame(animate); return; }

      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);

      scene.style.transform = `perspective(1200px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;

      // Extra depth parallax on floating elements — move opposite to scene tilt
      float3dEls.forEach((el, i) => {
        const depth = 1 + (i % 4) * 0.6; // vary depth multiplier per element
        const extraX = currentY * depth * -4;
        const extraY = currentX * depth * 4;
        el.style.setProperty('--mouse-x', `${extraX}px`);
        el.style.setProperty('--mouse-y', `${extraY}px`);
      });

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  /* ========== 3D DEPTH SCROLL ========== */
  function init3DScrollDepth() {
    if (isMobile()) return;

    const sections = qsa('.section');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const ratio = e.intersectionRatio;
          const el = e.target;
          const scale = 0.96 + (ratio * 0.04);
          const translateZ = (1 - ratio) * -30;
          el.style.transform = `perspective(1200px) translateZ(${translateZ}px) scale(${scale})`;
          el.style.opacity = 1;
        }
      });
    }, { threshold: Array.from({ length: 20 }, (_, i) => i / 19) });

    sections.forEach(s => {
      s.style.transition = 'transform 0.1s linear';
      io.observe(s);
    });
  }

  /* ========== INIT ========== */
  document.addEventListener('DOMContentLoaded', () => {
    orchestrateLoad();
    initNav();
    const header = initHeader();
    initScrollReveal();
    initParallax();
    initMagneticButtons();
    initTiltCards();
    initSvgDraw();
    initScrollProgress();
    initCursorGlow();
    initTextReveal();
    initTestimonials();
    initSmoothScroll(header);
    initActiveNav(header);
    initSectionBorders();
    init3DScene();
    init3DScrollDepth();
  });

})();
