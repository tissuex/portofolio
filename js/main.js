/**
 * main.js — Portfolio Controller
 * Modules: navbar, cursor, scroll, Three.js hero, animations
 */

// ────────────────────────────────────────────────────────
// 1. THREE.JS — Load via CDN, pin version r163
// ────────────────────────────────────────────────────────
import { initHero3D, updateMouse, destroyHero3D } from './hero3d.js';

const THREEJS_CDN = 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.min.js';

async function loadThree() {
  try {
    const THREE = await import(THREEJS_CDN);
    // Expose globally for hero3d.js
    window.__THREE__ = THREE;
    return true;
  } catch (e) {
    console.warn('[Portfolio] Three.js CDN failed to load. Static fallback active.');
    return false;
  }
}

// ────────────────────────────────────────────────────────
// 2. REDUCED MOTION CHECK
// ────────────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ────────────────────────────────────────────────────────
// 3. INIT
// ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // ── Navbar ──
  initNavbar();

  // ── Scroll Progress ──
  initScrollProgress();

  // ── Section Dots ──
  initSectionDots();

  // ── Active Nav on Scroll ──
  initActiveNav();

  // ── Fade Up Observer ──
  initFadeUp();

  // ── Custom Cursor (desktop only) ──
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    initCursor();
  }

  // ── Hero code typing animation ──
  if (!prefersReducedMotion) {
    initCodeTyping();
  }

  // ── Three.js Hero ──
  if (!prefersReducedMotion) {
    const loaded = await loadThree();
    if (loaded) {
      const canvas = document.getElementById('hero-canvas');
      initHero3D(canvas);

      // Mouse parallax
      const hero = document.getElementById('hero');
      hero?.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        updateMouse(nx, ny);
      }, { passive: true });

      // Touch parallax
      hero?.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const rect = hero.getBoundingClientRect();
        const nx = ((t.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = -((t.clientY - rect.top) / rect.height - 0.5) * 2;
        updateMouse(nx * 0.5, ny * 0.5);
      }, { passive: true });
    }
  }

  // ── Cleanup on page unload ──
  window.addEventListener('pagehide', destroyHero3D);

});


// ────────────────────────────────────────────────────────
// NAVBAR MODULE
// ────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const ham = document.getElementById('ham');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mnav-link, .mnav-cta');
  let menuOpen = false;

  // Scroll effect
  function handleNavScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Init state

  // Hamburger toggle
  function openMenu() {
    menuOpen = true;
    ham.classList.add('open');
    ham.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mobileLinks.forEach(l => l.setAttribute('tabindex', '0'));
  }

  function closeMenu() {
    menuOpen = false;
    ham.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    mobileLinks.forEach(l => l.setAttribute('tabindex', '-1'));
  }

  ham?.addEventListener('click', () => {
    menuOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
}


// ────────────────────────────────────────────────────────
// SCROLL PROGRESS
// ────────────────────────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


// ────────────────────────────────────────────────────────
// SECTION DOTS
// ────────────────────────────────────────────────────────
function initSectionDots() {
  const dots = document.querySelectorAll('.sdot');
  const sections = document.querySelectorAll('section[id], footer[id]');
  if (!dots.length) return;

  function update() {
    const scrollY = window.scrollY + window.innerHeight * 0.4;

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const dot = document.querySelector(`.sdot[href="#${section.id}"]`);
      if (!dot) return;

      if (scrollY >= top && scrollY < bottom) {
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


// ────────────────────────────────────────────────────────
// ACTIVE NAV LINK
// ────────────────────────────────────────────────────────
function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function update() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
      if (!link) return;

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(l => {
          l.classList.remove('active');
          l.removeAttribute('aria-current');
        });
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


// ────────────────────────────────────────────────────────
// FADE UP OBSERVER
// ────────────────────────────────────────────────────────
function initFadeUp() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}


// ────────────────────────────────────────────────────────
// CUSTOM CURSOR
// ────────────────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');

  let curX = 0, curY = 0;
  let ringX = 0, ringY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    curX = e.clientX;
    curY = e.clientY;
  }, { passive: true });

  function animateCursor() {
    // Dot follows instantly
    dot.style.transform = `translate(${curX}px, ${curY}px)`;

    // Ring lags behind
    ringX += (curX - ringX) * 0.12;
    ringY += (curY - ringY) * 0.12;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    cursor.style.opacity = '1';
    rafId = requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hover state on interactive elements
  const interactors = document.querySelectorAll('a, button, .skill-item, .project-item, .test-card, .blog-card');
  interactors.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

  // Cleanup on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) cancelAnimationFrame(rafId);
    else if (!document.hidden) animateCursor();
  });
}


// ────────────────────────────────────────────────────────
// CODE TYPING ANIMATION (Hero code block)
// ────────────────────────────────────────────────────────
function initCodeTyping() {
  const codeLines = document.querySelectorAll('.code-line');
  if (!codeLines.length) return;

  codeLines.forEach((line, i) => {
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.transition = 'opacity 400ms ease';
      line.style.opacity = '1';
    }, 800 + i * 200);
  });
}


// ────────────────────────────────────────────────────────
// SMOOTH ANCHOR SCROLL
// ────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
