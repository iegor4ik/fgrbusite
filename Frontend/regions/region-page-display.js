(() => {
  const slug = document.body.dataset.regionSlug;
  const heroTitle = document.getElementById('regionHeroTitle');
  const initialTitle = heroTitle?.textContent.trim() || '';
  const displayNames = {
    kyiv_city: 'м. Київ',
    kyiv_oblast: 'Київська область',
    vinnytsia_city: 'м. Вінниця',
    zhmerynka: 'м. Жмеринка',
  };
  const displayTitle = displayNames[slug] || initialTitle
    .replace(/\s+ФГРБ$/iu, '')
    .replace(/областна$/iu, 'область')
    .trim();
  const regionName = document.getElementById('regionName');

  const applyPageText = () => {
    if (heroTitle && heroTitle.textContent !== displayTitle) heroTitle.textContent = displayTitle;
    if (regionName && regionName.textContent !== displayTitle) regionName.textContent = displayTitle;
    const badge = document.getElementById('regionBadge');
    if (badge && badge.textContent !== 'Боротьба в регіонах') badge.textContent = 'Боротьба в регіонах';
    const subtitle = document.getElementById('regionHeroSubtitle');
    if (subtitle && subtitle.textContent !== '') subtitle.textContent = '';
    document.querySelectorAll('.region-presidium h2').forEach((heading) => {
      if (heading.textContent.includes('Президія')) {
        heading.textContent = 'Президент федерації';
        if (heading.nextElementSibling?.tagName === 'P') heading.nextElementSibling.textContent = '';
      }
      if (heading.textContent.includes('Клуби')) {
        heading.closest('.region-presidium')?.classList.add('region-clubs-section');
        heading.textContent = 'Відділення з греко-римської боротьби';
      }
    });
  };

  applyPageText();
  const observer = new MutationObserver(applyPageText);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
