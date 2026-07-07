/**
 * PRESIDIUM PAGE - Dynamic Hierarchy Rendering
 * 
 * This module manages the rendering of the Presidium hierarchy structure
 * with dynamic card generation from data arrays organized by hierarchy levels.
 * 
 * Architecture:
 * - Data Layer: presidiumMembers array with hierarchy levels
 * - Rendering Layer: createCard(), renderHierarchy() functions
 * - Interaction Layer: Modal system, event delegation
 * 
 * Compatible with future API/Database integration
 */

// ============================================================================
// DATA LAYER - Presidium Members Structure
// ============================================================================

/**
 * Presidium members organized by hierarchy levels (1-6)
 * 
 * Level 1: President (1 person)
 * Level 2: First Vice President (1 person)
 * Level 3: General Secretary (1 person)
 * Level 4: Honorary Presidents (3 people)
 * Level 5: Vice Presidents (8 people)
 * Level 6: Presidium Members (1 person)
 */
const presidiumMembers = [
  // ========================================================================
  // LEVEL 0 - PRESIDENT (SPECIAL DISPLAY)
  // ========================================================================
  {
    id: 'president-1',
    level: 0,
    role: 'Президент Федерації греко-римської боротьби України',
    name: 'Сазонов Олег Юрійович',
    image: 'assets/images/oleg-sazonov.jpg',
    dob: '1973-08-20',
    city: 'Кременчук',
    appointed: '2023',
    description: 'Очолює федерацію та формує стратегію розвитку спорту. Забезпечує представництво федерації на міжнародному рівні, підтримує молодіжні програми та підсилює партнерські стосунки з органами влади й міжнародними спортивними організаціями.',
  },

  // ========================================================================
  // LEVEL 3 - PRESIDIUM MEMBERS (ALL ON ONE LEVEL)
  // ========================================================================
  {
    id: 'vice-president-1',
    level: 3,
    role: 'Перший віце-президент Федерації греко-римської боротьби',
    name: 'Коваль Віталій Станіславович',
    image: 'assets/images/Vitaliy_Koval\'.jpg',
    dob: '1982-07-05',
    city: 'Рівне',
    appointed: '2023',
    description: 'Керує напрямком спортивної підготовки та координує розвиток тренерського складу. Відповідає за якість спортивної підготовки на всіх рівнях та взаємодію з регіональними спортивними організаціями.',
  },
  {
    id: 'honorary-1',
    level: 3,
    role: 'Почесний президент Федерації',
    name: 'Кисіль Вадим Володимирович',
    image: 'assets/images/Kisil_Vadim.jpg',
    dob: '1972-04-20',
    city: 'Київ',
    appointed: '2023',
    description: '',
  },
  {
    id: 'honorary-2',
    level: 3,
    role: 'Почесний президент Федерації',
    name: 'Камач Олександр Петрович',
    image: 'assets/images/Kamch.jpg',
    dob: '1946-03-26',
    city: 'Київ',
    appointed: '2023',
    description: '',
  },
  {
    id: 'honorary-3',
    level: 3,
    role: 'Почесний президент Федерації',
    name: 'Кравченко Олег Миколайович',
    image: 'assets/images/Kravchenko.jpg',
    dob: '1958-01-17',
    city: 'Київ',
    appointed: '2023',
    description: '',
  },
  {
    id: 'secretary-1',
    level: 3,
    role: 'Генеральний секретар Федерації греко-римської боротьби',
    name: 'Каплуновський Андрій Олександрович',
    image: 'assets/images/Kaplunovski.webp',
    dob: '1965-03-15',
    city: 'Харків',
    appointed: '2023',
    description: '',
  },

  // ========================================================================
  // LEVEL 3 - VICE PRESIDENTS (MOVED TO SINGLE LEVEL)
  // ========================================================================
  {
    id: 'vp-1',
    level: 3,
    role: 'Віце-президент',
    name: 'Петро Григорович Душейко',
    image: 'assets/images/dushejko.webp',
    dob: '1951-02-08',
    city: 'Черкаська область',
    appointed: '2023',
    description: '',
  },
  {
    id: 'vp-2',
    level: 3,
    role: 'Віце-президент',
    name: 'Лисак Сергій Петрович',
    image: 'assets/images/lysak.webp',
    dob: '1975-01-21',
    city: 'Одеса',
    appointed: '2023',
    description: '',
  },
  {
    id: 'vp-3',
    level: 3,
    role: 'Віце-президент',
    name: 'Ковальчук Олександр Іванович',
    image: 'assets/images/Kovalchuk.webp',
    dob: '1985-04-18',
    city: 'Костопіль',
    appointed: '2023',
    description: '',
  },
  {
    id: 'vp-4',
    level: 3,
    role: 'Віце-президент',
    name: 'Кирій Олександр Вікторович',
    image: 'assets/images/kyrii.webp',
    dob: '1958-08-18',
    city: 'Конотоп',
    appointed: '2023',
    description: '',
  },
  {
    id: 'vp-5',
    level: 3,
    role: 'Віце-президент',
    name: 'Варданян Вартан Володимирович',
    image: 'assets/images/No-photo-m.png',
    dob: '',
    city: 'Київ',
    appointed: '2023',
    description: '',
  },
  {
    id: 'vp-6',
    level: 3,
    role: 'Віце-президент',
    name: 'Акопян Гегам Ванікович',
    image: 'assets/images/No-photo-m.png',
    dob: '',
    city: '',
    appointed: '2023',
    description: '',
  },
  {
    id: 'vp-7',
    level: 3,
    role: 'Віце-президент',
    name: 'Роєнко Євгеній Анатолійович',
    image: 'assets/images/Royenko.webp',
    dob: '',
    city: '',
    appointed: '2023',
    description: '',
  },
  {
    id: 'vp-8',
    level: 3,
    role: 'Віце-президент ',
    name: 'Квятковський Андрій Васильович',
    image: 'assets/images/Kvyatkovski.webp',
    dob: '1990-02-02',
    city: 'Івано-Франківськ',
    appointed: '2023',
    description: '',
  },
  

  // ========================================================================
  // LEVEL 3 - ADDITIONAL PRESIDIUM MEMBERS
  // ========================================================================
  {
    id: 'member-1',
    level: 3,
    role: 'Член Президіуму Федерації',
    name: 'Калашников Андрій Миколайович',
    image: 'assets/images/Kalashnikov.webp',
    dob: '1964-11-20',
    city: 'Київ',
    appointed: '2023',
    description: '',
  },
    {
    id: 'member-2',
    level: 3,
    role: 'Член Президіуму Федерації',
    name: 'Смишляєв Олександр Вікторович',
    image: 'assets/images/No-photo-m.png',
    dob: '',
    city: 'Київ',
    appointed: '2023',
    description: '',
  },
];

