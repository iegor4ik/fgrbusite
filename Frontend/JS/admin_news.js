const API_BASE = (window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:4000') + '/api';
const newsList = document.getElementById('newsList');
const newNewsBtn = document.getElementById('newNewsBtn');
const newsFormPanel = document.getElementById('newsFormPanel');
const formTitle = document.getElementById('formTitle');
const newsForm = document.getElementById('newsForm');
const newsIdInput = document.getElementById('newsId');
const newsTitleInput = document.getElementById('newsTitle');
const newsCategorySelect = document.getElementById('newsCategory');
const newsDateInput = document.getElementById('newsDate');
const newsShortInput = document.getElementById('newsShort');
const coverPreview = document.getElementById('coverPreview');
const coverInput = document.getElementById('coverInput');
const editor = document.getElementById('editor');
const editorToolbar = document.getElementById('editorToolbar');
const insertImageInput = document.getElementById('insertImageInput');
const cancelNewsBtn = document.getElementById('cancelNewsBtn');
const searchInput = document.getElementById('searchNews');

let newsItems = [];
let activeEditId = null;

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function setFormValues(item = null) {
  activeEditId = item ? item.id : null;
  newsIdInput.value = item ? item.id : '';
  newsTitleInput.value = item ? item.title : '';
  newsCategorySelect.value = item ? item.category : 'Змагання';
  newsDateInput.value = item ? new Date(item.news_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  newsShortInput.value = item ? item.short_description : '';
  editor.innerHTML = item ? item.content : '<p>Введіть текст новини...</p>';
  coverPreview.src = item ? item.cover_image : '';
  coverPreview.style.display = item ? 'block' : 'none';
  formTitle.textContent = item ? 'Редагувати новину' : 'Нова новина';
  newsFormPanel.classList.remove('hidden');
}

function hideForm() {
  newsFormPanel.classList.add('hidden');
  newsForm.reset();
  editor.innerHTML = '<p>Введіть текст новини...</p>';
  coverPreview.src = '';
  coverPreview.style.display = 'none';
  activeEditId = null;
}

function renderNewsList(items) {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const text = `${item.title} ${item.category} ${item.short_description}`.toLowerCase();
    return text.includes(query);
  });

  if (!filtered.length) {
    newsList.innerHTML = '<div class="empty-state"><h3>Новин не знайдено</h3><p>Спробуйте змінити пошук або створити новину.</p></div>';
    return;
  }

  newsList.innerHTML = filtered
    .map((item) => `
      <div class="admin-news-card">
        <div class="news-card-head">
          <div>
            <p class="news-card-category">${item.category}</p>
            <h4>${item.title}</h4>
          </div>
          <span class="news-card-date">${formatDate(item.news_date)}</span>
        </div>
        <p class="news-card-description">${item.short_description}</p>
        <div class="admin-news-actions">
          <button type="button" data-action="edit" data-id="${item.id}">Редагувати</button>
          <button type="button" data-action="delete" data-id="${item.id}">Видалити</button>
        </div>
      </div>
    `)
    .join('');
}

async function loadNews() {
  const response = await fetch(`${API_BASE}/news`);
  if (!response.ok) {
    newsList.innerHTML = '<div class="empty-state"><h3>Помилка завантаження новин</h3></div>';
    return;
  }
  newsItems = await response.json();
  renderNewsList(newsItems);
}

async function deleteNews(id) {
  if (!confirm('Ви дійсно хочете видалити цю новину?')) return;
  const response = await fetch(`${API_BASE}/news/${id}`, { method: 'DELETE' });
  if (response.ok) {
    await loadNews();
  } else {
    alert('Не вдалося видалити новину.');
  }
}

async function saveNews(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append('title', newsTitleInput.value.trim());
  formData.append('category', newsCategorySelect.value);
  formData.append('short_description', newsShortInput.value.trim());
  formData.append('content', editor.innerHTML);
  formData.append('news_date', newsDateInput.value);

  if (coverInput.files[0]) {
    formData.append('cover_image', coverInput.files[0]);
  }

  const method = activeEditId ? 'PUT' : 'POST';
  const url = `${API_BASE}/news${activeEditId ? `/${activeEditId}` : ''}`;
  const response = await fetch(url, { method, body: formData });

  if (response.ok) {
    await loadNews();
    hideForm();
  } else {
    const error = await response.json();
    alert(error.message || 'Не вдалося зберегти новину.');
  }
}

function execCommand(command) {
  document.execCommand(command, false, null);
  editor.focus();
}

function createLink() {
  const url = prompt('Вставте URL посилання');
  if (!url) return;
  document.execCommand('createLink', false, url);
}

async function uploadInlineImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE}/news/upload`, { method: 'POST', body: formData });
  if (!response.ok) {
    alert('Не вдалося завантажити зображення.');
    return;
  }
  const payload = await response.json();
  const imageUrl = payload.url;
  document.execCommand('insertImage', false, imageUrl);
}

function setupListeners() {
  newNewsBtn.addEventListener('click', () => setFormValues());
  cancelNewsBtn.addEventListener('click', hideForm);
  searchInput.addEventListener('input', () => renderNewsList(newsItems));

  newsList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === 'edit') {
      const item = newsItems.find((news) => String(news.id) === id);
      if (item) setFormValues(item);
    }
    if (button.dataset.action === 'delete') {
      deleteNews(id);
    }
  });

  editorToolbar.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'bold') execCommand('bold');
    if (action === 'underline') execCommand('underline');
    if (action === 'link') createLink();
    if (action === 'image') insertImageInput.click();
  });

  insertImageInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
      await uploadInlineImage(file);
    }
    insertImageInput.value = '';
  });

  newsForm.addEventListener('submit', saveNews);
}

window.addEventListener('DOMContentLoaded', () => {
  setupListeners();
  loadNews();
});
