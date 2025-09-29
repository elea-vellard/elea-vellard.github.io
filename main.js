// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Dynamic year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Mobile menu toggle
const menuBtn = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close on link click (mobile)
  nav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Copy email button
const copyBtn = document.getElementById('copyEmailBtn');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email || 'elea.vellard@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = 'Email copied ✓';
      setTimeout(() => (copyBtn.textContent = 'Copy Email'), 1600);
    } catch {
      // Fallback to mailto
      window.location.href = 'mailto:' + email;
    }
  });
}

// Logo carousel: duplicate track for seamless loop
(function initLogos() {
  const track = document.getElementById('logoTrack');
  if (!track) return;
  if (track.dataset.ready === '1') return;

  const wrapper = track.closest('.logo-carousel') || track.parentElement;
  const getWrapperWidth = () => Math.max(0, wrapper?.clientWidth || 0);
  let ww = getWrapperWidth();
  if (!ww) {
    requestAnimationFrame(initLogos);
    return;
  }

  const originals = Array.from(track.children);
  track.style.display = 'inline-flex';

  const maxLoops = 100;
  const target = ww * 2.1;
  let loops = 0;
  while (track.scrollWidth < target && loops < maxLoops) {
    originals.forEach(n => track.appendChild(n.cloneNode(true)));
    loops++;
  }
  // final double for continuity
  originals.forEach(n => track.appendChild(n.cloneNode(true)));

  const base = 26;
  const factor = Math.min(2, Math.max(1, track.scrollWidth / (ww * 2)));
  track.style.setProperty('--dur', `${base * factor}s`);
  track.style.setProperty('--half', `${track.scrollWidth / 2}px`);
  track.classList.add('is-ready');
  track.dataset.ready = '1';
})();

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Pills: scroll to target sections
document.querySelectorAll('.pill[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-target');
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Dots menu toggle
const dotsBtn = document.querySelector('.menu-dots');
const mobileMenu = document.getElementById('mobileMenu');

if (dotsBtn && mobileMenu) {
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    mobileMenu.hidden = true;
    dotsBtn.setAttribute('aria-expanded', 'false');
  };

  dotsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !mobileMenu.classList.contains('open');
    if (willOpen) {
      mobileMenu.hidden = false;
      mobileMenu.classList.add('open');
    } else {
      closeMenu();
    }
    dotsBtn.setAttribute('aria-expanded', String(willOpen));
  });

  // click outside closes
  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('open')) return;
    if (!mobileMenu.contains(e.target) && e.target !== dotsBtn) closeMenu();
  });

  // escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // on resize to desktop, ensure closed
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}
