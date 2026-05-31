const API_BASE = (window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:4000') + '/api';

const competitionDetails = document.getElementById('competitionDetails');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const compImage = document.getElementById('compImage');
const compTitle = document.getElementById('compTitle');
const compCategory = document.getElementById('compCategory');
const compStatus = document.getElementById('compStatus');
const compCity = document.getElementById('compCity');
const compDate = document.getElementById('compDate');
const compDescription = document.getElementById('compDescription');
const weightCategoriesSection = document.getElementById('weightCategoriesSection');
const weightCategoriesList = document.getElementById('weightCategoriesList');

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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

function renderWeightCategories(weights) {
  if (!weights || !weights.length) {
    weightCategoriesSection.classList.add('hidden');
    return;
  }

  weightCategoriesSection.classList.remove('hidden');
  weightCategoriesList.innerHTML = weights
    .map((w) => {
      if (w.bracket_link) {
        return `
          <li class="weight-category-item">
            <a href="${w.bracket_link}" target="_blank" rel="noopener noreferrer" class="bracket-link">
              ${w.weight_name} — Сітка
            </a>
          </li>
        `;
      } else {
        return `
          <li class="weight-category-item weight-category-empty">
            <span>${w.weight_name}</span>
            <span class="bracket-placeholder">Сітка недоступна</span>
          </li>
        `;
      }
    })
    .join('');
}

function renderCompetition(competition) {
  loadingState.classList.add('hidden');
  competitionDetails.classList.remove('hidden');

  compImage.src = competition.cover_image;
  compImage.alt = competition.title;
  compTitle.textContent = competition.title;
  compCategory.textContent = `Категорія: ${getCategoryLabel(competition.category)}`;
  compStatus.className = `comp-status ${getStatusClass(competition.status)}`;
  compStatus.textContent = getStatusLabel(competition.status);
  compCity.textContent = competition.city;
  compDate.textContent = formatDate(competition.event_date);
  compDescription.innerHTML = competition.description || '<p>Опис не надано.</p>';

  renderWeightCategories(competition.weight_categories);
}

function showError(message) {
  loadingState.classList.add('hidden');
  competitionDetails.classList.add('hidden');
  errorState.classList.remove('hidden');
  errorState.textContent = message || 'Не вдалося завантажити деталі змагання.';
}

async function loadCompetition() {
  const id = getIdFromUrl();

  if (!id) {
    showError('ID змагання не знайдено.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/competitions/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        showError('Змагання не знайдено.');
      } else {
        showError('Помилка завантаження змагання.');
      }
      return;
    }

    const competition = await response.json();
    renderCompetition(competition);
  } catch (error) {
    console.error('Error loading competition:', error);
    showError('Помилка завантаження змагання.');
  }
}

// Load on page load
loadCompetition();
