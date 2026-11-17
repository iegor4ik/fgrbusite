document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('documentsList');
  const federationFoldersListEl = document.getElementById('federationFoldersList');
  const ministryFoldersListEl = document.getElementById('ministryFoldersList');
  const createBtn = document.getElementById('createBtn');
  const createFolderBtn = document.getElementById('createFolderBtn');
  const modal = document.getElementById('docModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('docForm');
  const filesContainer = document.getElementById('filesContainer');
  const addFileBtn = document.getElementById('addFileBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const folderModal = document.getElementById('folderModal');
  const folderForm = document.getElementById('folderForm');
  const folderModalTitle = document.getElementById('folderModalTitle');
  const cancelFolderBtn = document.getElementById('cancelFolderBtn');
  const categorySelect = form.elements.category;
  const folderSelect = form.elements.folderId;
  let editingId = null;
  let editingFolderId = null;
  let folders = [];
  const documentFileAccept = '.pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
  }

  function openModal(edit = false) {
    if (!edit) renderFolderOptions('');
    modal.hidden = false;
    modal.classList.add('active');
    modalTitle.textContent = edit ? 'Редагувати документ' : 'Додати документ';
  }

  function closeModal() {
    modal.hidden = true;
    modal.classList.remove('active');
    form.reset();
    editingId = null;
    filesContainer.innerHTML = `<label>Файл PDF або Excel\n<input type="file" name="files" accept="${documentFileAccept}"></label>`;
  }

  function openFolderModal(folder = null) {
    editingFolderId = folder ? folder.id : null;
    folderForm.reset();
    folderForm.title.value = folder ? folder.title : '';
    folderForm.category.value = folder ? folder.category : 'федерація';
    folderForm.category.disabled = Boolean(folder);
    folderModalTitle.textContent = folder ? 'Редагувати папку' : 'Створити папку';
    folderModal.hidden = false;
    folderModal.classList.add('active');
  }

  function closeFolderModal() {
    folderModal.hidden = true;
    folderModal.classList.remove('active');
    folderForm.reset();
    editingFolderId = null;
  }

  function renderFolders() {
    federationFoldersListEl.innerHTML = '';
    ministryFoldersListEl.innerHTML = '';
    folders.forEach((folder) => {
      const card = document.createElement('article');
      card.className = 'dashboard-card';
      card.innerHTML = `
        <h3>${escapeHtml(folder.title)}</h3>
        <p>Документів: ${Number(folder.document_count) || 0}</p>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <a href="${folder.category === 'міністерство' ? 'documents_mistry.html' : 'documents_federation.html'}?folder=${encodeURIComponent(folder.id)}" target="_blank" rel="noopener">Переглянути на сайті</a>
          <button type="button" class="edit-folder-btn">Перейменувати</button>
          <button type="button" class="delete-folder-btn">Видалити</button>
        </div>`;
      card.querySelector('.edit-folder-btn').addEventListener('click', () => openFolderModal(folder));
      card.querySelector('.delete-folder-btn').addEventListener('click', () => deleteFolder(folder));
      (folder.category === 'міністерство' ? ministryFoldersListEl : federationFoldersListEl).appendChild(card);
    });
    if (!federationFoldersListEl.children.length) federationFoldersListEl.innerHTML = '<p>Папок федерації ще немає.</p>';
    if (!ministryFoldersListEl.children.length) ministryFoldersListEl.innerHTML = '<p>Папок міністерства ще немає.</p>';
    renderFolderOptions();
  }

  function renderFolderOptions(selectedId = folderSelect.value) {
    folderSelect.innerHTML = '<option value="">Без папки</option>';
    folders
      .filter((folder) => folder.category === categorySelect.value)
      .forEach((folder) => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.title;
        folderSelect.appendChild(option);
      });
    folderSelect.value = selectedId;
  }

  addFileBtn.addEventListener('click', () => {
    const label = document.createElement('label');
    label.innerHTML = `Файл PDF або Excel\n<input type="file" name="files" accept="${documentFileAccept}">`;
    filesContainer.appendChild(label);
  });

  cancelBtn.addEventListener('click', closeModal);
  cancelFolderBtn.addEventListener('click', closeFolderModal);
  createBtn.addEventListener('click', () => openModal(false));
  createFolderBtn.addEventListener('click', () => openFolderModal());
  categorySelect.addEventListener('change', () => renderFolderOptions(''));

  async function fetchFolders() {
    const res = await fetch('/api/document-folders');
    if (!res.ok) throw new Error('Не вдалося завантажити папки документів.');
    folders = await res.json();
    renderFolders();
  }

  async function fetchDocuments() {
    listEl.innerHTML = '<p>Завантаження...</p>';
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Не вдалося завантажити документи.');
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
      const folder = folders.find((item) => Number(item.id) === Number(doc.folder_id));
      card.className = 'dashboard-card';
      card.innerHTML = `
        <h3>${escapeHtml(doc.title)}</h3>
        <p style="margin:0.25rem 0">Категорія: ${escapeHtml(doc.category)}</p>
        <p style="margin:0.25rem 0">Папка: ${folder ? escapeHtml(folder.title) : 'без папки'}</p>
        <p style="margin:0.25rem 0">Файлів: ${doc.files.length}</p>
        <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
          <button class="edit-btn" type="button">Редагувати</button>
          <button class="delete-btn" type="button">Видалити</button>
        </div>`;
      card.querySelector('.edit-btn').addEventListener('click', () => openEdit(doc.id));
      card.querySelector('.delete-btn').addEventListener('click', () => doDelete(doc.id));
      listEl.appendChild(card);
    });
  }

  async function openEdit(id) {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) return alert('Не вдалося завантажити документ');
    const doc = await res.json();
    editingId = id;
    form.title.value = doc.title;
    form.category.value = doc.category;
    renderFolderOptions(doc.folder_id || '');
    folderSelect.value = doc.folder_id || '';
    const existing = document.createElement('div');
    existing.innerHTML = '<strong>Існуючі файли</strong>';
    doc.files.forEach((f) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.gap = '0.5rem';
      row.innerHTML = `<a href="${escapeHtml(f.file_path)}" target="_blank" rel="noopener">${escapeHtml(f.original_name)}</a> <label style="margin-left:0.5rem"><input type="checkbox" name="deleteFile" value="${f.id}"> Видалити</label>`;
      existing.appendChild(row);
    });
    filesContainer.innerHTML = '';
    filesContainer.appendChild(existing);
    const newInputLabel = document.createElement('label');
    newInputLabel.innerHTML = `Додати файл PDF або Excel\n<input type="file" name="files" accept="${documentFileAccept}">`;
    filesContainer.appendChild(newInputLabel);
    openModal(true);
  }

  async function doDelete(id) {
    if (!confirm('Видалити документ?')) return;
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      await fetchFolders();
      await fetchDocuments();
    } else {
      alert('Не вдалося видалити документ.');
    }
  }

  async function deleteFolder(folder) {
    if (!confirm(`Видалити папку «${folder.title}»? Документи залишаться без папки.`)) return;
    const res = await fetch(`/api/document-folders/${folder.id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchFolders();
      await fetchDocuments();
    } else {
      alert('Не вдалося видалити папку.');
    }
  }

  folderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = folderForm.title.value.trim();
    try {
      const response = await fetch(editingFolderId ? `/api/document-folders/${editingFolderId}` : '/api/document-folders', {
        method: editingFolderId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: folderForm.category.value }),
      });
      if (!response.ok) {
        const error = await response.json();
        return alert(error.message || 'Не вдалося зберегти папку.');
      }
      closeFolderModal();
      await fetchFolders();
      await fetchDocuments();
    } catch (error) {
      alert('Помилка мережі під час збереження папки.');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title.value);
    fd.append('category', form.category.value);
    fd.append('folderId', folderSelect.value);
    const deletes = Array.from(form.querySelectorAll('input[name="deleteFile"]:checked')).map((i) => Number(i.value));
    if (deletes.length) fd.append('deleteFileIds', JSON.stringify(deletes));
    const fileInputs = Array.from(form.querySelectorAll('input[type="file"][name="files"]'));
    fileInputs.forEach((inp) => {
      if (inp.files && inp.files[0]) fd.append('files', inp.files[0]);
    });

    try {
      const res = editingId
        ? await fetch(`/api/documents/${editingId}`, { method: 'PUT', body: fd })
        : await fetch('/api/documents', { method: 'POST', body: fd });
      if (res.ok) {
        closeModal();
        await fetchFolders();
        await fetchDocuments();
      } else {
        const err = await res.json();
        alert(err.message || 'Помилка');
      }
    } catch (err) {
      alert('Помилка мережі');
    }
  });

  [modal, folderModal].forEach((currentModal) => {
    currentModal.addEventListener('click', (event) => {
      if (!event.target.classList.contains('modal-overlay')) return;
      if (currentModal === modal) closeModal();
      else closeFolderModal();
    });
  });

  (async () => {
    await fetchFolders();
    await fetchDocuments();
  })().catch((error) => {
    listEl.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  });
});
