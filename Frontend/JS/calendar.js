const isLocalFileProtocol = window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null';
const API_BASE = (isLocalFileProtocol ? 'http://localhost:4000' : window.location.origin) + '/api';
const competitionsGrid = document.getElementById('competitionsGrid');
const emptyState = document.getElementById('emptyState');
const categoryFilter = document.getElementById('categoryFilter');
const citySearch = document.getElementById('citySearch');
const statusFilter = document.getElementById('statusFilter');
const visualCalendarContainer = document.getElementById('visualCalendar');
const pdfOpenBtn = document.getElementById('pdfOpenBtn');
const yearSwitcher = document.getElementById('yearSwitcher');

const calendarModal = document.getElementById('calendarEventModal');
const modalTitle = document.getElementById('calendarEventTitle');
const modalDate = document.getElementById('calendarEventDate');
const modalLocation = document.getElementById('calendarEventLocation');
const modalType = document.getElementById('calendarEventType');
const regulationBtn = document.getElementById('calendarRegulationBtn');
const resultsBtn = document.getElementById('calendarResultsBtn');
const modalCloseButtons = document.querySelectorAll('[data-modal-close]');

let allCompetitions = [];
let currentCalendarYear = null;
const visualCalendarEvents = new Map();

function getEventTypeLabel(type) {
  const labels = {
    міжнародне: 'Міжнародне',
    національне: 'Національне',
    чемпіонат: 'Чемпіонат',
    National: 'Національне',
    International: 'Міжнародне',
    Championship: 'Чемпіонат',
    'Training Camp': 'НТЗ',
  };
  return labels[type] || type || 'Подія';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateWithoutYear(dateStr) {
  if (!dateStr) return '';
  return String(dateStr)
    .replace(/\b\d{4}\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+—\s+$/, '')
    .trim();
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCategoryLabel(category) {
  return category === 'Ukraine' ? 'Україна' : 'Міжнародне';
}

function getStatusLabel(status) {
  const labels = {
    'planned': 'Заплановано',
    'live': 'Йде',
    'completed': 'Завершено',
  };
  return labels[status] || status;
}

function getStatusClass(status) {
  return `status-${status}`;
}

function getEventTypeClass(type) {
  const normalizedType = String(type || '').trim().toLowerCase();
  if (normalizedType === 'міжнародне' || normalizedType === 'international') {
    return 'type-international';
  }
  if (normalizedType === 'чемпіонат' || normalizedType === 'championship') {
    return 'type-championship';
  }
  if (normalizedType === 'національне' || normalizedType === 'national') {
    return 'type-national';
  }
  return 'type-training-camp';
}

function updateModalButton(button, url) {
  if (!button) return;

  if (url) {
    button.classList.remove('disabled');
    button.removeAttribute('aria-disabled');
    button.href = url;
  } else {
    button.classList.add('disabled');
    button.setAttribute('aria-disabled', 'true');
    button.href = '#';
  }
}

function openEventModal(eventData) {
  if (!calendarModal || !eventData) return;

  const typeValue = eventData.event_type || eventData.type || '';
  const typeLabel = getEventTypeLabel(typeValue);
  const typeClass = getEventTypeClass(typeValue);

  modalTitle.textContent = eventData.title || 'Подія';
  modalType.textContent = typeLabel;
  modalType.className = `event-badge ${typeClass}`;
  modalDate.textContent = formatDateWithoutYear(eventData.dates) || 'Немає даних';
  modalLocation.textContent = eventData.location || 'Немає даних';
  updateModalButton(regulationBtn, eventData.regulation_pdf);
  updateModalButton(resultsBtn, eventData.results_url);

  calendarModal.classList.add('active');
  calendarModal.setAttribute('aria-hidden', 'false');
}

function closeEventModal() {
  if (!calendarModal) return;
  calendarModal.classList.remove('active');
  calendarModal.setAttribute('aria-hidden', 'true');
}

function setupEventModal() {
  if (!visualCalendarContainer) return;

  visualCalendarContainer.addEventListener('click', (event) => {
    let eventCard = event.target;
    while (eventCard && eventCard !== visualCalendarContainer) {
      if (eventCard.classList && eventCard.classList.contains('calendar-month-event')) break;
      eventCard = eventCard.parentElement;
    }
    if (!eventCard || eventCard === visualCalendarContainer) return;

    const eventId = String(eventCard.dataset.eventId);
    const eventData = visualCalendarEvents.get(eventId);
    if (eventData) {
      openEventModal(eventData);
    }
  });

  visualCalendarContainer.addEventListener('keydown', (event) => {
    const eventCard = event.target.closest?.('.calendar-month-event');
    if (!eventCard) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const eventId = eventCard.dataset.eventId;
      const eventData = visualCalendarEvents.get(eventId);
      if (eventData) {
        openEventModal(eventData);
      }
    }
  });

  modalCloseButtons.forEach((button) => {
    button.addEventListener('click', closeEventModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && calendarModal?.classList.contains('active')) {
      closeEventModal();
    }
  });
}

function setActiveYear(year) {
  currentCalendarYear = year;
  const yearButtons = yearSwitcher ? Array.from(yearSwitcher.querySelectorAll('.year-pill')) : [];
  yearButtons.forEach((pill) => {
    const pillYear = parseInt(pill.textContent, 10);
    pill.classList.toggle('active', pillYear === year);
  });
  loadVisualCalendar(year);
}

function renderYearSwitcher(years, activeYear) {
  if (!yearSwitcher) return;
  yearSwitcher.innerHTML = years
    .map((year) => `
      <button type="button" class="year-pill${year === activeYear ? ' active' : ''}" data-year="${year}">${year}</button>
    `)
    .join('');

  yearSwitcher.querySelectorAll('.year-pill').forEach((button) => {
    button.addEventListener('click', () => {
      const year = Number(button.dataset.year);
      if (year && year !== currentCalendarYear) {
        setActiveYear(year);
      }
    });
  });
}

function renderCompetitions(competitions) {
  if (!competitions.length) {
    competitionsGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  competitionsGrid.innerHTML = competitions
    .map(
      (comp) => `
      <article class="competition-card" onclick="window.location.href='competition_details.html?id=${comp.id}'">
        <div class="competition-image">
          <img src="${comp.cover_image}" alt="${comp.title}" />
          <span class="competition-status ${getStatusClass(comp.status)}">${getStatusLabel(comp.status)}</span>
        </div>
        <div class="competition-info">
          <h3>${comp.title}</h3>
          <p class="competition-category">${getCategoryLabel(comp.category)}</p>
          <p class="competition-location">📍 ${comp.city}</p>
          <p class="competition-date">📅 ${formatDate(comp.event_date)} ${formatTime(comp.event_date)}</p>
        </div>
      </article>
    `
    )
    .join('');
}

function applyFilters() {
  const selectedCategory = categoryFilter.value;
  const selectedCity = citySearch.value.toLowerCase().trim();
  const selectedStatus = statusFilter.value;

  const filtered = allCompetitions.filter((comp) => {
    const categoryMatch = !selectedCategory || comp.category === selectedCategory;
    const cityMatch = !selectedCity || comp.city.toLowerCase().includes(selectedCity);
    const statusMatch = !selectedStatus || comp.status === selectedStatus;
    return categoryMatch && cityMatch && statusMatch;
  });

  renderCompetitions(filtered);
}

async function loadCompetitions() {
  try {
    const response = await fetch(`${API_BASE}/competitions`);
    if (!response.ok) {
      competitionsGrid.innerHTML = '<p>Помилка завантаження змагань</p>';
      return;
    }
    allCompetitions = await response.json();
    applyFilters();
  } catch (error) {
    console.error('Error loading competitions:', error);
    competitionsGrid.innerHTML = '<p>Помилка завантаження змагань</p>';
  }
}

function renderVisualCalendar(months) {
  if (!visualCalendarContainer) return;
  if (!Array.isArray(months) || months.length === 0) {
    visualCalendarContainer.innerHTML = '<div class="calendar-error">Календар наразі недоступний.</div>';
    return;
  }

  visualCalendarEvents.clear();
  visualCalendarContainer.innerHTML = months
    .map((month) => {
      const monthEvents = month.events
        .map((event, index) => {
          const eventId = String(event.id != null ? event.id : `${month.month}-${index}`);
          visualCalendarEvents.set(eventId, event);
          const typeValue = event.event_type || event.type || '';
          return `
            <article class="calendar-month-event" data-event-id="${eventId}" tabindex="0">
              <div class="event-meta">
                <span class="event-date">${formatDateWithoutYear(event.dates)}</span>
                <span class="event-badge ${getEventTypeClass(typeValue)}" aria-label="${getEventTypeLabel(typeValue)}">${getEventTypeLabel(typeValue)}</span>
              </div>
              <h3>${event.title}</h3>
              <p>${event.location || ''}</p>
            </article>
          `;
        })
        .join('');

      return `
        <article class="calendar-month-card">
          <div class="calendar-month-header">
            <span>${month.month}</span>
          </div>
          <div class="calendar-month-events">
            ${monthEvents}
          </div>
        </article>
      `;
    })
    .join('');

  visualCalendarContainer.querySelectorAll('.calendar-month-event').forEach((card) => {
    card.addEventListener('click', () => {
      const eventId = String(card.dataset.eventId);
      const eventData = visualCalendarEvents.get(eventId);
      if (eventData) {
        openEventModal(eventData);
      }
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const eventId = String(card.dataset.eventId);
        const eventData = visualCalendarEvents.get(eventId);
        if (eventData) {
          openEventModal(eventData);
        }
      }
    });
  });
}

async function loadVisualCalendar(year = currentCalendarYear) {
  if (!visualCalendarContainer) return;
  currentCalendarYear = year;
  try {
    const response = await fetch(`${API_BASE}/calendar/${year}`);
    if (!response.ok) {
      visualCalendarContainer.innerHTML = '<div class="calendar-error">Не вдалося завантажити календар.</div>';
      if (pdfOpenBtn) {
        pdfOpenBtn.classList.add('disabled');
        pdfOpenBtn.setAttribute('aria-disabled', 'true');
        pdfOpenBtn.href = '#';
      }
      return;
    }

    const calendarData = await response.json();
    if (pdfOpenBtn) {
      if (calendarData.pdf_url) {
        pdfOpenBtn.classList.remove('disabled');
        pdfOpenBtn.removeAttribute('aria-disabled');
        pdfOpenBtn.href = calendarData.pdf_url;
      } else {
        pdfOpenBtn.classList.add('disabled');
        pdfOpenBtn.setAttribute('aria-disabled', 'true');
        pdfOpenBtn.href = '#';
      }
    }
    renderVisualCalendar(calendarData.months);
  } catch (error) {
    console.error('Error loading visual calendar:', error);
    visualCalendarContainer.innerHTML = '<div class="calendar-error">Не вдалося завантажити календар.</div>';
    if (pdfOpenBtn) {
      pdfOpenBtn.classList.add('disabled');
      pdfOpenBtn.setAttribute('aria-disabled', 'true');
      pdfOpenBtn.href = '#';
    }
  }
}

// Event listeners
categoryFilter.addEventListener('change', applyFilters);
citySearch.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);

setupEventModal();

async function loadCalendarYears() {
  try {
    const response = await fetch(`${API_BASE}/calendar/years`);
    if (!response.ok) {
      console.error('Не вдалося завантажити роки календаря.');
      return;
    }
    const years = await response.json();
    if (!years.length) return;
    const yearNumbers = years.map((year) => year.year);
    const activeYear = yearNumbers.includes(currentCalendarYear)
      ? currentCalendarYear
      : yearNumbers[yearNumbers.length - 1];
    renderYearSwitcher(yearNumbers, activeYear);
    setActiveYear(activeYear);
  } catch (error) {
    console.error('Error loading calendar years:', error);
  }
}

// Initial load
loadCompetitions();
loadCalendarYears();
