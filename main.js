// Smooth scroll (pour une sensation proche du template)
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
            e.preventDefault();
            document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Année dynamique dans le footer
document.getElementById('year').textContent = new Date().getFullYear();

// Copier l'email
const copyBtn = document.getElementById('copyEmailBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('elea.vellard@gmail.com');
            copyBtn.textContent = 'Email copié ✓';
            setTimeout(() => (copyBtn.textContent = 'Copier mon email'), 1600);
        } catch {
            window.location.href = 'mailto:elea.vellard@gmail.com';
        }
    });
}

// Carrousel de logos — duplique le track pour un défilement infini plus fluide
// Carrousel logos, duplication pour boucle infinie
(function initLogos() {
    const track = document.getElementById('logoTrack');
    if (!track) return;

    // évite de ré-initialiser
    if (track.dataset.ready === '1') return;

    const wrapper = track.closest('.logo-carousel') || track.parentElement;

    // attendre d'avoir une largeur utile
    const getWrapperWidth = () => Math.max(0, wrapper?.clientWidth || 0);
    let ww = getWrapperWidth();
    if (!ww) {
        requestAnimationFrame(initLogos); // réessaie au prochain tick
        return;
    }

    const originals = Array.from(track.children);
    track.style.display = 'inline-flex';

    // garde-fous
    const maxLoops = 200;      // empêche les boucles folles
    const target = ww * 2.1;   // on veut un peu plus de 2x la largeur
    let loops = 0;

    while (track.scrollWidth < target && loops < maxLoops) {
        originals.forEach(n => track.appendChild(n.cloneNode(true)));
        loops++;
    }

    // double final pour continuité
    originals.forEach(n => track.appendChild(n.cloneNode(true)));

    // durée d'anim un peu adaptative
    const base = 26;
    const factor = Math.min(2, Math.max(1, track.scrollWidth / (ww * 2)));
    track.style.setProperty('--dur', `${base * factor}s`);

    track.classList.add('is-ready');
    track.dataset.ready = '1';
})();




// Révélations au scroll
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
        }
    });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Effet tilt subtil sur les cartes Expérience
const tiltCards = document.querySelectorAll('.tilt');
tiltCards.forEach(card => {
    let raf = null;
    const damp = 14; // sensibilité
    function apply(e) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        const rx = (dy * -damp).toFixed(2) + 'deg';
        const ry = (dx * damp).toFixed(2) + 'deg';
        card.style.setProperty('--rx', rx);
        card.style.setProperty('--ry', ry);
    }
    card.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => apply(e));
    });
    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
    });
});

// Scroll sur clic des pills FX / Publications
document.querySelectorAll('.pill[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-target');
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

