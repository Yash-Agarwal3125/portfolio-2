# CLAUDE.md — Portfolio Build Instructions

## Project

Build Yash Agarwal's personal portfolio site. Target audience: SDE/MLE recruiters and hiring managers at Google, Microsoft, Amazon, Atlassian, Uber, Stripe, Databricks, Palantir, and high-growth startups. Placement season 2026.

The site must read as **a premium engineering product**, not a student portfolio or a design-showcase template. Reference feel: Anthropic.com, Linear.app, Vercel.com, Stripe.com — typography-led, restrained, editorial, calm. Explicitly avoid: Framer-template energy, Awwwards animation showcases, floating 3D objects, particle effects, gradients-as-decoration.

## Stack

- Plain HTML/CSS/vanilla JS. No framework, no build step.
- File structure:
  ```
  /index.html
  /styles.css
  /script.js
  /assets/  (resume.pdf, favicon, og-image, project screenshots)
  ```
- Self-hosted Geist font (woff2), fallback Inter → IBM Plex Sans → system-ui.

## Design Tokens

Define all of these as CSS custom properties in `:root` in `styles.css` before writing any component styles:

```css
:root {
  /* Color */
  --bg: #FAF8F3;
  --bg-alt: #F8F6F0;
  --card: #FFFFFF;
  --border: #E7E3DA;
  --text-primary: #111111;
  --text-secondary: #4A4A4A;
  --accent: #4F46E5;
  --accent-hover: #4338CA;
  --focus-ring: #4F46E5;

  /* Spacing (8px base) */
  --space-1: 8px; --space-2: 16px; --space-3: 24px; --space-4: 32px;
  --space-5: 48px; --space-6: 64px; --space-7: 96px; --space-8: 128px;

  /* Typography */
  --text-xs: 13px; --text-sm: 15px; --text-base: 17px; --text-lg: 20px;
  --text-xl: 28px; --text-2xl: 40px; --text-3xl: 64px;
  --text-hero: clamp(64px, 12vw, 160px);

  /* Radius / Shadow */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 20px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);

  /* Motion */
  --duration-fast: 120ms; --duration-base: 200ms; --duration-slow: 400ms;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Breakpoints: mobile `<640px`, tablet `640–1024px`, desktop `>1024px`. Build mobile-first.

## Background

- Subtle drafting-paper grid: 64px cells, 1px lines, 2-4% opacity on desktop, 1.5% on mobile. CSS `background-image` with repeating linear gradients — not an SVG asset, not canvas.
- Radial gradient behind hero that shifts position slowly on scroll (JS, throttled via `requestAnimationFrame`, not a per-frame listener). Under `prefers-reduced-motion: reduce`, gradient stays static — no shift at all.

## Hero

Typography-only. No illustration, no floating cards, no diagram on the right side. This is a deliberate decision — do not add a hero-side visual even if it seems like it fills empty space well; the empty space is intentional (see reference sites).

Structure:
1. Name — "Yash Agarwal", `--text-hero`, left-aligned, tight line-height, biggest element on the page.
2. Headline — one line describing what he builds (e.g. "Building reliable software for real-world problems"), `--text-2xl`, `--text-secondary`, max-width ~600px.
3. Role tags — "Software Engineer · Backend · Machine Learning" as small pill badges.
4. Two CTAs: "View Work" (filled accent button, scrolls to Selected Work) and "Resume" (outline button, opens `/assets/resume.pdf` in new tab).

## Sections (in order)

1. **Nav** — fixed, transparent over hero, solid `--bg` with backdrop-blur after scrolling past hero. Links: Work, Philosophy, Experience, Contact. Resume link always visible in nav, not just hero.
2. **Selected Work** — project case studies, see pattern below.
3. **Engineering Philosophy** — 2-3 short paragraphs, not a manifesto. Keep it under 150 words total.
4. **Experience** — timeline format (Jio Platforms internship, Jala Academy internship). No skill bars, no percentages.
5. **Technologies** — inline tag groups: Languages / Frameworks / Infra & Tools. No circles, no proficiency meters.
6. **Contact / Footer** — mailto, LinkedIn, GitHub icons. No contact form.

## Case Study Pattern

Two-tier per project — do not render full case study text by default:

**Collapsed card (default state):**
- Project name
- One-line impact statement (outcome-focused: what changed/improved, with a number if possible — not "a project I built to learn X")
- 3-4 tech stack tags
- "Expand" affordance

**Expanded state (click/tap toggle):**
- Problem → Architecture → Challenges → Solution → Results → Lessons Learned → GitHub link
- Use `<details>`/`<summary>` or a JS toggle with `aria-expanded` — must be keyboard-operable, not just click-only

Projects to include (pull specifics from resume/prior conversation context — ask me for exact metrics if not in your context):
- Distributed AI Inference Platform (Kafka, FastAPI, Redis, Docker, Prometheus, 12 microservices)
- IPL-Bhai-Log betting platform (FastAPI, React, MySQL, JWT)
- Self-Driving DQN Car (TensorFlow, Pygame)
- Placement Mail Tracker (Gemini API, pytest, CI/CD)
- Flight Price Predictor (from-scratch gradient descent)

## Accessibility (non-negotiable)

- Every interactive element gets a visible `:focus-visible` state using `--focus-ring`. Never `outline: none` without a replacement.
- Respect `prefers-reduced-motion` globally — disable all transitions/animations under that media query.
- All images/diagrams get descriptive alt text.
- Color contrast: body text uses `--text-secondary` (#4A4A4A) which passes WCAG AA at 17px — do not substitute a lighter gray.
- Case study expand/collapse must work via keyboard (Enter/Space), not just mouse click.

## Responsive Rules

- Mobile (<640px): hero name scales to `clamp(48px, 16vw, 72px)`; CTAs stack full-width; case study cards show summary only, tap to expand, no hover-dependent interactions.
- Tablet (640-1024px): hero name `clamp(56px, 10vw, 96px)`; single-column project layout.
- Desktop (>1024px): full spec; expanded case studies can use 2-column layout (narrative left, tech stack right).

## Performance Targets

- Total page weight <500KB excluding resume PDF.
- Self-hosted fonts, no Google Fonts CDN call.
- Lighthouse: Performance ≥95, Accessibility ≥95, Best Practices ≥95, SEO ≥90.
- No canvas/WebGL — grid and gradient are CSS/SVG only.

## Explicitly Forbidden

Particles, blobs, cursor trails, typing effects, matrix rain, bouncing elements, infinite floating animations, 3D cubes, neon glows, gradient-heavy sections, skill percentage bars/circles, stock illustrations, AI-robot artwork, laptop mockup images.

## Build Order

1. Set up design tokens in `styles.css` first — nothing else until this is locked.
2. Build nav + hero, test at all 3 breakpoints before moving on.
3. Build one project case study card fully (collapsed + expanded states, keyboard accessible) before replicating for the rest.
4. Build remaining sections in order listed above.
5. Add scroll gradient + reduced-motion handling last, after static layout is confirmed correct.
6. Run a Lighthouse pass and fix anything under target before calling it done.

## When Ambiguous

If a detail isn't specified here (exact copy for Engineering Philosophy, specific project metrics, exact icon set), ask rather than inventing filler content — especially project impact numbers, which need to be accurate, not impressive-sounding placeholders.