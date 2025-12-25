// HomeScope Wrapped — static story player (tap/swipe + Auto toggle)

const SLIDES = [
  { src: "./assets/01-hero.png", alt: "HomeScope Wrapped 2025" },
  { src: "./assets/02-tap.png", alt: "Tap to view" },
  { src: "./assets/03-stickers.png", alt: "Hashtag stickers" },
  { src: "./assets/04-cities.png", alt: "Cities: Las Vegas, Houston, Dallas" },
  { src: "./assets/05-63.png", alt: "63% statistic" },
  { src: "./assets/06-stats.png", alt: "6 conferences, 4 cities, 2 years, 1 mission" },
  { src: "./assets/07-thanks.png", alt: "Thanks slide" },
  { src: "./assets/08-outro.png", alt: "Outro slide" },
];

const AUTO_MS = 4200; // story timing
const HOLD_PAUSE_MS = 140; // small delay to detect hold intent

const stage = document.getElementById("stage");
const progressTrack = document.getElementById("progressTrack");
const autoToggle = document.getElementById("autoToggle");

let index = 0;
let autoOn = false;
let autoTimer = null;
let holdTimer = null;
let isHolding = false;
let deckEl = null;
let slideEls = [];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function build() {
  // Deck
  deckEl = document.createElement("div");
  deckEl.className = "deck";
  deckEl.setAttribute("role", "group");
  deckEl.setAttribute("aria-roledescription", "carousel");
  deckEl.setAttribute("aria-label", "HomeScope Wrapped slides");
  stage.appendChild(deckEl);

  // Slides (stacked)
  slideEls = SLIDES.map((s, i) => {
    const d = document.createElement("div");
    d.className = "slide" + (i === 0 ? " active" : "");
    d.style.backgroundImage = `url('${s.src}')`;
    d.setAttribute("aria-hidden", i === 0 ? "false" : "true");
    d.setAttribute("data-index", String(i));
    d.title = s.alt;
    deckEl.appendChild(d);
    return d;
  });

  // Progress segments
  progressTrack.style.gridTemplateColumns = `repeat(${SLIDES.length}, 1fr)`;
  progressTrack.innerHTML = "";
  for (let i = 0; i < SLIDES.length; i++) {
    const seg = document.createElement("div");
    seg.className = "segment";
    const fill = document.createElement("span");
    seg.appendChild(fill);
    progressTrack.appendChild(seg);
  }

  // Preload images so transitions are smooth
  SLIDES.forEach((s) => {
    const img = new Image();
    img.src = s.src;
  });

  attachEvents();
  render();
}

function render() {
  // Update slides
  slideEls.forEach((el, i) => {
    const active = i === index;
    el.classList.toggle("active", active);
    el.setAttribute("aria-hidden", active ? "false" : "true");
  });

  // Update progress: previous full, current animated when auto on
  const segments = Array.from(progressTrack.querySelectorAll(".segment > span"));
  segments.forEach((fill, i) => {
    if (i < index) fill.style.width = "100%";
    else if (i > index) fill.style.width = "0%";
    else fill.style.width = autoOn ? "0%" : "100%"; // when not auto, show current as filled
  });

  if (autoOn) animateCurrentProgress();
}

function animateCurrentProgress() {
  const fills = Array.from(progressTrack.querySelectorAll(".segment > span"));
  const fill = fills[index];
  if (!fill) return;

  // Animate current segment from 0 to 100 over AUTO_MS
  // Use rAF for reliable timing + easy pause.
  const start = performance.now();
  const duration = AUTO_MS;

  function tick(now) {
    if (!autoOn || isHolding) return; // paused or off
    const t = clamp((now - start) / duration, 0, 1);
    fill.style.width = `${Math.round(t * 100)}%`;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function go(next) {
  const prev = index;
  index = clamp(next, 0, SLIDES.length - 1);
  if (index === prev) return;

  stopAutoTimer();
  render();
  if (autoOn) startAutoTimer();
}

function next() {
  if (index >= SLIDES.length - 1) {
    // end: loop back to start (Spotify-like)
    go(0);
  } else {
    go(index + 1);
  }
}
function prev() {
  if (index <= 0) {
    go(0);
  } else {
    go(index - 1);
  }
}

function setAuto(on) {
  autoOn = !!on;
  autoToggle.setAttribute("aria-pressed", autoOn ? "true" : "false");
  autoToggle.textContent = autoOn ? "Auto: On" : "Auto: Off";

  stopAutoTimer();
  render();
  if (autoOn) startAutoTimer();
}

function startAutoTimer() {
  stopAutoTimer();
  autoTimer = setInterval(() => {
    if (!autoOn || isHolding) return;
    next();
  }, AUTO_MS);
}

function stopAutoTimer() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

function attachEvents() {
  // Tap/click to advance (but ignore clicks on controls)
  deckEl.addEventListener("click", (e) => {
    const target = e.target;
    // If user clicked the toggle (or header) don't advance
    if (target && (target.id === "autoToggle" || target.closest(".topbar"))) return;
    next();
  });

  // Keyboard
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      next();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  });

  // Auto toggle
  autoToggle.addEventListener("click", () => setAuto(!autoOn));

  // Swipe
  let x0 = null;
  let y0 = null;
  let tracking = false;

  deckEl.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    tracking = true;
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;

    // Hold to pause if Auto is on
    if (autoOn) {
      holdTimer = setTimeout(() => {
        isHolding = true;
      }, HOLD_PAUSE_MS);
    }
  }, { passive: true });

  deckEl.addEventListener("touchmove", (e) => {
    if (!tracking || !e.touches || e.touches.length !== 1) return;
    const x1 = e.touches[0].clientX;
    const y1 = e.touches[0].clientY;
    const dx = x1 - x0;
    const dy = y1 - y0;

    // If user is swiping, cancel hold-to-pause intent
    if (holdTimer && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }, { passive: true });

  deckEl.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;

    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

    // If we were holding, release and resume
    if (isHolding) {
      isHolding = false;
      // resume progress animation
      if (autoOn) render();
      return;
    }

    // Detect swipe vs tap
    const changed = e.changedTouches && e.changedTouches[0];
    if (!changed) {
      next();
      return;
    }
    const x1 = changed.clientX;
    const y1 = changed.clientY;
    const dx = x1 - x0;
    const dy = y1 - y0;

    // Horizontal swipe threshold
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) next();
      else prev();
    } else {
      // tap
      next();
    }
  }, { passive: true });
}

// Boot
build();
