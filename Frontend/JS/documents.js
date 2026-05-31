document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('publicDocuments');
  const searchInput = document.getElementById('documentSearch');
  const categoriesEl = document.getElementById('documentCategories');
  let allDocuments = [];
  let activeCategory = 'Усе';
  let searchTerm = '';

  async function load() {
    container.innerHTML = '<p>Завантаження...</p>';
    try {
      const res = await fetch('/api/documents');
      allDocuments = await res.json();
      render(getFilteredDocuments());
    } catch (e) {
      container.innerHTML = '<p>Не вдалося завантажити документи.</p>';
    }
  }

  function getFilteredDocuments() {
    const search = searchTerm.trim().toLowerCase();
    return allDocuments.filter((doc) => {
      const matchesCategory = activeCategory === 'Усе' || doc.category === activeCategory;
      const matchesSearch = !search || doc.title.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }

  function render(docs) {
    container.innerHTML = '';
    if (!docs.length) {
      container.innerHTML = '<p>Документи відсутні.</p>';
      return;
    }
    docs.forEach((doc) => {
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
      container.appendChild(card);
    });
  }

  function updateActiveCategory(button) {
    categoriesEl.querySelectorAll('.category-btn').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
  }

  function onCardClick(doc) {
    if (!doc.files || !doc.files.length) return;
    if (doc.files.length === 1) {
      window.open(doc.files[0].file_path, '_blank');
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
          ${doc.files.map((f) => `<div style="margin:0.5rem 0;"><a href="${f.file_path}" target="_blank">${escapeHtml(f.original_name)}</a></div>`).join('')}
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) modal.remove();
    });
    document.body.appendChild(modal);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      searchTerm = event.target.value || '';
      render(getFilteredDocuments());
    });
  }

  if (categoriesEl) {
    categoriesEl.addEventListener('click', (event) => {
      const button = event.target.closest('.category-btn');
      if (!button) return;
      activeCategory = button.dataset.category || 'Усе';
      updateActiveCategory(button);
      render(getFilteredDocuments());
    });
  }

  load();
});