const API_BASE = (window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:4000') + '/api';
const competitionsList = document.getElementById('competitionsList');
const newCompetitionBtn = document.getElementById('newCompetitionBtn');
const competitionFormPanel = document.getElementById('competitionFormPanel');
const formTitle = document.getElementById('formTitle');
const competitionForm = document.getElementById('competitionForm');
const competitionIdInput = document.getElementById('competitionId');
const competitionTitleInput = document.getElementById('competitionTitle');
const competitionCityInput = document.getElementById('competitionCity');
const competitionCategorySelect = document.getElementById('competitionCategory');
const competitionStatusSelect = document.getElementById('competitionStatus');
const competitionDateInput = document.getElementById('competitionDate');
const competitionDescriptionInput = document.getElementById('competitionDescription');
const coverPreview = document.getElementById('coverPreview');
const coverInput = document.getElementById('coverInput');
const weightCategoriesList = document.getElementById('weightCategoriesList');
const addWeightBtn = document.getElementById('addWeightBtn');
const cancelCompetitionBtn = document.getElementById('cancelCompetitionBtn');
const searchInput = document.getElementById('searchCompetitions');

let competitions = [];
let activeEditId = null;
let weightCategories = [];

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setFormValues(item = null) {
  activeEditId = item ? item.id : null;
  competitionIdInput.value = item ? item.id : '';
  competitionTitleInput.value = item ? item.title : '';
  competitionCityInput.value = item ? item.city : '';
  competitionCategorySelect.value = item ? item.category : '';
  competitionStatusSelect.value = item ? item.status : 'planned';
  competitionDateInput.value = item ? formatDatetimeLocal(item.event_date) : '';
  competitionDescriptionInput.value = item ? (item.description || '') : '';
  coverPreview.src = item ? item.cover_image : '';
  coverPreview.style.display = item ? 'block' : 'none';
  formTitle.textContent = item ? 'Редагувати змагання' : 'Нове змагання';

  weightCategories = item ? (item.weight_categories || []).map(w => ({ ...w })) : [];
  renderWeightCategories();
  competitionFormPanel.classList.remove('hidden');
}

function hideForm() {
  competitionFormPanel.classList.add('hidden');
  competitionForm.reset();
  coverPreview.src = '';
  coverPreview.style.display = 'none';
  activeEditId = null;
  weightCategories = [];
  renderWeightCategories();
}

function renderWeightCategories() {
  weightCategoriesList.innerHTML = weightCategories
    .map((w, index) => `
      <div class="weight-category-item">
        <input type="text" class="weight-name" placeholder="Назва ваги (напр. 55 кг)" value="${w.weight_name || ''}" />
        <input type="url" class="bracket-link" placeholder="Посилання на сітку (необов'язково)" value="${w.bracket_link || ''}" />
        <button type="button" class="remove-weight-btn" data-index="${index}">Видалити</button>
      </div>
    `)
    .join('');

  document.querySelectorAll('.remove-weight-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(btn.getAttribute('data-index'));
      weightCategories.splice(index, 1);
      renderWeightCategories();
    });
  });
}

function renderCompetitionsList(items) {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const text = `${item.title} ${item.city} ${item.category}`.toLowerCase();
    return text.includes(query);
  });

  if (!filtered.length) {
    competitionsList.innerHTML = '<div class="empty-state"><h3>Змагань не знайдено</h3><p>Спробуйте змінити пошук або створити змагання.</p></div>';
    return;
  }

  competitionsList.innerHTML = filtered
    .map((item) => `
      <div class="admin-news-card">
        <div class="news-card-head">
          <div>
            <p class="news-card-category">${item.category === 'Ukraine' ? 'Україна' : 'Міжнародне'}</p>
            <h4>${item.title}</h4>
            <p class="news-card-category">${item.city}</p>
          </div>
          <span class="news-card-date">${formatDate(item.event_date)}</span>
        </div>
        <p class="news-card-description">${item.description || 'Без опису'}</p>
        <div class="admin-news-actions">
          <button type="button" data-action="edit" data-id="${item.id}">Редагувати</button>
          <button type="button" data-action="delete" data-id="${item.id}">Видалити</button>
        </div>
      </div>
    `)
    .join('');
}

