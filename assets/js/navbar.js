(function() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const header = document.querySelector('.header');

  if (!hamburger || !navLinks || !header) return;

  function closeNav() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
    // remove focus-trap listener
    document.removeEventListener('keydown', trapFocus);
  }

  function openNav() {
    hamburger.classList.add('active');
    navLinks.classList.add('show');
    hamburger.setAttribute('aria-expanded', 'true');

    // focus first focusable element inside nav and install focus trap
    const focusable = getFocusableElements(navLinks);
    if (focusable.length) focusable[0].focus();
    document.addEventListener('keydown', trapFocus);
  }

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
  }

  function trapFocus(e) {
    // Close on Escape
    if (e.key === 'Escape' && navLinks.classList.contains('show')) {
      closeNav();
      hamburger.focus();
      return;
    }

    if (e.key !== 'Tab' || !navLinks.classList.contains('show')) return;

    const focusable = getFocusableElements(navLinks);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('show')) closeNav();
    else openNav();
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('show')) return;
    if (!navLinks.contains(e.target) && e.target !== hamburger && !hamburger.contains(e.target)) {
      closeNav();
    }
  });

  // (Escape handling is now part of trapFocus)

  // Close nav when clicking any nav link (mobile behavior) and set active link
  function setActiveNavLink() {
    // Remove active class from all links first
    navLinks.querySelectorAll('a').forEach(a => {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    });

    // Set active based on current file name
    try {
      const path = window.location.pathname.split('/').pop() || 'index.html';
      const hash = window.location.hash;
      
      navLinks.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        // Handle both index.html and empty path
        if ((path === 'index.html' || path === '' || path === '/') && (href === 'index.html' || href === './index.html')) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        } else if (href && (href === path || href.includes(path.replace('.html', '')))) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
      });
    } catch(e) {
      console.warn('Error setting active nav link:', e);
    }
  }

  // Set active link on page load
  setActiveNavLink();

  // Update active link when navigation changes
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      closeNav();
      // Update active state after a brief delay to ensure navigation happened
      setTimeout(setActiveNavLink, 100);
    });
  });

  // Scroll handler with auto-hide (adds .scrolled and .hidden-on-scroll)
  let lastScroll = window.scrollY || 0;
  let ticking = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onScroll() {
    const current = window.scrollY;

    if (current > 18) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    if (!prefersReducedMotion) {
      if (Math.abs(current - lastScroll) > 10) {
        if (current > lastScroll && current > 80) header.classList.add('hidden-on-scroll');
        else header.classList.remove('hidden-on-scroll');
        lastScroll = current;
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();