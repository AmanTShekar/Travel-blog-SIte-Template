/**
 * AERIE GLOBAL - CORE INTERACTIVITY
 * Handles: SPA Routing, Transition Effects, Cursor, Overlay, and Page-Specific Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initGlobalScripts();
    initCurrentPage();
});

// Robust Refresh for FOUC/Layout Issues
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 500); // Safety fallback
});

// Global Router State
let isAnimating = false;
let lenis = null;

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

function initGlobalScripts() {
    initCursor();
    initMobileMenu(); // New Mobile Menu
    initInquireOverlay(); // Ensures overlay exists
    initPageTransitions(); // Sets up link interception
    initScrollAnimations();
    initSmoothScroll();
    initNavScroll();
    // GSAP Features
    initParallax();
    initHorizontalScroll();
    initPinning();
}


function initNavScroll() {
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
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
            <div class="burger-menu" id="burger-menu" role="button" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu-overlay">
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
            overlay.classList.toggle('open');
            const isOpen = overlay.classList.contains('open');
            document.body.style.overflow = isOpen ? 'hidden' : '';
            burger.setAttribute('aria-expanded', isOpen);
            burger.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Menu');
        };

        // Close on Link Click
        const links = overlay.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('open');
                overlay.classList.remove('active');
                overlay.classList.remove('open');
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

        const targetUrl = href.split('#')[0];
        const currentUrl = window.location.pathname.split('/').pop() || 'index.html';

        if (targetUrl === currentUrl && targetUrl !== '') return;

        handlePageTransition(href);
    });

    // Handle Browser Back/Forward
    window.addEventListener('popstate', (e) => {
        handlePageTransition(window.location.pathname, true);
    });
}

function handlePageTransition(url, isPopState = false) {
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

                // 2.1. HANDLE CSS (CRITICAL FIX)
                const newLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
                const currentLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

                newLinks.forEach(newLink => {
                    const href = newLink.getAttribute('href');
                    if (!currentLinks.some(current => current.getAttribute('href') === href)) {
                        const linkTag = document.createElement('link');
                        linkTag.rel = 'stylesheet';
                        linkTag.href = href;
                        document.head.appendChild(linkTag);
                    }
                });

                // Optional: Remove old specific CSS to prevent conflicts (e.g. home.css vs about.css)
                // We keep common.css always.
                currentLinks.forEach(current => {
                    const href = current.getAttribute('href');
                    if (!newLinks.some(n => n.getAttribute('href') === href) && href !== 'common.css') {
                        // Small delay to prevent FOUC during transition
                        setTimeout(() => current.remove(), 500);
                    }
                });

                // 3. KILL OLD SCROLLTRIGGERS (Crucial for SPA Stability)
                ScrollTrigger.getAll().forEach(t => t.kill());

                // 4. Swap Content
                const newContent = doc.getElementById('app-content');
                const currentContent = document.getElementById('app-content');

                if (newContent && currentContent) {
                    currentContent.innerHTML = newContent.innerHTML;
                    document.title = doc.title;
                    window.scrollTo(0, 0);

                    // Update History
                    if (!isPopState) {
                        window.history.pushState({}, '', url);
                    }

                    // Update Nav Active State
                    updateNavState(url);

                    // 5. Re-init Scripts
                    initScrollAnimations(); // IntersectionObserver

                    // Re-run global animations
                    initParallax();
                    initHorizontalScroll();
                    initPinning();

                    // Re-run page specific logic
                    initCurrentPage();

                    // Refresh ScrollTrigger to account for new heights
                    // Delayed slightly to allow CSS to apply
                    setTimeout(() => ScrollTrigger.refresh(), 100);

                    // Notify Lenis of content change
                    if (lenis) {
                        lenis.scrollTo(0, { immediate: true });
                    }
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
    const currentPath = url.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === 'index.html' && href === 'index.html')) {
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
    const storyContent = document.getElementById('storyContent') || document.getElementById('story-content');
    const journeyPath = document.querySelector('.journey-path-animated');

    // Map Data with images, stats, and richer narrative
    const stateLogs = {
        'jk': {
            name: 'Leh, Ladakh', year: '2010', codename: 'FROZEN MANDATE',
            img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
            log: 'High-altitude extraction where oxygen is the real luxury. At 11,500 feet, the body surrenders before the mind does.',
            stats: { altitude: '11,500 ft', distance: '1,200 km', days: '18' }
        },
        'rj': {
            name: 'Jaipur, Rajasthan', year: '2012', codename: 'GOLDEN PROTOCOL',
            img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
            log: 'Private inheritance in the desert\'s most guarded echoes. The Hawa Mahal whispers of a thousand queens who watched the world from behind perforated stone.',
            stats: { altitude: '431 m', distance: '2,400 km', days: '12' }
        },
        'up': {
            name: 'Varanasi, Uttar Pradesh', year: '2017', codename: 'RIVER MANDATE',
            img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
            log: 'Rituals performed at the intersection of life and death. The oldest living city where fire never dies and the river carries both prayer and ash.',
            stats: { altitude: '80 m', distance: '800 km', days: '9' }
        },
        'ka': {
            name: 'Hampi, Karnataka', year: '2016', codename: 'MONOLITHIC ARCHIVE',
            img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
            log: 'The precision of stone meeting the ancient chaos of life. A ruined empire\'s capital where boulders balance on boulders and temples grow from granite.',
            stats: { altitude: '467 m', distance: '3,100 km', days: '14' }
        },
        'kl': {
            name: 'Munnar, Kerala', year: '2015', codename: 'TROPICAL ORIGINS',
            img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
            log: 'Navigating the emerald gardens where trade winds carry empires. Tea plantations cascade down misty hillsides like green waterfalls frozen in time.',
            stats: { altitude: '1,532 m', distance: '1,800 km', days: '11' }
        },
        'an': {
            name: 'Port Blair, Andaman Islands', year: '2018', codename: 'BLUE PROTOCOL',
            img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            log: 'Submerged logic in the depths of the crystal horizon. Island archipelago where colonial prisons became shrines and coral reefs hold older histories than stone.',
            stats: { altitude: '16 m', distance: '1,400 km', days: '15' }
        },
        'tg': {
            name: 'Hyderabad, Telangana', year: '2016', codename: 'DIGITAL FRONTIER',
            img: 'https://images.unsplash.com/photo-1572638660981-8e8a2c3e3e8d?auto=format&fit=crop&w=800&q=80',
            log: 'Mapping the grid where bits and bytes build future cities. The Charminar stands as a 400-year-old compass in a city racing toward tomorrow.',
            stats: { altitude: '542 m', distance: '1,600 km', days: '7' }
        },
        'ut': {
            name: 'Rishikesh, Uttarakhand', year: '2011', codename: 'GATEWAY PROTOCOL',
            img: 'https://images.unsplash.com/photo-1588279102819-f4e267e3e0dd?auto=format&fit=crop&w=800&q=80',
            log: 'High-altitude philosophy in the shadow of the peaks. Where the Ganges runs clear and the Beatles once sought the sound of God.',
            stats: { altitude: '372 m', distance: '950 km', days: '10' }
        },
        'ga': {
            name: 'Panjim, Goa', year: '2014', codename: 'COASTAL CREED',
            img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
            log: 'Sunset architecture where the tide writes its own rules. Portuguese churches bleed into laterite cliffs above Arabian waters.',
            stats: { altitude: '7 m', distance: '600 km', days: '8' }
        },
        'hp': {
            name: 'Manali, Himachal Pradesh', year: '2010', codename: 'CLOUD ARCHIVE',
            img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
            log: 'Sourcing whispers from the high Himalayan winds. Apple orchards and cedar forests cloak valleys where the road itself becomes the destination.',
            stats: { altitude: '2,050 m', distance: '1,100 km', days: '13' }
        },
        'br': {
            name: 'Nalanda, Bihar', year: '2018', codename: 'ANCIENT BLUEPRINT',
            img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            log: 'Excavating logic from the foundations of old universities. The world\'s first university lies in ruins that still teach.',
            stats: { altitude: '72 m', distance: '700 km', days: '6' }
        },
        'pb': {
            name: 'Amritsar, Punjab', year: '2012', codename: 'GOLDEN PULSE',
            img: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80',
            log: 'Rhythms of the soil meeting the steel of modernization. The Golden Temple floats on liquid devotion.',
            stats: { altitude: '234 m', distance: '500 km', days: '5' }
        },
        'hr': {
            name: 'Gurgaon, Haryana', year: '2013', codename: 'INDUSTRIAL ECHO',
            img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
            log: 'Where the roar of the machine becomes the song of progress. Glass towers rise from farmland like crystal dreams.',
            stats: { altitude: '217 m', distance: '300 km', days: '4' }
        },
        'mp': {
            name: 'Bhopal, Madhya Pradesh', year: '2015', codename: 'HEARTWOOD MANDATE',
            img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
            log: 'Navigating the deep jungles of the central plateau. Tiger country where nature enforces hierarchy.',
            stats: { altitude: '523 m', distance: '2,200 km', days: '10' }
        },
        'or': {
            name: 'Konark, Odisha', year: '2017', codename: 'TEMPLE TRACE',
            img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            log: 'Calculating the geometry of ancient shoreline monoliths. The Sun Temple chariot wheels mark time itself.',
            stats: { altitude: '6 m', distance: '1,500 km', days: '8' }
        },
        'jh': {
            name: 'Ranchi, Jharkhand', year: '2016', codename: 'MINERAL MANDATE',
            img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
            log: 'Deep extraction logic in the veins of the earth. Waterfalls crash through forests hiding ancient tribal wisdom.',
            stats: { altitude: '651 m', distance: '900 km', days: '6' }
        }
    };

    if (!states.length) return; // Guard logic

    const hName = document.getElementById('hoverStateName');
    const hYear = document.getElementById('hoverStateYear');
    const hLog = document.getElementById('hoverStateStory');

    function updateStoryPanel(id) {
        if (!storyContent) return;

        const data = stateLogs[id] || {
            name: 'Field Survey', year: 'Ongoing', codename: 'UNKNOWN',
            img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
            log: 'Territory unmapped. Reconnaissance pending.', stats: { altitude: '---', distance: '---', days: '---' }
        };
        const title = data.name.toUpperCase();
        const codename = data.codename || id.toUpperCase();
        const stats = data.stats || { altitude: '---', distance: '---', days: '---' };

        // Cinematic update with GSAP
        const tl = gsap.timeline();

        tl.to(storyContent, {
            opacity: 0, y: 20, duration: 0.3, ease: "power2.in", onComplete: () => {
                storyContent.innerHTML = `
                <div class="story-hero-img" style="background-image: url('${data.img}')">
                    <div class="story-img-overlay"></div>
                    <span class="story-codename">${codename}</span>
                </div>
                <div class="story-metadata">
                    <span class="coordinate-tag">LOC // 0x${id.toUpperCase()}</span>
                    <span class="survey-year-tag">SURVEYED // ${data.year}</span>
                </div>
                <h3 class="story-title">${title}</h3>
                <div class="story-divider"></div>
                <div class="story-quote-wrap">
                    <p class="story-quote">${data.log}</p>
                </div>
                <div class="story-stats-grid">
                    <div class="story-stat">
                        <span class="stat-value">${stats.altitude}</span>
                        <span class="stat-label">ALTITUDE</span>
                    </div>
                    <div class="story-stat">
                        <span class="stat-value">${stats.distance}</span>
                        <span class="stat-label">DISTANCE</span>
                    </div>
                    <div class="story-stat">
                        <span class="stat-value">${stats.days}</span>
                        <span class="stat-label">DAYS</span>
                    </div>
                </div>
                <div class="story-actions">
                    <a href="#" class="btn-gold-minimal">ACCESS MANDATE ARCHIVE</a>
                </div>
            `;
            }
        });

        tl.to(storyContent, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });

        // Reset active states for map
        states.forEach(s => s.classList.remove('active-state'));
        const activePath = document.getElementById(id);
        if (activePath) activePath.classList.add('active-state');

        // Update markers (Highlight current location)
        document.querySelectorAll('.coordinate-marker').forEach(m => m.classList.remove('active'));
        const activeMarker = document.querySelector(`.coordinate-marker[data-location="${id}"]`);
        if (activeMarker) activeMarker.classList.add('active');

        // Reset active states for milestones (Bottom Nav)
        document.querySelectorAll('.loc-btn').forEach(m => m.classList.remove('active'));
        const activeLocBtn = document.querySelector(`.loc-btn[data-id="${id}"]`);
        if (activeLocBtn) activeLocBtn.classList.add('active');

        // Sync Internal Sidebar Nav
        document.querySelectorAll('.side-nav-btn').forEach(b => b.classList.remove('active'));
        const activeSideBtn = document.querySelector(`.side-nav-btn[data-id="${id}"]`);
        if (activeSideBtn) activeSideBtn.classList.add('active');
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


    // Sidebar Internal Nav Listeners
    document.querySelectorAll('.side-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateStoryPanel(btn.dataset.id);
        });
    });

    // Journey Path Draw Animation
    if (journeyPath && typeof ScrollTrigger !== 'undefined') {
        const pathLength = journeyPath.getTotalLength();
        gsap.set(journeyPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        gsap.to(journeyPath, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".map-masterpiece",
                start: "top 50%",
                end: "bottom 50%",
                scrub: 1
            }
        });
    }

    // Click handlers on scroll chapters (legacy compat)
    const scrollChapters = document.querySelectorAll('.scroll-chapter');
    scrollChapters.forEach(chapter => {
        chapter.addEventListener('click', () => {
            scrollChapters.forEach(c => c.classList.remove('active'));
            chapter.classList.add('active');
            if (chapter.dataset.id) updateStoryPanel(chapter.dataset.id);
        });
    });

    // Auto-select first location on load (LEH // FROZEN MANDATE)
    const sideBtns = document.querySelectorAll('.side-nav-btn');
    if (sideBtns.length) {
        // Immediate trigger
        setTimeout(() => updateStoryPanel('jk'), 300);

        // Multiple safety fallbacks for varying DOM speeds
        [1000, 2500, 4500].forEach(delay => {
            setTimeout(() => {
                if (storyContent && (storyContent.innerHTML.includes('SELECT A COORDINATE') || !storyContent.innerHTML.includes('story-hero-img'))) {
                    updateStoryPanel('jk');
                }
            }, delay);
        });
    }

    // --- Drag to Scroll Ergonomics ---
    const scrollContainer = document.querySelector('.story-scroll-area');
    if (scrollContainer) {
        let isPressed = false;
        let yStart;
        let scrollStart;

        scrollContainer.addEventListener('mousedown', (e) => {
            isPressed = true;
            yStart = e.pageY - scrollContainer.offsetTop;
            scrollStart = scrollContainer.scrollTop;
            scrollContainer.style.cursor = 'grabbing';
            scrollContainer.style.userSelect = 'none'; // Prevent text selection while dragging
        });

        window.addEventListener('mouseup', () => {
            isPressed = false;
            if (scrollContainer) {
                scrollContainer.style.cursor = 'grab';
                scrollContainer.style.userSelect = 'auto';
            }
        });

        scrollContainer.addEventListener('mousemove', (e) => {
            if (!isPressed) return;
            e.preventDefault();
            const yCurrent = e.pageY - scrollContainer.offsetTop;
            const distance = (yCurrent - yStart) * 2.0; // Snappier drag sensitivity
            scrollContainer.scrollTop = scrollStart - distance;
        });
    }

    // --- ISOLATED HOVER SCROLLING FOR ATLAS STORY PANEL ---
    const storyPanel = document.querySelector('.story-panel-luxe');
    if (storyPanel) {
        const preventScrollBubbling = (e) => {
            const scrollArea = storyPanel.querySelector('.story-scroll-area');
            if (!scrollArea) return;

            const isScrollable = scrollArea.scrollHeight > scrollArea.clientHeight;

            // If the content is too short to scroll, just block the wheel/touch entirely so page doesn't move
            if (!isScrollable) {
                if (e.cancelable) e.preventDefault();
                return;
            }

            // If it IS scrollable, check if we're hitting the boundaries
            const atTop = scrollArea.scrollTop <= 0;
            const atBottom = Math.abs(scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight) <= 2;

            // e.deltaY exists on wheel events
            if (e.type === 'wheel') {
                if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
                    if (e.cancelable) e.preventDefault(); // Prevent page from moving when hitting edges
                }
            }
        };

        storyPanel.addEventListener('wheel', preventScrollBubbling, { passive: false });
        // NOTE: touchmove isn't strictly necessary to polyfill overscroll-behavior on modern mobile 
        // but can be added if mobile scroll bleed behaves unpredictably.
    }
}

/* ==========================================================================
   CURSOR LOGIC
   ========================================================================== */
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return;

    let mx = 0, my = 0, bx = 0, by = 0;
    let isMoving = false;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;

        // Immediate cursor movement using translate3d for performance
        cursor.style.transform = `translate3d(calc(${mx}px - 50%), calc(${my}px - 50%), 0)`;

        if (!isMoving) {
            isMoving = true;
            follower.style.opacity = '1';
        }
    });

    function animate() {
        // Follower trailing effect with smoother interpolation
        bx += (mx - bx) * 0.15;
        by += (my - by) * 0.15;

        follower.style.transform = `translate3d(calc(${bx}px - 50%), calc(${by}px - 50%), 0)`;
        requestAnimationFrame(animate);
    }
    animate();

    // Event Delegation for hover effects
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .gallery-item, .state-item, input')) {
            follower.classList.add('cursor-active');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .gallery-item, .state-item, input')) {
            follower.classList.remove('cursor-active');
        }
    });

    // Hide on mouse out of window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });
}

