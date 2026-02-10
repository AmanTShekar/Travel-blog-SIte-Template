// Cursor
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
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

document.querySelectorAll('a, button, .state-path, .timeline-card').forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('cursor-active'));
    el.addEventListener('mouseleave', () => follower.classList.remove('cursor-active'));
});

// Reveal Animations
const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('active');
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

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

// Interactive Map
const statePaths = document.querySelectorAll('.state-path');
const storyDisplay = document.getElementById('storyDisplay');

const stateStories = {
    'Kashmir': {
        year: '2010',
        title: 'The Beginning',
        story: 'Started in Srinagar with ₹5,000 and a backpack. A truck driver offered my first ride—and my first lesson in Indian hospitality. The snow-capped peaks and Dal Lake became the backdrop for the journey of a lifetime.',
        icon: '🏔️'
    },
    'Punjab': {
        year: '2010',
        title: 'Truck Cabins & Songs',
        story: 'Slept in truck cabins, learned Punjabi folk songs from drivers. Punjab taught me that the road is a classroom. The Golden Temple in Amritsar showed me the power of community and service.',
        icon: '🚛'
    },
    'Rajasthan': {
        year: '2011-2012',
        title: 'Desert Immersion',
        story: 'Six months in the Thar Desert. Jaisalmer, Jodhpur, Udaipur—each city a masterclass in heritage. The desert silence taught me that luxury is about precision, not abundance.',
        icon: '🏜️'
    },
    'Gujarat': {
        year: '2012',
        title: 'Rann of Kutch',
        story: 'The white desert under a full moon. An otherworldly experience that redefined beauty. The salt flats stretched endlessly, creating a surreal landscape that felt like another planet.',
        icon: '🌕'
    },
    'Maharashtra': {
        year: '2013',
        title: 'Return to Mumbai',
        story: 'Came back to where I was born, but as a completely different person. The city felt both familiar and foreign. Mumbai\'s chaos now made perfect sense.',
        icon: '🏙️'
    },
    'Goa': {
        year: '2013',
        title: 'Beyond Beaches',
        story: 'Discovered Portuguese architecture, spice plantations, and a slower pace hidden behind the party reputation. Old Goa\'s churches revealed layers of history.',
        icon: '🏖️'
    },
    'Karnataka': {
        year: '2014',
        title: 'Hampi & Coorg',
        story: 'Ancient ruins and coffee estates. Hampi\'s boulders and temples defied logic. Coorg\'s mist-covered hills offered a different kind of magic.',
        icon: '☕'
    },
    'Kerala': {
        year: '2015',
        title: 'Backwater Wisdom',
        story: 'Houseboats, Ayurveda, and the art of slow travel. Kerala taught me that luxury is about time, not money. The backwaters moved at nature\'s pace.',
        icon: '🛶'
    },
    'Tamil Nadu': {
        year: '2015',
        title: 'Temple Architecture',
        story: 'Madurai, Thanjavur, Kanyakumari. The journey ended where India ends—at the southern tip. Temple gopurams reached for the sky, each one a testament to devotion.',
        icon: '🕉️'
    },
    'Madhya Pradesh': {
        year: '2012',
        title: 'Heart of India',
        story: 'Khajuraho temples and Bandhavgarh tigers. Central India revealed layers of history and wilderness. The stone carvings told stories from centuries past.',
        icon: '🐅'
    },
    'Uttar Pradesh': {
        year: '2011',
        title: 'Varanasi Ghats',
        story: 'Witnessed life and death on the Ganges. Varanasi is where India\'s spiritual core becomes visible. The evening aarti transformed the river into a sea of light.',
        icon: '🪔'
    },
    'Bihar': {
        year: '2016',
        title: 'Buddhist Roots',
        story: 'Bodh Gaya and Nalanda. Walked where Buddha walked, studied where ancient scholars studied. The Bodhi tree stood as a silent witness to enlightenment.',
        icon: '🌳'
    },
    'West Bengal': {
        year: '2016',
        title: 'Kolkata & Darjeeling',
        story: 'From Kolkata\'s chaos to Darjeeling\'s serenity. Bengal is a study in contrasts. The tea gardens and Himalayan views offered respite from the city.',
        icon: '🍵'
    },
    'Assam': {
        year: '2018',
        title: 'Gateway to Northeast',
        story: 'Tea estates and the mighty Brahmaputra. Assam opened the door to India\'s most underrated region. River islands and one-horned rhinos made it unforgettable.',
        icon: '🦏'
    },
    'Meghalaya': {
        year: '2018',
        title: 'Living Root Bridges',
        story: 'The wettest place on Earth revealed living root bridges and crystal-clear rivers. Meghalaya\'s natural engineering was centuries ahead of its time.',
        icon: '🌉'
    },
    'Uttarakhand': {
        year: '2011',
        title: 'Himalayan Spirituality',
        story: 'Rishikesh and Haridwar. Where the Ganges begins its journey. The mountains held ancient wisdom in their silence.',
        icon: '⛰️'
    },
    'Himachal': {
        year: '2010',
        title: 'Mountain Monasteries',
        story: 'Dharamshala and Spiti Valley. Buddhist monasteries perched on cliffs. The thin mountain air clarified everything.',
        icon: '🏔️'
    },
    'Andhra Pradesh': {
        year: '2014',
        title: 'Coastal Devotion',
        story: 'Tirupati and Visakhapatnam. Coastal beauty meets devotion. The temple crowds showed India\'s unwavering faith.',
        icon: '🏛️'
    },
    'Telangana': {
        year: '2014',
        title: 'Hyderabad Biryani',
        story: 'Hyderabad\'s biryani and Golconda Fort. A foodie\'s paradise with layers of Mughal history.',
        icon: '🍛'
    },
    'Odisha': {
        year: '2017',
        title: 'Sun Temple',
        story: 'Konark Sun Temple and Puri beaches. Odisha is India\'s underrated gem. The temple\'s chariot wheels measured time itself.',
        icon: '☀️'
    },
    'Chhattisgarh': {
        year: '2013',
        title: 'Tribal Heritage',
        story: 'Bastar region\'s tribal culture and waterfalls. Chhattisgarh showed India\'s indigenous roots.',
        icon: '🌊'
    },
    'Jharkhand': {
        year: '2016',
        title: 'Waterfall Country',
        story: 'Hundru Falls and tribal villages. Jharkhand\'s natural beauty rivals any tourist hotspot.',
        icon: '💧'
    }
};

statePaths.forEach(path => {
    path.addEventListener('mouseenter', function() {
        const stateName = this.getAttribute('data-state');
        const story = stateStories[stateName];
        
        if (story) {
            storyDisplay.innerHTML = `
                <div class="active-story">
                    <div class="story-icon">${story.icon}</div>
                    <span class="story-year">${story.year}</span>
                    <h4>${stateName}: ${story.title}</h4>
                    <p>${story.story}</p>
                </div>
            `;
        }
        
        // Highlight effect
        this.style.fill = 'rgba(212, 175, 55, 0.4)';
        this.style.stroke = 'var(--accent)';
        this.style.strokeWidth = '2';
    });
    
    path.addEventListener('mouseleave', function() {
        // Reset
        this.style.fill = 'rgba(212, 175, 55, 0.1)';
        this.style.stroke = 'rgba(212, 175, 55, 0.3)';
        this.style.strokeWidth = '1';
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
