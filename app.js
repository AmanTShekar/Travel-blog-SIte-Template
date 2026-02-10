/**
 * AERIE GLOBAL - CORE INTERACTIVITY
 * Handles: Page Transitions, Inquire Overlay, Cursor Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initInquireOverlay();
    initPageTransitions();
    initScrollAnimations();
});

/* ==========================================================================
   CURSOR LOGIC
   ========================================================================== */
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return; // Guard clause

    let mx = 0, my = 0, bx = 0, by = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
    });

    function animate() {
        bx += (mx - bx) * 0.1;
        by += (my - by) * 0.1;
        follower.style.left = bx + 'px';
        follower.style.top = by + 'px';
        requestAnimationFrame(animate);
    }
    animate();

    // Magnetic / Active States
    document.querySelectorAll('a, button, .gallery-item, .state-item').forEach(el => {
        el.addEventListener('mouseenter', () => follower.classList.add('cursor-active'));
        el.addEventListener('mouseleave', () => follower.classList.remove('cursor-active'));
    });
}

/* ==========================================================================
   INQUIRE OVERLAY
   ========================================================================== */
function initInquireOverlay() {
    // 1. Inject HTML
    const overlayHTML = `
        <div class="inquire-overlay" id="inquire-overlay">
            <div class="page-transition-curtain" id="page-curtain"></div>
            <div class="inquire-container">
                <div class="inquire-close" id="inquire-close">CLOSE [ESC]</div>
                <span class="section-label">THE COMMENCEMENT</span>
                <h2 style="font-family: var(--font-heading); font-size: 3rem; color: var(--text-prime); margin-bottom: 2rem;">Begin the <span class="editorial-gold">Dialogue.</span></h2>
                <form class="inquire-form">
                    <div class="form-group">
                        <input type="text" class="form-input" placeholder="Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" class="form-input" placeholder="Email" required>
                    </div>
                    <div class="form-group full">
                        <input type="text" class="form-input" placeholder="Mandate Interest (e.g. Himalaya)" required>
                    </div>
                    <div class="form-group full">
                        <input type="text" class="form-input" placeholder="Specific Requirements / Intent" required>
                    </div>
                    <button type="submit" class="btn-gold" style="margin-top: 2rem;">REQUEST INTELLIGENCE</button>
                </form>
            </div>
        </div>
    `;

    // Append to body if not exists
    if (!document.getElementById('inquire-overlay')) {
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }

    // 2. Event Listeners
    const overlay = document.getElementById('inquire-overlay');
    const closeBtn = document.getElementById('inquire-close');
    const startBtns = document.querySelectorAll('a[href="#contact"]'); // Hook into existing links

    function openOverlay(e) {
        if (e) e.preventDefault();
        overlay.classList.add('open');
    }

    function closeOverlay() {
        overlay.classList.remove('open');
    }

    startBtns.forEach(btn => btn.addEventListener('click', openOverlay));
    closeBtn.addEventListener('click', closeOverlay);

    // ESC Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            closeOverlay();
        }
    });
}

/* ==========================================================================
   CINEMATIC PAGE TRANSITIONS
   ========================================================================== */
function initPageTransitions() {
    const curtain = document.createElement('div');
    curtain.className = 'page-transition-curtain';
    document.body.appendChild(curtain);

    // Initial Load - Fade Out Curtain
    // Remove 'active' class to slide curtain down/up
    // Or we can just start with it transparent.
    // Let's assume the curtain is transparent by default.

    // Intercept Links
    document.querySelectorAll('a').forEach(link => {
        // Skip hash links or external links
        if (link.getAttribute('href').startsWith('#') || link.getAttribute('href').startsWith('mailto')) return;

        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (target === window.location.pathname.split('/').pop()) return; // Same page

            e.preventDefault();

            // 1. Activate Curtain (Scale Up)
            curtain.classList.add('active');

            // 2. Wait for animation, then navigation
            setTimeout(() => {
                window.location.href = target;
            }, 600); // Match CSS transition time
        });
    });

    // Check if we just arrived (could check referrer or local storage, but simple animation on load is nice)
    // Actually, to do "curtain reveal" on load, we need the curtain to be present and covering on load.
    // CSS trick: .page-transition-curtain.exit (starts covering, then scales away)

    curtain.classList.add('active'); // Start covering
    requestAnimationFrame(() => {
        curtain.classList.remove('active'); // Reveal
        curtain.classList.add('exit'); // Optional different animation
    });
}

/* ==========================================================================
   SCROLL ANIMATIONS (Reveal)
   ========================================================================== */
function initScrollAnimations() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
