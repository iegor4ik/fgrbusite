document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('clubsList');
  const modal = document.getElementById('clubModal');
  const form = document.getElementById('clubForm');
  const modalTitle = document.getElementById('modalTitle');
  const regionSelect = document.getElementById('regionSelect');
  const addressesList = document.getElementById('addressesList');
  const trainersList = document.getElementById('trainersList');
  const contactsList = document.getElementById('contactsList');
  const clubPreview = document.getElementById('clubPreview');
  const photoHint = document.getElementById('photoHint');
  let editingId = null;
  let trainerIndex = 0;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function setPreview(source) {
    if (source) {
      clubPreview.src = source;
      clubPreview.hidden = false;
    } else {
      clubPreview.removeAttribute('src');
      clubPreview.hidden = true;
    }
  }

  function addAddress(value = '') {
    const row = document.createElement('div');
    row.className = 'dynamic-field-row';
    row.innerHTML = `<input type="text" class="address-input" value="${escapeHtml(value)}" placeholder="Адреса залу" /><button type="button" class="delete-btn remove-field-btn" aria-label="Видалити адресу">×</button>`;
    row.querySelector('.remove-field-btn').addEventListener('click', () => row.remove());
    addressesList.appendChild(row);
  }

  function addTrainer(trainer = {}) {
    const index = trainerIndex++;
    const row = document.createElement('div');
    row.className = 'dynamic-field-row trainer-row';
    row.dataset.photo = trainer.photo || '';
    row.innerHTML = `
      <input type="text" class="trainer-name-input" value="${escapeHtml(trainer.name || '')}" placeholder="ПІБ тренера" />
      <input type="file" class="trainer-photo-input" name="trainer_photo_${index}" accept="image/*" />
      <button type="button" class="delete-btn remove-field-btn" aria-label="Видалити тренера">×</button>`;
    row.querySelector('.remove-field-btn').addEventListener('click', () => row.remove());
    trainersList.appendChild(row);
  }

  function addContact(value = '') {
    const row = document.createElement('div');
    row.className = 'dynamic-field-row';
    row.innerHTML = `<input type="text" class="contact-input" value="${escapeHtml(value)}" placeholder="Телефон, email, сайт або інший контакт" /><button type="button" class="delete-btn remove-field-btn" aria-label="Видалити контакт">×</button>`;
    row.querySelector('.remove-field-btn').addEventListener('click', () => row.remove());
    contactsList.appendChild(row);
  }

  function resetForm() {
    form.reset();
    editingId = null;
    trainerIndex = 0;
    addressesList.innerHTML = '';
    trainersList.innerHTML = '';
    contactsList.innerHTML = '';
    setPreview(null);
    photoHint.textContent = 'Обов’язково для нового клубу.';
  }

  function closeModal() {
    modal.hidden = true;
    modal.classList.remove('active');
    resetForm();
  }

  function openModal(club = null) {
    resetForm();
    editingId = club?.id || null;
    modalTitle.textContent = club ? 'Редагувати клуб' : 'Додати клуб';
    form.name.value = club?.name || '';
    form.city.value = club?.city || '';
    regionSelect.value = club?.region_id || '';
    if (club) {
      setPreview(club.photo);
      photoHint.textContent = 'Залиште порожнім, щоб зберегти поточне фото.';
      (club.gym_addresses || []).forEach(addAddress);
      (club.trainers || []).forEach(addTrainer);
      (club.contacts || []).forEach(addContact);
    }
    modal.hidden = false;
    modal.classList.add('active');
  }

  function renderClubs(clubs) {
    list.innerHTML = '';
    if (!clubs.length) {
      list.innerHTML = '<p>Клубів або ДЮСШ ще немає.</p>';
      return;
    }
    clubs.forEach((club) => {
      const card = document.createElement('article');
      card.className = 'dashboard-card';
      card.innerHTML = `
        <img src="${escapeHtml(club.photo)}" alt="${escapeHtml(club.name)}" style="width:100%; height:180px; object-fit:cover; border-radius:10px; margin-bottom:1rem;">
        <h3>${escapeHtml(club.name)}</h3>
        <p style="margin:0.25rem 0; font-size:0.95rem;">Місто: ${escapeHtml(club.city || 'Не вказано')}</p>
        <p style="margin:0.25rem 0; font-size:0.95rem;">Область: ${escapeHtml(club.region_name || 'Не обрано')}</p>
        <p style="margin:0.25rem 0; font-size:0.95rem;">Тренерів: ${club.trainers?.length || 0}, залів: ${club.gym_addresses?.length || 0}, контактів: ${club.contacts?.length || 0}</p>
        <div style="display:flex; gap:0.5rem; margin-top:1rem;"><button class="edit-btn" type="button">Редагувати</button><button class="delete-btn" type="button">Видалити</button></div>`;
      card.querySelector('.edit-btn').addEventListener('click', () => openModal(club));
      card.querySelector('.delete-btn').addEventListener('click', () => deleteClub(club.id));
      list.appendChild(card);
    });
  }

  async function loadRegions() {
    const response = await fetch('/api/regions');
    if (!response.ok) throw new Error('Не вдалося завантажити області.');
    const regions = await response.json();
    regionSelect.innerHTML = '<option value="">Не обрано</option>';
    regions.forEach((region) => {
      const option = document.createElement('option');
      option.value = region.id;
      option.textContent = region.name;
      regionSelect.appendChild(option);
    });
  }

  async function loadClubs() {
    try {
      const response = await fetch('/api/clubs');
      if (!response.ok) throw new Error('Не вдалося завантажити клуби.');
      renderClubs(await response.json());
    } catch (error) {
      list.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
  }

  async function deleteClub(id) {
    if (!window.confirm('Видалити клуб?')) return;
    const response = await fetch(`/api/clubs/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      alert(payload.message || 'Не вдалося видалити клуб.');
      return;
    }
    await loadClubs();
  }

  document.getElementById('newClubBtn').addEventListener('click', () => openModal());
  document.getElementById('cancelClubBtn').addEventListener('click', closeModal);
  document.getElementById('addAddressBtn').addEventListener('click', () => addAddress());
  document.getElementById('addTrainerBtn').addEventListener('click', () => addTrainer());
  document.getElementById('addContactBtn').addEventListener('click', () => addContact());
  modal.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-overlay')) closeModal();
  });
  form.photo.addEventListener('change', () => {
    const file = form.photo.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!editingId && !form.photo.files?.[0]) {
      alert('Додайте фото клубу.');
      return;
    }
    const data = new FormData();
    data.append('name', form.name.value.trim());
    data.append('city', form.city.value.trim());
    data.append('region_id', regionSelect.value);
    data.append('gym_addresses', JSON.stringify(Array.from(document.querySelectorAll('.address-input')).map((input) => input.value.trim()).filter(Boolean)));
    data.append('contacts', JSON.stringify(Array.from(document.querySelectorAll('.contact-input')).map((input) => input.value.trim()).filter(Boolean)));
    const trainers = Array.from(document.querySelectorAll('.trainer-row')).map((row) => {
      const fileInput = row.querySelector('.trainer-photo-input');
      const trainer = { name: row.querySelector('.trainer-name-input').value.trim(), photo: row.dataset.photo || null };
      if (fileInput.files?.[0]) {
        trainer.photo_field = fileInput.name;
        data.append(fileInput.name, fileInput.files[0]);
      }
      return trainer;
    }).filter((trainer) => trainer.name);
    data.append('trainers', JSON.stringify(trainers));
    if (form.photo.files?.[0]) data.append('photo', form.photo.files[0]);
    const url = editingId ? `/api/clubs/${editingId}` : '/api/clubs';
    const response = await fetch(url, { method: editingId ? 'PUT' : 'POST', body: data });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      alert(payload.message || 'Не вдалося зберегти клуб.');
      return;
    }
    closeModal();
    await loadClubs();
  });

  Promise.all([loadRegions(), loadClubs()]).catch((error) => {
    list.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  });
});
