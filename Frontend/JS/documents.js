document.addEventListener('DOMContentLoaded', () => {
  const documentIndex = document.querySelector('[data-document-index]');
  const documentScope = document.body.dataset.documentScope;
  const documentCategory = documentScope === 'federation'
    ? 'федерація'
    : documentScope === 'ministry' ? 'міністерство' : null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
  }

  async function fetchFolders(category) {
    const url = category
      ? `/api/document-folders?category=${encodeURIComponent(category)}`
      : '/api/document-folders';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити папки документів.');
    return response.json();
  }

  async function fetchDocuments(folderId) {
    const url = folderId ? `/api/documents?folderId=${encodeURIComponent(folderId)}` : '/api/documents';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не вдалося завантажити документи.');
    return response.json();
  }

  function renderDocuments(target, docs, searchTerm = '') {
    const search = searchTerm.trim().toLowerCase();
    const filtered = docs.filter((doc) => doc.title.toLowerCase().includes(search));
    target.innerHTML = '';
    if (!filtered.length) {
      target.innerHTML = '<p>Документи відсутні.</p>';
      return;
    }

    filtered.forEach((doc) => {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.innerHTML = `
        <div class="news-card-media" style="display:flex; align-items:center; justify-content:center; padding:1rem;">
          <div style="font-size:48px">📄</div>
        </div>
        <div class="news-card-body">
          <h3>${escapeHtml(doc.title)}</h3>
          <div class="news-card-meta">${escapeHtml(doc.category)}</div>
        </div>
      `;
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => onCardClick(doc));
      target.appendChild(card);
    });
  }

  function onCardClick(doc) {
    if (!doc.files || !doc.files.length) return;
    if (doc.files.length === 1) {
      const file = doc.files[0];
      if (isExcelFile(file)) {
        showExcelPreview(file, doc.title);
      } else {
        window.open(file.file_path, '_blank', 'noopener');
      }
      return;
    }
    const modal = document.createElement('div');
    modal.className = 'news-modal active';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close">✕</button>
        <h3>${escapeHtml(doc.title)}</h3>
        <div style="margin-top:0.5rem;">
          ${doc.files.map((file) => `
            <div class="document-file-action">
              ${isExcelFile(file)
                ? `<button type="button" class="excel-preview-button" data-preview-file="${Number(file.id)}">Переглянути Excel</button>`
                : `<a href="${escapeHtml(file.file_path)}" target="_blank" rel="noopener">${escapeHtml(file.original_name)}</a>`}
              <a class="document-download-button" href="/api/document-files/${Number(file.id)}/download" download="${escapeHtml(file.original_name)}">Скачати</a>
            </div>`).join('')}
        </div>
      </div>
    `;
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.classList.contains('modal-close')) modal.remove();
    });
    modal.querySelectorAll('[data-preview-file]').forEach((button) => {
      button.addEventListener('click', () => {
        const file = doc.files.find((item) => Number(item.id) === Number(button.dataset.previewFile));
        if (file) showExcelPreview(file, doc.title);
      });
    });
    document.body.appendChild(modal);
  }

  function isExcelFile(file) {
    return /\.(xls|xlsx)$/i.test(file.original_name || file.file_path || '');
  }

  async function showExcelPreview(file, documentTitle = '') {
    const modal = document.createElement('div');
    modal.className = 'news-modal active excel-preview-modal';
    modal.innerHTML = `
      <div class="modal-card excel-preview-card">
        <button class="modal-close" type="button" aria-label="Закрити">✕</button>
        <div class="excel-preview-header">
          <h3>${escapeHtml(documentTitle || 'Документ')}</h3>
          <a class="document-download-button" href="/api/document-files/${Number(file.id)}/download" download="${escapeHtml(file.original_name)}">Скачати Excel</a>
        </div>
        <div class="excel-preview-status" role="status">Підготовка попереднього перегляду...</div>
        <iframe
          class="excel-preview-frame"
          title="Попередній перегляд ${escapeHtml(file.original_name)}"
          hidden
        ></iframe>
      </div>
    `;
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.classList.contains('modal-close')) modal.remove();
    });
    const frame = modal.querySelector('.excel-preview-frame');
    const status = modal.querySelector('.excel-preview-status');
    document.body.appendChild(modal);

    frame.src = `/api/document-files/${encodeURIComponent(file.id)}/preview`;
    frame.addEventListener('load', () => {
      status.hidden = true;
      frame.hidden = false;
    }, { once: true });
  }

  function getFolderPageLink(category) {
    return category === 'міністерство' ? 'documents_mistry.html' : 'documents_federation.html';
  }

  function renderFolderCards(folders) {
    if (!folders.length) return '<p>Папок поки немає.</p>';
    return folders.map((folder) => `
      <a class="documents-folder-card" href="${getFolderPageLink(folder.category)}?folder=${encodeURIComponent(folder.id)}">
        <span class="documents-folder-icon" aria-hidden="true">📁</span>
        <span><strong>${escapeHtml(folder.title)}</strong><small>Документів: ${Number(folder.document_count) || 0}</small></span>
      </a>`).join('');
  }

  async function loadIndex() {
    const requestedFolderId = new URLSearchParams(window.location.search).get('folder');
    if (requestedFolderId) {
      try {
        const folders = await fetchFolders();
        const folder = folders.find((item) => String(item.id) === requestedFolderId);
        if (!folder) {
          documentIndex.innerHTML = '<div class="container"><p>Ця папка була видалена або не існує.</p></div>';
          return;
        }
        window.location.replace(`${getFolderPageLink(folder.category)}?folder=${encodeURIComponent(folder.id)}`);
      } catch (error) {
        documentIndex.innerHTML = `<div class="container"><p>${escapeHtml(error.message)}</p></div>`;
      }
      return;
    }

    documentIndex.innerHTML = `
      <div class="container">
        <section class="news-collection">
          <h2 class="section-header">Документи</h2>
          <p>Оберіть розділ документації.</p>
          <div class="documents-choice-grid">
            <a class="documents-choice-card" href="documents_federation.html"><div><h3>Федерація</h3><p>Документи та папки федерації.</p></div></a>
            <a class="documents-choice-card" href="documents_mistry.html"><div><h3>Міністерство</h3><p>Документи та папки міністерства.</p></div></a>
          </div>
        </section>
      </div>`;
  }

  async function loadCategoryPage() {
    const page = document.querySelector('.documents-list-page .news-collection');
    const requestedFolderId = new URLSearchParams(window.location.search).get('folder');
    const categoryLabel = documentCategory === 'міністерство' ? 'міністерства' : 'федерації';
    try {
      const [folders, documents] = await Promise.all([
        fetchFolders(documentCategory),
        fetchDocuments(requestedFolderId || undefined),
      ]);

      if (requestedFolderId) {
        const folder = folders.find((item) => String(item.id) === requestedFolderId);
        if (!folder) {
          page.innerHTML = `<a class="documents-back-link" href="${getFolderPageLink(documentCategory)}">← Документы ${categoryLabel}</a><p>Папку не знайдено.</p>`;
          return;
        }
        page.innerHTML = `
          <a class="documents-back-link" href="${getFolderPageLink(documentCategory)}">← Усі документи ${categoryLabel}</a>
          <h2 class="section-header">${escapeHtml(folder.title)}</h2>
          <div class="news-search-panel" style="margin-top:1rem;">
            <div class="search-field"><input id="documentSearch" type="search" placeholder="Пошук за назвою..." /></div>
          </div>
          <div id="publicDocuments" class="news-grid" style="margin-top:1rem;"></div>`;
        const list = document.getElementById('publicDocuments');
        const search = document.getElementById('documentSearch');
        const render = () => renderDocuments(list, documents, search.value);
        search.addEventListener('input', render);
        render();
        return;
      }

      const unfiledDocuments = documents.filter((doc) => doc.category === documentCategory && !doc.folder_id);
      page.innerHTML = `
        <h2 class="section-header">Документы ${categoryLabel}</h2>
        <h3 class="documents-folder-heading">Папки</h3>
        <div class="documents-folder-grid">${renderFolderCards(folders)}</div>
        <h3 class="documents-folder-heading">Документи без папки</h3>
        <div class="news-search-panel" style="margin-top:1rem;">
          <div class="search-field"><input id="documentSearch" type="search" placeholder="Пошук за назвою..." /></div>
        </div>
        <div id="publicDocuments" class="news-grid" style="margin-top:1rem;"></div>`;
      const list = document.getElementById('publicDocuments');
      const search = document.getElementById('documentSearch');
      const render = () => renderDocuments(list, unfiledDocuments, search.value);
      search.addEventListener('input', render);
      render();
    } catch (error) {
      page.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
  }

  if (documentIndex) {
    loadIndex();
  } else if (documentCategory) {
    loadCategoryPage();
  }
});