async function loadCompetitions() {
  try {
    const response = await fetch(`${API_BASE}/competitions`);
    if (!response.ok) {
      competitionsList.innerHTML = '<div class="empty-state"><h3>Помилка завантаження змагань</h3></div>';
      return;
    }
    competitions = await response.json();
    renderCompetitionsList(competitions);
  } catch (error) {
    console.error('Error loading competitions:', error);
    competitionsList.innerHTML = '<div class="empty-state"><h3>Помилка завантаження змагань</h3></div>';
  }
}

async function deleteCompetition(id) {
  if (!confirm('Ви дійсно хочете видалити це змагання?')) return;
  try {
    const response = await fetch(`${API_BASE}/competitions/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await loadCompetitions();
    } else {
      alert('Не вдалося видалити змагання.');
    }
  } catch (error) {
    console.error('Error deleting competition:', error);
    alert('Не вдалося видалити змагання.');
  }
}

async function saveCompetition(event) {
  event.preventDefault();

  const title = competitionTitleInput.value.trim();
  const city = competitionCityInput.value.trim();
  const category = competitionCategorySelect.value;
  const status = competitionStatusSelect.value;
  const event_date = competitionDateInput.value;
  const description = competitionDescriptionInput.value.trim();

  if (!title || !city || !category || !status || !event_date) {
    alert('Заповніть усі обов\'язкові поля.');
    return;
  }

  // Collect weight categories from form inputs
  const formWeights = [];
  document.querySelectorAll('.weight-category-item').forEach((item) => {
    const name = item.querySelector('.weight-name').value.trim();
    if (name) {
      formWeights.push({
        id: weightCategories[Array.from(document.querySelectorAll('.weight-category-item')).indexOf(item)]?.id,
        weight_name: name,
        bracket_link: item.querySelector('.bracket-link').value.trim() || null,
      });
    }
  });

  const formData = new FormData();
  formData.append('title', title);
  formData.append('city', city);
  formData.append('category', category);
  formData.append('status', status);
  formData.append('event_date', new Date(event_date).toISOString());
  formData.append('description', description);
  formData.append('weight_categories', JSON.stringify(formWeights));

  // Collect deleted weight IDs if editing
  if (activeEditId) {
    const deletedIds = (weightCategories || [])
      .filter(w => w.id && !formWeights.some(fw => fw.id === w.id))
      .map(w => w.id);
    if (deletedIds.length) {
      formData.append('deleted_weight_ids', JSON.stringify(deletedIds));
    }
  }

  if (coverInput.files[0]) {
    formData.append('cover_image', coverInput.files[0]);
  }

  const method = activeEditId ? 'PUT' : 'POST';
  const url = `${API_BASE}/competitions${activeEditId ? `/${activeEditId}` : ''}`;

  try {
    const response = await fetch(url, { method, body: formData });

    if (response.ok) {
      await loadCompetitions();
      hideForm();
    } else {
      const error = await response.json();
      alert(error.message || 'Не вдалося зберегти змагання.');
    }
  } catch (error) {
    console.error('Error saving competition:', error);
    alert('Не вдалося зберегти змагання.');
  }
}

// Event listeners
newCompetitionBtn.addEventListener('click', () => setFormValues());
cancelCompetitionBtn.addEventListener('click', (e) => {
  e.preventDefault();
  hideForm();
});

addWeightBtn.addEventListener('click', (e) => {
  e.preventDefault();
  weightCategories.push({ weight_name: '', bracket_link: '' });
  renderWeightCategories();
});

competitionForm.addEventListener('submit', saveCompetition);

coverInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      coverPreview.src = evt.target.result;
      coverPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

competitionsList.addEventListener('click', (e) => {
  if (e.target.dataset.action === 'edit') {
    const id = parseInt(e.target.dataset.id);
    const competition = competitions.find(c => c.id === id);
    if (competition) setFormValues(competition);
  } else if (e.target.dataset.action === 'delete') {
    const id = parseInt(e.target.dataset.id);
    deleteCompetition(id);
  }
});

searchInput.addEventListener('input', () => renderCompetitionsList(competitions));

// Initial load
loadCompetitions();
