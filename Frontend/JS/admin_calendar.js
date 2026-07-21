const isLocalFileProtocol = window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null';
const API_BASE = (isLocalFileProtocol ? 'http://localhost:4000' : window.location.origin) + '/api';
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

const createEventBtn = document.getElementById('createEventBtn');
const searchEventBtn = document.getElementById('searchEventBtn');
const editEventBtn = document.getElementById('editEventBtn');
const newCalendarYearBtn = document.getElementById('newCalendarYearBtn');
const editCalendarYearBtn = document.getElementById('editCalendarYearBtn');

const eventFormPanel = document.getElementById('eventFormPanel');
const eventForm = document.getElementById('eventForm');
const eventIdInput = document.getElementById('eventId');
const eventTitleInput = document.getElementById('eventTitle');
const eventTypeSelect = document.getElementById('eventType');
const eventStartInput = document.getElementById('eventStart');
const eventEndInput = document.getElementById('eventEnd');
const eventLocationInput = document.getElementById('eventLocation');
const eventResultsUrlInput = document.getElementById('eventResultsUrl');
const eventRegulationPdfInput = document.getElementById('eventRegulationPdf');
const eventRegulationInfo = document.getElementById('eventRegulationInfo');
const removeRegulationLabel = document.getElementById('removeRegulationLabel');
const removeRegulationCheckbox = document.getElementById('removeRegulationPdf');
const eventDescriptionInput = document.getElementById('eventDescription');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const deleteEventBtn = document.getElementById('deleteEventBtn');

const eventSearchPanel = document.getElementById('eventSearchPanel');
const eventSearchInput = document.getElementById('eventSearchInput');
const eventSearchYear = document.getElementById('eventSearchYear');
const eventResultsList = document.getElementById('eventResultsList');

const yearFormPanel = document.getElementById('yearFormPanel');
const yearManagementPanel = document.getElementById('yearManagementPanel');
const yearForm = document.getElementById('yearForm');
const yearInput = document.getElementById('yearInput');
const yearPdfInput = document.getElementById('yearPdfInput');
const cancelYearBtn = document.getElementById('cancelYearBtn');
const largestYearDisplay = document.getElementById('largestYearDisplay');
const yearManagementList = document.getElementById('yearManagementList');
const yearEditForm = document.getElementById('yearEditForm');
const yearEditIdInput = document.getElementById('yearEditId');
const yearEditValueInput = document.getElementById('yearEditValue');
const yearEditPdfInput = document.getElementById('yearEditPdfInput');
const yearEditPdfInfo = document.getElementById('yearEditPdfInfo');
const removeYearPdfLabel = document.getElementById('removeYearPdfLabel');
const removeYearPdfCheckbox = document.getElementById('removeYearPdfCheckbox');
const cancelYearEditBtn = document.getElementById('cancelYearEditBtn');
const deleteYearBtn = document.getElementById('deleteYearBtn');

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

function setPanelVisibility(panelToShow) {
  [eventFormPanel, eventSearchPanel, yearFormPanel, yearManagementPanel].forEach((panel) => {
    if (!panel) return;
    panel.classList.toggle('hidden', panel !== panelToShow);
  });
}

let activeCalendarYearId = null;
let activeCalendarYearYear = null;
const calendarYearMap = new Map();
let editingCalendarYearId = null;
let calendarYears = [];

function resetEventForm() {
  eventIdInput.value = '';
  eventTitleInput.value = '';
  eventTypeSelect.value = '';
  eventStartInput.value = '';
  eventEndInput.value = '';
  eventLocationInput.value = '';
  eventResultsUrlInput.value = '';
  eventRegulationPdfInput.value = '';
  eventRegulationInfo.textContent = 'Файл не додано.';
  removeRegulationCheckbox.checked = false;
  removeRegulationLabel.classList.add('hidden');
  eventDescriptionInput.value = '';
  deleteEventBtn.classList.add('hidden');
  editingCalendarYearId = null;
}

function resetYearEditForm() {
  yearEditIdInput.value = '';
  yearEditValueInput.value = '';
  yearEditPdfInput.value = '';
  yearEditPdfInfo.textContent = 'Файл не додано.';
  removeYearPdfCheckbox.checked = false;
  removeYearPdfLabel.classList.add('hidden');
  deleteYearBtn.classList.add('hidden');
}

