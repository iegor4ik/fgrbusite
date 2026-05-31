document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('documentsList');
  const createBtn = document.getElementById('createBtn');
  const modal = document.getElementById('docModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('docForm');
  const filesContainer = document.getElementById('filesContainer');
  const addFileBtn = document.getElementById('addFileBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  let editingId = null;

  function openModal(edit = false) {
    modal.hidden = false;
    modal.classList.add('active');
    modalTitle.textContent = edit ? 'Редагувати документ' : 'Додати документ';
  }
  function closeModal() {
    modal.hidden = true;
    modal.classList.remove('active');
    form.reset();
    editingId = null;
    // reset files inputs
    filesContainer.innerHTML = '<label>PDF файл\n            <input type="file" name="files" accept="application/pdf">\n          </label>';
  }

  addFileBtn.addEventListener('click', () => {
    const label = document.createElement('label');
    label.innerHTML = 'PDF файл\n<input type="file" name="files" accept="application/pdf">';
    filesContainer.appendChild(label);
  });

  cancelBtn.addEventListener('click', closeModal);

  createBtn.addEventListener('click', () => { openModal(false); });

  async function fetchDocuments() {
    listEl.innerHTML = '<p>Завантаження...</p>';
    const res = await fetch('/api/documents');
    const data = await res.json();
    renderList(data);
  }

  function renderList(docs) {
    listEl.innerHTML = '';
    if (!docs.length) {
      listEl.innerHTML = '<p>Документів ще немає.</p>';
      return;
    }
    docs.forEach((doc) => {
      const card = document.createElement('article');
      card.className = 'dashboard-card';
      card.innerHTML = `
        <h3>${escapeHtml(doc.title)}</h3>
        <p style="margin:0.25rem 0">Категорія: ${escapeHtml(doc.category)}</p>
        <p style="margin:0.25rem 0">Файлів: ${doc.files.length}</p>
        <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
          <button class="edit-btn">Редагувати</button>
          <button class="delete-btn">Видалити</button>
        </div>
      `;
      const editBtn = card.querySelector('.edit-btn');
      const deleteBtn = card.querySelector('.delete-btn');
      editBtn.addEventListener('click', () => openEdit(doc.id));
      deleteBtn.addEventListener('click', () => doDelete(doc.id));
      listEl.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
  }

  async function openEdit(id) {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) return alert('Не вдалося завантажити документ');
    const doc = await res.json();
    editingId = id;
    form.title.value = doc.title;
    form.category.value = doc.category;
    // show existing files with checkboxes
    const existing = document.createElement('div');
    existing.innerHTML = '<strong>Існуючі файли</strong>';
    doc.files.forEach((f) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.gap = '0.5rem';
      row.innerHTML = `<a href="${f.file_path}" target="_blank">${escapeHtml(f.original_name)}</a> <label style="margin-left:0.5rem"><input type="checkbox" name="deleteFile" value="${f.id}"> Видалити</label>`;
      existing.appendChild(row);
    });
    // place existing before file inputs
    filesContainer.innerHTML = '';
    filesContainer.appendChild(existing);
    const newInputLabel = document.createElement('label');
    newInputLabel.innerHTML = 'Додати PDF файл\n<input type="file" name="files" accept="application/pdf">';
    filesContainer.appendChild(newInputLabel);
    openModal(true);
  }

  async function doDelete(id) {
    if (!confirm('Видалити документ?')) return;
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      fetchDocuments();
    } else {
      alert('Не вдалося видалити документ.');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title.value);
    fd.append('category', form.category.value);
    // collect deleteFile checkboxes
    const deletes = Array.from(form.querySelectorAll('input[name="deleteFile"]:checked')).map(i => Number(i.value));
    if (deletes.length) fd.append('deleteFileIds', JSON.stringify(deletes));
    // files
    const fileInputs = Array.from(form.querySelectorAll('input[type="file"][name="files"]'));
    fileInputs.forEach((inp) => {
      if (inp.files && inp.files[0]) fd.append('files', inp.files[0]);
    });

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/documents/${editingId}`, { method: 'PUT', body: fd });
      } else {
        res = await fetch('/api/documents', { method: 'POST', body: fd });
      }
      if (res.ok) {
        closeModal();
        fetchDocuments();
      } else {
        const err = await res.json();
        alert(err.message || 'Помилка');
      }
    } catch (err) {
      alert('Помилка мережі');
    }
  });

  // close modal when clicking overlay
  modal.addEventListener('click', (ev) => {
    if (ev.target.classList.contains('modal-overlay')) closeModal();
  });

  fetchDocuments();
});