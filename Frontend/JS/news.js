const API_BASE = (window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:4000') + '/api';
const newsGrid = document.getElementById('newsGrid');
const searchInput = document.getElementById('newsSearch');
const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
const newsModal = document.getElementById('newsModal');
const modalClose = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');

let newsItems = [];
let activeCategory = 'Усі новини';
let activeSearch = '';

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

async function loadNews() {
  try {
    const response = await fetch(`${API_BASE}/news`);
    const data = await response.json();
    newsItems = Array.isArray(data) ? data : [];
    renderNews();
  } catch (error) {
    newsGrid.innerHTML = `
      <div class="empty-state">
        <h3>Помилка завантаження новин</h3>
        <p>Перевірте сервер або спробуйте оновити сторінку.</p>
      </div>
    `;
  }
}

function filterNews() {
  const searchQuery = activeSearch.trim().toLowerCase();

  return newsItems.filter((item) => {
    const matchCategory = activeCategory === 'Усі новини' || item.category === activeCategory;
    const text = `${item.title} ${item.short_description}`.toLowerCase();
    const matchSearch = searchQuery === '' || text.includes(searchQuery);
    return matchCategory && matchSearch;
  });
}

function renderNews() {
  const items = filterNews();

  if (!items.length) {
    newsGrid.innerHTML = `
      <div class="empty-state">
        <h3>Нічого не знайдено</h3>
        <p>Спробуйте змінити категорію або пошуковий запит, щоб побачити більше новин.</p>
      </div>
    `;
    return;
  }

  newsGrid.innerHTML = items
    .map((item) => `
      <article class="news-card">
        <div class="news-card-media">
          <img src="${item.cover_image}" alt="${item.title}" loading="lazy" />
          <span class="news-card-badge">${item.category}</span>
        </div>
        <div class="news-card-body">
          <h3>${item.title}</h3>
          <p>${item.short_description}</p>
          <div class="news-card-meta">
            <time datetime="${item.news_date}">${formatDate(item.news_date)}</time>
            <button class="read-btn" type="button" data-id="${item.id}">Читати більше</button>
          </div>
        </div>
      </article>
    `)
    .join('');
}

function setActiveCategory(category) {
  activeCategory = category;
  categoryButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  renderNews();
}

function openModal(item) {
  if (!item) return;
  const image = item.cover_image || '';

  modalContent.querySelector('.modal-category').textContent = item.category;
  modalContent.querySelector('#modalTitle').textContent = item.title;
  modalContent.querySelector('#modalDate').textContent = formatDate(item.news_date);
  modalContent.querySelector('#modalText').innerHTML = item.content;
  modalContent.parentElement.querySelector('.modal-image').src = image;
  modalContent.parentElement.querySelector('.modal-image').alt = item.title;

  newsModal.classList.add('active');
  newsModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  newsModal.classList.remove('active');
  newsModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveCategory(button.dataset.category);
  });
});

searchInput.addEventListener('input', (event) => {
  activeSearch = event.target.value;
  renderNews();
});

newsGrid.addEventListener('click', (event) => {
  const button = event.target.closest('.read-btn');
  if (!button) return;
  const id = Number(button.dataset.id);
  const item = newsItems.find((news) => news.id === id);
  openModal(item);
});

modalClose.addEventListener('click', closeModal);
newsModal.addEventListener('click', (event) => {
  if (event.target === newsModal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && newsModal.classList.contains('active')) {
    closeModal();
  }
});

window.addEventListener('DOMContentLoaded', loadNews);
