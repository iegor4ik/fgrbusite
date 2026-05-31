// ==============================================================
// THEME SYSTEM - NO FLASH INITIALIZATION
// ==============================================================
(function() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
  if (isDark) {
    document.body.classList.add('dark-theme');
  }
})();

// ==============================================================
// MENU TOGGLE
// ==============================================================
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const menuLinks = mobileMenu?.querySelectorAll('a') || [];

function toggleMenu() {
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
}

menuToggle?.addEventListener('click', toggleMenu);
menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      toggleMenu();
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 767 && mobileMenu?.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }
});

// ==============================================================
// INTERSECTION OBSERVER - FADE IN ON SCROLL
// ==============================================================
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('[data-observe]').forEach((element) => {
  observer.observe(element);
});

// ==============================================================
// THEME TOGGLE
// ==============================================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle?.querySelector('.theme-icon');

function setTheme(isDark) {
  document.body.classList.toggle('dark-theme', isDark);
  if (themeIcon) {
    themeIcon.textContent = isDark ? '☀️' : '🌙';
  }
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDarkNow = document.body.classList.contains('dark-theme');
    setTheme(!isDarkNow);
  });
}

// ==============================================================
// HOMEPAGE DATA LOADING
// ==============================================================

const isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
const homepageNewsGrid = isHomepage ? document.querySelector('main .news-grid') : null;
const homepageCompetitionFeatured = isHomepage ? document.getElementById('competitionFeatured') : null;
const homepageCompetitionList = isHomepage ? document.getElementById('competitionList') : null;
const HOMEPAGE_API_BASE = (window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:4000') + '/api';

function formatHomepageDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getHomepageCompetitionStatusLabel(status) {
  const labels = {
    completed: 'Завершено',
    planned: 'Планується',
    live: 'Наживо',
  };
  return labels[status] || status;
}

function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHomepageCompetitions(items) {
  if (!homepageCompetitionFeatured || !homepageCompetitionList) return;

  if (!Array.isArray(items) || items.length === 0) {
    homepageCompetitionFeatured.innerHTML = `
      <article class="calendar-card calendar-featured">
        <div class="card-image">
          <img src="assets/images/BNY_banner.jpg" alt="Змагання незабаром" class="resp-img-placeholder">
        </div>
        <div class="card-details">
          <span class="card-date">Незабаром</span>
          <h4>Змагання буде додано найближчим часом</h4>
          <p>Слідкуйте за оновленнями на сайті.</p>
        </div>
      </article>
    `;
    homepageCompetitionList.innerHTML = '';
    return;
  }

  const [featured, ...sideItems] = items;
  const featuredTitle = escapeHtml(featured.title);
  const featuredCity = escapeHtml(featured.city);
  const featuredDate = formatHomepageDate(featured.event_date);
  const featuredStatus = getHomepageCompetitionStatusLabel(featured.status);
  const featuredImage = featured.cover_image || 'assets/images/BNY_banner.jpg';

  homepageCompetitionFeatured.innerHTML = `
    <a href="competition_details.html?id=${featured.id}" class="competition-link">
      <article class="calendar-card calendar-featured">
        <div class="card-image">
          <img src="${escapeHtml(featuredImage)}" alt="${featuredTitle}" class="resp-img-placeholder">
          <span class="competition-status ${escapeHtml(featured.status)}">${featuredStatus}</span>
        </div>
        <div class="card-details">
          <span class="card-date">${featuredDate}</span>
          <h4>${featuredTitle}</h4>
          <p>${featuredCity}</p>
        </div>
      </article>
    </a>
  `;

  homepageCompetitionList.innerHTML = sideItems
    .map((comp) => {
      const title = escapeHtml(comp.title);
      const city = escapeHtml(comp.city);
      const date = formatHomepageDate(comp.event_date);
      const status = getHomepageCompetitionStatusLabel(comp.status);
      return `
        <a href="competition_details.html?id=${comp.id}" class="competition-link">
          <article class="mini-card">
            <span class="mini-date">${date}</span>
            <h5>${title}</h5>
            <p>${city}</p>
            <p>${status}</p>
          </article>
        </a>
      `;
    })
    .join('');
}

function renderHomepageNews(items) {
  if (!homepageNewsGrid) return;

  if (!items.length) {
    homepageNewsGrid.innerHTML = `
      <article class="news-card">
        <div class="news-content">
          <h4>Новини тимчасово недоступні</h4>
          <p>Спробуйте оновити сторінку або перевірити пізніше.</p>
        </div>
      </article>
    `;
    return;
  }

  homepageNewsGrid.innerHTML = items
    .map((item) => `
      <article class="news-card">
        <div class="news-image">
          <img src="${item.cover_image}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="news-content">
          <span class="news-date">${formatHomepageDate(item.news_date)}</span>
          <h4>${item.title}</h4>
          <a href="news.html" class="news-link">Читати далі</a>
        </div>
      </article>
    `)
    .join('');
}

function getLatestHomepageNews(items, limit = 3) {
  return [...items]
    .sort((a, b) => new Date(b.news_date) - new Date(a.news_date))
    .slice(0, limit);
}

async function loadHomepageLatestNews() {
  if (!homepageNewsGrid) return;

  try {
    const response = await fetch(`${HOMEPAGE_API_BASE}/news`);
    const data = await response.json();
    const newsItems = Array.isArray(data) ? data : [];
    renderHomepageNews(getLatestHomepageNews(newsItems));
  } catch (error) {
    renderHomepageNews([]);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadHomepageLatestNews();
  loadHomepageLatestCompetitions();
});

async function loadHomepageLatestCompetitions() {
  if (!homepageCompetitionFeatured || !homepageCompetitionList) return;

  try {
    const response = await fetch(`${HOMEPAGE_API_BASE}/competitions?limit=4`);
    if (!response.ok) {
      renderHomepageCompetitions([]);
      return;
    }

    const competitions = await response.json();
    renderHomepageCompetitions(Array.isArray(competitions) ? competitions : []);
  } catch (error) {
    console.error('Error loading competitions:', error);
    renderHomepageCompetitions([]);
  }
}
