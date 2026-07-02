// index2 — "Observability Dashboard" exploration. No external libraries:
// IntersectionObserver reveals + one cheap 2D-canvas sparkline is the whole engine.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// dev/staging only — same rule as the main build
const isDevHost = ['localhost', '127.0.0.1'].includes(location.hostname)
  || location.protocol === 'file:'
  || new URLSearchParams(location.search).has('dev');
if (isDevHost) document.documentElement.classList.add('dev-mode');

// Gates boot-log stagger, reveals, and the pulse dot. Without JS (or with reduced
// motion) nothing is ever hidden.
if (!reduceMotion) document.documentElement.classList.add('motion');

// --- IST clock in the status bar ---
const clock = document.getElementById('clock');
function tickClock() {
  clock.textContent = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
  }).format(new Date()) + ' IST';
}
tickClock();
setInterval(tickClock, 30000);

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

// --- decorative throughput sparkline: DPR-sharp 2D canvas time-series scroll.
//     Shifts one point every 90ms (a calm Grafana pan, not per-frame noise), paused
//     when offscreen or tab hidden, drawn once statically under reduced motion ---
(function initStream() {
  const canvas = document.getElementById('stream');
  const ctx = canvas.getContext('2d');
  const N = 120; // points in the window
  const points = [];
  let v = 0.5;
  for (let i = 0; i < N; i++) {
    v = Math.min(0.9, Math.max(0.1, v + (Math.random() - 0.5) * 0.12));
    points.push(v);
  }

  let W = 0;
  let H = 0;
  function size() {
    // Render at the element's real CSS size × devicePixelRatio so the line is
    // crisp on retina instead of an upscaled 900px bitmap.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const green = '#4ADE80';
  const grid = 'rgba(139, 152, 169, 0.12)';

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // horizontal gridlines, grafana-style
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let y = H / 4; y < H; y += H / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // area fill
    ctx.beginPath();
    ctx.moveTo(0, H);
    points.forEach((p, i) => ctx.lineTo((i / (N - 1)) * W, H - p * H * 0.85));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(74, 222, 128, 0.10)';
    ctx.fill();
    // line
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (N - 1)) * W;
      const y = H - p * H * 0.85;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = green;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  size();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { size(); draw(); }, 150);
  });

  if (reduceMotion) return; // static sparkline only

  let visible = true;
  let last = 0;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; })
    .observe(canvas);

  function frame(t) {
    if (visible && !document.hidden && t - last > 90) {
      last = t;
      points.shift();
      v = Math.min(0.9, Math.max(0.1, points[points.length - 1] + (Math.random() - 0.5) * 0.12));
      points.push(v);
      draw();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