// ============================================================================
// DOM ELEMENTS CACHE
// ============================================================================

const profileModal = document.getElementById('profileModal');
const profileClose = document.getElementById('profileClose');
const profileImage = document.getElementById('profileImage');
const profileCategory = document.getElementById('profileCategory');
const profileName = document.getElementById('profileName');
const profilePosition = document.getElementById('profilePosition');
const profileDetails = document.getElementById('profileDetails');
const profileExtra = document.getElementById('profileExtra');
const profileAchievements = document.getElementById('profileAchievements');

// ============================================================================
// RENDERING LAYER - Card and Hierarchy Generation
// ============================================================================

/**
 * Creates a presidium card element for a given member
 * @param {Object} member - Member data object
 * @returns {string} HTML string for the card
 */
function createPresidiumCard(member) {
  return `
    <button 
      class="presidium-card fade-in-up" 
      type="button" 
      data-id="${member.id}" 
      data-level="${member.level}"
      aria-label="Відкрити профіль ${member.name}"
    >
      <img 
        src="${member.image}" 
        alt="${member.name}" 
        loading="lazy" 
        decoding="async"
      />
      <div class="presidium-card-body">
        <h4>${member.name}</h4>
        <p>${member.role}</p>
      </div>
    </button>
  `;
}

/**
 * Renders the entire presidium hierarchy by grouping members by level
 * and populating the corresponding level grids
 */
function renderHierarchy() {
  // Group members by hierarchy level
  const membersByLevel = {};
  
  presidiumMembers.forEach(member => {
    if (!membersByLevel[member.level]) {
      membersByLevel[member.level] = [];
    }
    membersByLevel[member.level].push(member);
  });

  // Render president (level 0) - special large card
  if (membersByLevel[0]) {
    const presidentContainer = document.getElementById(`level-0`);
    if (presidentContainer) {
      presidentContainer.innerHTML = membersByLevel[0]
        .map(member => `
          <button 
            class="presidium-card presidium-card-president fade-in-up" 
            type="button" 
            data-id="${member.id}" 
            data-level="${member.level}"
            aria-label="Відкрити профіль ${member.name}"
          >
            <img 
              src="${member.image}" 
              alt="${member.name}" 
              loading="lazy" 
              decoding="async"
            />
            <div class="presidium-card-body">
              <h4>${member.name}</h4>
              <p>${member.role}</p>
            </div>
          </button>
        `)
        .join('');
    }
  }

  // Render presidium members - all on level 1 container, regardless of their level in data
  const presidiumContainer = document.getElementById('level-1');
  if (presidiumContainer) {
    // Collect all members except president (level 0)
    const allPresidiumMembers = presidiumMembers.filter(member => member.level !== 0);
    presidiumContainer.innerHTML = allPresidiumMembers
      .map(member => createPresidiumCard(member))
      .join('');
  }
}

