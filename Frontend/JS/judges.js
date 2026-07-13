// ==========================================================================
// JUDGES PAGE - Local modal interaction for judges cards
// ==========================================================================

const judgeProfiles = {
  'judge-head': {
    name: 'Ситнік Віталій Михайлович',
    role: 'Голова суддівського комітету Федерації греко-римської боротьби України',
    image: 'assets/judges/Ситнік Віталій Михайлович ГК.webp',
    description: 'Інформацію про голову суддівського комітету буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-1': {
    name: 'Васьківський Григорій Васильович',
    role: 'Суддя міжнародної категорії',
    image: 'assets/judges/Васьківський Григорій Васильович МК.jpeg',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-2': {
    name: 'Горбатько Андрій',
    role: 'Суддя міжнародної категорії',
    image: 'assets/judges/Горбатько Андрій МК.webp',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-3': {
    name: 'Кулішенко Олександр Миколайович',
    role: 'Суддя міжнародної категорії',
    image: 'assets/judges/Кулішенко Олександр Миколайович МК.webp',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-4': {
    name: 'Кулішенко Сергій Миколайович',
    role: 'Суддя міжнародної категорії',
    image: 'assets/judges/Кулішенко Сергій Миколайович MK.webp',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-5': {
    name: 'Собчук Олег Васильович',
    role: 'Суддя міжнародної категорії',
    image: 'assets/judges/Собчук Олег Васильович МК.jpeg',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
  'judge-int-6': {
    name: 'Щербаков Олександр Володимирович',
    role: 'Суддя міжнародної категорії',
    image: 'assets/judges/Щербаков Олександр Володимирович МК.jpeg',
    description: 'Інформацію про суддю міжнародної категорії буде додано найближчим часом.',
    city: 'Не вказано',
    dob: '',
    appointed: '',
  },
};

judgeProfiles['judge-nat-1'] = {
  name: 'Гаврилюк Сергій Сергійович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Гаврилюк Сергій Сергійович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-2'] = {
  name: 'Горбань Микола Андрійович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Горбань Микола Андрійович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-3'] = {
  name: 'Кононов Віталій Леонідович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Кононов Віталій Леонідович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-4'] = {
  name: 'Кукушкін Іван Іванович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Кукушкін Іван Іванович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-5'] = {
  name: 'Кулак Румлан Сергійович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Кулак Румлан Сергійович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-6'] = {
  name: 'Машкевич Павло Євгенович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Машкевич Павло Євгенович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-7'] = {
  name: 'Никитенко Юрій Олександрович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Никитенко Юрій  Олександрович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-8'] = {
  name: 'Петришин Ярослав Віталійович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Петришин Ярослав Віталійович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-9'] = {
  name: 'Соколов Олександр Валентинович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Соколов Олександр Валентинович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

judgeProfiles['judge-nat-10'] = {
  name: 'Чижов Сергій Валерійович',
  role: 'Суддя національної категорії',
  image: 'assets/judges/Чижов Сергій Валерійович НК.jpeg',
  description: 'Інформацію про суддю національної категорії буде додано найближчим часом.',
  city: 'Не вказано',
  dob: '',
  appointed: '',
};

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
