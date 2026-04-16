import { animate, stagger, splitText } from 'https://esm.sh/animejs';

document.addEventListener('DOMContentLoaded', () => {

  // ── Anime.js logo text animation ──
  const { chars } = splitText('.logo', { words: false, chars: true });

  animate(chars, {
    y: [
      { to: '-2.75rem', ease: 'outExpo', duration: 600 },
      { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
    ],
    rotate: {
      from: '-1turn',
      delay: 0
    },
    delay: stagger(50),
    ease: 'inOutCirc',
    loopDelay: 5000,
    loop: true
  });

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', handleNavbarScroll);

  // ── Hamburger menu ──
  const ham = document.getElementById('ham');
  const navLinks = document.querySelector('.nav-links');
  let menuOpen = false;

  ham.addEventListener('click', () => {
    menuOpen = !menuOpen;

    if (menuOpen) {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '68px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = '#fff';
      navLinks.style.padding = '20px 24px';
      navLinks.style.boxShadow = '0 8px 24px rgba(14,165,233,.1)';
      navLinks.style.zIndex = '99';
    } else {
      navLinks.style.display = '';
      navLinks.style.flexDirection = '';
      navLinks.style.position = '';
      navLinks.style.top = '';
      navLinks.style.left = '';
      navLinks.style.right = '';
      navLinks.style.background = '';
      navLinks.style.padding = '';
      navLinks.style.boxShadow = '';
      navLinks.style.zIndex = '';
    }
  });

  // ── IntersectionObserver for fade-up animations ──
  const fadeEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  fadeEls.forEach((el) => observer.observe(el));

  // ── Portfolio tag filter (UI only) ──
  const portTags = document.querySelectorAll('.port-tags span');

  portTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      portTags.forEach((t) => t.classList.remove('active'));
      tag.classList.add('active');
    });
  });

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  function handleActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);

      if (!link) return;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinksAll.forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleActiveLink);

});
