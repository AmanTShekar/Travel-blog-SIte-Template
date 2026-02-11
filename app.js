/**
 * AERIE GLOBAL - CORE INTERACTIVITY
 * Handles: SPA Routing, Transition Effects, Cursor, Overlay, and Page-Specific Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initGlobalScripts();
    initCurrentPage();
});

// Global Router State
let isAnimating = false;

function initGlobalScripts() {
    initCursor();
    initMobileMenu(); // New Mobile Menu
    initInquireOverlay(); // Ensures overlay exists
    initPageTransitions(); // Sets up link interception
    initScrollAnimations();
}

/* ==========================================================================
   MOBILE MENU LOGIC
   ========================================================================== */
function initMobileMenu() {
    // 1. Inject Overlay HTML if missing
    if (!document.getElementById('mobile-menu-overlay')) {
        const menuHTML = `
            <div class="mobile-menu-overlay" id="mobile-menu-overlay">
                <ul class="mobile-nav-links">
                    <li class="mobile-nav-item"><a href="index.html">Home</a></li>
                    <li class="mobile-nav-item"><a href="about.html">About</a></li>
                    <li class="mobile-nav-item"><a href="mandates.html">Mandates</a></li>
                    <li class="mobile-nav-item"><a href="journal.html">Journal</a></li>
                    <li class="mobile-nav-item"><a href="#contact">Inquire</a></li>
                </ul>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }

    // 2. Inject Burger Button if missing
    const nav = document.querySelector('nav');
    if (nav && !document.getElementById('burger-menu')) {
        const burgerHTML = `
            <div class="burger-menu" id="burger-menu">
                <div class="burger-line"></div>
                <div class="burger-line"></div>
                <div class="burger-line"></div>
            </div>
        `;
        nav.insertAdjacentHTML('beforeend', burgerHTML);
    }

    // 3. Bind Events
    const burger = document.getElementById('burger-menu');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (burger && overlay) {
        // Toggle Menu
        burger.onclick = (e) => {
            e.stopPropagation();
            burger.classList.toggle('open');
            overlay.classList.toggle('active');
            document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
        };

        // Close on Link Click
        const links = overlay.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

function initCurrentPage() {
    const path = window.location.pathname;

    if (path.includes('about.html')) {
        initAboutPage();
    } else if (path.includes('mandates.html')) {
        initMandatesPage();
    } else if (path.includes('journal.html')) {
        // initJournalPage();
    } else {
        // Home or Default
        initHomePage();
    }
}

/* ==========================================================================
   PAGE TRANSITIONS (SPA ROUTER)
   ========================================================================== */
function initPageTransitions() {
    // Inject Curtain if not exists
    let curtain = document.getElementById('page-transition-curtain');
    if (!curtain) {
        curtain = document.createElement('div');
        curtain.id = 'page-transition-curtain';
        curtain.className = 'page-transition-curtain'; // Ensure styles match style.css
        document.body.appendChild(curtain);
    }

    // Intercept Links
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Ignore hash links, external links, mailto/tel, or same-page links
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('://')) return;

        // Ignore if opening in new tab
        if (link.target === '_blank') return;

        e.preventDefault();
        if (isAnimating) return;

        const targetUrl = href;
        if (targetUrl === window.location.pathname.split('/').pop()) return;

        handlePageTransition(targetUrl);
    });

    // Handle Browser Back/Forward
    window.addEventListener('popstate', () => {
        window.location.reload(); // Simple fallback for now
    });
}

function handlePageTransition(url) {
    isAnimating = true;
    const curtain = document.getElementById('page-transition-curtain');

    // 1. Cover Screen
    curtain.classList.add('active');

    setTimeout(() => {
        // 2. Fetch New Page
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // 3. Swap Content
                const newContent = doc.getElementById('app-content');
                const currentContent = document.getElementById('app-content');

                if (newContent && currentContent) {
                    currentContent.innerHTML = newContent.innerHTML;
                    document.title = doc.title;
                    window.scrollTo(0, 0);

                    // Update History
                    window.history.pushState({}, '', url);

                    // Update Nav Active State
                    updateNavState(url);

                    // 4. Re-init Scripts
                    initScrollAnimations(); // Re-observe new elements
                    // initCursor(); // Canvas/Elements persist, no need to re-init unless logic binds to elements

                    // Re-run page specific logic
                    initCurrentPage();
                } else {
                    console.error('SPA Error: #app-content not found in target page.');
                    window.location.href = url; // Fallback
                }

                // 5. Reveal Screen
                setTimeout(() => {
                    curtain.classList.remove('active');
                    isAnimating = false;
                }, 100);
            })
            .catch(err => {
                console.error('Navigation Error:', err);
                window.location.href = url; // Fallback
            });
    }, 800); // Wait for cover animation (match CSS 0.8s ~ 1s)
}

function updateNavState(url) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === url) {
            link.classList.add('active');
        }
    });
}

/* ==========================================================================
   PAGE SPECIFIC LOGIC
   ========================================================================== */

function initHomePage() {
    // Any home specific logic
}

function initMandatesPage() {
    const states = document.querySelectorAll('.state-item');
    const bgs = document.querySelectorAll('.visual-layer');
    const cards = document.querySelectorAll('.mandate-card-reveal'); // Ensure HTML uses this class or update logic

    if (!states.length) return;

    states.forEach(state => {
        state.addEventListener('mouseenter', () => {
            // Reset
            states.forEach(s => s.classList.remove('active'));
            bgs.forEach(b => b.classList.remove('active'));
            // Check if cards exist before looping
            if (cards.length) cards.forEach(c => c.classList.remove('active'));

            // Activate
            state.classList.add('active');
            const target = state.dataset.target;

            const bg = document.getElementById('bg-' + target);
            if (bg) bg.classList.add('active');

            const card = document.getElementById('card-' + target);
            if (card) card.classList.add('active');
        });
    });
}

function initAboutPage() {
    const mapHoverCard = document.getElementById('mapHoverCard');
    const states = document.querySelectorAll('.state-layer');
    const coordinates = document.querySelectorAll('.coordinate-marker');
    const storyContent = document.getElementById('story-content');

    // Map Data
    const stateLogs = {
        'jk': { name: 'Leh, Ladakh', year: '2010', log: 'The Frozen Mandate. High-altitude extraction where oxygen is the real luxury.' },
        'rj': { name: 'Jaipur, Rajasthan', year: '2012', log: 'The Dust Protocol. Private access to the desert\'s most guarded echoes.' },
        'kl': { name: 'Varkala, Kerala', year: '2015', log: 'Liquid Architecture. Navigating the backwaters where trade winds carry empires.' },
        'mh': { name: 'Mumbai, Maharashtra', year: '2014', log: 'The Concrete Archive. Deconstructing the vertical density of Mumbai\'s soul.' },
        'gj': { name: 'Rann, Gujarat', year: '2013', log: 'Salt & Steel. Where the horizon disappears into the endless white desert.' },
        'ka': { name: 'Hampi, Karnataka', year: '2016', log: 'Silicone & Soul. The precision of code meeting the ancient chaos of life.' },
        'tn': { name: 'Madurai, Tamil Nadu', year: '2015', log: 'The Stone Chronicles. Massive monoliths telling stories of a thousand years.' },
        'wb': { name: 'Kolkata, West Bengal', year: '2018', log: 'The Editorial Ghost. Literary echoes in the narrow lanes of old Kolkata.' },
        'up': { name: 'Varanasi, Uttar Pradesh', year: '2017', log: 'The River Protocol. Rituals performed at the intersection of life and death.' },
        'as': { name: 'Kaziranga, Assam', year: '2019', log: 'The Green Frontier. Sourcing the world\'s most elusive tea leaves in the clouds.' },
        'tg': { name: 'Hyderabad, Telangana', year: '2016', log: 'The Digital Frontier. Mapping the grid where bits and bytes build future cities.' },
        'ut': { name: 'Rishikesh, Uttarakhand', year: '2011', log: 'Gateway to the Gods. High-altitude philosophy in the shadow of the peaks.' },
        'ga': { name: 'Panjim, Goa', year: '2014', log: 'The Coastal Creed. Sunset architecture where the tide writes its own rules.' },
        'hp': { name: 'Manali, Himachal', year: '2010', log: 'The Cloud Archive. Sourcing whispers from the high Himalayan winds.' },
        'br': { name: 'Nalanda, Bihar', year: '2018', log: 'The Ancient Blueprint. Excavating logic from the foundations of old universities.' },
        'pb': { name: 'Amritsar, Punjab', year: '2012', log: 'The Golden Pulse. Rhythms of the soil meeting the steel of modernization.' },
        'hr': { name: 'Gurgaon, Haryana', year: '2013', log: 'The Industrial Echo. Where the roar of the machine becomes the song of progress.' },
        'mp': { name: 'Bhopal, Madhya Pradesh', year: '2015', log: 'The Heartwood Mandate. Navigating the deep jungles of the central plateau.' },
        'or': { name: 'Konark, Odisha', year: '2017', log: 'The Temple Trace. Calculating the geometry of ancient shoreline monoliths.' },
        'jh': { name: 'Ranchi, Jharkhand', year: '2016', log: 'The Mineral Mandate. Deep extraction logic in the veins of the earth.' }
    };

    if (!states.length) return; // Guard logic

    const hName = document.getElementById('hoverStateName');
    const hYear = document.getElementById('hoverStateYear');
    const hLog = document.getElementById('hoverStateStory');

    function updateStoryPanel(id) {
        if (!storyContent) return;

        const data = stateLogs[id] || { name: 'Field Survey', year: 'Ongoing', log: 'Unmapped.' };
        const title = data.name.toUpperCase();

        storyContent.innerHTML = `
            <span class="section-label reveal active">COORDINATE: ${id.toUpperCase()}</span>
            <h3 class="reveal active">${title}</h3>
            <p class="section-text reveal active" style="font-style: italic;">"${data.log}"</p>
            <div style="margin-top: 2rem;">
                <span class="section-label" style="opacity: 0.5;">SURVEY YEAR: ${data.year}</span>
            </div>
            <a href="#" class="btn-gold-minimal reveal active" style="margin-top: 2rem; display: inline-block;">DOWNLOAD FULL DOSSIER</a>
        `;

        // Reset active states
        states.forEach(s => s.classList.remove('active-state'));
        const activePath = document.getElementById(id);
        if (activePath) activePath.classList.add('active-state');
    }

    // Expose for inline HTML handlers
    window.updateStoryPanel = updateStoryPanel;

    states.forEach(state => {
        state.addEventListener('mouseenter', (e) => {
            const id = state.id;
            const data = stateLogs[id] || { name: 'Unknown', year: '---', log: 'Data corrupted.' };

            if (hName) hName.textContent = data.name;
            if (hYear) hYear.textContent = data.year;
            if (hLog) hLog.textContent = data.log;

            if (mapHoverCard) mapHoverCard.classList.add('visible');
        });

        state.addEventListener('mousemove', (e) => {
            if (mapHoverCard) {
                const x = e.clientX;
                const y = e.clientY;
                mapHoverCard.style.left = x + 'px';
                mapHoverCard.style.top = y + 'px';
            }
        });

        state.addEventListener('mouseleave', () => {
            if (mapHoverCard) mapHoverCard.classList.remove('visible');
        });

        state.addEventListener('click', () => {
            updateStoryPanel(state.id);
        });
    });

    // Auto-select random on load
    setTimeout(() => updateStoryPanel('rj'), 1000);
}

/* ==========================================================================
   CURSOR LOGIC
   ========================================================================== */
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return;

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

    // Event Delegation for hover effects (better for SPA)
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.matches('a, button, .gallery-item, .state-item, input')) {
            follower.classList.add('cursor-active');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.matches('a, button, .gallery-item, .state-item, input')) {
            follower.classList.remove('cursor-active');
        }
    });
}

/* ==========================================================================
   INQUIRE OVERLAY
   ========================================================================== */
function initInquireOverlay() {
    // 1. Inject HTML if missing
    if (!document.getElementById('inquire-overlay')) {
        const overlayHTML = `
            <div class="inquire-overlay" id="inquire-overlay">
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
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }

    const overlay = document.getElementById('inquire-overlay');

    // Delegation for Close
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'inquire-close') {
            overlay.classList.remove('open');
        }
        // Open
        if (e.target.matches('a[href="#contact"]')) {
            e.preventDefault();
            overlay.classList.add('open');
        }
    });

    // ESC Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            overlay.classList.remove('open');
        }
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
