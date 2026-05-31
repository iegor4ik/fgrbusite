const categoryButtons = document.querySelectorAll('.category-btn');
const albumsGrid = document.getElementById('albumsGrid');
const searchInput = document.getElementById('newsSearch');
let albums = [];
let selectedCategory = 'all';

const categoryLabels = {
  competition: 'Змагання',
  training: 'Тренування',
  events: 'Заходи',
  other: 'Інше',
};

function getCategoryLabel(category) {
  return categoryLabels[category] || category;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function renderAlbums() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = albums.filter((album) => {
    const matchesCategory = selectedCategory === 'all' || album.category === selectedCategory;
    const matchesQuery = `${album.title} ${album.short_description} ${album.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  if (!visible.length) {
    albumsGrid.innerHTML = '<div class="empty-state"><h3>Альбомів не знайдено</h3><p>Спробуйте інший фільтр або завітайте пізніше.</p></div>';
    return;
  }

  albumsGrid.innerHTML = visible
    .map((album) => `
      <div class="album-card" data-id="${album.id}">
        <div class="album-cover">
          <img src="${album.cover_image}" alt="${album.title}" />
          <div class="album-overlay">
            <span class="album-count">${album.photo_count} фото</span>
          </div>
        </div>
        <div class="album-info">
          <h4>${album.title}</h4>
          <p class="album-date">${formatDate(album.created_at)}</p>
          <p class="album-location">${getCategoryLabel(album.category)}</p>
          <p class="album-location">${album.short_description}</p>
        </div>
      </div>
    `)
    .join('');
}

async function loadAlbums() {
  const response = await fetch('/api/gallery/albums');
  if (!response.ok) {
    albumsGrid.innerHTML = '<div class="empty-state"><h3>Не вдалося завантажити альбоми</h3></div>';
    return;
  }
  albums = await response.json();
  renderAlbums();
}

function setupListeners() {
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.category;
      renderAlbums();
    });
  });

  searchInput.addEventListener('input', renderAlbums);

  albumsGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.album-card');
    if (!card) return;
    const id = card.dataset.id;
    window.location.href = `gallery_album.html?id=${id}`;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupListeners();
  loadAlbums();
});
