const API_BASE = (window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:4000') + '/api';
const albumList = document.getElementById('albumList');
const newAlbumBtn = document.getElementById('newAlbumBtn');
const albumFormPanel = document.getElementById('albumFormPanel');
const albumFormTitle = document.getElementById('albumFormTitle');
const albumForm = document.getElementById('albumForm');
const albumIdInput = document.getElementById('albumId');
const albumTitleInput = document.getElementById('albumTitle');
const albumCategorySelect = document.getElementById('albumCategory');
const albumDescriptionInput = document.getElementById('albumDescription');
const albumCoverPreview = document.getElementById('albumCoverPreview');
const albumCoverInput = document.getElementById('albumCoverInput');
const albumPhotosInput = document.getElementById('albumPhotosInput');
const currentPhotoList = document.getElementById('currentPhotoList');
const searchAlbumsInput = document.getElementById('searchAlbums');
const cancelAlbumBtn = document.getElementById('cancelAlbumBtn');

let albums = [];
let activeAlbumId = null;

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

function hideForm() {
  albumFormPanel.classList.add('hidden');
  albumForm.reset();
  albumIdInput.value = '';
  albumCoverPreview.src = '';
  albumCoverPreview.style.display = 'none';
  albumPhotosInput.value = '';
  currentPhotoList.innerHTML = '';
  activeAlbumId = null;
}

function renderAlbumList(items) {
  const query = searchAlbumsInput.value.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const text = `${item.title} ${item.category} ${item.short_description}`.toLowerCase();
    const matchesQuery = text.includes(query);
    return matchesQuery;
  });
  if (!filtered.length) {
    albumList.innerHTML = '<div class="empty-state"><h3>Альбомів не знайдено</h3><p>Створіть перший альбом або змініть фільтр.</p></div>';
    return;
  }
  albumList.innerHTML = filtered
    .map((item) => `
      <div class="album-item">
        <div class="album-thumbnail">
          <img src="${item.cover_image}" alt="${item.title}" />
        </div>
        <div class="album-details">
          <h4>${item.title}</h4>
          <p class="album-meta">${getCategoryLabel(item.category)} · ${item.photo_count} фото</p>
          <p>${item.short_description}</p>
        </div>
        <div class="album-actions">
          <button type="button" data-action="edit" data-id="${item.id}">Редагувати</button>
          <button type="button" data-action="delete" data-id="${item.id}">Видалити</button>
        </div>
      </div>
    `)
    .join('');
}

async function loadAlbums() {
  const response = await fetch(`${API_BASE}/gallery/albums`);
  if (!response.ok) {
    albumList.innerHTML = '<div class="empty-state"><h3>Помилка завантаження альбомів</h3></div>';
    return;
  }
  albums = await response.json();
  renderAlbumList(albums);
}

async function loadAlbumDetails(id) {
  const response = await fetch(`${API_BASE}/gallery/albums/${id}`);
  if (!response.ok) {
    return { photos: [] };
  }
  return await response.json();
}

async function setFormValues(item = null) {
  activeAlbumId = item ? item.id : null;
  albumIdInput.value = item ? item.id : '';
  albumTitleInput.value = item ? item.title : '';
  albumCategorySelect.value = item ? item.category : 'competition';
  albumDescriptionInput.value = item ? item.short_description : '';
  albumFormTitle.textContent = item ? 'Редагувати альбом' : 'Новий альбом';
  if (item) {
    const album = await loadAlbumDetails(item.id);
    albumCoverPreview.src = album.cover_image || '';
    albumCoverPreview.style.display = album.cover_image ? 'block' : 'none';
    renderCurrentPhotos(album.photos || []);
  } else {
    albumCoverPreview.src = '';
    albumCoverPreview.style.display = 'none';
    currentPhotoList.innerHTML = '';
  }
  albumFormPanel.classList.remove('hidden');
}

