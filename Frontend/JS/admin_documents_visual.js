document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('otherDocumentsList');
  const search = document.getElementById('otherDocumentSearch');
  let documents = [];

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  function render() {
    const term = (search.value || '').trim().toLowerCase();
    const filtered = documents.filter((document) => document.title.toLowerCase().includes(term));
    list.innerHTML = filtered.length ? filtered.map((document) => `
      <article class="dashboard-card admin-document-view-card">
        <h3>${escapeHtml(document.title)}</h3>
        <p>Категорія: інше</p>
        <div class="admin-document-files">
          ${document.files.map((file) => `<a href="${escapeHtml(file.file_path)}" target="_blank" rel="noopener">${escapeHtml(file.original_name)}</a>`).join('')}
        </div>
      </article>`).join('') : '<p>Документів категорії «інше» не знайдено.</p>';
  }

  async function load() {
    try {
      const response = await fetch('/api/documents');
      const allDocuments = await response.json();
      documents = allDocuments.filter((document) => document.category === 'інше');
      render();
    } catch (error) {
      list.innerHTML = '<p>Не вдалося завантажити документи.</p>';
    }
  }

  search.addEventListener('input', render);
  load();
});