/**
 * LENIS SMOOTH SCROLL INIT
 */
function initSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smoothHover: true,
            smoothWheel: true,
            touchMultiplier: 1.5,
        });

        // Connect GSAP ScrollTrigger to Lenis
        lenis.on('scroll', ScrollTrigger.update);

        // Use GSAP ticker for Lenis updates (Single Source of Truth)
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);


    }
    initExploreTrips(); // New Stagger Animation
}

function initExploreTrips() {
    const section = document.querySelector('.explore-trips-section');
    if (!section) return;

    const bg = section.querySelector('.explore-trips-bg');
    const header = section.querySelector('.explore-header');
    const cards = section.querySelectorAll('.trip-card');
    const cta = section.querySelector('.explore-cta-reveal');

    // 1. Initial State
    gsap.set([header, cards, cta], { opacity: 0, y: 50 });

    // 2. Background Scale Scroll Effect (Dramatic Zoom)
    if (bg) {
        gsap.fromTo(bg,
            { scale: 1, opacity: 0.8 },
            {
                scale: 1.5,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    }

    // 3. Main Entrance Timeline (Reveal components early)
    const revealTl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    });

    revealTl.to(header, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" });

    if (cards.length) {
        revealTl.to(cards, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power2.out"
        }, "-=0.8");
    }

    if (cta) {
        revealTl.to(cta, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.5");
    }

    // 4. Interactive 3D Tilt (Mouse Move)
    cards.forEach(card => {
        const layer = card.querySelector('.card-3d-layer');
        if (!layer) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(layer, {
                rotateX: y * -15,
                rotateY: x * 15,
                translateZ: 30,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(layer, {
                rotateX: 0,
                rotateY: 0,
                translateZ: 0,
                duration: 1,
                ease: "power2.out"
            });
        });
    });
}

/* ==========================================================================
   GSAP ANIMATIONS (Parallax, Horizontal, Pinning)
   ========================================================================== */

function initParallax() {
    // 1. Hero Parallax (Subtle Zoom & Pan)
    const aboutHero = document.querySelector('.about-hero-cinematic');
    const heroVideo = document.querySelector('.video-background');
    if (aboutHero && heroVideo) {
        gsap.fromTo(heroVideo,
            { yPercent: 0, scale: 1 },
            {
                yPercent: 15,
                scale: 1.1,
                ease: "none",
                scrollTrigger: {
                    trigger: aboutHero,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    }

    // 2. Section Background Parallax (.parallax-bg)
    document.querySelectorAll('.parallax-bg').forEach(bg => {
        const speed = parseFloat(bg.dataset.speed) || 0.1;
        gsap.fromTo(bg,
            { yPercent: 0 }, // Start at the -10% offset (nudge)
            {
                yPercent: -25, // Move up to show more of the image
                ease: "none",
                scrollTrigger: {
                    trigger: bg.parentElement,
                    start: "top top", // Start when section hits top
                    end: "bottom top", // End when section leaves top
                    scrub: true
                }
            }
        );
    });

    // 3. Cinematic Image Parallax (.archive-img, .pan-img)
    document.querySelectorAll('.archive-img, .pan-img').forEach(img => {
        gsap.fromTo(img,
            { scale: 1.2, yPercent: -10 },
            {
                scale: 1.1,
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });

    // 4. Generic Parallax Elements (for backward compatibility)
    document.querySelectorAll('[data-speed]').forEach(el => {
        if (!el.classList.contains('parallax-bg')) {
            const speed = parseFloat(el.dataset.speed);
            gsap.to(el, {
                y: () => -100 * speed,
                ease: "none",
                scrollTrigger: {
                    trigger: el,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    });
}

function initHorizontalScroll() {
    // Skip on pages that have their own inline GSAP horizontal scroll
    if (window.location.pathname.includes('mandates') || window.location.pathname.includes('journal')) return;

    // Only on Desktop
    if (window.innerWidth > 1024) {
        const horizontalSections = document.querySelectorAll('.horizontal-scroll-section');
        horizontalSections.forEach(section => {
            const container = section.querySelector('.horizontal-container');
            if (container) {
                gsap.to(container, {
                    x: () => -(container.scrollWidth - window.innerWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: () => `+=${container.scrollWidth - window.innerWidth + 200}`,
                        scrub: 1,
                        pin: true,
                        pinType: "transform",
                        invalidateOnRefresh: true,
                        anticipatePin: 1
                    }
                });
            }
        });
    }
}

function initPinning() {
    // Pin Core Beliefs Header (if structure matches)
    // Structure: .core-beliefs-compact as trigger, .compact-header as pinned element
    const beliefSection = document.querySelector('.core-beliefs-compact');
    const beliefHeader = document.querySelector('.compact-header');

    if (beliefSection && beliefHeader && window.innerWidth > 1024) {
        ScrollTrigger.create({
            trigger: beliefSection,
            start: "top 20%",
            end: "bottom 60%",
            pin: beliefHeader,
            pinSpacing: false,
            pinType: "transform"
        });
    }
}


/* ==========================================================================
   INQUIRE OVERLAY
   ========================================================================== */
function initInquireOverlay() {
    // 1. Inject HTML if missing
    if (!document.getElementById('inquire-overlay')) {
        const overlayHTML = `
            <div class="inquire-overlay" id="inquire-overlay">
                <div class="inquire-container" data-lenis-prevent>
                    <div class="inquire-header">
                        <div class="inquire-close" id="inquire-close">✖</div>
                        <span class="section-label">THE COMMENCEMENT</span>
                        <h2>Begin the <span class="editorial-gold">Dialogue.</span></h2>
                    </div>
                    
                    <form class="inquire-form">
                        <div class="form-group slide-up-reveal">
                            <input type="text" class="form-input" placeholder="Name" required>
                        </div>
                        <div class="form-group slide-up-reveal">
                            <input type="email" class="form-input" placeholder="Email / Signal" required>
                        </div>
                        <div class="form-group slide-up-reveal">
                            <input type="text" class="form-input" placeholder="Mandate Interest (e.g. Himalaya)" required>
                        </div>
                        <div class="form-group slide-up-reveal">
                            <input type="text" class="form-input" placeholder="Specific Requirements / Intent" required>
                        </div>
                        <button type="submit" class="btn-gold slide-up-reveal" style="margin-top: 2rem; width: 100%;">REQUEST INTELLIGENCE</button>
                    </form>

                    <div class="inquire-footer slide-up-reveal">
                        <div class="contact-row">
                            <span class="contact-label">DIRECT LINE</span>
                            <span class="contact-value">+91 98765 43210</span>
                        </div>
                        <div class="contact-row">
                            <span class="contact-label">SECURE MAIL</span>
                            <span class="contact-value">studio@aerie.design</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }

    const overlay = document.getElementById('inquire-overlay');

    // Close Button Delegation
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#inquire-close')) {
            overlay.classList.remove('open');
        }
    });

    // Smart Cursor & Interaction Handling
    const container = overlay.querySelector('.inquire-container');
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (container) {
        container.addEventListener('mouseenter', () => {
            if (cursor) cursor.style.opacity = '0';
            if (follower) follower.style.opacity = '0';
        });
        container.addEventListener('mouseleave', () => {
            if (cursor) cursor.style.opacity = '1';
            if (follower) follower.style.opacity = '1';
        });
    }

    // Open Trigger
    document.body.addEventListener('click', (e) => {
        const openBtn = e.target.closest('a[href="#contact"], .btn-inquire, [data-open-inquire]');
        if (openBtn) {
            e.preventDefault();
            overlay.classList.add('open');

            // Stagger Animation for Fields
            gsap.fromTo('.slide-up-reveal',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, delay: 0.3, ease: "power2.out" }
            );
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
let globalObserver = null;
function initScrollAnimations() {
    if (globalObserver) globalObserver.disconnect();

    globalObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
        globalObserver.observe(el);
        // Instant check for above-fold content
        if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('active');
        }
    });
}

