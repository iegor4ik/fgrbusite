INSERT INTO regions (name, photo)
SELECT seed.name, seed.photo
FROM (VALUES
  ('АР Крим ФГРБ', '/assets/flags/Oblast/Flag_of_Crimea.svg.webp'),
  ('Дніпропетровська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Dnipropetrovsk_Oblast.svg.webp'),
  ('Донецька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Donetsk_Oblast.svg.webp'),
  ('Івано-Франківська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Ivano-Frankivsk_Oblast.svg.webp'),
  ('Харківська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kharkiv_Oblast.svg.webp'),
  ('Херсонська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kherson_Oblast.svg.webp'),
  ('Хмельницька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Khmelnytskyi_Oblast.svg.webp'),
  ('Кіровоградська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kirovohrad_Oblast.svg.webp'),
  ('Київська ФГРБ', '/assets/flags/Oblast/Flag_of_Kyiv_Kurovskyi.svg.webp'),
  ('Київська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Kyiv_Oblast.svg.webp'),
  ('Луганська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Luhansk_Oblast.svg.webp'),
  ('Миколаївська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Mykolaiv_Oblast_(2026).svg.webp'),
  ('Одеська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Odesa_Oblast.svg.webp'),
  ('Полтавська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Poltava_Oblast.svg.webp'),
  ('Рівненська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Rivne_Oblast.svg.webp'),
  ('Сумська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Sumy_Oblast.svg.webp'),
  ('Тернопільська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Ternopil_Oblast.svg.webp'),
  ('Закарпатська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Transcarpathian_Oblast.svg.webp'),
  ('Вінницька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Vinnytsia_Oblast.svg.webp'),
  ('Волинська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Volhynian_Oblast.svg.webp'),
  ('Запорізька областна ФГРБ', '/assets/flags/Oblast/Flag_of_Zaporizhia_Oblast.svg.webp'),
  ('Житомирська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Zhytomyr_Oblast.svg.webp'),
  ('Черкаська областна ФГРБ', '/assets/flags/Oblast/Flag_of_Cherkasy_Oblast.svg.webp')
) AS seed(name, photo)
WHERE NOT EXISTS (
  SELECT 1 FROM regions existing WHERE existing.name = seed.name
);
