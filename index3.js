// index3 — "Spec Sheet" exploration. No libraries: dev-mode TODO gating (same
// mechanism as index.html's script.js) + IntersectionObserver reveals. The marquee
// is pure CSS.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// dev/staging only: never true on a real deployed hostname unless ?dev is added on purpose
const isDevHost = ['localhost', '127.0.0.1'].includes(location.hostname)
  || location.protocol === 'file:'
  || new URLSearchParams(location.search).has('dev');
if (isDevHost) document.documentElement.classList.add('dev-mode');

// Gates reveals + marquee animation. Without JS or under reduced motion,
// everything renders in its final visible state.
if (!reduceMotion) document.documentElement.classList.add('motion');

// --- nav scrollspy: highlight the section currently in view ---
if ('IntersectionObserver' in window) {
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const byId = Object.fromEntries(navLinks.map((a) => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = byId[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  navLinks.forEach((a) => {
    const section = document.getElementById(a.hash.slice(1));
    if (section) spy.observe(section);
  });
}

// --- section reveals, once each ---
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