function populateYearEditForm(yearItem = null) {
  resetYearEditForm();
  if (!yearItem) return;

  yearEditIdInput.value = yearItem.id;
  yearEditValueInput.value = yearItem.year;
  if (yearItem.pdf_file) {
    yearEditPdfInfo.textContent = 'Існуючий PDF додано.';
    removeYearPdfLabel.classList.remove('hidden');
  }
  deleteYearBtn.classList.remove('hidden');
}

function renderYearManagementList(years) {
  calendarYears = years || [];
  if (!yearManagementList) return;

  if (!calendarYears.length) {
    yearManagementList.innerHTML = '<div class="empty-state"><h3>Років не знайдено</h3><p>Створіть перший рік календаря.</p></div>';
    return;
  }

  yearManagementList.innerHTML = calendarYears
    .map((year) => `
      <div class="admin-news-card">
        <div class="news-card-head">
          <div>
            <p class="news-card-category">Календар</p>
            <h4>${year.year}</h4>
          </div>
          <span class="news-card-date">${year.pdf_file ? 'PDF є' : 'PDF відсутній'}</span>
        </div>
        <div class="admin-news-actions">
          <button type="button" data-action="select-year" data-id="${year.id}">Вибрати</button>
          <button type="button" data-action="delete-year" data-id="${year.id}">Видалити</button>
        </div>
      </div>
    `)
    .join('');
}

function setEventFormValues(event = null) {
  resetEventForm();
  if (!event) return;

  eventIdInput.value = event.id;
  eventTitleInput.value = event.title || '';
  eventTypeSelect.value = event.event_type || '';
  eventStartInput.value = event.start_date ? event.start_date.replace('Z', '') : '';
  eventEndInput.value = event.end_date ? event.end_date.replace('Z', '') : '';
  eventLocationInput.value = event.location || '';
  eventResultsUrlInput.value = event.results_url || '';
  if (event.regulation_pdf) {
    eventRegulationInfo.textContent = 'Існуючий файл додано.';
    removeRegulationLabel.classList.remove('hidden');
  }
  editingCalendarYearId = event.calendar_year_id || null;
  eventDescriptionInput.value = event.description || '';
  deleteEventBtn.classList.remove('hidden');
}

function buildEventCard(event) {
  return `
    <div class="admin-news-card">
      <div class="news-card-head">
        <div>
          <p class="news-card-category">${event.event_type || 'Подія'}</p>
          <h4>${event.title || 'Без назви'}</h4>
          <p class="news-card-category">Рік: ${event.year || ''}</p>
        </div>
        <span class="news-card-date">${event.dates || ''}</span>
      </div>
      <p class="news-card-description">${event.location || 'Без локації'}</p>
      <div class="admin-news-actions">
        <button type="button" data-action="edit-event" data-id="${event.id}">Редагувати</button>
        <button type="button" data-action="delete-event" data-id="${event.id}">Видалити</button>
      </div>
    </div>
  `;
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

eventSearchInput.addEventListener('input', async () => {
  const query = eventSearchInput.value.trim();
  await loadCalendarEvents(query, eventSearchYear.value);
});

eventSearchYear.addEventListener('change', async () => {
  await loadCalendarEvents(eventSearchInput.value.trim(), eventSearchYear.value);
});

createEventBtn.addEventListener('click', () => {
  setPanelVisibility(eventFormPanel);
  resetEventForm();
});

searchEventBtn.addEventListener('click', () => {
  setPanelVisibility(eventSearchPanel);
});

editEventBtn.addEventListener('click', () => {
  setPanelVisibility(eventSearchPanel);
});

newCalendarYearBtn.addEventListener('click', () => {
  setPanelVisibility(yearFormPanel);
  resetYearEditForm();
});

editCalendarYearBtn.addEventListener('click', () => {
  setPanelVisibility(yearManagementPanel);
  renderYearManagementList(calendarYears);
});

cancelEventBtn.addEventListener('click', (e) => {
  e.preventDefault();
  setPanelVisibility(null);
});

yearForm.addEventListener('submit', saveCalendarYear);
yearEditForm.addEventListener('submit', saveCalendarYearEdit);
cancelYearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  setPanelVisibility(null);
});
cancelYearEditBtn.addEventListener('click', (e) => {
  e.preventDefault();
  setPanelVisibility(null);
  resetYearEditForm();
});

