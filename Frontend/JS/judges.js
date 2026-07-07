// ==========================================================================
// JUDGES PAGE - Local modal interaction for judges cards
// ==========================================================================

const judgeProfiles = {
  'judge-head': {
    name: 'Ситнік Віталій Михайлович',
    role: 'Голова суддівського комітету Федерації греко-римської боротьби України',
    image: 'assets/images/Sitnik.webp',
    description: 'Інформацію про голову суддівського комітету буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-1': {
    name: 'Кулішенко Олександр Миколайович',
    role: 'Суддя міжнародної категорії',
    image: 'assets/images/KulishO.webp',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-2': {
    name: 'Кулішенко Сергій Миколайович',
    role: 'Суддя міжнародної категорії',
    image: 'assets/images/KulishS.webp',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-3': {
    name: 'Горбатько Андрій',
    role: 'Суддя міжнародної категорії',
    image: 'assets/images/Gorbatko.webp',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
};

for (let index = 1; index <= 10; index += 1) {
  judgeProfiles[`judge-nat-${index}`] = {
    name: 'Очікується',
    role: 'Суддя національної категорії',
    image: 'assets/images/No-photo-m.png',
    description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  };
}

const profileModal = document.getElementById('profileModal');
const profileClose = document.getElementById('profileClose');
const profileImage = document.getElementById('profileImage');
const profileCategory = document.getElementById('profileCategory');
const profileName = document.getElementById('profileName');
const profilePosition = document.getElementById('profilePosition');
const profileDetails = document.getElementById('profileDetails');
const profileExtra = document.getElementById('profileExtra');

function formatDate(value) {
  if (!value) return 'Не вказана';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Не вказана';
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function openJudgeModal(profile) {
  if (!profileModal || !profile) return;

  profileImage.src = profile.image;
  profileImage.alt = profile.name;
  profileCategory.textContent = profile.role;
  profileName.textContent = profile.name;
  profilePosition.textContent = profile.role;

  profileDetails.innerHTML = `
    <div>
      <span>Місто</span>
      <strong>${profile.city || 'Не вказано'}</strong>
    </div>
    <div>
      <span>Дата народження</span>
      <strong>${formatDate(profile.dob)}</strong>
    </div>
    <div>
      <span>Рік призначення</span>
      <strong>${profile.appointed || 'Не вказано'}</strong>
    </div>
  `;

  profileExtra.textContent = profile.description || 'Інформація відсутня.';
  profileExtra.style.display = profile.description ? 'block' : 'none';

  profileModal.classList.add('active');
  profileModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function renderJudgeCards() {
  document.querySelectorAll('.presidium-card[data-id]').forEach((card) => {
    const id = card.dataset.id;
    const profile = judgeProfiles[id];
    if (!profile) return;

    const img = card.querySelector('img');
    const titleEl = card.querySelector('h4');
    const roleEl = card.querySelector('p');

    if (img) {
      img.src = profile.image;
      img.alt = profile.name;
    }

    if (titleEl) {
      titleEl.textContent = profile.name;
    }

    if (roleEl) {
      roleEl.textContent = profile.role;
    }

    if (!titleEl || !roleEl) {
      const body = card.querySelector('.presidium-card-body');
      if (body) {
        body.innerHTML = `
          <h4>${profile.name}</h4>
          <p>${profile.role}</p>
        `;
      }
    }
  });
}

function closeJudgeModal() {
  if (!profileModal) return;
  profileModal.classList.remove('active');
  profileModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function handleCardClick(event) {
  const card = event.target.closest('.presidium-card');
  if (!card) return;

  const id = card.dataset.id;
  if (!id) return;

  const profile = judgeProfiles[id];
  if (!profile) return;

  openJudgeModal(profile);
}

function handleDocumentClick(event) {
  if (!profileModal) return;
  if (event.target === profileModal) {
    closeJudgeModal();
  }
}

function handleKeyDown(event) {
  if (event.key === 'Escape' && profileModal?.classList.contains('active')) {
    closeJudgeModal();
  }
}

function initJudgesPage() {
  renderJudgeCards();
  document.addEventListener('click', handleCardClick);
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleKeyDown);
  profileClose?.addEventListener('click', closeJudgeModal);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initJudgesPage);
} else {
  initJudgesPage();
}
