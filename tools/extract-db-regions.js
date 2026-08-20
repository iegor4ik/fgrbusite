const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const svgPath = path.join(projectRoot, 'Frontend', 'assets', 'Ukraine_location_map.svg');
const outputDir = path.join(projectRoot, 'Frontend', 'assets', 'regions-svg');
const databaseRegions = JSON.parse(process.env.REGIONS_JSON || '[]');

const nameToSlug = [
  ['крим', 'crimea'],
  ['вінницька', 'vinnytsia'],
  ['волинська', 'volyn'],
  ['дніпропетровська', 'dnipropetrovsk'],
  ['донецька', 'donetsk'],
  ['житомирська', 'zhytomyr'],
  ['закарпатська', 'zakarpattia'],
  ['запорізька', 'zaporizhzhia'],
  ['івано-франківська', 'ivano_frankivsk'],
  ['кіровоградська', 'kirovohrad'],
  ['луганська', 'luhansk'],
  ['львівська', 'lviv'],
  ['миколаївська', 'mykolaiv'],
  ['одеська', 'odesa'],
  ['полтавська', 'poltava'],
  ['рівненська', 'rivne'],
  ['сумська', 'sumy'],
  ['тернопільська', 'ternopil'],
  ['харківська', 'kharkiv'],
  ['херсонська', 'kherson'],
  ['хмельницька', 'khmelnytsky'],
  ['черкаська', 'cherkasy'],
  ['чернівецька', 'chernivtsi'],
  ['чернігівська', 'chernihiv'],
];

function getSlug(region) {
  const name = String(region.name || '').toLocaleLowerCase('uk-UA');
  if (name === 'київська фгрб') return 'kyiv_city';
  if (name.includes('київська')) return 'kyiv_oblast';
  return nameToSlug.find(([part]) => name.includes(part))?.[1] || null;
}

const svg = fs.readFileSync(svgPath, 'utf8');
const viewBox = svg.match(/viewBox="([^"]+)"/i)?.[1] || '0 0 1000 669';
const groupPattern = /<g\s+data-region="([^"]+)"[^>]*>[\s\S]*?<\/g>/g;
const groups = new Map();
for (const match of svg.matchAll(groupPattern)) {
  groups.set(match[1], match[0]);
}

fs.mkdirSync(outputDir, { recursive: true });
const generated = [];
for (const region of databaseRegions) {
  const slug = getSlug(region);
  const group = groups.get(slug);
  if (!slug || !group) {
    console.warn(`Skipped ${region.name}: no map group for ${slug || 'unknown'}`);
    continue;
  }
  const content = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${region.name}">\n  ${group}\n</svg>\n`;
  fs.writeFileSync(path.join(outputDir, `${slug}.svg`), content, 'utf8');
  generated.push(slug);
}

console.log(`Generated ${generated.length} region SVG files in ${outputDir}`);
console.log(generated.sort().join('\n'));
