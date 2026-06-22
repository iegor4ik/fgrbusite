
let currentSelectedRegion = null;

const mapSvg = document.querySelector('.ukraine-map');
const panelEmpty = document.getElementById('panelEmpty');
const panelContent = document.getElementById('panelContent');
const regionName = document.getElementById('regionName');
const regionCode = document.getElementById('regionCode');
const regionFlag = document.getElementById('regionFlag');
const membersList = document.getElementById('membersList');

// Modal elements
const memberModal = document.getElementById('memberModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const memberPhoto = document.getElementById('memberPhoto');
const memberName = document.getElementById('memberName');
const memberPosition = document.getElementById('memberPosition');
const memberPhone = document.getElementById('memberPhone');
const memberEmail = document.getElementById('memberEmail');
const memberBirth = document.getElementById('memberBirth');
const memberAppointment = document.getElementById('memberAppointment');
const memberBio = document.getElementById('memberBio');

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  if (typeof regionsData === 'undefined') {
    console.error('regions-data.js not loaded');
    return;
  }

  // Setup SVG interactions
  setupMapInteractions();
  
  // Setup modal interactions
  setupModalInteractions();

  // Restore from URL if present
  const params = new URLSearchParams(window.location.search);
  const regionParam = params.get('region');
  if (regionParam) {
    selectRegion(regionParam);
  }
});

// ============================================================================
// MAP INTERACTION SETUP
// ============================================================================

function setupMapInteractions() {
  const svgGroups = mapSvg.querySelectorAll('g[data-region]');

  svgGroups.forEach(group => {
    const regionId = group.getAttribute('data-region');
    const oblast = group.querySelector('.oblast');

    if (!oblast) return;

    // Mouse events
    oblast.addEventListener('click', () => selectRegion(regionId));
    oblast.addEventListener('mouseenter', () => {
      oblast.style.cursor = 'pointer';
    });

    // Keyboard accessibility
    oblast.setAttribute('tabindex', '0');
    oblast.setAttribute('role', 'button');
    oblast.setAttribute('aria-label', `Виберіть регіон: ${getRegionName(regionId)}`);

    oblast.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRegion(regionId);
      }
    });
  });
}

// ============================================================================
// MODAL INTERACTIONS
// ============================================================================

function setupModalInteractions() {
  // Close button
  modalClose.addEventListener('click', closeModal);
  
  // Overlay click
  modalOverlay.addEventListener('click', closeModal);
  
  // Prevent closing when clicking on the card
  memberModal.querySelector('.modal-card').addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Keyboard: ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && memberModal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ============================================================================
// REGION SELECTION
// ============================================================================

function selectRegion(regionId) {
  const region = regionsData[regionId];
  if (!region) {
    console.error(`Region not found: ${regionId}`);
    return;
  }

  currentSelectedRegion = regionId;
  updateUrlState(regionId);
  highlightMapRegion(regionId);
  renderPanel(region, regionId);

  panelEmpty.style.display = 'none';
  panelContent.style.display = 'block';

  if (window.innerWidth < 1120) {
    panelContent.scrollTop = 0;
  }
}

// ============================================================================
// PANEL RENDERING
// ============================================================================

function renderPanel(region, regionId) {
  regionName.textContent = region.name;
  regionCode.textContent = `Код: ${region.code} • ${region.presidium.length} членів президії`;
  regionFlag.src = region.flag || 'assets/images/image.png';
  regionFlag.alt = `Прапор ${region.name}`;

  membersList.innerHTML = '';

  region.presidium.forEach(member => {
    const card = createMemberCard(member);
    membersList.appendChild(card);
  });
}

function createMemberCard(member) {
  const card = document.createElement('div');
  card.className = 'member-card';
  card.addEventListener('click', () => openMemberModal(member));
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMemberModal(member);
    }
  });

  const name = document.createElement('div');
  name.className = 'member-name';
  name.textContent = member.fullName;

  const position = document.createElement('div');
  position.className = 'member-position';
  position.textContent = member.position;

  card.appendChild(name);
  card.appendChild(position);

  if (member.phone || member.email) {
    const contacts = document.createElement('div');
    contacts.className = 'member-contacts';

    if (member.phone) {
      const phoneLink = document.createElement('a');
      phoneLink.href = `tel:${member.phone}`;
      phoneLink.textContent = member.phone;
      contacts.appendChild(phoneLink);
    }

    if (member.email) {
      const emailLink = document.createElement('a');
      emailLink.href = `mailto:${member.email}`;
      emailLink.textContent = member.email;
      contacts.appendChild(emailLink);
    }

    card.appendChild(contacts);
  }

  return card;
}

// ============================================================================
// MEMBER MODAL
// ============================================================================

function openMemberModal(member) {
  memberPhoto.src = member.photo || 'assets/images/image.png';
  memberPhoto.alt = member.fullName;
  memberName.textContent = member.fullName;
  memberPosition.textContent = member.position;

  // Phone
  if (member.phone) {
    memberPhone.innerHTML = `<strong>Телефон:</strong> <a href="tel:${member.phone}">${member.phone}</a>`;
  } else {
    memberPhone.innerHTML = '';
  }

  // Email
  if (member.email) {
    memberEmail.innerHTML = `<strong>Email:</strong> <a href="mailto:${member.email}">${member.email}</a>`;
  } else {
    memberEmail.innerHTML = '';
  }

  // Birth Date
  if (member.birthDate) {
    memberBirth.innerHTML = `<strong>Дата народження:</strong> ${formatDateUkrainian(member.birthDate)}`;
  } else {
    memberBirth.innerHTML = '';
  }

  // Appointment Date
  if (member.appointmentDate) {
    memberAppointment.innerHTML = `<strong>Дата призначення:</strong> ${formatDateUkrainian(member.appointmentDate)}`;
  } else {
    memberAppointment.innerHTML = '';
  }

  // Bio
  memberBio.textContent = member.bio || '';

  memberModal.classList.add('active');
  memberModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  memberModal.classList.remove('active');
  memberModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ============================================================================
// MAP HIGHLIGHTING
// ============================================================================

function highlightMapRegion(regionId) {
  const allOblasts = mapSvg.querySelectorAll('.oblast');
  allOblasts.forEach(oblast => {
    oblast.classList.remove('active');
  });

  const group = mapSvg.querySelector(`g[data-region="${regionId}"]`);
  if (group) {
    const oblast = group.querySelector('.oblast');
    if (oblast) {
      oblast.classList.add('active');
      oblast.focus();
    }
  }
}

// ============================================================================
// URL STATE MANAGEMENT
// ============================================================================

function updateUrlState(regionId) {
  const url = new URL(window.location);
  url.searchParams.set('region', regionId);
  window.history.pushState({ region: regionId }, '', url);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRegionName(regionId) {
  if (regionsData && regionsData[regionId]) {
    return regionsData[regionId].name;
  }
  return regionId;
}

function formatDateUkrainian(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

// ============================================================================
// BROWSER HISTORY
// ============================================================================

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.region) {
    selectRegion(e.state.region);
  } else {
    currentSelectedRegion = null;
    panelEmpty.style.display = 'block';
    panelContent.style.display = 'none';
    
    const allOblasts = mapSvg.querySelectorAll('.oblast');
    allOblasts.forEach(oblast => {
      oblast.classList.remove('active');
    });
  }
});
