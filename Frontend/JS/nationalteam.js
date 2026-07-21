



const staffMembers = [
	{ id: 'staff-1', role: 'Державний тренер', name: 'Каплуновський Андрій Олександрович', image: 'assets/images/Kaplunovski.webp', city: '', description: 'Державний тренер національної збірної.' },
	{ id: 'staff-2', role: 'Провідний тренер', name: 'Костенко Іван Павлович', image: 'assets/images/No-photo-m.png', city: '', description: 'Провідний тренер збірної.' },
	{ id: 'staff-3', role: 'Провідний тренер', name: 'Волошин Віталій Михайлович', image: 'assets/images/No-photo-m.png', city: '', description: 'Провідний тренер збірної.' },
	{ id: 'staff-4', role: 'Начальник команди', name: 'Полякова Тетяна Вікторівна', image: 'assets/images/Полякова Тетяна.jpeg', city: '', description: 'Начальник команди.' },
	{ id: 'staff-5', role: 'Начальник команди', name: 'Мегей Вікторія Леонідівна', image: 'assets/images/Мегей Вікторія.jpeg', city: '', description: 'Начальник команди.' },
	{ id: 'staff-6', role: 'Тренер - лікар', name: 'Мелешко Олександр Вікторович', image: 'assets/images/No-photo-m.png', city: '', description: 'Тренер-лікар.' },
	{ id: 'staff-7', role: 'Тренер - масажист', name: 'Глухарев Ігор Владиславович', image: 'assets/images/No-photo-m.png', city: '', description: 'Тренер-масажист.' },
	{ id: 'staff-8', role: 'Тренер - психолог', name: 'Курилюк Сергій Іванович', image: 'assets/images/No-photo-m.png', city: '', description: 'Тренер-психолог.' },
];

// ---------------------------------------------------------------------------
// Teams data: coaches and athletes per age category
// ---------------------------------------------------------------------------
function buildDummyAthletes(prefix) {
	const arr = [];
	for (let i = 1; i <= 10; i++) {
		arr.push({
			id: `${prefix}-athlete-${i}`,
			role: 'Спортсмен',
			name: `Спортсмен ${i}`,
			image: 'assets/images/No-photo-m.png',
			dob: '',
			city: '',
			title: '',
			weight: '',
			achievements: [],
		});
	}
	return arr;
}

function buildPlaceholderRoster(teamKey, count = 10) {
	return Array.from({ length: count }, (_, index) => ({
		id: `${teamKey}-world-placeholder-${index + 1}`,
		role: 'Спортсмен',
		name: `Спортсмен ${index + 1}`,
		image: 'assets/images/No-photo-m.png',
		dob: '',
		city: '',
		title: 'Склад світу',
		weight: '',
		achievements: [],
	}));
}

