const AGE_LABELS = {
  adult: 'Дорослі',
  u23: 'U23',
  u20: 'U20',
  u17: 'U17',
  u15: 'U15',
};

const yearSelect = document.getElementById('rosterYear');
const ageSelect = document.getElementById('rosterAge');
const championshipSelect = document.getElementById('rosterChampionship');
const championshipLabel = document.getElementById('rosterChampionshipLabel');
const athleteCards = document.getElementById('athleteCards');
const coachCards = document.getElementById('coachCards');
const rosterMessage = document.getElementById('rosterMessage');
const saveRosterBtn = document.getElementById('saveRosterBtn');
const addCoachBtn = document.getElementById('addCoachBtn');
const addPreviousAthleteBtn = document.getElementById('addPreviousAthleteBtn');
const previousAthletePicker = document.getElementById('previousAthletePicker');
const previousAthleteSelect = document.getElementById('previousAthleteSelect');
let rosterYears = [];
let currentRoster = { athletes: [], coaches: [] };
let previousAthletes = [];

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function showMessage(message, isError = false) {
  rosterMessage.textContent = message;
  rosterMessage.classList.toggle('is-error', isError);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Сталася помилка запиту.');
  return payload;
}

function createMemberCard(member, kind, index) {
  const label = kind === 'athlete' ? 'Спортсмен' : 'Тренер';
  const image = member.photo_url || member.image || '';
  const fields = kind === 'athlete'
    ? [
      ['name', 'Ім’я та прізвище', 'text'],
      ['birth_date', 'Дата народження', 'date'],
      ['city', 'Місто', 'text'],
      ['weight', 'Вагова категорія', 'text'],
      ['title', 'Звання / підпис', 'text'],
      ['achievements', 'Досягнення (кожне з нового рядка)', 'textarea'],
    ]
    : [
      ['name', 'Ім’я та прізвище', 'text'],
      ['role', 'Посада', 'text'],
      ['city', 'Місто', 'text'],
      ['description', 'Додаткова інформація', 'textarea'],
    ];

  const inputs = fields.map(([field, title, type]) => {
    const value = field === 'achievements'
      ? (member.achievements || []).join('\n')
      : member[field] || '';
    const control = type === 'textarea'
      ? `<textarea data-field="${field}" rows="2">${escapeHtml(value)}</textarea>`
      : `<input data-field="${field}" type="${type}" value="${escapeHtml(value)}" />`;
    return `<label>${title}${control}</label>`;
  }).join('');

  return `
    <article class="roster-member-card" data-member-kind="${kind}" data-index="${index}"
      data-image="${escapeHtml(member.image)}" data-photo-id="${escapeHtml(member.photo_id)}">
      <h3>${label} ${index + 1}</h3>
      <img class="roster-photo-preview" src="${escapeHtml(image)}" alt="Фото: ${escapeHtml(member.name)}" ${image ? '' : 'hidden'} />
      ${inputs}
      <label>Завантажити фото (JPG, PNG або WebP; до 2 МБ)
        <input data-photo type="file" accept="image/jpeg,image/png,image/webp" />
      </label>
      <label class="roster-remove-photo"><input data-remove-photo type="checkbox" /> Видалити поточне фото</label>
      ${kind === 'coach' ? `<button type="button" class="delete-btn remove-coach-btn">Прибрати тренера</button>` : ''}
    </article>
  `;
}

function renderCards() {
  athleteCards.innerHTML = Array.from({ length: 10 }, (_, index) =>
    createMemberCard(currentRoster.athletes[index] || {}, 'athlete', index)).join('');
  coachCards.innerHTML = currentRoster.coaches
    .map((coach, index) => createMemberCard(coach, 'coach', index)).join('');
}

function readCards(container) {
  return Array.from(container.querySelectorAll('.roster-member-card')).map((card) => {
    const values = {
      image: card.dataset.image || '',
      photo_id: card.dataset.photoId || '',
      remove_photo: card.querySelector('[data-remove-photo]').checked,
      photo_file: card.querySelector('[data-photo]').files[0] || null,
    };
    card.querySelectorAll('[data-field]').forEach((input) => {
      values[input.dataset.field] = input.value.trim();
    });
    values.achievements = values.achievements
      ? values.achievements.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)
      : [];
    return values;
  });
}

function setChampionshipOptions() {
  const isU15 = ageSelect.value === 'u15';
  championshipLabel.hidden = isU15;
  if (isU15) championshipSelect.value = 'europe';
}

async function loadRoster() {
  setChampionshipOptions();
  showMessage('Завантаження складу…');
  try {
    const age = ageSelect.value;
    const year = yearSelect.value;
    const championship = championshipSelect.value;
    const payload = await fetchJson(`/api/national-team/roster/${year}/${age}`);
    currentRoster = payload.roster[championship];
    renderCards();
    previousAthletePicker.hidden = true;
    showMessage(`Склад ${AGE_LABELS[age]} — ${year}, чемпіонат ${championship === 'world' ? 'світу' : 'Європи'}.`);
  } catch (error) {
    currentRoster = { athletes: [], coaches: [] };
    renderCards();
    showMessage(error.message, true);
  }
}

