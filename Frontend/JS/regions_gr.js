
let currentSelectedRegion = null;
let databaseRegions = [];

const regionalCenterLabels = {
  crimea: { name: 'Сімферополь', x: 645, y: 595 },
  vinnytsia_city: { name: 'Вінниця', x: 370, y: 305 },
  zhmerynka: { name: 'Жмеринка', x: 355, y: 330 },
  volyn: { name: 'Луцьк', x: 220, y: 155 },
  dnipropetrovsk: { name: 'Дніпро', x: 700, y: 335 },
  donetsk: { name: 'Донецьк', x: 825, y: 375 },
  zhytomyr: { name: 'Житомир', x: 365, y: 200 },
  zakarpattia: { name: 'Мукачево', x: 115, y: 340 },
  zaporizhzhia: { name: 'Запоріжжя', x: 700, y: 385 },
  ivano_frankivsk: { name: 'Івано-Франківськ', x: 165, y: 305 },
  kyiv_city: { name: 'Київ', x: 470, y: 185 },
  kyiv_oblast: { name: 'Київ', x: 555, y: 220 },
  kirovohrad: { name: 'Кропивницький', x: 560, y: 340 },
  luhansk: { name: 'Луганськ', x: 900, y: 315 },
  mykolaiv: { name: 'Миколаїв', x: 530, y: 450 },
  odesa: { name: 'Одеса', x: 475, y: 493 },
  poltava: { name: 'Полтава', x: 660, y: 240 },
  rivne: { name: 'Рівне', x: 265, y: 170 },
  sumy: { name: 'Суми', x: 695, y: 170 },
  ternopil: { name: 'Тернопіль', x: 220, y: 250 },
  kharkiv: { name: 'Харків', x: 755, y: 220 },
  kherson: { name: 'Херсон', x: 560, y: 480 },
  khmelnytsky: { name: 'Хмельницький', x: 285, y: 265 },
  cherkasy: { name: 'Черкаси', x: 525, y: 265 },
};

const mapSvg = document.querySelector('.ukraine-map');
const mapTooltip = document.getElementById('mapTooltip');

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

document.addEventListener('DOMContentLoaded', async function() {
  if (typeof regionsData === 'undefined') {
    console.error('regions-data.js not loaded');
    return;
  }

  try {
    await loadMapSvg();
    await loadDatabaseRegions();
  } catch (error) {
    console.error('Failed to load map region data:', error);
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

async function loadMapSvg() {
  if (!mapSvg) return;

  let svgText = null;
  try {
    const response = await fetch('assets/Ukraine_location_map.svg');
    if (response.ok) {
      svgText = await response.text();
    } else {
      throw new Error(`Unable to fetch map SVG: ${response.status}`);
    }
  } catch (fetchError) {
    try {
      svgText = await loadSvgWithXhr('assets/Ukraine_location_map.svg');
    } catch (xhrError) {
      console.error('SVG load failed:', fetchError, xhrError);
      return;
    }
  }

  if (!svgText) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const importedSvg = doc.querySelector('svg');

  if (!importedSvg) {
    console.error('Failed to parse SVG document');
    return;
  }

  const importedViewBox = importedSvg.getAttribute('viewBox') || importedSvg.getAttribute('viewbox');
  if (importedViewBox) {
    mapSvg.setAttribute('viewBox', importedViewBox);
  }

  mapSvg.innerHTML = importedSvg.innerHTML;

  const regionGroups = mapSvg.querySelectorAll('g[data-region]');
  if (regionGroups.length === 0) {
    console.error('No interactive regions found after SVG injection');
  }

  regionGroups.forEach(group => {
    const sourceRegion = group.getAttribute('data-region');
    if (sourceRegion === 'kyiv_city') {
      group.setAttribute('data-region', 'kyiv_oblast');
    } else if (sourceRegion === 'kyiv_oblast') {
      group.setAttribute('data-region', 'kyiv_city');
    }
    const shape = group.querySelector('path, polygon, circle, rect, ellipse');
    if (shape?.id === 'UA30') {
      group.setAttribute('data-region', 'kyiv_oblast');
    } else if (shape?.id === 'UA32') {
      group.setAttribute('data-region', 'kyiv_city');
    }
    group.style.pointerEvents = 'all';
    group.style.cursor = 'pointer';
    const shapes = Array.from(group.querySelectorAll('path, polygon, circle, rect, ellipse'));
    shapes.forEach(shape => {
      shape.classList.add('oblast');
      shape.style.pointerEvents = 'all';
    });
  });

  renderRegionalCenterLabels();
}

function renderRegionalCenterLabels() {
  const labelLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelLayer.classList.add('regional-center-labels');
  labelLayer.setAttribute('aria-hidden', 'true');
  Object.entries(regionalCenterLabels).forEach(([regionId, city]) => {
    if (!Object.prototype.hasOwnProperty.call(regionsData, regionId)) return;

    const isInteractiveCity = regionId === 'vinnytsia_city' || regionId === 'zhmerynka';
    const markerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    markerGroup.classList.add('regional-center', isInteractiveCity ? 'regional-center--interactive' : 'regional-center--static');

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.classList.add('regional-center-marker');
    marker.setAttribute('cx', city.x);
    marker.setAttribute('cy', city.y);
    marker.setAttribute('r', '4');
    marker.style.setProperty('fill', '#198754', 'important');
    marker.style.setProperty('stroke', '#ffffff', 'important');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.classList.add('regional-center-label');
    label.setAttribute('x', city.x + 8);
    label.setAttribute('y', city.y + 4);
    label.textContent = city.name;

    markerGroup.append(marker, label);
    if (isInteractiveCity) {
      markerGroup.setAttribute('role', 'button');
      markerGroup.setAttribute('tabindex', '0');
      markerGroup.setAttribute('aria-label', `Відкрити ${getRegionName(regionId)}`);
      markerGroup.style.pointerEvents = 'all';
      markerGroup.addEventListener('click', () => selectRegion(regionId));
      markerGroup.addEventListener('pointerenter', (event) => showRegionTooltip(regionId, event));
      markerGroup.addEventListener('pointermove', updateRegionTooltipPosition);
      markerGroup.addEventListener('pointerleave', hideRegionTooltip);
      markerGroup.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectRegion(regionId);
        }
      });
    }
    labelLayer.append(markerGroup);
  });

  mapSvg.appendChild(labelLayer);
}

