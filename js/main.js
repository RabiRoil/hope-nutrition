/* ============================================
   Hope Nutrition — JavaScript
   Navigation, animations, testimonials
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Navigation Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav__list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navList.classList.toggle('active');
      document.body.style.overflow = navList.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navList.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navList.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // --- Scroll Animations (Intersection Observer) ---
  const fadeElements = document.querySelectorAll('.fade-up');
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    fadeElements.forEach(el => observer.observe(el));
  }

  // --- Testimonials Slider ---
  const testimonials = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let autoSlideInterval;

  function showSlide(index) {
    if (testimonials.length === 0) return;

    testimonials.forEach(t => {
      t.style.display = 'none';
      t.style.opacity = '0';
    });
    dots.forEach(d => d.classList.remove('active'));

    currentSlide = ((index % testimonials.length) + testimonials.length) % testimonials.length;
    testimonials[currentSlide].style.display = 'block';

    // Trigger reflow for smooth fade
    void testimonials[currentSlide].offsetWidth;
    testimonials[currentSlide].style.opacity = '1';
    testimonials[currentSlide].style.transition = 'opacity 0.5s ease';

    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  function startAutoSlide() {
    if (testimonials.length <= 1) return;
    autoSlideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  if (testimonials.length > 0) {
    showSlide(0);
    startAutoSlide();

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        resetAutoSlide();
      });
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // --- Active Navigation Link Highlight ---
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && header) {
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    
    const highlightNav = () => {
      const scrollPos = window.scrollY + header.offsetHeight + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('nav__link--active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('nav__link--active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });
  }

});
