const photoGrid = document.getElementById('albumPhotosGrid');
const albumTitle = document.getElementById('albumTitle');
const albumDescription = document.getElementById('albumDescription');
const albumCategory = document.getElementById('albumCategory');
const albumCoverImage = document.getElementById('albumCoverImage');

function getAlbumId() {
  return new URLSearchParams(window.location.search).get('id');
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getCategoryLabel(value) {
  const map = {
    competition: 'Змагання',
    training: 'Тренування',
    events: 'Заходи',
    other: 'Інше',
  };
  return map[value] || value;
}

function openLightbox(src, alt) {
  const modal = document.createElement('div');
  modal.className = 'album-photos-modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" aria-label="Закрити">✕</button>
      <img src="${src}" alt="${alt}" style="width:100%; height:auto; border-radius: 16px;" />
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('.modal-close')) {
      modal.remove();
    }
  });
  document.addEventListener('keydown', function onKey(event) {
    if (event.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', onKey);
    }
  });
}

function renderPhotos(photos) {
  if (!photos.length) {
    photoGrid.innerHTML = '<div class="empty-state"><h3>Фотографії не знайдено</h3><p>Додайте фото через адмін-панель.</p></div>';
    return;
  }
  photoGrid.innerHTML = photos
    .map((photo) => `
      <img src="${photo.image_path}" alt="Фото альбому" data-src="${photo.image_path}" />
    `)
    .join('');
}

async function loadAlbum() {
  const id = getAlbumId();
  if (!id) {
    albumTitle.textContent = 'Альбом не знайдено';
    return;
  }
  const response = await fetch(`/api/gallery/albums/${id}`);
  if (!response.ok) {
    albumTitle.textContent = 'Альбом не знайдено';
    return;
  }
  const album = await response.json();
  albumTitle.textContent = album.title;
  albumDescription.textContent = album.short_description;
  albumCategory.textContent = `${getCategoryLabel(album.category)} · ${formatDate(album.created_at)}`;
  albumCoverImage.src = album.cover_image;
  albumCoverImage.alt = album.title;
  renderPhotos(album.photos || []);
}

function setupListeners() {
  photoGrid.addEventListener('click', (event) => {
    const photo = event.target.closest('img[data-src]');
    if (!photo) return;
    openLightbox(photo.dataset.src, photo.alt || 'Фото');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupListeners();
  loadAlbum();
});
