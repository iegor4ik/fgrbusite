-- Add Lviv oblast and the separate Vinnytsia and Zhmerynka city federations.

INSERT INTO regions (name, photo, president)
SELECT 'Львівська областна ФГРБ', '/assets/flags/Oblast/Lviv.png', 'Путій Євгеній Володимирович'
WHERE NOT EXISTS (
  SELECT 1 FROM regions WHERE photo = '/assets/flags/Oblast/Lviv.png'
);

UPDATE regions
SET name = 'Львівська областна ФГРБ',
    president = 'Путій Євгеній Володимирович',
    updated_at = now()
WHERE photo = '/assets/flags/Oblast/Lviv.png';

INSERT INTO regions (name, photo, president)
SELECT seed.name, seed.photo, seed.president
FROM (VALUES
  ('Вінниця ФГРБ', '/assets/flags/Oblast/Vinnytsa_City.png', 'Заєць Олександр Іванович'),
  ('ФГРБ м. Жмеринка', '/assets/flags/Oblast/Zmerynka_City.png', 'Стемповський Андрій Миколайович')
) AS seed(name, photo, president)
WHERE NOT EXISTS (
  SELECT 1 FROM regions existing WHERE existing.name = seed.name
);

UPDATE regions
SET president = 'Заєць Олександр Іванович', updated_at = now()
WHERE name = 'Вінниця ФГРБ';

UPDATE regions
SET president = 'Стемповський Андрій Миколайович', updated_at = now()
WHERE name = 'ФГРБ м. Жмеринка';