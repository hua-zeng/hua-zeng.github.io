(function () {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  const themeBtn = document.querySelector('.theme-toggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const isLight = theme === 'light';
    themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeColorMeta.setAttribute('content', isLight ? '#FFFFFF' : '#0B1220');
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  themeBtn.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  menuBtn.addEventListener('click', function () {
    setMenu(!header.classList.contains('is-open'));
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  window.matchMedia('(min-width: 761px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Highlight the current section in the nav ---------- */
  const sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  });

  function updateActive() {
    const marker = header.offsetHeight + window.innerHeight * 0.3;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = -1;

    if (atBottom) {
      current = sections.length - 1;
    } else {
      sections.forEach(function (section, i) {
        if (section.getBoundingClientRect().top <= marker) current = i;
      });
    }

    navLinks.forEach(function (link, i) {
      const active = i === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActive();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Fade-up on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Email button ----------
     The address is stored reversed in data attributes and only assembled on click,
     so it never appears as plain text in the page source. */
  const emailBtn = document.querySelector('.email-btn');
  const reverse = function (s) { return s.split('').reverse().join(''); };
  const user = reverse(emailBtn.dataset.u || '');
  const domain = reverse(emailBtn.dataset.d || '');

  if (user && domain) {
    emailBtn.addEventListener('click', function () {
      window.location.href = 'mailto:' + user + '@' + domain;
    });
  } else {
    emailBtn.setAttribute('aria-disabled', 'true');
    emailBtn.title = 'Email address not set yet';
  }

  /* ---------- Footer year ---------- */
  const year = document.querySelector('.year');
  if (year) year.textContent = new Date().getFullYear();
})();
