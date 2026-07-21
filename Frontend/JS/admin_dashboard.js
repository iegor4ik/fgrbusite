const TEAM_ROSTER_STORAGE_KEY = 'fgrbu_team_roster_mode';
const TEAM_ROSTER_OPTIONS = [
  { key: 'adult', label: 'Дорослі', modes: ['europe', 'world'] },
  { key: 'u23', label: 'U23', modes: ['europe', 'world'] },
  { key: 'u20', label: 'U20', modes: ['europe', 'world'] },
  { key: 'u17', label: 'U17', modes: ['europe', 'world'] },
  { key: 'u15', label: 'U15', modes: ['europe'] },
];

function getStoredRosterMode(teamKey) {
  try {
    const saved = localStorage.getItem(`${TEAM_ROSTER_STORAGE_KEY}:${teamKey}`);
    return saved === 'world' ? 'world' : 'europe';
  } catch (error) {
    return 'europe';
  }
}

function setStoredRosterMode(teamKey, mode) {
  try {
    localStorage.setItem(`${TEAM_ROSTER_STORAGE_KEY}:${teamKey}`, mode);
  } catch (error) {
    console.warn('Не вдалося зберегти режим складу збірної', error);
  }
  window.dispatchEvent(new CustomEvent('fgrbu-roster-preference-changed', { detail: { teamKey, mode } }));
}

document.addEventListener('DOMContentLoaded', () => {
  const newsCountValue = document.getElementById('newsCountValue');
  const galleryCountValue = document.getElementById('galleryCountValue');
  const onlineCountValue = document.getElementById('onlineCountValue');
  const dashboardStatusText = document.getElementById('dashboardStatusText');
  const rosterControls = document.getElementById('teamRosterControls');

  function renderRosterControls() {
    if (!rosterControls) return;

    rosterControls.innerHTML = TEAM_ROSTER_OPTIONS.map((team) => {
      const activeMode = getStoredRosterMode(team.key);
      const buttons = team.modes.map((mode) => {
        const isActive = activeMode === mode;
        const label = mode === 'world' ? 'Чемпіонат світу' : 'Чемпіонат Європи';
        return `
          <button
            class="team-roster-btn ${isActive ? 'active' : ''}"
            type="button"
            data-team-key="${team.key}"
            data-mode="${mode}"
            aria-pressed="${isActive ? 'true' : 'false'}"
          >${label}</button>
        `;
      }).join('');

      return `
        <div class="dashboard-roster-row">
          <div class="dashboard-roster-label">${team.label}</div>
          <div class="dashboard-roster-buttons">${buttons}</div>
        </div>
      `;
    }).join('');
  }

  function setLoadingState(isLoading) {
    if (!dashboardStatusText) return;
    dashboardStatusText.textContent = isLoading ? 'Оновлюємо статистику…' : 'Оновлено в реальному часі';
    dashboardStatusText.classList.toggle('is-loading', isLoading);
  }

  async function loadDashboardStats() {
    if (!newsCountValue || !galleryCountValue || !onlineCountValue) return;

    setLoadingState(true);
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error('Не вдалося отримати статистику');
      }

      const payload = await response.json();
      newsCountValue.textContent = Number(payload.news_count ?? 0).toLocaleString('uk-UA');
      galleryCountValue.textContent = Number(payload.gallery_photo_count ?? 0).toLocaleString('uk-UA');
      onlineCountValue.textContent = Number(payload.online_users ?? 0).toLocaleString('uk-UA');
      dashboardStatusText.textContent = 'Оновлено в реальному часі';
      dashboardStatusText.classList.remove('is-error');
    } catch (error) {
      newsCountValue.textContent = '0';
      galleryCountValue.textContent = '0';
      onlineCountValue.textContent = '0';
      dashboardStatusText.textContent = 'Статистика тимчасово недоступна';
      dashboardStatusText.classList.add('is-error');
    } finally {
      setLoadingState(false);
    }
  }

  rosterControls?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-team-key][data-mode]');
    if (!button) return;

    const teamKey = button.dataset.teamKey;
    const mode = button.dataset.mode;
    setStoredRosterMode(teamKey, mode);
    renderRosterControls();
  });

  renderRosterControls();
  loadDashboardStats();
  window.setInterval(loadDashboardStats, 10000);
});