// ============================================================================
// INTERACTION LAYER - Modal System
// ============================================================================

/**
 * Formats a date string to Ukrainian locale
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date or empty string if invalid
 */
function formatDate(dateString) {
  if (!dateString) return 'Не вказана';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return 'Невідомо';
  }
}

/**
 * Opens the profile modal with member information
 * @param {Object} member - Member data object
 */
function openProfile(member) {
  if (!member) return;

  // Populate modal content
  profileImage.src = member.image;
  profileImage.alt = member.name;
  profileCategory.textContent = member.role;
  profileName.textContent = member.name;
  profilePosition.textContent = member.role;

  // Populate member details
  profileDetails.innerHTML = `
    <div>
      <span>Дата народження</span>
      <strong>${formatDate(member.dob)}</strong>
    </div>
    <div>
      <span>Місто</span>
      <strong>${member.city || 'Не вказане'}</strong>
    </div>
    <div>
      <span>Рік призначення</span>
      <strong>${member.appointed || 'Не вказано'}</strong>
    </div>
    <div>
      <span>Рівень</span>
      <strong>Рівень ${member.level}</strong>
    </div>
  `;

  // Populate biography
  profileExtra.textContent = member.description || '';
  profileExtra.style.display = member.description ? 'block' : 'none';

  // Clear achievements (not used for presidium, but kept for consistency)
  profileAchievements.innerHTML = '';

  // Show modal
  profileModal.classList.add('active');
  profileModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Set focus to close button for accessibility
  profileClose.focus();
}

/**
 * Closes the profile modal
 */
function closeProfile() {
  profileModal.classList.remove('active');
  profileModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Retrieves a member by ID
 * @param {string} id - Member ID
 * @returns {Object|null} Member object or null if not found
 */
function getMemberById(id) {
  return presidiumMembers.find(member => member.id === id) || null;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Sets up all event listeners for the page
 */
function setupEventListeners() {
  // Event delegation for card clicks
  document.addEventListener('click', (event) => {
    // Handle card clicks
    const card = event.target.closest('.presidium-card');
    if (card) {
      const id = card.dataset.id;
      const member = getMemberById(id);
      if (member) {
        openProfile(member);
      }
      return;
    }

    // Handle backdrop click (close modal)
    if (event.target === profileModal) {
      closeProfile();
    }
  });

  // Close button click
  profileClose.addEventListener('click', closeProfile);

  // Keyboard support (ESC closes modal)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && profileModal.classList.contains('active')) {
      closeProfile();
    }
  });
}

// ============================================================================
// ANIMATION & OBSERVER LAYER - IntersectionObserver for Fade-in
// ============================================================================

/**
 * Sets up IntersectionObserver for fade-in animations
 * Cards animate when they come into view
 */
function buildFadeInObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Observe all presidium cards
  document.querySelectorAll('.presidium-card').forEach((card) => {
    observer.observe(card);
  });
}

/**
 * Sets up IntersectionObserver for footer fade-in animation
 */
function buildFooterObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  const footer = document.querySelector('[data-observe]');
  if (footer) {
    observer.observe(footer);
  }
}

// ============================================================================
// ACCESSIBILITY & FOCUS MANAGEMENT
// ============================================================================

/**
 * Traps focus within modal when it's open
 * Ensures keyboard users cannot tab outside the modal
 */
function setupFocusTrap() {
  const focusableElements = '.presidium-card, .profile-close, a, button';
  
  profileModal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    const focusables = profileModal.querySelectorAll(focusableElements);
    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main initialization function - runs on DOMContentLoaded
 * Sets up the entire page: rendering, event listeners, animations
 */
function initPresidiumPage() {
  try {
    // Render hierarchy structure from data
    renderHierarchy();

    // Setup all event listeners
    setupEventListeners();

    // Setup focus trap for modal
    setupFocusTrap();

    // Initialize fade-in animations with IntersectionObserver
    buildFadeInObserver();
    buildFooterObserver();

    // Log initialization (for debugging)
    console.log(
      `✓ Presidium page initialized: ${presidiumMembers.length} members loaded`
    );
  } catch (error) {
    console.error('Error initializing Presidium page:', error);
  }
}

// ============================================================================
// DOM READY - Trigger Initialization
// ============================================================================

if (document.readyState === 'loading') {
  // DOM is still loading
  document.addEventListener('DOMContentLoaded', initPresidiumPage);
} else {
  // DOM is already loaded (e.g., script loaded asynchronously after page load)
  initPresidiumPage();
}

// ============================================================================
// EXPORT FOR TESTING & FUTURE API INTEGRATION
// ============================================================================

// Make functions available for testing and potential API integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    presidiumMembers,
    createPresidiumCard,
    renderHierarchy,
    openProfile,
    closeProfile,
    getMemberById,
    formatDate,
  };
}
