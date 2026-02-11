// Map Story Data (Curated Logs)
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

const defaultLog = { name: 'Field Survey', year: 'Ongoing', log: 'Unmapped regions undergoing architectural audit.' };

// Elements
const mapHoverCard = document.getElementById('mapHoverCard');
const hName = document.getElementById('hoverStateName');
const hYear = document.getElementById('hoverStateYear');
const hLog = document.getElementById('hoverStateStory');
const states = document.querySelectorAll('.state-layer');
const coordinates = document.querySelectorAll('.coordinate-marker');
const storyContent = document.getElementById('story-content');

// Helper to update story panel
function updateStoryPanel(id) {
    const data = stateLogs[id] || defaultLog;
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

    // Reset active states on map
    states.forEach(s => s.classList.remove('active-state'));
    const activePath = document.getElementById(id);
    if (activePath) activePath.classList.add('active-state');

    // Update active sub-card
    const subCards = document.querySelectorAll('.sub-card');
    subCards.forEach(card => {
        card.classList.remove('active');
        const onclick = card.getAttribute('onclick');
        if (onclick && onclick.includes(`'${id}'`)) {
            card.classList.add('active');
        }
    });

    // Smooth scroll to panel on mobile
    if (window.innerWidth < 1200) {
        storyContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Map Interactions
states.forEach(state => {
    state.addEventListener('mouseenter', (e) => {
        const id = state.id;
        const data = stateLogs[id] || { name: state.getAttribute('name'), year: '2010-2022', log: 'Logs being decrypted.' };

        hName.textContent = data.name;
        hYear.textContent = data.year;
        hLog.textContent = data.log;

        mapHoverCard.classList.add('visible');
    });

    state.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        mapHoverCard.style.left = x + 'px';
        mapHoverCard.style.top = y + 'px';
    });

    state.addEventListener('mouseleave', () => {
        mapHoverCard.classList.remove('visible');
    });

    state.addEventListener('click', () => {
        updateStoryPanel(state.id);
    });
});

// Coordinate Clicks
coordinates.forEach(coord => {
    coord.addEventListener('click', () => {
        const id = coord.getAttribute('data-location');
        updateStoryPanel(id);
    });
});

// Journey Trace Animation
window.addEventListener('scroll', () => {
    const path = document.getElementById('journeyPathFull');
    if (!path) return;

    const scrollPos = window.scrollY + window.innerHeight;
    const pathPos = path.getBoundingClientRect().top + window.scrollY;

    if (scrollPos > pathPos) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        if (!path.classList.contains('drawn')) {
            path.style.strokeDashoffset = length;
            path.classList.add('drawn');
            path.style.transition = 'stroke-dashoffset 3s ease-in-out';
            setTimeout(() => path.style.strokeDashoffset = '0', 200);
        }
    }
});

// Initialize with a state
window.addEventListener('load', () => {
    setTimeout(() => updateStoryPanel('rj'), 1500);
});
