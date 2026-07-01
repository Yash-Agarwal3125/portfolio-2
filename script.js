const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// dev/staging only: never true on a real deployed hostname unless ?dev is added on purpose
const isDevHost = ['localhost', '127.0.0.1'].includes(location.hostname)
  || location.protocol === 'file:'
  || new URLSearchParams(location.search).has('dev');
if (isDevHost) document.documentElement.classList.add('dev-mode');

// Gates the cursor-reactive grid highlight only (see styles.css) — scroll animation
// gating lives entirely in the reduceMotion branch below.
if (!reduceMotion) document.body.classList.add('motion-ready');

const nav = document.getElementById('nav');
const hero = document.querySelector('.hero');
const heroName = document.getElementById('hero-name');
const navLogoSlot = document.querySelector('.nav-logo-slot');

let lenis = null;

function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.1 });
  else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}

// --- hero name doubles as a back-to-top control, docked or not ---
heroName.addEventListener('click', scrollToTop);
heroName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    scrollToTop();
  }
});

// --- case study expand/collapse, height-animated via CSS grid-template-rows ---
document.querySelectorAll('.cs-summary').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.closest('.case-study').classList.toggle('is-open', !expanded);
    document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('is-open', !expanded);
  });
});

// --- sticky hero-name dock: shared by the GSAP path and the reduced-motion path ---
const DOCKED_FONT_SIZE = 26; // px, matches the nav's visual scale
let fullOrigin = null; // {x, y} of the hero-name's natural (undocked) position

const heroSpacer = document.querySelector('.hero-name-spacer');

function dockHeroName(animate) {
  const startRect = heroName.getBoundingClientRect();
  const nameStyle = getComputedStyle(heroName);
  const fullFontSize = parseFloat(nameStyle.fontSize);
  fullOrigin = { x: startRect.left, y: startRect.top };

  // Reserve the h1's flow slot before it goes position:fixed — otherwise the whole
  // document below the hero shifts up by the h1's height at the dock threshold.
  heroSpacer.style.height = `${heroName.offsetHeight + parseFloat(nameStyle.marginBottom)}px`;
  heroName.classList.add('is-docked');
  const slotRect = navLogoSlot.getBoundingClientRect();
  const scale = DOCKED_FONT_SIZE / fullFontSize;

  if (animate) {
    gsap.killTweensOf(heroName, 'x,y,scale');
    gsap.set(heroName, { x: fullOrigin.x, y: fullOrigin.y, scale: 1 });
    gsap.to(heroName, { x: slotRect.left, y: slotRect.top, scale, duration: 0.4, ease: 'power2.out' });
  } else {
    heroName.style.transform = `translate(${slotRect.left}px, ${slotRect.top}px) scale(${scale})`;
  }
}

function undockHeroName(animate) {
  if (animate) {
    gsap.killTweensOf(heroName, 'x,y,scale');
    gsap.to(heroName, {
      x: fullOrigin ? fullOrigin.x : 0,
      y: fullOrigin ? fullOrigin.y : 0,
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        heroName.classList.remove('is-docked');
        heroSpacer.style.height = '0';
        gsap.set(heroName, { clearProps: 'transform' });
      },
    });
  } else {
    heroName.classList.remove('is-docked');
    heroName.style.transform = '';
    heroSpacer.style.height = '0';
  }
}

if (!reduceMotion) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Mirror the CSS motion tokens (--duration-slow: 400ms, --ease) so GSAP and CSS
  // transitions share one timing language instead of drifting apart.
  const DUR = 0.4;
  const EASE = 'power2.out';

  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Lenis virtualizes scroll, so native hash-link jumps (nav, "View Work" CTA)
  // no longer move the page on their own — route them through lenis.scrollTo.
  // The skip link jumps instantly and moves focus: smooth-scrolling a keyboard
  // bypass defeats its purpose.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (anchor.classList.contains('skip-link')) {
        lenis.scrollTo(target, { immediate: true });
        target.focus();
      } else {
        lenis.scrollTo(target);
      }
    });
  });

  // --- hero on-load stagger (name -> tags -> ctas; headline is covered by SplitText below) ---
  const heroTl = gsap.timeline({ defaults: { opacity: 0, y: 16, duration: DUR, ease: EASE } });
  heroTl
    .from('.hero-name', {})
    .from('.role-tags', {}, 0.1)
    .from('.hero-ctas', {}, 0.2);

  // --- section reveal on scroll, once each (.is-visible also draws the heading underline, see CSS) ---
  gsap.utils.toArray('.reveal-section').forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 24,
      duration: DUR,
      ease: EASE,
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true,
        onEnter: () => section.classList.add('is-visible'),
      },
    });
  });

  // --- case-study card stagger within Selected Work ---
  gsap.from('.case-study', {
    opacity: 0,
    y: 24,
    duration: DUR,
    stagger: 0.08,
    ease: EASE,
    scrollTrigger: { trigger: '.work', start: 'top 85%', once: true },
  });

  // --- section headers + hero headline: word-stagger reveal, not body copy ---
  document.querySelectorAll('.section-heading, .hero-headline').forEach((el) => {
    const split = new SplitText(el, { type: 'words' });
    gsap.from(split.words, {
      opacity: 0,
      y: 16,
      stagger: 0.03,
      duration: DUR,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // --- hero radial gradient shifts with scroll progress through the hero ---
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      hero.style.setProperty('--gx', `${20 + self.progress * 40}%`);
      hero.style.setProperty('--gy', `${20 + self.progress * 30}%`);
    },
  });

  // --- nav background + sticky hero-name dock, one trigger for both ---
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom top',
    onEnter: () => {
      nav.classList.add('scrolled');
      dockHeroName(true);
    },
    onLeaveBack: () => {
      nav.classList.remove('scrolled');
      undockHeroName(true);
    },
  });

  // sync initial state in case the page loads already scrolled past the hero
  if (window.scrollY > hero.offsetHeight) {
    nav.classList.add('scrolled');
    dockHeroName(false);
  }
} else {
  // reduced motion: no Lenis, no GSAP scroll animation — native scroll, instant dock toggle
  document.querySelectorAll('.reveal-section').forEach((el) => el.classList.add('is-visible'));

  function syncDockState() {
    const shouldDock = window.scrollY > hero.offsetHeight;
    nav.classList.toggle('scrolled', shouldDock);
    if (shouldDock !== heroName.classList.contains('is-docked')) {
      shouldDock ? dockHeroName(false) : undockHeroName(false);
    }
  }
  window.addEventListener('scroll', syncDockState, { passive: true });
  syncDockState();
}

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
