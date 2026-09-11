(() => {
  const slug = document.body.dataset.regionSlug;
  const heroTitle = document.getElementById('regionHeroTitle');
  const initialTitle = heroTitle?.textContent.trim() || '';
  const displayTitle = slug === 'kyiv_city'
    ? 'Федерація греко-римської боротьби міста Київ'
    : slug === 'vinnytsia_city'
      ? 'Федерація греко-римської боротьби міста Вінниця'
      : slug === 'zhmerynka'
        ? 'Федерація греко-римської боротьби міста Жмеринка'
        : slug === 'crimea'
          ? 'Федерація греко-римської боротьби АР Крим'
          : `Федерація греко-римської боротьби ${initialTitle
            .replace(/\s+(область|областна ФГРБ)$/i, '')
            .replace(/цька$/, 'цької')
            .replace(/ська$/, 'ської')
            .replace(/зька$/, 'зької')} області`;

  const applyPageText = () => {
    if (heroTitle && heroTitle.textContent !== displayTitle) heroTitle.textContent = displayTitle;
    const subtitle = document.getElementById('regionHeroSubtitle');
    if (subtitle) subtitle.textContent = '';
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
