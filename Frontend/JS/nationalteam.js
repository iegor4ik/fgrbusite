// National Team page script: slider, cards, and modal interactions
const leaders = [
	{
		id: 'leader-1',
		role: 'Президент Асоціації спортивної боротьби ',
		name: 'Сазонов Олег Юрійович',
		image: "assets/images/oleg-sazonov.jpg",
		dob: '1973-08-20',
		appointed: '2018',
		city: 'Кременчук',
		description: 'Очолює федерацію та формує стратегію розвитку, підтримує молодіжні програми й підсилює міжнародні зв’язки.',
	},
	{
		id: 'leader-2',
		role: 'Перший віце-президент Федерації греко-римської боротьби',
		name: 'Коваль Віталій Станіславович',
		image: "assets/images/Vitaliy_Koval'.jpg",
		dob: '1982-07-05',
		appointed: '2018',
		city: 'Рівне',
		description: 'Керує напрямком спортивної підготовки та координує програму розвитку тренерського складу.',
	},
    {
		id: 'leader-3',
		role: 'Генеральний секретар Федерації греко-римської боротьби',
		name: 'Каплуновський Андрій Олександрович',
		image: "assets/images/photo_5206177327367263296_y.jpg",
		dob: '',
		appointed: '2018',
		city: 'Харків',
		description: 'Працює у координації підготовки національної збірної, взаємодії федерації з Міністерством молоді та спорту та організації міжнародних стартів.',
	},
];

const coaches = [
	{
		id: 'coach-1',
		role: 'Головний тренер',
		name: 'Володимир Шацьких',
		image: "assets/images/VolodymyrShatskih.jpg",
		dob: '1981-07-02',
		appointed: '',
		city: 'Дніпро',
		description: 'Борець греко-римського стилю, чемпіон світу 2006 року у вазі до 74 кг, Віце-чемпіон Європи 2009 року та учасник Олімпійських ігор 2004 і 2008 років. Після завершення кар’єри очолив дорослу збірну України з греко-римської боротьби. Також відомий як особистий тренер олімпійського чемпіона Жана Беленюка. Має звання заслуженого майстра спорту України та заслуженого працівника фізичної культури і спорту України. У 2024 році був нагороджений орденом «За заслуги» II ступеня.',
	},
	{
		id: 'coach-2',
		role: 'Державний тренер',
		name: 'Андрій Каплуновський',
		image: 'assets/images/Kaplunovski.webp',
		dob: '',
		appointed: '',
		city: 'Харків',
		description: 'Працює у координації підготовки національної збірної, взаємодії федерації з Міністерством молоді та спорту та організації міжнародних стартів.',
	},
	{
		id: 'coach-3',
		role: 'Старший тренер',
		name: 'Армен Варданян',
		image: "assets/images/vardanyan.jpg",
		dob: '1982-11-30',
		appointed: '',
		city: '',
		description: 'Український борець греко-римського стилю вірменського походження, бронзовий призер Олімпійських ігор 2008 року, чемпіон Європи 2004 та 2008 років, срібний призер чемпіонату світу 2003 року. Багаторічний лідер збірної України у категорії до 66 кг. Після завершення спортивної кар’єри працює у тренерському штабі національної команди. Має звання заслуженого майстра спорту України.',
	},
	{
		id: 'coach-4',
		role: 'Старший тренер',
		name: 'Яшар Насіров',
		image: "assets/images/YasharNasirov.jpg",
		dob: '',
		appointed: '',
		city: 'Закарпаття',
		description: 'Тренер з греко-римської боротьби, заслужений тренер України та один із відомих наставників Закарпаття. Працював зі спортсменами юніорської та молодіжної збірних України, а також був старшим тренером юніорської національної команди з греко-римської боротьби. Відомий підготовкою перспективних борців міжнародного рівня та розвитком школи греко-римської боротьби у Береговому.',
	},
];

