const API_BASE = (window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:4000') + '/api';
const competitionsGrid = document.getElementById('competitionsGrid');
const emptyState = document.getElementById('emptyState');
const categoryFilter = document.getElementById('categoryFilter');
const citySearch = document.getElementById('citySearch');
const statusFilter = document.getElementById('statusFilter');

let allCompetitions = [];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
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

// Event listeners
categoryFilter.addEventListener('change', applyFilters);
citySearch.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// Initial load
loadCompetitions();