function loadSvgWithXhr(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 0) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`XHR failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('XHR network error'));
    xhr.send();
  });
}

function getInteractiveShape(group) {
  return group.querySelector('path, polygon, circle, rect, ellipse');
}

function normalizeMapRegionId(group) {
  const shape = getInteractiveShape(group);
  if (shape?.id === 'UA30') return 'kyiv_oblast';
  if (shape?.id === 'UA32') return 'kyiv_city';
  return group.getAttribute('data-region');
}

function setupMapInteractions() {
  const svgGroups = mapSvg.querySelectorAll('g[data-region]');

  svgGroups.forEach(group => {
    const regionId = normalizeMapRegionId(group);
    group.setAttribute('data-region', regionId);
    const shapes = Array.from(group.querySelectorAll('path, polygon, circle, rect, ellipse'));
    if (shapes.length === 0) return;

    group.setAttribute('tabindex', '0');
    group.setAttribute('role', 'button');
    group.setAttribute('aria-label', `Виберіть регіон: ${getRegionName(regionId)}`);
    group.style.cursor = 'pointer';
    group.style.pointerEvents = 'visiblePainted';

    group.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRegion(regionId);
      }
    });

    group.addEventListener('pointerenter', (event) => showRegionTooltip(regionId, event));
    group.addEventListener('pointermove', updateRegionTooltipPosition);
    group.addEventListener('pointerleave', hideRegionTooltip);

    shapes.forEach(shape => {
      shape.classList.add('oblast');
      shape.style.pointerEvents = 'visiblePainted';
      shape.setAttribute('tabindex', '0');
      shape.setAttribute('role', 'button');
      shape.setAttribute('aria-label', `Виберіть регіон: ${getRegionName(regionId)}`);
      shape.addEventListener('click', () => selectRegion(regionId));
      shape.addEventListener('pointerenter', (event) => showRegionTooltip(regionId, event));
      shape.addEventListener('pointermove', updateRegionTooltipPosition);
      shape.addEventListener('pointerleave', hideRegionTooltip);
      shape.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectRegion(regionId);
        }
      });
    });
  });

  mapSvg.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const group = target.closest('g[data-region]');
    if (!group || !mapSvg.contains(group)) return;
    const regionId = normalizeMapRegionId(group);
    if (regionId) {
      selectRegion(regionId);
    }
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
  if (!region || !getDatabaseRegion(regionId)) {
    hideRegionTooltip();
    return;
  }

  const regionPageSlug = regionId;
  const regionPageUrl = `./regions/${regionPageSlug}.html`;

  currentSelectedRegion = regionId;
  updateUrlState(regionId);
  highlightMapRegion(regionId);
  window.location.href = regionPageUrl;
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
    const shapes = Array.from(group.querySelectorAll('path, polygon, circle, rect, ellipse'));
    shapes.forEach(shape => {
      shape.classList.add('active');
      if (shape instanceof SVGGraphicsElement) {
        shape.focus();
      }
    });
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

async function loadDatabaseRegions() {
  const response = await fetch('/api/regions');
  if (!response.ok) throw new Error(`Unable to fetch regions: ${response.status}`);
  databaseRegions = await response.json();
}

function normalizeRegionName(name) {
  return String(name || '')
    .toLocaleLowerCase('uk-UA')
    .replace(/област?на\s+фгрб$/i, '')
    .replace(/\s+фгрб$/i, '')
    .replace(/область$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDatabaseRegion(regionId) {
  const staticRegion = regionsData?.[regionId];
  const targetName = normalizeRegionName(staticRegion?.name || getRegionName(regionId));
  const aliases = {
    kyiv_city: 'київська фгрб',
    kyiv_oblast: 'київська областна фгрб',
    vinnytsia_city: 'вінниця фгрб',
    zhmerynka: 'фгрб м. жмеринка',
  };
  const exactName = aliases[regionId];
  if (exactName) {
    const exactMatch = databaseRegions.find((region) => String(region.name || '').toLocaleLowerCase('uk-UA') === exactName);
    if (exactMatch) return exactMatch;
  }
  return databaseRegions.find((region) => normalizeRegionName(region.name) === targetName) || null;
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

function showRegionTooltip(regionId, event) {
  if (!mapTooltip) return;
  const region = getDatabaseRegion(regionId);
  renderRegionTooltip(regionId, region);
  mapTooltip.style.display = 'block';
  mapTooltip.setAttribute('aria-hidden', 'false');
  if (event) {
    updateRegionTooltipPosition(event);
  }
}

function renderRegionTooltip(regionId, region) {
  const fallbackName = getRegionName(regionId);
  if (!region) {
    mapTooltip.textContent = fallbackName;
    return;
  }

  const clubs = Array.isArray(region.clubs_dyussh) ? region.clubs_dyussh.slice(0, 3) : [];
  const clubMarkup = clubs.length
    ? `<ul class="map-tooltip__clubs">${clubs.map((club) => `
        <li class="map-tooltip__club">
          <img class="map-tooltip__club-photo" src="${escapeTooltipAttribute(club.photo || 'assets/images/No-photo-m.png')}" alt="" />
          <span>${escapeTooltipText(club.name)}</span>
        </li>`).join('')}</ul>`
    : '<div class="map-tooltip__empty">Клубів ще немає</div>';

  const presidentPhoto = region.president_photo || 'assets/images/No-photo-m.png';

  mapTooltip.innerHTML = `
    <div class="map-tooltip__header">
      <img class="map-tooltip__flag" src="${escapeTooltipAttribute(region.photo)}" alt="" />
      <strong>${escapeTooltipText(region.name)}</strong>
    </div>
    <div class="map-tooltip__president">
      <img class="map-tooltip__president-photo" src="${escapeTooltipAttribute(presidentPhoto)}" alt="" />
      <span><b>Президент:</b><br />${escapeTooltipText(region.president || 'Не вказано')}</span>
    </div>
    <div class="map-tooltip__clubs-title"><b>Клуби:</b></div>
    ${clubMarkup}`;
}

function escapeTooltipText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function escapeTooltipAttribute(value) {
  return escapeTooltipText(value).replace(/javascript:/gi, '');
}

function updateRegionTooltipPosition(event) {
  if (!mapTooltip) return;
  const offset = 14;
  const x = Math.min(window.innerWidth - mapTooltip.offsetWidth - offset, event.clientX + offset);
  const y = Math.min(window.innerHeight - mapTooltip.offsetHeight - offset, event.clientY + offset);
  mapTooltip.style.left = `${x}px`;
  mapTooltip.style.top = `${y}px`;
}

function hideRegionTooltip() {
  if (!mapTooltip) return;
  mapTooltip.style.display = 'none';
  mapTooltip.setAttribute('aria-hidden', 'true');
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