const athletes = [
	{
		id: 'athlete-1',
		role: 'Спортсмен',
		name: 'Михайло Вишневецький',
		image: "assets/images/Vyshnevetski.jpg",
		dob: '2002',
		city: 'Харків',
		title: 'Майстер спорту міжнародного класу',
		weight: '130 кг',
		achievements: ['Чемпон Європи U23', 'Чемпіон України 9x'],
	},
	{
		id: 'athlete-2',
		role: 'Спортсмен',
		name: 'Єгор Якушенко',
		image: "assets/images/Yakushenko.jpg",
		dob: '2006',
		city: 'Київ',
		title: 'Майстер спорту міжнародного класу',
		weight: '97 кг',
		achievements: ['Чемпіон світу U20/U23', 'Чемпіон Європи U20/U23 x2'],
	},
	{
		id: 'athlete-3',
		role: 'Спортсмен',
		name: 'Ярослав Фільчаков',
		image: "assets/images/Yaroslav_Filchakov_(UKR).jpg",
		dob: '1995',
		city: 'Харків',
		title: 'Майстер спорту міжнародного класу',
		weight: '87 кг',
		achievements: ['Бронзовий призер чемпіонату світу', 'Віце-чемпіон Європи'],
	},
	{
		id: 'athlete-4',
		role: 'Спортсмен',
		name: 'Руслан Абдієв',
		image: "assets/images/Abdiev.jpg",
		dob: '2003',
		city: 'Харків',
		title: 'Майстер спорту міжнародного класу',
		weight: '82 кг',
		achievements: ['Віце-чемпіон світу', 'Переможець міжнародного Grand Prix'],
	},
	{
		id: 'athlete-5',
		role: 'Спортсмен',
		name: 'Ірфан Мірзоєв',
		image: "assets/images/Mirzoev.jpg",
		dob: '2004',
		city: 'АР Крим',
		title: 'Майстер спорту міжнародного класу',
		weight: '77 кг',
		achievements: ['Чемпіон світу', 'Бронзовий призер чемпіонату Європи'],
	},
	{
		id: 'athlete-6',
		role: 'Спортсмен',
		name: 'Парвіз Насібов',
		image: "assets/images/Parviz_Nasibov_2021_(crop).jpg",
		dob: '1998',
		city: 'Запоріжжя',
		title: 'Заслужений Майстер спорту України',
		weight: '72 кг',
		achievements: ['Віце-чемпіон Олімпійських Ігор 2x', 'Бронзовий призер чемпіонату Європи 2x'],
	},
	{
		id: 'athlete-7',
		role: 'Спортсмен',
		name: 'Олександр Грушин',
		image: "assets/images/Hrushin.jpg",
		dob: '1998',
		city: 'Київ',
		title: 'Майстер спорту міжнародного класу',
		weight: '67 кг',
		achievements: ['Віце-Чемпіон Європи', 'Бронзовий призер чемпіонату Європи'],
	},
	{
		id: 'athlete-8',
		role: 'Спортсмен',
		name: 'Максим Лю',
		image: "assets/images/lyu.jpg",
		dob: '2000',
		city: 'Полтава',
		title: 'Майстер спорту міжнародного класу',
		weight: '63 кг',
		achievements: ['Переможець міжнародного Grand Prix', 'Чемпіон України'],
	},
	{
		id: 'athlete-9',
		role: 'Спортсмен',
		name: 'Владислав Кузько',
        image: "assets/images/Kuzko.jpg",
        dob: '2000',
		city: 'Запоріжжя',
		title: 'Майстер спорту України',
		weight: '55 кг',
		achievements: ['Переможець міжнародного Grand Prix', 'Чемпіон України 3x'],
	},
	{
		id: 'athlete-10',
		role: 'Спортсмен',
		name: 'Іван Стефанський',
		image: "assets/images/Stefanski.jpg",
		dob: '2004',
		city: 'Дніпро',
		title: 'Майстер спорту України',
		weight: '55 кг',
		achievements: ['Переможець міжнародного Grand Prix', 'Чемпіон України'],
	},
];

const heroSlides = document.querySelectorAll('.hero-slide');
const coachGrid = document.getElementById('coachGrid');
const athleteGrid = document.getElementById('athleteGrid');
const profileModal = document.getElementById('profileModal');
const profileClose = document.getElementById('profileClose');
const profileImage = document.getElementById('profileImage');
const profileCategory = document.getElementById('profileCategory');
const profileName = document.getElementById('profileName');
const profilePosition = document.getElementById('profilePosition');
const profileDetails = document.getElementById('profileDetails');
const profileExtra = document.getElementById('profileExtra');
const profileAchievements = document.getElementById('profileAchievements');

let heroIndex = 0;
let slideTimer = null;

function rotateHeroSlides() {
	heroSlides.forEach((slide, index) => {
		slide.classList.toggle('active', index === heroIndex);
	});
	heroIndex = (heroIndex + 1) % heroSlides.length;
}

function createProfileCard(item, type) {
	return `\n    <button class="profile-card-item fade-in-up" type="button" data-id="${item.id}" data-type="${type}">\n      <img src="${item.image}" alt="${item.name}" loading="lazy" />\n      <div class="profile-card-body">\n        <h4>${item.name}</h4>\n        <p>${item.role}</p>\n      </div>\n    </button>\n  `;
}

function renderCards() {
	coachGrid.innerHTML = coaches.map((coach) => createProfileCard(coach, 'coach')).join('');
	athleteGrid.innerHTML = athletes.map((athlete) => {
		return `\n      <button class="profile-card-item fade-in-up" type="button" data-id="${athlete.id}" data-type="athlete">\n        <img src="${athlete.image}" alt="${athlete.name}" loading="lazy" />\n        <div class="profile-card-body">\n          <h4>${athlete.name}</h4>\n          <p>${athlete.title}</p>\n          <p>${athlete.weight}</p>\n        </div>\n      </button>\n    `;
	}).join('');
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
	if (type === 'leader') return leaders.find((item) => item.id === id);
	if (type === 'coach') return coaches.find((item) => item.id === id);
	if (type === 'athlete') return athletes.find((item) => item.id === id);
	return null;
}

function setupEventListeners() {
	document.addEventListener('click', (event) => {
		const card = event.target.closest('[data-id]');
		if (!card) return;
		const id = card.dataset.id;
		const type = card.dataset.type;

		if (type && id) {
			openProfile(getItemById(id, type), type);
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
	rotateHeroSlides();
	slideTimer = setInterval(rotateHeroSlides, 4000);
}

window.addEventListener('DOMContentLoaded', () => {
	renderCards();
	setupEventListeners();
	initHeroSlider();
	buildFadeInObserver();
});