function renderCurrentPhotos(photos) {
  if (!photos.length) {
    currentPhotoList.innerHTML = '<div class="empty-state"><h3>Фото ще не додані</h3><p>Збережіть альбом і завантажте фото.</p></div>';
    return;
  }
  currentPhotoList.innerHTML = photos
    .map((photo) => `
      <div class="album-item">
        <div class="album-thumbnail">
          <img src="${photo.image_path}" alt="Фото альбому" />
        </div>
        <div class="album-details">
          <h4>Фото</h4>
          <p class="album-meta">${formatDate(photo.upload_date)}</p>
        </div>
        <div class="album-actions">
          <button type="button" data-action="delete-photo" data-id="${photo.id}">Видалити</button>
        </div>
      </div>
    `)
    .join('');
}

async function saveAlbum(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append('title', albumTitleInput.value.trim());
  formData.append('category', albumCategorySelect.value);
  formData.append('short_description', albumDescriptionInput.value.trim());
  if (albumCoverInput.files[0]) {
    formData.append('cover_image', albumCoverInput.files[0]);
  }
  Array.from(albumPhotosInput.files || []).forEach((file) => {
    formData.append('photos', file);
  });
  const method = activeAlbumId ? 'PUT' : 'POST';
  const url = `${API_BASE}/gallery/albums${activeAlbumId ? `/${activeAlbumId}` : ''}`;
  const response = await fetch(url, { method, body: formData });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    alert(payload?.message || 'Не вдалося зберегти альбом.');
    return;
  }
  await loadAlbums();
  if (activeAlbumId) {
    await setFormValues({ id: activeAlbumId });
  } else {
    hideForm();
  }
}

async function deleteAlbum(id) {
  if (!confirm('Ви дійсно хочете видалити цей альбом?')) return;
  const response = await fetch(`${API_BASE}/gallery/albums/${id}`, { method: 'DELETE' });
  if (response.ok) {
    await loadAlbums();
    hideForm();
  } else {
    alert('Не вдалося видалити альбом.');
  }
}

async function uploadPhotos(files) {
  if (!activeAlbumId) {
    alert('Спочатку збережіть альбом.');
    return;
  }
  if (!files.length) return;
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('photos', file));
  const response = await fetch(`${API_BASE}/gallery/albums/${activeAlbumId}/photos`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    alert(payload?.message || 'Не вдалося завантажити фото.');
    return;
  }
  albumPhotosInput.value = '';
  const album = await loadAlbumDetails(activeAlbumId);
  renderCurrentPhotos(album.photos || []);
  await loadAlbums();
}

async function deletePhoto(photoId) {
  if (!confirm('Ви дійсно хочете видалити це фото?')) return;
  const response = await fetch(`${API_BASE}/gallery/photos/${photoId}`, { method: 'DELETE' });
  if (response.ok) {
    const album = await loadAlbumDetails(activeAlbumId);
    renderCurrentPhotos(album.photos || []);
    await loadAlbums();
  } else {
    alert('Не вдалося видалити фото.');
  }
}

function setupListeners() {
  newAlbumBtn.addEventListener('click', () => setFormValues());
  cancelAlbumBtn.addEventListener('click', hideForm);
  searchAlbumsInput.addEventListener('input', () => renderAlbumList(albums));

  albumList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === 'edit') {
      const item = albums.find((album) => String(album.id) === id);
      if (item) {
        await setFormValues(item);
      }
    }
    if (button.dataset.action === 'delete') {
      await deleteAlbum(id);
    }
  });

  currentPhotoList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="delete-photo"]');
    if (!button) return;
    await deletePhoto(button.dataset.id);
  });

  albumForm.addEventListener('submit', saveAlbum);
  albumCoverInput.addEventListener('change', () => {
    if (albumCoverInput.files[0]) {
      albumCoverPreview.src = URL.createObjectURL(albumCoverInput.files[0]);
      albumCoverPreview.style.display = 'block';
    }
  });
  albumPhotosInput.addEventListener('change', (event) => uploadPhotos(event.target.files));
}

window.addEventListener('DOMContentLoaded', () => {
  setupListeners();
  loadAlbums();
});
