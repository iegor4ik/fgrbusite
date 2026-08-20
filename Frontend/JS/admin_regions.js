document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('regionsList');
  const modal = document.getElementById('regionModal');
  const form = document.getElementById('regionForm');
  const modalTitle = document.getElementById('modalTitle');
  const newRegionBtn = document.getElementById('newRegionBtn');
  const cancelBtn = document.getElementById('cancelRegionBtn');
  const regionPreview = document.getElementById('regionPreview');
  const presidentPreview = document.getElementById('presidentPreview');
  const photoHint = document.getElementById('photoHint');
  const removePresidentPhotoLabel = document.getElementById('removePresidentPhotoLabel');
  let editingId = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function setPreview(element, source) {
    if (source) {
      element.src = source;
      element.hidden = false;
    } else {
      element.removeAttribute('src');
      element.hidden = true;
    }
  }

  function resetForm() {
    form.reset();
    editingId = null;
    setPreview(regionPreview, null);
    setPreview(presidentPreview, null);
    photoHint.textContent = 'Обов’язково для нового регіону.';
    removePresidentPhotoLabel.hidden = true;
  }

  function closeModal() {
    modal.hidden = true;
    modal.classList.remove('active');
    resetForm();
  }

  function openModal(region = null) {
    resetForm();
    editingId = region?.id || null;
    modalTitle.textContent = region ? 'Редагувати регіон' : 'Додати регіон';
    form.name.value = region?.name || '';
    form.president.value = region?.president || '';
    if (region) {
      setPreview(regionPreview, region.photo);
      setPreview(presidentPreview, region.president_photo);
      photoHint.textContent = 'Залиште порожнім, щоб зберегти поточне фото.';
      removePresidentPhotoLabel.hidden = !region.president_photo;
    }
    modal.hidden = false;
    modal.classList.add('active');
  }

  function renderRegions(regions) {
    list.innerHTML = '';
    if (!regions.length) {
      list.innerHTML = '<p>Регіонів ще немає.</p>';
      return;
    }
    regions.forEach((region) => {
      const card = document.createElement('article');
      card.className = 'dashboard-card';
      card.innerHTML = `
        <img src="${escapeHtml(region.photo)}" alt="${escapeHtml(region.name)}" style="width:100%; height:180px; object-fit:cover; border-radius:10px; margin-bottom:1rem;">
        <h3>${escapeHtml(region.name)}</h3>
        <p style="margin:0.25rem 0; font-size:0.95rem;">Президент: ${escapeHtml(region.president || 'Не вказано')}</p>
        <p style="margin:0.25rem 0; font-size:0.95rem;">Клубів / ДЮСШ: ${Array.isArray(region.clubs_dyussh) ? region.clubs_dyussh.length : 0}</p>
        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          <button class="edit-btn" type="button">Редагувати</button>
          <button class="delete-btn" type="button">Видалити</button>
        </div>
      `;
      card.querySelector('.edit-btn').addEventListener('click', () => openModal(region));
      card.querySelector('.delete-btn').addEventListener('click', () => deleteRegion(region.id));
      list.appendChild(card);
    });
  }

  async function loadRegions() {
    try {
      const response = await fetch('/api/regions');
      if (!response.ok) throw new Error('Не вдалося завантажити регіони.');
      renderRegions(await response.json());
    } catch (error) {
      list.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
  }

  async function deleteRegion(id) {
    if (!window.confirm('Видалити регіон?')) return;
    const response = await fetch(`/api/regions/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      alert(payload.message || 'Не вдалося видалити регіон.');
      return;
    }
    await loadRegions();
  }

  function showLocalPreview(input, preview) {
    const file = input.files?.[0];
    if (file) setPreview(preview, URL.createObjectURL(file));
  }

  form.photo.addEventListener('change', () => showLocalPreview(form.photo, regionPreview));
  form.president_photo.addEventListener('change', () => showLocalPreview(form.president_photo, presidentPreview));
  newRegionBtn.addEventListener('click', () => openModal());
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-overlay')) closeModal();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!editingId && !form.photo.files?.[0]) {
      alert('Додайте фото регіону.');
      return;
    }
    const data = new FormData();
    data.append('name', form.name.value.trim());
    data.append('president', form.president.value.trim());
    if (form.photo.files?.[0]) data.append('photo', form.photo.files[0]);
    if (form.president_photo.files?.[0]) data.append('president_photo', form.president_photo.files[0]);
    if (form.remove_president_photo.checked) data.append('remove_president_photo', 'true');
    const url = editingId ? `/api/regions/${editingId}` : '/api/regions';
    const response = await fetch(url, { method: editingId ? 'PUT' : 'POST', body: data });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      alert(payload.message || 'Не вдалося зберегти регіон.');
      return;
    }
    closeModal();
    await loadRegions();
  });

  loadRegions();
});
