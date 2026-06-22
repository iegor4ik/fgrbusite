/**
 * REGIONS DATA CONFIGURATION
 * 
 * Centralized data file for all regional presidium information.
 * All regions content is managed through this configuration.
 * 
 * Structure:
 * - Regional data organized by oblast code
 * - Each region contains name, flag, and presidium members
 * - Members are typed by position (delegate, president, vice-president, etc.)
 * 
 * Usage:
 * - Import this file before regions_gr.js
 * - Data is automatically used by renderRegion() and renderRegions()
 */

const regionsData = {
  // ========================================================================
  // AR Крим (Autonomous Republic of Crimea)
  // ========================================================================
  crimea: {
    id: 'crimea',
    name: 'АР Крим',
    nameShort: 'Крим',
    code: 'AR-KR',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'crimea-delegate-unknown',
        fullName: 'Невідомо',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        status: 'Інформація уточнюється',
        photo: 'assets/images/No-photo-m.png',
        birthDate: '1980-01-15',
        appointmentDate: '2023-01-01',
      },
    ],
  },

  // ========================================================================
  // Вінницька область
  // ========================================================================
  vinnytsia: {
    id: 'vinnytsia',
    name: 'Вінницька область',
    nameShort: 'Вінниця',
    code: 'UA-05',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'vinnytsia-delegate-yusifzade',
        fullName: 'Юсіфзаде Тугрул',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
        birthDate: '1975-06-20',
        appointmentDate: '2023-03-15',
      },
    ],
  },

  // ========================================================================
  // Волинська область
  // ========================================================================
  volyn: {
    id: 'volyn',
    name: 'Волинська область',
    nameShort: 'Волинь',
    code: 'UA-07',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'volyn-delegate-lyubezhaning',
        fullName: 'Любежанін Ігор',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
        birthDate: '1968-08-10',
        appointmentDate: '2023-02-01',
      },
    ],
  },

  // ========================================================================
  // Дніпропетровська область
  // ========================================================================
  dnipropetrovsk: {
    id: 'dnipropetrovsk',
    name: 'Дніпропетровська область',
    nameShort: 'Дніпропетровськ',
    code: 'UA-12',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'dnipropetrovsk-delegate-stavrinov',
        fullName: 'Ставрінов Микола',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'dnipropetrovsk-vp-lysak',
        fullName: 'Лисак Сергій Петрович',
        position: 'Віце-президент',
        phone: '',
        email: '',
        bio: 'Віце-президент Федерації греко-римської боротьби України',
        photo: 'assets/images/lysak.webp',
      },
    ],
  },

  // ========================================================================
  // Донецька область
  // ========================================================================
  donetsk: {
    id: 'donetsk',
    name: 'Донецька область',
    nameShort: 'Донецьк',
    code: 'UA-14',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'donetsk-delegate-sokolov',
        fullName: 'Соколов Олександр',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'donetsk-member-sokolov',
        fullName: 'Соколов Олександр',
        position: 'Член президії',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'donetsk-coaching-yevtushenko',
        fullName: 'Євтушенко Олег',
        position: 'Член тренерської ради',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Житомирська область
  // ========================================================================
  zhytomyr: {
    id: 'zhytomyr',
    name: 'Житомирська область',
    nameShort: 'Житомир',
    code: 'UA-18',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'zhytomyr-delegate-piskun',
        fullName: 'Пискун Петро',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Закарпатська область
  // ========================================================================
  zakarpattia: {
    id: 'zakarpattia',
    name: 'Закарпатська область',
    nameShort: 'Закарпаття',
    code: 'UA-21',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'zakarpattia-delegate-kukushkin',
        fullName: 'Кукушкін Іван',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Запорізька область
  // ========================================================================
  zaporizhzhia: {
    id: 'zaporizhzhia',
    name: 'Запорізька область',
    nameShort: 'Запоріжжя',
    code: 'UA-23',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'zaporizhzhia-delegate-chertkov',
        fullName: 'Чертков Євген',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Івано-Франківська область
  // ========================================================================
  ivano_frankivsk: {
    id: 'ivano_frankivsk',
    name: 'Івано-Франківська область',
    nameShort: 'Івано-Франківськ',
    code: 'UA-26',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'ivano_frankivsk-delegate-tbd',
        fullName: 'Невідомо',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        status: 'Інформація уточнюється',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'ivano_frankivsk-vp-kvyatkovsky',
        fullName: 'Квятковський Андрій Васильович',
        position: 'Віце-президент',
        phone: '',
        email: '',
        bio: 'Віце-президент Федерації греко-римської боротьби України',
        photo: 'assets/images/Kvyatkovski.webp',
      },
    ],
  },

  // ========================================================================
  // Київська область
  // ========================================================================
  kyiv_oblast: {
    id: 'kyiv_oblast',
    name: 'Київська область',
    nameShort: 'Київ. обл.',
    code: 'UA-32',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'kyiv_oblast-delegate-kalashnikov',
        fullName: 'Калашніков Андрій Миколайович',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: 'Член Президіуму Федерації',
        photo: 'assets/images/Kalashnikov.webp',
      },
      {
        id: 'kyiv_oblast-president-kalashnikov',
        fullName: 'Калашніков Андрій Миколайович',
        position: 'Президент',
        phone: '',
        email: '',
        bio: 'Член Президіуму Федерації',
        photo: 'assets/images/Kalashnikov.webp',
      },
      {
        id: 'kyiv_oblast-first-vp-kalashnikov',
        fullName: 'Калашніков Андрій Миколайович',
        position: '1-й віце-президент',
        phone: '',
        email: '',
        bio: 'Член Президіуму Федерації',
        photo: 'assets/images/Kalashnikov.webp',
      },
      {
        id: 'kyiv_oblast-vp-kalashnikov',
        fullName: 'Калашніков Андрій Миколайович',
        position: 'Віце-президент',
        phone: '',
        email: '',
        bio: 'Член Президіуму Федерації',
        photo: 'assets/images/Kalashnikov.webp',
      },
      {
        id: 'kyiv_oblast-member-kalashnikov',
        fullName: 'Калашніков Андрій Миколайович',
        position: 'Член президії',
        phone: '',
        email: '',
        bio: 'Член Президіуму Федерації',
        photo: 'assets/images/Kalashnikov.webp',
      },
      {
        id: 'kyiv_oblast-member-pikalov',
        fullName: 'Пікалов Дмитро',
        position: 'Член президії',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'kyiv_oblast-coaching-lozovy',
        fullName: 'Лозовий Віктор',
        position: 'Тренерська рада',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'kyiv_oblast-coaching-pikalov',
        fullName: 'Пікалов Дмитро',
        position: 'Тренерська рада',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Кіровоградська область
  // ========================================================================
  kirovohrad: {
    id: 'kirovohrad',
    name: 'Кіровоградська область',
    nameShort: 'Кіровоград',
    code: 'UA-35',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'kirovohrad-delegate-gorban',
        fullName: 'Горбань Микола',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Луганська область
  // ========================================================================
  luhansk: {
    id: 'luhansk',
    name: 'Луганська область',
    nameShort: 'Луганськ',
    code: 'UA-44',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'luhansk-delegate-korotkykh',
        fullName: 'Коротких Сергій',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Львівська область
  // ========================================================================
  lviv: {
    id: 'lviv',
    name: 'Львівська область',
    nameShort: 'Львів',
    code: 'UA-46',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'lviv-delegate-tbd',
        fullName: 'Невідомо',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        status: 'Інформація уточнюється',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // м. Київ (Kyiv City - separate from Kyiv Oblast)
  // ========================================================================
  kyiv_city: {
    id: 'kyiv_city',
    name: 'м. Київ',
    nameShort: 'Київ',
    code: 'UA-80',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'kyiv_city-delegate-mykolenko',
        fullName: 'Миколенко Максим',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'kyiv_city-member-smyshliaev',
        fullName: 'Смишляєв Олександр',
        position: 'Член президії',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Миколаївська область
  // ========================================================================
  mykolaiv: {
    id: 'mykolaiv',
    name: 'Миколаївська область',
    nameShort: 'Миколаїв',
    code: 'UA-48',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'mykolaiv-delegate-belobaba',
        fullName: 'Бєлобаба Сергій',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'mykolaiv-member-belobaba',
        fullName: 'Бєлобаба Сергій',
        position: 'Член президії',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Одеська область
  // ========================================================================
  odesa: {
    id: 'odesa',
    name: 'Одеська область',
    nameShort: 'Одеса',
    code: 'UA-51',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'odesa-delegate-koval',
        fullName: 'Коваль Юрій',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Полтавська область
  // ========================================================================
  poltava: {
    id: 'poltava',
    name: 'Полтавська область',
    nameShort: 'Полтава',
    code: 'UA-53',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'poltava-delegate-kohanevych',
        fullName: 'Коханевич Анатолій',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'poltava-president-sazonov',
        fullName: 'Сазонов Олег Юрійович',
        position: 'Президент',
        phone: '',
        email: '',
        bio: 'Президент Федерації греко-римської боротьби України',
        photo: 'assets/images/oleg-sazonov.jpg',
      },
    ],
  },

  // ========================================================================
  // Рівненська область
  // ========================================================================
  rivne: {
    id: 'rivne',
    name: 'Рівненська область',
    nameShort: 'Рівне',
    code: 'UA-56',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'rivne-delegate-kovalchuk',
        fullName: 'Ковальчук Олександр Іванович',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: 'Віце-президент Федерації греко-римської боротьби України',
        photo: 'assets/images/Kovalchuk.webp',
      },
      {
        id: 'rivne-vp-kovalchuk',
        fullName: 'Ковальчук Олександр Іванович',
        position: 'Віце-президент',
        phone: '',
        email: '',
        bio: 'Віце-президент Федерації греко-римської боротьби України',
        photo: 'assets/images/Kovalchuk.webp',
      },
    ],
  },

  // ========================================================================
  // Сумська область
  // ========================================================================
  sumy: {
    id: 'sumy',
    name: 'Сумська область',
    nameShort: 'Суми',
    code: 'UA-59',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'sumy-delegate-aldayev',
        fullName: 'Алдаєв Андрій',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Тернопільська область
  // ========================================================================
  ternopil: {
    id: 'ternopil',
    name: 'Тернопільська область',
    nameShort: 'Тернопіль',
    code: 'UA-61',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'ternopil-delegate-teleban',
        fullName: 'Телебан Андрій',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Харківська область
  // ========================================================================
  kharkiv: {
    id: 'kharkiv',
    name: 'Харківська область',
    nameShort: 'Харків',
    code: 'UA-63',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'kharkiv-delegate-sklyarov',
        fullName: 'Скляров Вадим',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Херсонська область
  // ========================================================================
  kherson: {
    id: 'kherson',
    name: 'Херсонська область',
    nameShort: 'Херсон',
    code: 'UA-65',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'kherson-delegate-nasirov',
        fullName: 'Насіров Яшар',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Хмельницька область
  // ========================================================================
  khmelnytsky: {
    id: 'khmelnytsky',
    name: 'Хмельницька область',
    nameShort: 'Хмельницький',
    code: 'UA-68',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'khmelnytsky-delegate-marchuk',
        fullName: 'Марчук Олександр',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Черкаська область
  // ========================================================================
  cherkasy: {
    id: 'cherkasy',
    name: 'Черкаська область',
    nameShort: 'Черкаси',
    code: 'UA-71',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'cherkasy-delegate-samokha',
        fullName: 'Самоха Анатолій',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        photo: 'assets/images/No-photo-m.png',
      },
      {
        id: 'cherkasy-vp-dushejko',
        fullName: 'Петро Григорович Душейко',
        position: 'Віце-президент',
        phone: '',
        email: '',
        bio: 'Віце-президент Федерації греко-римської боротьби України',
        photo: 'assets/images/dushejko.webp',
      },
    ],
  },

  // ========================================================================
  // Чернівецька область
  // ========================================================================
  chernivtsi: {
    id: 'chernivtsi',
    name: 'Чернівецька область',
    nameShort: 'Чернівці',
    code: 'UA-73',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'chernivtsi-delegate-tbd',
        fullName: 'Невідомо',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        status: 'Інформація уточнюється',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },

  // ========================================================================
  // Чернігівська область
  // ========================================================================
  chernihiv: {
    id: 'chernihiv',
    name: 'Чернігівська область',
    nameShort: 'Чернігів',
    code: 'UA-74',
    flag: 'assets/images/No-photo-m.png',
    presidium: [
      {
        id: 'chernihiv-delegate-tbd',
        fullName: 'Невідомо',
        position: 'Делегат',
        phone: '',
        email: '',
        bio: '',
        status: 'Інформація уточнюється',
        photo: 'assets/images/No-photo-m.png',
      },
    ],
  },
};

/**
 * Helper function to get all regions as an array
 * @returns {Array} Array of region objects with id property
 */
function getAllRegions() {
  return Object.values(regionsData);
}

/**
 * Helper function to get a region by ID
 * @param {string} regionId - The region ID
 * @returns {Object|null} Region object or null if not found
 */
function getRegionById(regionId) {
  return regionsData[regionId] || null;
}

/**
 * Helper function to get region's presidium members
 * @param {string} regionId - The region ID
 * @returns {Array} Array of presidium members
 */
function getRegionPresidium(regionId) {
  const region = getRegionById(regionId);
  return region ? region.presidium : [];
}

/**
 * Helper function to sort regions alphabetically
 * @returns {Array} Sorted array of regions
 */
function getRegionsSorted() {
  return getAllRegions().sort((a, b) => 
    a.name.localeCompare(b.name, 'uk')
  );
}

// Export for use in regions_gr.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    regionsData,
    getAllRegions,
    getRegionById,
    getRegionPresidium,
    getRegionsSorted,
  };
}
