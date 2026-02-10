// Specific Cursor Interactions for About Page
const follower = document.getElementById('cursor-follower');
if (follower) {
    document.querySelectorAll('.state-path, .timeline-card').forEach(el => {
        el.addEventListener('mouseenter', () => follower.classList.add('cursor-active'));
        el.addEventListener('mouseleave', () => follower.classList.remove('cursor-active'));
    });
}

// Animated Stats Counter
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const counter = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target.toLocaleString() + (target === 22000 ? '+' : '');
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number-animated').forEach(stat => {
    statsObserver.observe(stat);
});

// Interactive Map Hotspots
const hotspots = document.querySelectorAll('.hotspot');
const subCards = document.querySelectorAll('.sub-card');
const storyDisplay = document.getElementById('storyDisplay');

const locationStories = {
    'kashmir': {
        num: '01',
        title: 'SILENCE AT THE EDGE',
        story: 'Srinagar, 2010. My journey began not with a plan, but with a feeling of absolute insignificance against the Himalayas. The silence here is heavy, a luxury in a world of noise.',
        year: '2010'
    },
    'rajasthan': {
        num: '02',
        title: 'THE PRECISION OF DUST',
        story: 'The Thar Desert taught me that luxury is precision. Every grain of sand has its place. Six months in the desert rewires how you perceive time and abundance.',
        year: '2012'
    },
    'assam': {
        num: '03',
        title: 'THE TEA ARCHIVES',
        story: 'Rolling hills of tea and the mighty Brahmaputra. Northeast India feels like a secret world, untouched by the rush of the mainland.',
        year: '2018'
    },
    'kerala': {
        num: '04',
        title: 'FLOWING THROUGH LIQUID TIME',
        story: 'The backwaters of Kerala move at the speed of water. No rushing. No mandates. Just the steady pulse of a land that has seen a thousand years of trade and wisdom.',
        year: '2015'
    },
    'kanyakumari': {
        num: '05',
        title: 'THE END TRACE',
        story: 'The southern tip. Where the land ends and the divine begins. The temples are not just buildings; they are physical manifestations of a collective soul.',
        year: '2015'
    }
};

function activateLocation(locId) {
    const data = locationStories[locId];
    if (data) {
        storyDisplay.innerHTML = `
            <div class="active-story-luxe">
                <span class="story-num">${data.num}</span>
                <span class="story-year-luxe">${data.year}</span>
                <h3>${data.title}</h3>
                <p>${data.story}</p>
            </div>
        `;
        setTimeout(() => {
            const activeStory = document.querySelector('.active-story-luxe');
            if (activeStory) activeStory.classList.add('reveal-text');
        }, 10);
    }

    // Highlight sub-card
    subCards.forEach(card => {
        if (card.getAttribute('data-location') === locId) {
            card.classList.add('active-card');
        } else {
            card.classList.remove('active-card');
        }
    });

    // Highlight hotspot
    hotspots.forEach(spot => {
        const inner = spot.querySelector('.pulse-inner');
        if (inner) {
            if (spot.getAttribute('data-location') === locId) {
                inner.style.fill = '#fff';
                inner.style.transform = 'scale(1.8)';
                inner.style.filter = 'drop-shadow(0 0 10px #fff)';
            } else {
                inner.style.fill = 'var(--accent)';
                inner.style.transform = 'scale(1)';
                inner.style.filter = 'none';
            }
        }
    });

    // Highlight state paths
    document.querySelectorAll('.state-path').forEach(path => {
        path.style.fill = 'rgba(212, 175, 55, 0.03)';
        path.style.stroke = 'rgba(212, 175, 55, 0.15)';
    });

    // Some basic mapping of locId to path index or similar could go here, 
    // but for now we'll just focus on markers and cards.
}

hotspots.forEach(spot => {
    spot.addEventListener('mouseenter', function () {
        const locId = this.getAttribute('data-location');
        activateLocation(locId);
    });
});

subCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        const locId = this.getAttribute('data-location');
        activateLocation(locId);
    });
});

// Animate journey path on load
window.addEventListener('load', () => {
    const journeyPath = document.getElementById('journeyPath');
    if (journeyPath) {
        const length = journeyPath.getTotalLength();
        journeyPath.style.strokeDasharray = length;
        journeyPath.style.strokeDashoffset = length;

        setTimeout(() => {
            journeyPath.style.transition = 'stroke-dashoffset 4s ease-in-out';
            journeyPath.style.strokeDashoffset = '0';
        }, 1000);
    }
});