eventForm.addEventListener('submit', saveCalendarEvent);

deleteEventBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const eventId = eventIdInput.value;
  if (!eventId) return;
  if (!confirm('Ви дійсно хочете видалити цю подію?')) return;
  await deleteCalendarEvent(eventId);
});

deleteYearBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const yearId = yearEditIdInput.value;
  if (!yearId) return;
  if (!confirm('Ви дійсно хочете видалити цей рік календаря? Це також видалить події цього року.')) return;
  await deleteCalendarYear(yearId);
});

yearManagementList.addEventListener('click', async (e) => {
  const button = e.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const yearId = button.dataset.id;
  if (!yearId) return;

  const yearItem = calendarYears.find((item) => String(item.id) === String(yearId));
  if (!yearItem) return;

  if (action === 'select-year') {
    populateYearEditForm(yearItem);
    setPanelVisibility(yearManagementPanel);
    return;
  }

  if (action === 'delete-year') {
    if (!confirm('Ви дійсно хочете видалити цей рік календаря? Це також видалить події цього року.')) return;
    await deleteCalendarYear(yearId);
  }
});

async function loadCalendarYears() {
  try {
    const response = await fetch(`${API_BASE}/calendar/years`);
    if (!response.ok) return;
    const years = await response.json();
    fillYearSelects(years);
  } catch (error) {
    console.error('Error loading calendar years:', error);
  }
}

function fillYearSelects(years) {
  calendarYears = years || [];
  calendarYearMap.clear();
  calendarYears.forEach((year) => {
    calendarYearMap.set(String(year.year), year.id);
  });

  if (eventSearchYear) {
    eventSearchYear.innerHTML = '<option value="">Усі роки</option>' + calendarYears
      .map((year) => `<option value="${year.year}">${year.year}</option>`)
      .join('');
  }
  if (largestYearDisplay) {
    const maxYearItem = calendarYears.reduce((max, item) => (item.year > max.year ? item : max), calendarYears[0] || { year: '—', id: null });
    activeCalendarYearId = maxYearItem.id;
    activeCalendarYearYear = maxYearItem.year;
    largestYearDisplay.textContent = activeCalendarYearYear;
  }

  renderYearManagementList(calendarYears);
}

async function loadCalendarEvents(query = '', year = '') {
  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (year) params.set('year', year);

    const response = await fetch(`${API_BASE}/calendar/events/search?${params.toString()}`);
    if (!response.ok) {
      eventResultsList.innerHTML = '<div class="empty-state"><h3>Не вдалося завантажити події</h3></div>';
      return;
    }

    const events = await response.json();
    if (!events.length) {
      eventResultsList.innerHTML = '<div class="empty-state"><h3>Подій не знайдено</h3></div>';
      return;
    }

    eventResultsList.innerHTML = events.map(buildEventCard).join('');
  } catch (error) {
    console.error('Error loading calendar events:', error);
    eventResultsList.innerHTML = '<div class="empty-state"><h3>Не вдалося завантажити події</h3></div>';
  }
}

async function saveCalendarYear(event) {
  event.preventDefault();
  const yearValue = Number(yearInput.value);
  if (!Number.isInteger(yearValue) || yearValue < 1900) {
    alert('Вкажіть коректний рік.');
    return;
  }

  const formData = new FormData();
  formData.append('year', yearValue);
  if (yearPdfInput.files[0]) {
    formData.append('pdf_file', yearPdfInput.files[0]);
  }

  try {
    const response = await fetch(`${API_BASE}/calendar/years`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || 'Не вдалося створити рік.');
      return;
    }

    await loadCalendarYears();
    setPanelVisibility(null);
    yearForm.reset();
  } catch (error) {
    console.error('Error saving calendar year:', error);
    alert('Не вдалося створити рік.');
  }
}

