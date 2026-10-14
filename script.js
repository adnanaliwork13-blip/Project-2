/* ==========================================================================
   دار العدالة — Interactive Behaviors
   1) Mobile hamburger drawer
   2) Animated statistic counters (IntersectionObserver)
   3) Smooth scroll for anchor links + active nav link tracking
   4) Contact form validation
   5) Scroll reveal animations
   6) Header shrink / back-to-top button
   7) Subtle parallax on the About section image
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1) MOBILE HAMBURGER DRAWER
  ------------------------------------------------------------------ */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-menu-cta');

  const openMobileMenu = () => {
    mobileMenu.classList.add('is-open');
    mobileMenuBackdrop.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('is-open');
    mobileMenuBackdrop.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });

    // Close drawer automatically if viewport grows past tablet breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  /* ------------------------------------------------------------------
     2) ANIMATED COUNTERS
  ------------------------------------------------------------------ */
  const counters = document.querySelectorAll('.counter-up');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const duration = 1800;
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(easeOut * target);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /* ------------------------------------------------------------------
     3) SMOOTH SCROLL + ACTIVE NAV LINK TRACKING
  ------------------------------------------------------------------ */
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
  allAnchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 84;
          const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
          history.pushState(null, '', targetId);
        }
      }
    });
  });

  const sections = document.querySelectorAll('main section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');
  if (sections.length && desktopNavLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          desktopNavLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(section => navObserver.observe(section));
  }

  /* ------------------------------------------------------------------
     4) CONTACT FORM VALIDATION
  ------------------------------------------------------------------ */
  const form = document.getElementById('consultationForm');
  const formSuccess = document.getElementById('formSuccess');

  const validators = {
    fullName: (value) => value.trim().length >= 3,
    phone: (value) => /^05[0-9]{8}$/.test(value.trim()),
    consultType: (value) => value.trim() !== ''
  };

  const setFieldState = (fieldName, isValid) => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const fieldWrap = input ? input.closest('.field') : null;
    if (fieldWrap) {
      fieldWrap.classList.toggle('has-error', !isValid);
    }
  };

  if (form) {
    // Live validation as the user types / selects
    Object.keys(validators).forEach((fieldName) => {
      const input = form.querySelector(`[name="${fieldName}"]`);
      if (!input) return;
      const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventType, () => {
        setFieldState(fieldName, validators[fieldName](input.value));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formSuccess.classList.remove('is-visible');

      let isFormValid = true;
      Object.keys(validators).forEach((fieldName) => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (!input) return;
        const valid = validators[fieldName](input.value);
        setFieldState(fieldName, valid);
        if (!valid) isFormValid = false;
      });

      if (!isFormValid) {
        const firstError = form.querySelector('.field.has-error input, .field.has-error select');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate successful submission
      formSuccess.classList.add('is-visible');
      form.reset();
      Object.keys(validators).forEach((fieldName) => setFieldState(fieldName, true));
    });
  }

  /* ------------------------------------------------------------------
     5) SCROLL REVEAL ANIMATIONS
  ------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal-item, .reveal-scale');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------
     6) HEADER SHADOW ON SCROLL + BACK TO TOP BUTTON
  ------------------------------------------------------------------ */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    if (header) header.style.boxShadow = scrolled
      ? '0 12px 36px -4px rgba(0,0,0,0.9)'
      : '0 12px 36px -4px rgba(0,0,0,0.8)';

    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 480);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     7) SUBTLE PARALLAX — About section lawyer image
  ------------------------------------------------------------------ */
  const parallaxImg = document.getElementById('parallaxLawyerImg');
  const parallaxWrap = document.getElementById('parallaxLawyerWrap');

  if (parallaxImg && parallaxWrap && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let ticking = false;

    const updateParallax = () => {
      const rect = parallaxWrap.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollPercent = (windowHeight - rect.top) / (windowHeight + rect.height);
        const translateY = (scrollPercent - 0.5) * 30;
        parallaxImg.style.transform = `translateY(${translateY}px) scale(1.05)`;
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }
});
