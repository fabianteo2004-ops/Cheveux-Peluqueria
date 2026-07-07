const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ===== SCROLL PROGRESS BAR =====
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
}, { passive: true });

// ===== BURGER MENU =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-clip').forEach(el => revealObserver.observe(el));

// ===== CUSTOM CURSOR =====
if (isFinePointer && !reduceMotion) {
  document.body.classList.add('has-fine-pointer');
  const cursor = document.getElementById('cursor');
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
  document.querySelectorAll('[data-cursor="view"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('view'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('view'));
  });
}

// ===== TABS PRECIOS (clip-path duplicate technique) =====
const tabsBase = document.querySelectorAll('.precios__tabs-row--base .tab');
const activeRow = document.querySelector('.precios__tabs-row--active');
const panels = document.querySelectorAll('.precios__panel');
const TAB_COUNT = tabsBase.length;

function setActiveTab(index) {
  const left = (index * (100 / TAB_COUNT));
  const right = 100 - ((index + 1) * (100 / TAB_COUNT));
  activeRow.style.clipPath = `inset(0 ${right}% 0 ${left}%)`;
  panels.forEach(p => p.classList.remove('active'));
  panels[index].classList.add('active');
}

tabsBase.forEach(tab => {
  tab.addEventListener('click', () => setActiveTab(parseInt(tab.dataset.index, 10)));
});
setActiveTab(0);

// ===== QUOTE BANNER — clip-path text reveal tied to scroll =====
const quoteText = document.getElementById('quoteText');
if (quoteText) {
  const banner = quoteText.closest('.quote-banner');
  window.addEventListener('scroll', () => {
    const rect = banner.getBoundingClientRect();
    const progress = 1 - Math.min(Math.max((rect.top) / window.innerHeight, 0), 1);
    const reveal = Math.min(Math.max(progress * 1.6, 0), 1) * 100;
    quoteText.style.clipPath = `inset(0 ${100 - reveal}% 0 0)`;
  }, { passive: true });
}

// ===== GALERÍA — horizontal scroll driven by vertical scroll (desktop only) =====
const scroller = document.getElementById('galeriaScroller');
const track = document.getElementById('galeriaTrack');
const desktopQuery = window.matchMedia('(min-width: 900px)');

function setupGalleryScroll() {
  if (!desktopQuery.matches || reduceMotion) {
    scroller.style.height = '';
    track.style.transform = '';
    return;
  }
  const maxTranslate = track.scrollWidth - window.innerWidth + 64;
  scroller.style.height = (Math.max(maxTranslate, 0) + window.innerHeight) + 'px';

  function onScroll() {
    if (!desktopQuery.matches) return;
    const rect = scroller.getBoundingClientRect();
    const scrollerTop = window.scrollY + rect.top;
    const total = scroller.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max((window.scrollY - scrollerTop) / total, 0), 1);
    track.style.transform = `translateX(-${progress * maxTranslate}px)`;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

setupGalleryScroll();
window.addEventListener('resize', setupGalleryScroll);

// ===== SMOOTH ANCHOR OFFSET (navbar compensation) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + section.id
          ? 'var(--ink)'
          : '';
      });
    }
  });
}, { passive: true });