async function saveCalendarYearEdit(event) {
  event.preventDefault();
  const yearId = yearEditIdInput.value;
  const yearValue = Number(yearEditValueInput.value);
  if (!yearId) {
    alert('Оберіть рік для редагування.');
    return;
  }
  if (!Number.isInteger(yearValue) || yearValue < 1900) {
    alert('Вкажіть коректний рік.');
    return;
  }

  const formData = new FormData();
  formData.append('year', yearValue);
  if (yearEditPdfInput.files[0]) {
    formData.append('pdf_file', yearEditPdfInput.files[0]);
  }
  if (removeYearPdfCheckbox.checked) {
    formData.append('remove_pdf', 'true');
  }

  try {
    const response = await fetch(`${API_BASE}/calendar/years/${yearId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || 'Не вдалося оновити рік.');
      return;
    }

    await loadCalendarYears();
    setPanelVisibility(yearManagementPanel);
  } catch (error) {
    console.error('Error updating calendar year:', error);
    alert('Не вдалося оновити рік.');
  }
}

async function deleteCalendarYear(id) {
  try {
    const response = await fetch(`${API_BASE}/calendar/years/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const error = await response.json();
      alert(error.message || 'Не вдалося видалити рік.');
      return;
    }

    await loadCalendarYears();
    resetYearEditForm();
    setPanelVisibility(yearManagementPanel);
  } catch (error) {
    console.error('Error deleting calendar year:', error);
    alert('Не вдалося видалити рік.');
  }
}

async function saveCalendarEvent(event) {
  event.preventDefault();
  const id = eventIdInput.value;
  const title = eventTitleInput.value.trim();
  const eventType = eventTypeSelect.value;
  const startDate = eventStartInput.value ? new Date(eventStartInput.value).toISOString() : '';
  const endDate = eventEndInput.value ? new Date(eventEndInput.value).toISOString() : '';
  const location = eventLocationInput.value.trim();
  const resultsUrl = eventResultsUrlInput.value.trim();
  const description = eventDescriptionInput.value.trim();
  const calendarYearId = id ? editingCalendarYearId : (calendarYearMap.get(eventSearchYear.value) || activeCalendarYearId);

  if (!title || !eventType || !calendarYearId) {
    alert('Заповніть усі обов’язкові поля.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('event_type', eventType);
  formData.append('start_date', startDate);
  formData.append('end_date', endDate);
  formData.append('location', location);
  formData.append('results_url', resultsUrl);
  formData.append('description', description);
  formData.append('calendar_year_id', calendarYearId);
  if (eventRegulationPdfInput.files[0]) {
    formData.append('regulation_pdf', eventRegulationPdfInput.files[0]);
  }
  if (removeRegulationCheckbox.checked) {
    formData.append('remove_regulation', 'true');
  }

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/calendar/events/${id}` : `${API_BASE}/calendar/events`;

  try {
    const response = await fetch(url, { method, body: formData });
    if (!response.ok) {
      const error = await response.json();
      alert(error.message || 'Не вдалося зберегти подію.');
      return;
    }
    await loadCalendarEvents();
    setPanelVisibility(null);
    resetEventForm();
  } catch (error) {
    console.error('Error saving calendar event:', error);
    alert('Не вдалося зберегти подію.');
  }
}

async function deleteCalendarEvent(id) {
  try {
    const response = await fetch(`${API_BASE}/calendar/events/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await loadCalendarEvents();
      setPanelVisibility(null);
      resetEventForm();
    } else {
      alert('Не вдалося видалити подію.');
    }
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    alert('Не вдалося видалити подію.');
  }
}

eventResultsList.addEventListener('click', async (e) => {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  if (!action || !id) return;

  if (action === 'edit-event') {
    try {
      const response = await fetch(`${API_BASE}/calendar/events/${id}`);
      if (!response.ok) throw new Error('Event fetch failed');
      const eventData = await response.json();
      setEventFormValues(eventData);
      setPanelVisibility(eventFormPanel);
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Не вдалося завантажити подію.');
    }
  }

  if (action === 'delete-event') {
    if (!confirm('Ви дійсно хочете видалити цю подію?')) return;
    await deleteCalendarEvent(id);
  }
});

// Initial load
loadCompetitions();
loadCalendarYears().then(() => loadCalendarEvents()).catch((error) => {
  console.error('Error initializing calendar admin:', error);
});