const teams = {
	adult: {
		coaches: [
			{ id: 'coach-adult-1', role: 'Головний тренер', name: 'Володимир Шацьких', image: 'assets/images/VolodymyrShatskih.jpg', city: 'Дніпро' },
			{ id: 'coach-adult-2', role: 'Старший тренер', name: 'Сарсян', image: 'assets/images/Sarasyan.jpg', city: '' },
			{ id: 'coach-adult-3', role: 'Старший тренер', name: 'Яшар Насіров', image: 'assets/images/YasharNasirov.jpg', city: 'Закарпаття' },
		],
		athletes: [
			{ id: 'adult-athlete-1', role: 'Спортсмен', name: 'Михайло Вишнивецький', image: 'assets/Дорослі/Europe/Михайло Вишнивецький (130 кг).png', dob: '', city: '', title: '', weight: '130 кг', achievements: [] },
			{ id: 'adult-athlete-2', role: 'Спортсмен', name: 'Владлен Козлюк', image: 'assets/Дорослі/Europe/Владлен Козлюк (97 кг).png', dob: '', city: '', title: '', weight: '97 кг', achievements: [] },
			{ id: 'adult-athlete-3', role: 'Спортсмен', name: 'Ярослав Фільчаков', image: 'assets/Дорослі/Europe/Ярослав Фільчаков (87 кг).png', dob: '', city: '', title: '', weight: '87 кг', achievements: [] },
			{ id: 'adult-athlete-4', role: 'Спортсмен', name: 'Руслан Абдієв', image: 'assets/Дорослі/Europe/Руслан Абдієв (82 кг).png', dob: '', city: '', title: '', weight: '82 кг', achievements: [] },
			{ id: 'adult-athlete-5', role: 'Спортсмен', name: 'Ірфан Мірзоєв', image: 'assets/Дорослі/Europe/Ірфан Мірзоєв (77 кг).png', dob: '', city: '', title: '', weight: '77 кг', achievements: [] },
			{ id: 'adult-athlete-6', role: 'Спортсмен', name: 'Дмитро Васильєв', image: 'assets/Дорослі/Europe/Дмитро Васильєв (72 кг).png', dob: '', city: '', title: '', weight: '72 кг', achievements: [] },
			{ id: 'adult-athlete-7', role: 'Спортсмен', name: 'Олександр Грушин', image: 'assets/Дорослі/Europe/Олександр Грушин (67 кг).png', dob: '', city: '', title: '', weight: '67 кг', achievements: [] },
			{ id: 'adult-athlete-8', role: 'Спортсмен', name: 'Максим Лю', image: 'assets/Дорослі/Europe/Максим Лю (63 кг).png', dob: '', city: '', title: '', weight: '63 кг', achievements: [] },
			{ id: 'adult-athlete-9', role: 'Спортсмен', name: 'Владислав Кузько', image: 'assets/Дорослі/Europe/Владислав Кузько (60 кг).png', dob: '', city: '', title: '', weight: '60 кг', achievements: [] },
			{ id: 'adult-athlete-10', role: 'Спортсмен', name: 'Іван Стефанський', image: 'assets/Дорослі/Europe/Іван Стефанський (55 кг).png', dob: '', city: '', title: '', weight: '55 кг', achievements: [] },
		],
		worldAthletes: buildPlaceholderRoster('adult', 10)
	},
	u23: {
		coaches: [
			{ id: 'coach-u23-1', role: 'Старший тренер', name: 'Армен Варданян', image: 'assets/images/vardanyan.jpg' },
			{ id: 'coach-u23-2', role: 'Старший тренер', name: 'Теміров Ленур', image: 'assets/images/Timirov.webp' },
		],
		athletes: [
			{ id: 'u23-athlete-1', role: 'Спортсмен', name: 'Іван Янковський', image: 'assets/u23/Europe/130кг - Іван Янковський.png', dob: '', city: '', title: '', weight: '130 кг', achievements: [] },
			{ id: 'u23-athlete-2', role: 'Спортсмен', name: 'Єгор Якушенко', image: 'assets/u23/Europe/97кг - Єгор Якушенко.png', dob: '', city: '', title: '', weight: '97 кг', achievements: [] },
			{ id: 'u23-athlete-3', role: 'Спортсмен', name: 'Владислав Солодчук', image: 'assets/u23/Europe/87кг - Владислав Солодчук.png', dob: '', city: '', title: '', weight: '87 кг', achievements: [] },
			{ id: 'u23-athlete-4', role: 'Спортсмен', name: 'Руслан Абдієв', image: 'assets/u23/Europe/82кг - Руслан Абдієв.png', dob: '', city: '', title: '', weight: '82 кг', achievements: [] },
			{ id: 'u23-athlete-5', role: 'Спортсмен', name: 'Ірфан Мірзоєв', image: 'assets/u23/Europe/77кг - Ірфан Мірзоєв.png', dob: '', city: '', title: '', weight: '77 кг', achievements: [] },
			{ id: 'u23-athlete-6', role: 'Спортсмен', name: 'Дмитро Васильєв', image: 'assets/u23/Europe/72кг - Дмитро Васильєв.png', dob: '', city: '', title: '', weight: '72 кг', achievements: [] },
			{ id: 'u23-athlete-7', role: 'Спортсмен', name: 'Імед Худжадзе', image: 'assets/u23/Europe/67кг - Імед Худжадзе.png', dob: '', city: '', title: '', weight: '67 кг', achievements: [] },
			{ id: 'u23-athlete-8', role: 'Спортсмен', name: 'Максут Султанов', image: 'assets/u23/Europe/63кг - Максут Султанов.png', dob: '', city: '', title: '', weight: '63 кг', achievements: [] },
			{ id: 'u23-athlete-9', role: 'Спортсмен', name: 'Євген Поковба', image: 'assets/u23/Europe/60кг - Євген Поковба.png', dob: '', city: '', title: '', weight: '60 кг', achievements: [] },
			{ id: 'u23-athlete-10', role: 'Спортсмен', name: 'Іван Стефанський', image: 'assets/u23/Europe/55кг - Іван Стефанський.jpg', dob: '', city: '', title: '', weight: '55 кг', achievements: [] },
		],
		worldAthletes: buildPlaceholderRoster('u23', 10)
	},
	u20: {
		coaches: [
			{ id: 'coach-u20-1', role: 'Старший тренер', name: 'Мягкий Євгеній', image: 'assets/u20/Coach/Євген Мягкий старший тренер збірної.png' },
			{ id: 'coach-u20-2', role: 'Старший тренер', name: 'Караєв Бутхус', image: 'assets/u20/Coach/Бутхузі Карая старший тренер збірної.png' },
		],
		athletes: [
			{ id: 'u20-athlete-1', role: 'Спортсмен', name: 'Іван Янковський', image: 'assets/u20/Europe/Іван Янковський 130 кг.png', dob: '', city: '', title: '', weight: '130 кг', achievements: [] },
			{ id: 'u20-athlete-2', role: 'Спортсмен', name: 'Єгор Якушенко', image: 'assets/u20/Europe/Єгор Якушенко 97 кг.png', dob: '', city: '', title: '', weight: '97 кг', achievements: [] },
			{ id: 'u20-athlete-3', role: 'Спортсмен', name: 'Владислав Солодчук', image: 'assets/u20/Europe/Владислав Солодчук 87 кг.png', dob: '', city: '', title: '', weight: '87 кг', achievements: [] },
			{ id: 'u20-athlete-4', role: 'Спортсмен', name: 'Єгор Легкий', image: 'assets/u20/Europe/Єгор Легкий 82 кг.png', dob: '', city: '', title: '', weight: '82 кг', achievements: [] },
			{ id: 'u20-athlete-5', role: 'Спортсмен', name: 'Павло Пошутилов', image: 'assets/u20/Europe/Павло Пошутилов 77 кг.png', dob: '', city: '', title: '', weight: '77 кг', achievements: [] },
			{ id: 'u20-athlete-6', role: 'Спортсмен', name: 'Дмитро Демʼяновський', image: 'assets/u20/Europe/Дмитро Демʼяновський 72 кг.png', dob: '', city: '', title: '', weight: '72 кг', achievements: [] },
			{ id: 'u20-athlete-7', role: 'Спортсмен', name: 'Владислав Покотило', image: 'assets/u20/Europe/Владислав Покотило 67 кг.png', dob: '', city: '', title: '', weight: '67 кг', achievements: [] },
			{ id: 'u20-athlete-8', role: 'Спортсмен', name: 'Максут Султанов', image: 'assets/u20/Europe/Максут Султанов 63 кг.png', dob: '', city: '', title: '', weight: '63 кг', achievements: [] },
			{ id: 'u20-athlete-9', role: 'Спортсмен', name: 'Герман Басараб', image: 'assets/u20/Europe/Герман Басараб 60 кг.png', dob: '', city: '', title: '', weight: '60 кг', achievements: [] },
			{ id: 'u20-athlete-10', role: 'Спортсмен', name: 'Богдан Різниченко', image: 'assets/u20/Europe/Богдан Різниченко 55 кг.png', dob: '', city: '', title: '', weight: '55 кг', achievements: [] },
		],
		worldAthletes: buildPlaceholderRoster('u20', 10)
	},
	u17: {
		coaches: [
			{ id: 'coach-u17-1', role: 'Старший тренер', name: 'Сергій Рутенко', image: 'assets/u17/Coach/Сергій Рутенко.jpeg' },
			{ id: 'coach-u17-2', role: 'Старший тренер', name: 'Караєв Бутхус', image: 'assets/u20/Coach/Бутхузі Карая старший тренер збірної.png' },
		],
		athletes: [
			{ id: 'u17-athlete-1', role: 'Спортсмен', name: 'Соколюк Максим', image: 'assets/u17/Europe/110 кг - СОКОЛЮК Максим.png', dob: '', city: '', title: '', weight: '110 кг', achievements: [] },
			{ id: 'u17-athlete-2', role: 'Спортсмен', name: 'Гліб Євсєєв', image: 'assets/u17/Europe/92 кг - Гліб Євсєєв.png', dob: '', city: '', title: '', weight: '92 кг', achievements: [] },
			{ id: 'u17-athlete-3', role: 'Спортсмен', name: 'Даниїл Мельничук', image: 'assets/u17/Europe/80 кг - Даниїл Мельничук.png', dob: '', city: '', title: '', weight: '80 кг', achievements: [] },
			{ id: 'u17-athlete-4', role: 'Спортсмен', name: 'Величко Владислав', image: 'assets/u17/Europe/71 кг - ВЕЛИЧКО Владислав.png', dob: '', city: '', title: '', weight: '71 кг', achievements: [] },
			{ id: 'u17-athlete-5', role: 'Спортсмен', name: 'Олександр Венець', image: 'assets/u17/Europe/65 кг - Олександр Венець.png', dob: '', city: '', title: '', weight: '65 кг', achievements: [] },
			{ id: 'u17-athlete-6', role: 'Спортсмен', name: 'Желобков Артем', image: 'assets/u17/Europe/60 кг - ЖЕЛОБКОВ Артем.png', dob: '', city: '', title: '', weight: '60 кг', achievements: [] },
			{ id: 'u17-athlete-7', role: 'Спортсмен', name: 'Гамідов Рахман', image: 'assets/u17/Europe/55 кг - ГАМІДОВ Рахман.png', dob: '', city: '', title: '', weight: '55 кг', achievements: [] },
			{ id: 'u17-athlete-8', role: 'Спортсмен', name: 'Шлапак Сергій', image: 'assets/u17/Europe/51 кг - ШЛАПАК Сергій.png', dob: '', city: '', title: '', weight: '51 кг', achievements: [] },
			{ id: 'u17-athlete-9', role: 'Спортсмен', name: 'Магеррамов Тимур', image: 'assets/u17/Europe/48 кг - МАГЕРРАМОВ Тимур.png', dob: '', city: '', title: '', weight: '48 кг', achievements: [] },
			{ id: 'u17-athlete-10', role: 'Спортсмен', name: 'Голубєв Руслан', image: 'assets/u17/Europe/45 кг - ГОЛУБЄВ Руслан.png', dob: '', city: '', title: '', weight: '45 кг', achievements: [] },
		],
		worldAthletes: [
				{ id: 'u17-world-athlete-1', role: 'Спортсмен', name: 'Тимофій Приходько', image: 'assets/u17/World/Тимофій Приходько 110кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '110 кг', achievements: [] },
				{ id: 'u17-world-athlete-2', role: 'Спортсмен', name: 'Гліб Євсєєв', image: 'assets/u17/World/Євсєєв Гліб 92кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '92 кг', achievements: [] },
				{ id: 'u17-world-athlete-3', role: 'Спортсмен', name: 'Даниїл Мельничук', image: 'assets/u17/World/80 кг - Даниїл Мельничук.png', dob: '', city: '', title: 'Склад світу', weight: '80 кг', achievements: [] },
				{ id: 'u17-world-athlete-4', role: 'Спортсмен', name: 'Роман Іваник', image: 'assets/u17/World/Роман Іваник 71кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '71 кг', achievements: [] },
				{ id: 'u17-world-athlete-5', role: 'Спортсмен', name: 'Ібрагім Насібов', image: 'assets/u17/World/Ібрагім Насібов 65кг.png', dob: '', city: '', title: 'Склад світу', weight: '65 кг', achievements: [] },
				{ id: 'u17-world-athlete-6', role: 'Спортсмен', name: 'Гамідов Рахман', image: 'assets/u17/World/Гамідов Рахман 60кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '60 кг', achievements: [] },
				{ id: 'u17-world-athlete-7', role: 'Спортсмен', name: 'Ілля Ванжул', image: 'assets/u17/World/Ілля Ванжул 55кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '55 кг', achievements: [] },
				{ id: 'u17-world-athlete-8', role: 'Спортсмен', name: 'Денис Кірик', image: 'assets/u17/World/Денис Кірик 51кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '51 кг', achievements: [] },
				{ id: 'u17-world-athlete-9', role: 'Спортсмен', name: 'Тимур Магерамов', image: 'assets/u17/World/Тимур Магерамов 48кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '48 кг', achievements: [] },
				{ id: 'u17-world-athlete-10', role: 'Спортсмен', name: 'Родіон Свіриденко', image: 'assets/u17/World/Родіон Свіриденко 45кг.jpeg', dob: '', city: '', title: 'Склад світу', weight: '45 кг', achievements: [] },
			]
	},
	u15: {
		coaches: [
			{ id: 'coach-u15-1', role: 'Старший тренер', name: 'Молнар Сергій', image: 'assets/images/Molnar.webp"' },
			{ id: 'coach-u15-2', role: 'Старший тренер', name: 'Гробован Олександр', image: 'assets/images/Grobovan.webp' },
		],
		athletes: [
			{ id: 'u15-athlete-1', role: 'Спортсмен', name: 'Алессандро Бурич', image: 'assets/u15/V.Burych.JPG', dob: '', city: 'Київська обл.', title: '', weight: '85 кг', achievements: [] },
			{ id: 'u15-athlete-2', role: 'Спортсмен', name: 'Вадим Мінковський', image: 'assets/u15/V.Minovski.JPG', dob: '', city: 'Одеська обл.', title: '', weight: '75 кг', achievements: [] },
			{ id: 'u15-athlete-3', role: 'Спортсмен', name: 'Віктор Шелков', image: 'assets/u15/V.Shelkov.JPG', dob: '', city: 'Одеська обл.', title: '', weight: '68 кг', achievements: [] },
			{ id: 'u15-athlete-4', role: 'Спортсмен', name: 'Євген Кравчук', image: 'assets/u15/Y.Kravchuk.JPG', dob: '', city: 'Рівненська обл.', title: '', weight: '62 кг', achievements: [] },
			{ id: 'u15-athlete-5', role: 'Спортсмен', name: 'Володимир Зикін', image: 'assets/u15/V.Zikin.JPG', dob: '', city: 'Миколаївська обл.', title: '', weight: '57 кг', achievements: [] },
			{ id: 'u15-athlete-6', role: 'Спортсмен', name: 'Владислав Димчишин', image: 'assets/u15/V.Dymchishin.webp', dob: '', city: 'Київ', title: '', weight: '52 кг', achievements: [] },
			{ id: 'u15-athlete-7', role: 'Спортсмен', name: 'Андрій Чуйко', image: 'assets/u15/A.Chuyko.webp', dob: '', city: 'Закарпатська обл.', title: '', weight: '48 кг', achievements: [] },
			{ id: 'u15-athlete-8', role: 'Спортсмен', name: 'Радіон Свириденко', image: 'assets/u15/R.Sveridenko.webp', dob: '', city: 'Запорізька обл.', title: '', weight: '44 кг', achievements: [] },
			{ id: 'u15-athlete-9', role: 'Спортсмен', name: 'Іван Гуцол', image: 'assets/u15/I_Gutsol.webp', dob: '', city: 'Запорізька обл.', title: '', weight: '41 кг', achievements: [] },
			{ id: 'u15-athlete-10', role: 'Спортсмен', name: 'Єгор Шевченко', image: 'assets/u15/Y.Shevchenko.webp', dob: '', city: 'Сумська обл.', title: '', weight: '38 кг', achievements: [] },
		],
		worldAthletes: buildPlaceholderRoster('u15', 10)
	}
};

const heroSlides = document.querySelectorAll('.hero-slide');
const coachGrid = document.getElementById('coachGrid');
const athleteGrid = document.getElementById('athleteGrid');
const staffGrid = document.getElementById('staffGrid');
const profileModal = document.getElementById('profileModal');
const profileClose = document.getElementById('profileClose');
const profileImage = document.getElementById('profileImage');
const profileCategory = document.getElementById('profileCategory');
const profileName = document.getElementById('profileName');
const profilePosition = document.getElementById('profilePosition');
const profileDetails = document.getElementById('profileDetails');
const profileExtra = document.getElementById('profileExtra');
const profileAchievements = document.getElementById('profileAchievements');
const TEAM_ROSTER_STORAGE_KEY = 'fgrbu_team_roster_mode';

let heroIndex = 0;
let slideTimer = null;
let activeTeamKey = 'adult';

function getStoredRosterMode(teamKey) {
  try {
    const saved = localStorage.getItem(`${TEAM_ROSTER_STORAGE_KEY}:${teamKey}`);
    return saved === 'world' ? 'world' : 'europe';
  } catch (error) {
    return 'europe';
  }
}

function getTeamRosterVariants(teamKey, team) {
  const europeSource = team.europeAthletes || team.athletes || [];
  const worldSource = team.worldAthletes || buildPlaceholderRoster(teamKey, europeSource.length || 10);

  const europeRoster = europeSource.map((athlete, index) => ({
    ...athlete,
    id: `${teamKey}-europe-${index + 1}`,
    title: 'Склад Європи',
    weight: athlete.weight || '',
  }));

  const worldRoster = worldSource.map((athlete, index) => ({
    ...athlete,
    id: `${teamKey}-world-${index + 1}`,
    title: 'Склад світу',
    weight: athlete.weight || '',
  }));

  return { europe: europeRoster, world: worldRoster };
}

function refreshCurrentTeamView() {
  if (activeTeamKey) {
    renderTeam(activeTeamKey);
    buildFadeInObserver();
  }
}

function rotateHeroSlides() {
	if (!heroSlides || heroSlides.length === 0) return;
	heroSlides.forEach((slide, index) => {
		slide.classList.toggle('active', index === heroIndex);
	});
	heroIndex = (heroIndex + 1) % heroSlides.length;
}

function createProfileCard(item, type) {
	if (type === 'athlete') {
		return `\n    <button class="profile-card-item fade-in-up" type="button" data-id="${item.id}" data-type="athlete">\n      <img src="${item.image}" alt="${item.name}" loading="lazy" />\n      <div class="profile-card-body">\n        <h4>${item.name}</h4>\n        <p>${item.title || item.role || ''}</p>\n        <p>${item.weight || ''}</p>\n      </div>\n    </button>\n  `;
	}

	if (type === 'staff') {
		return `\n    <button class="profile-card-item fade-in-up" type="button" data-id="${item.id}" data-type="staff">\n      <img src="${item.image}" alt="${item.name}" loading="lazy" />\n      <div class="profile-card-body">\n        <h4>${item.name}</h4>\n        <p>${item.role}</p>\n      </div>\n    </button>\n  `;
	}

	return `\n    <button class="profile-card-item fade-in-up" type="button" data-id="${item.id}" data-type="coach">\n      <img src="${item.image}" alt="${item.name}" loading="lazy" />\n      <div class="profile-card-body">\n        <h4>${item.name}</h4>\n        <p>${item.role}</p>\n      </div>\n    </button>\n  `;
}

function createEmptyAthleteCard(label = 'Очікується') {
	return createProfileCard({
		id: `empty-athlete-${label}`,
		role: 'Спортсмен',
		name: label,
		image: 'assets/images/No-photo-m.png',
		dob: '',
		city: '',
		title: 'Спортсмен',
		weight: '',
		achievements: [],
	}, 'athlete');
}

function renderStaff() {
	if (!staffGrid) return;
	staffGrid.innerHTML = staffMembers.map((member) => createProfileCard(member, 'staff')).join('');
}

function renderTeam(teamKey) {
	const team = teams[teamKey];
	if (!team) return;
	coachGrid.innerHTML = team.coaches.map((c) => createProfileCard(c, 'coach')).join('');

	const shouldSplitGroups = ['adult', 'u23', 'u20', 'u17'].includes(teamKey);
	if (!shouldSplitGroups) {
		const roster = getTeamRosterVariants(teamKey, team).europe;
		athleteGrid.innerHTML = `
			<div class="team-subgroups">
				<div class="team-subgroup">
					<div class="team-subgroup-header"><h4>Чемпіонат Європи</h4></div>
					<div class="team-grid athletes-grid">${roster.map((a) => createProfileCard(a, 'athlete')).join('')}</div>
				</div>
			</div>
		`;
		return;
	}

	const rosterMode = getStoredRosterMode(teamKey);
	const rosterVariants = getTeamRosterVariants(teamKey, team);
	const primaryRoster = rosterMode === 'world' ? rosterVariants.world : rosterVariants.europe;
	const secondaryRoster = rosterMode === 'world' ? rosterVariants.europe : rosterVariants.world;
	const primaryLabel = rosterMode === 'world' ? 'Чемпіонат світу' : 'Чемпіонат Європи';
	const secondaryLabel = rosterMode === 'world' ? 'Чемпіонат Європи' : 'Чемпіонат світу';

	athleteGrid.innerHTML = `
		<div class="team-subgroups">
			<div class="team-subgroup">
				<div class="team-subgroup-header"><h4>${primaryLabel}</h4></div>
				<div class="team-grid athletes-grid">${primaryRoster.map((a) => createProfileCard(a, 'athlete')).join('')}</div>
			</div>
			<div class="team-subgroup">
				<div class="team-subgroup-header"><h4>${secondaryLabel}</h4></div>
				<div class="team-grid athletes-grid">${secondaryRoster.map((a) => createProfileCard(a, 'athlete')).join('')}</div>
			</div>
		</div>
	`;
}

function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString('uk-UA', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

function openProfile(item, type) {
	if (!item) return;

	profileImage.src = item.image;
	profileImage.alt = item.name;
	profileCategory.textContent = type === 'athlete' ? 'Спортсмен' : item.role;
	profileName.textContent = item.name;
	profilePosition.textContent = item.role;
	profileDetails.innerHTML = `\n      <div><span>Дата народження</span><strong>${formatDate(item.dob)}</strong></div>\n      <div><span>Місто</span><strong>${item.city}</strong></div>\n      ${type === 'athlete' ? '' : `<div><span>Рік призначення</span><strong>${item.appointed}</strong></div>`}\n    `;
	profileExtra.textContent = item.description || item.title || '';
	profileExtra.style.display = item.description || item.title ? 'block' : 'none';

	if (type === 'athlete') {
		profileAchievements.innerHTML = `\n      <h4>Досягнення</h4>\n      <ul>${item.achievements.map((achievement) => `<li>${achievement}</li>`).join('')}</ul>\n    `;
	} else {
		profileAchievements.innerHTML = '';
	}

	profileModal.classList.add('active');
	profileModal.setAttribute('aria-hidden', 'false');
	document.body.style.overflow = 'hidden';
}

function closeProfile() {
	profileModal.classList.remove('active');
	profileModal.setAttribute('aria-hidden', 'true');
	document.body.style.overflow = '';
}

function getItemById(id, type) {
	if (type === 'leader') return leaders.find((item) => item.id === id) || null;

	if (type === 'staff') {
		return staffMembers.find((item) => item.id === id) || null;
	}

	if (type === 'coach') {
		for (const key of Object.keys(teams)) {
			const found = (teams[key].coaches || []).find((c) => c.id === id);
			if (found) return found;
		}
		return null;
	}

	if (type === 'athlete') {
		for (const key of Object.keys(teams)) {
			const team = teams[key];
			const rosterVariants = getTeamRosterVariants(key, team);
			const combinedRoster = [...rosterVariants.europe, ...rosterVariants.world];
			const found = combinedRoster.find((item) => item.id === id);
			if (found) return found;
		}
		return null;
	}

	return null;
}

function setupEventListeners() {
	document.addEventListener('click', (event) => {
		const card = event.target.closest('[data-id]');
		if (!card) return;
		const id = card.dataset.id;
		const type = card.dataset.type;

		if (type && id) {
			const item = getItemById(id, type);
			if (item) {
				openProfile(item, type);
			}
		}
	});

	profileClose.addEventListener('click', closeProfile);

	profileModal.addEventListener('click', (event) => {
		if (event.target === profileModal) {
			closeProfile();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && profileModal.classList.contains('active')) {
			closeProfile();
		}
	});
}

function buildFadeInObserver() {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('visible');
				observer.unobserve(entry.target);
			}
		});
	}, {
		threshold: 0.15,
	});

	document.querySelectorAll('.fade-in-up').forEach((element) => observer.observe(element));
}

function initHeroSlider() {
	if (!heroSlides || heroSlides.length === 0) return;
	rotateHeroSlides();
	slideTimer = setInterval(rotateHeroSlides, 4000);
}

window.addEventListener('DOMContentLoaded', () => {
	activeTeamKey = 'adult';
	renderStaff();
	renderTeam(activeTeamKey);

	document.querySelectorAll('.team-tab').forEach(btn => {
		btn.addEventListener('click', () => {
			const team = btn.dataset.team;
			activeTeamKey = team;
			document.querySelectorAll('.team-tab').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			renderTeam(team);
			buildFadeInObserver();
		});
	});

	window.addEventListener('storage', (event) => {
		if (event.key && event.key.startsWith(TEAM_ROSTER_STORAGE_KEY)) {
			refreshCurrentTeamView();
		}
	});

	window.addEventListener('fgrbu-roster-preference-changed', () => {
		refreshCurrentTeamView();
	});

	setupEventListeners();
	initHeroSlider();
	buildFadeInObserver();
});