async function loadYears(selectedYear) {
  const payload = await fetchJson('/api/national-team/settings');
  rosterYears = payload.years || [];
  yearSelect.innerHTML = rosterYears.map((year) => `<option value="${year}">${year}</option>`).join('');
  if (selectedYear && rosterYears.includes(Number(selectedYear))) yearSelect.value = selectedYear;
  if (!rosterYears.length) throw new Error('Спочатку створіть рік збірної.');
}

function serializeCards(cards, kind, formData) {
  return cards.map((card, index) => {
    if (card.photo_file) {
      formData.append(`${kind}_photo_${index}`, card.photo_file);
    }
    const { photo_file, ...values } = card;
    return values;
  });
}

document.getElementById('newRosterYearForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const yearInput = document.getElementById('newRosterYear');
  try {
    const payload = await fetchJson('/api/admin/national-team/years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: Number(yearInput.value) }),
    });
    await loadYears(payload.year);
    yearInput.value = '';
    await loadRoster();
  } catch (error) {
    showMessage(error.message, true);
  }
});

for (const select of [yearSelect, ageSelect, championshipSelect]) {
  select.addEventListener('change', loadRoster);
}

for (const container of [athleteCards, coachCards]) {
  container.addEventListener('change', (event) => {
    const input = event.target.closest('[data-photo]');
    if (!input || !input.files[0]) return;
    const card = input.closest('.roster-member-card');
    const preview = card.querySelector('.roster-photo-preview');
    preview.src = URL.createObjectURL(input.files[0]);
    preview.hidden = false;
    card.querySelector('[data-remove-photo]').checked = false;
  });
  container.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-remove-photo]');
    if (!checkbox || !checkbox.checked) return;
    const card = checkbox.closest('.roster-member-card');
    card.dataset.image = '';
    card.dataset.photoId = '';
    card.querySelector('[data-photo]').value = '';
    card.querySelector('.roster-photo-preview').hidden = true;
  });
}

addCoachBtn.addEventListener('click', () => {
  const coachIndex = coachCards.querySelectorAll('.roster-member-card').length;
  if (coachIndex >= 20) {
    showMessage('Можна додати не більше 20 тренерів.', true);
    return;
  }
  coachCards.insertAdjacentHTML('beforeend', createMemberCard({}, 'coach', coachIndex));
});

coachCards.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-coach-btn');
  if (!button) return;
  button.closest('.roster-member-card').remove();
  coachCards.querySelectorAll('.roster-member-card').forEach((card, index) => {
    card.dataset.index = index;
    card.querySelector('h3').textContent = `Тренер ${index + 1}`;
  });
});

addPreviousAthleteBtn.addEventListener('click', async () => {
  if (!previousAthletePicker.hidden) {
    previousAthletePicker.hidden = true;
    return;
  }
  try {
    const payload = await fetchJson(
      `/api/national-team/roster/${yearSelect.value}/${ageSelect.value}/${championshipSelect.value}/previous-athletes`
    );
    previousAthletes = payload.athletes || [];
    previousAthleteSelect.innerHTML = '<option value="">Оберіть спортсмена</option>'
      + previousAthletes.map((athlete, index) =>
        `<option value="${index}">${escapeHtml(athlete.name)}${athlete.weight ? ` — ${escapeHtml(athlete.weight)}` : ''}</option>`
      ).join('');
    previousAthletePicker.hidden = false;
    showMessage(payload.year
      ? `Спортсмени зі складу ${payload.year} доступні для перенесення.`
      : 'У попередніх роках спортсменів для цього складу немає.');
  } catch (error) {
    showMessage(error.message, true);
  }
});

previousAthleteSelect.addEventListener('change', () => {
  const athlete = previousAthletes[Number(previousAthleteSelect.value)];
  if (!athlete) return;
  const cards = readCards(athleteCards);
  const emptyIndex = cards.findIndex((card) => !card.name);
  if (emptyIndex < 0) {
    showMessage('Немає порожньої картки. Очистьте картку спортсмена перед перенесенням.', true);
    previousAthleteSelect.value = '';
    return;
  }
  const { id, year, ...member } = athlete;
  cards[emptyIndex] = { ...member, photo_file: null, remove_photo: false };
  currentRoster.athletes = cards;
  renderCards();
  previousAthleteSelect.value = '';
  showMessage(`${athlete.name} доданий до картки спортсмена ${emptyIndex + 1}.`);
});

saveRosterBtn.addEventListener('click', async () => {
  saveRosterBtn.disabled = true;
  try {
    const formData = new FormData();
    const athletes = serializeCards(readCards(athleteCards), 'athlete', formData);
    const coaches = serializeCards(readCards(coachCards), 'coach', formData);
    formData.append('roster', JSON.stringify({ athletes, coaches }));
    const payload = await fetchJson(
      `/api/admin/national-team/roster/${yearSelect.value}/${ageSelect.value}/${championshipSelect.value}`,
      { method: 'PUT', body: formData }
    );
    await loadRoster();
    showMessage(`Збережено карток: ${payload.saved}.`);
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    saveRosterBtn.disabled = false;
  }
});

loadYears().then(loadRoster).catch((error) => showMessage(error.message, true));
