// Mobile navigation toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("show"));
  });
}

// Scroll progress bar
const scrollBar = document.querySelector(".scroll-progress span");
function updateScrollBar() {
  if (!scrollBar) return;
  const doc = document.documentElement;
  const scrolled = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const progress = height > 0 ? (scrolled / height) * 100 : 0;
  scrollBar.style.width = `${progress}%`;
}
window.addEventListener("scroll", updateScrollBar);
window.addEventListener("load", updateScrollBar);

// Dynamic year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Stat count-up animation
const statNumbers = document.querySelectorAll(".stat-number");
let statsAnimated = false;
function animateStats() {
  if (statsAnimated || !statNumbers.length) return;
  const triggerPoint = window.innerHeight * 0.85;
  const firstStat = statNumbers[0];
  if (!firstStat) return;
  const rect = firstStat.getBoundingClientRect();
  if (rect.top > triggerPoint) return;

  statNumbers.forEach((el) => {
    const target = parseFloat(el.dataset.count || el.textContent);
    if (Number.isNaN(target)) return;
    const suffix = el.dataset.suffix || "";
    const format = el.dataset.format === "comma";
    const duration = 1600;
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = start + (target - start) * progress;
      const display = format ? Math.floor(value).toLocaleString() : Math.floor(value);
      el.textContent = `${display}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });

  statsAnimated = true;
}
window.addEventListener("scroll", animateStats);
window.addEventListener("load", animateStats);

// Reveal on scroll
const revealElements = document.querySelectorAll("[data-reveal]");
if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("roadmap-item")) {
          entry.target.classList.add("active");
        }
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

// Device tilt interaction
const deviceCard = document.getElementById("deviceCard");
if (deviceCard) {
  deviceCard.addEventListener("pointermove", (event) => {
    const rect = deviceCard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width - 0.5) * 16).toFixed(2);
    const rotateX = ((0.5 - y / rect.height) * 16).toFixed(2);
    deviceCard.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  deviceCard.addEventListener("pointerleave", () => {
    deviceCard.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

// Mode toggle panel
const modeToggle = document.getElementById("modeToggle");
const modeLabel = document.getElementById("modeLabel");
const modeCopy = document.getElementById("modeCopy");
const modeGauge = document.getElementById("modeGauge");
const modeMap = {
  clinic: {
    label: "Clinical Oversight",
    copy: "Urologists direct capture protocols and review packaged studies.",
    gauge: "98.6%",
  },
  home: {
    label: "Home Kit Operation",
    copy: "Voice prompts and sterile packaging support layperson or PCP use.",
    gauge: "92.0%",
  },
  transfer: {
    label: "Secure Data Transfer",
    copy: "Encrypted stills and clips are uploaded for specialist review.",
    gauge: "256-bit",
  },
};

if (modeToggle && modeLabel && modeCopy && modeGauge) {
  modeToggle.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;
    const mode = button.dataset.mode;
    modeToggle.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    const config = modeMap[mode];
    if (!config) return;
    modeLabel.textContent = config.label;
    modeCopy.textContent = config.copy;
    modeGauge.querySelector(".gauge-value").textContent = config.gauge;
  });
}

// Publication carousel controls
const paperTrack = document.getElementById("paperTrack");
const paperPrev = document.getElementById("paperPrev");
const paperNext = document.getElementById("paperNext");

function scrollCarousel(direction) {
  if (!paperTrack) return;
  const amount = 260 * direction;
  paperTrack.scrollBy({ left: amount, behavior: "smooth" });
}

if (paperPrev) paperPrev.addEventListener("click", () => scrollCarousel(-1));
if (paperNext) paperNext.addEventListener("click", () => scrollCarousel(1));
