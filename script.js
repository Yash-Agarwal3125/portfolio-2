const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// dev/staging only: never true on a real deployed hostname unless ?dev is added on purpose
const isDevHost = ['localhost', '127.0.0.1'].includes(location.hostname)
  || location.protocol === 'file:'
  || new URLSearchParams(location.search).has('dev');
if (isDevHost) document.documentElement.classList.add('dev-mode');

if (!reduceMotion) document.body.classList.add('motion-ready');

// --- nav background + scroll gradient, tied to the hero's actual rendered height ---
const nav = document.getElementById('nav');
const hero = document.querySelector('.hero');
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}

function update() {
  const heroHeight = hero.offsetHeight;
  const y = window.scrollY;

  nav.classList.toggle('scrolled', y > heroHeight);

  if (!reduceMotion) {
    const progress = Math.min(y / heroHeight, 1);
    hero.style.setProperty('--gx', `${20 + progress * 40}%`);
    hero.style.setProperty('--gy', `${20 + progress * 30}%`);
  }

  ticking = false;
}

window.addEventListener('scroll', onScroll, { passive: true });
update();

// --- hero on-load stagger (name -> headline/tags -> ctas), load-triggered not scroll-triggered ---
if (!reduceMotion) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add('hero-animate');
  }));
}

// --- section reveal on scroll, once each ---
if (!reduceMotion && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (entry.target.classList.contains('work')) {
        document.querySelector('.case-studies').classList.add('cards-visible');
      }
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-section').forEach((el) => sectionObserver.observe(el));
} else {
  // reduced motion (or no IO support): everything just appears, no reveal state needed
  document.querySelectorAll('.reveal-section').forEach((el) => el.classList.add('is-visible'));
}

// --- case study expand/collapse, height-animated via CSS grid-template-rows ---
document.querySelectorAll('.cs-summary').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.closest('.case-study').classList.toggle('is-open', !expanded);
    document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('is-open', !expanded);
  });
});

// --- cursor-reactive grid highlight: desktop pointer only, skipped under reduced motion ---
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const gridCursor = document.querySelector('.grid-cursor');
  let gridX = -9999;
  let gridY = -9999;
  let gridTicking = false;

  function updateGridCursor() {
    gridCursor.style.setProperty('--cursor-x', `${gridX}px`);
    gridCursor.style.setProperty('--cursor-y', `${gridY}px`);
    gridTicking = false;
  }

  window.addEventListener('mousemove', (e) => {
    gridX = e.pageX;
    gridY = e.pageY;
    if (!gridTicking) {
      requestAnimationFrame(updateGridCursor);
      gridTicking = true;
    }
  }, { passive: true });
}

// --- magnetic buttons: desktop pointer only, skipped under reduced motion ---
if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = rect.width / 2 + 40;
      if (dist < radius) {
        const pull = Math.min(6, dist / radius * 6);
        const angle = Math.atan2(dy, dx);
        btn.style.transform = `translate(${Math.cos(angle) * pull}px, ${Math.sin(angle) * pull}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}
