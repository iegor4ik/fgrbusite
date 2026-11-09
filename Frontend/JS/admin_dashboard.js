const TEAM_ROSTER_OPTIONS = [
  { key: 'adult', label: 'Дорослі', modes: ['europe', 'world'] },
  { key: 'u23', label: 'U23', modes: ['europe', 'world'] },
  { key: 'u20', label: 'U20', modes: ['europe', 'world'] },
  { key: 'u17', label: 'U17', modes: ['europe', 'world'] },
  { key: 'u15', label: 'U15', modes: ['europe'] },
];

const TEAM_API = '/api';
let teamSettings = {};
let teamYears = [];

document.addEventListener('DOMContentLoaded', () => {
  const newsCountValue = document.getElementById('newsCountValue');
  const galleryCountValue = document.getElementById('galleryCountValue');
  const onlineCountValue = document.getElementById('onlineCountValue');
  const dashboardStatusText = document.getElementById('dashboardStatusText');
  const rosterControls = document.getElementById('teamRosterControls');

  function renderRosterControls() {
    if (!rosterControls) return;

    rosterControls.innerHTML = TEAM_ROSTER_OPTIONS.map((team) => {
      const current = teamSettings[team.key] || { year: teamYears[0], championship: 'europe' };
      const activeMode = current.championship;
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
          <div class="dashboard-roster-controls">
            <label class="dashboard-year-label">Рік
              <select class="dashboard-roster-year" data-team-key="${team.key}">
                ${teamYears.map((year) => `<option value="${year}" ${Number(current.year) === year ? 'selected' : ''}>${year}</option>`).join('')}
              </select>
            </label>
            <div class="dashboard-roster-buttons">${buttons}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function saveTeamSetting(teamKey, values) {
    const response = await fetch(`${TEAM_API}/admin/national-team/display/${teamKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: Number(values.year),
        championship: values.championship,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Не вдалося зберегти налаштування збірної.');
    teamSettings = payload.settings;
  }

  async function loadTeamSettings() {
    const response = await fetch(`${TEAM_API}/national-team/settings`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Не вдалося завантажити роки збірної.');
    teamYears = payload.years || [];
    teamSettings = payload.settings || {};
    renderRosterControls();
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

  rosterControls?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-team-key][data-mode]');
    if (!button) return;

    const teamKey = button.dataset.teamKey;
    const mode = button.dataset.mode;
    try {
      await saveTeamSetting(teamKey, { ...teamSettings[teamKey], championship: mode });
      renderRosterControls();
    } catch (error) {
      window.alert(error.message);
    }
  });

  rosterControls?.addEventListener('change', async (event) => {
    const select = event.target.closest('.dashboard-roster-year');
    if (!select) return;
    const teamKey = select.dataset.teamKey;
    try {
      await saveTeamSetting(teamKey, { ...teamSettings[teamKey], year: select.value });
      renderRosterControls();
    } catch (error) {
      window.alert(error.message);
      renderRosterControls();
    }
  });

  loadTeamSettings().catch((error) => {
    if (dashboardStatusText) {
      dashboardStatusText.textContent = error.message;
      dashboardStatusText.classList.add('is-error');
    }
  });
  loadDashboardStats();
  window.setInterval(loadDashboardStats, 10000);
});
