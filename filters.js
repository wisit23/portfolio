const siteHeader = document.querySelector('.site-header');
const workFilter = siteHeader.querySelector('.work-filter');
const filterSelect = workFilter.querySelector('select');
const filterCategories = new Set([...filterSelect.options].map(option => option.value));
const filterStatus = workFilter.querySelector('[role="status"]');
const navLinks = [...siteHeader.querySelectorAll('nav a')];
const workSections = [...document.querySelectorAll('[data-work-section]')].map(section => ({
  section,
  target: `#${section.id}`,
  navLink: navLinks.find(link => link.hash === `#${section.id}`),
  entries: [...section.querySelectorAll('[data-categories]')],
  groups: [...section.querySelectorAll('[data-work-group]')],
}));
const totalEntries = workSections.reduce((total, { entries }) => total + entries.length, 0);

function applyWorkFilter(category) {
  const visibleTargets = [];
  let visibleEntries = 0;

  for (const { section, target, navLink, entries, groups } of workSections) {
    let sectionHasMatches = false;
    for (const entry of entries) {
      const matches = category === 'all' || entry.dataset.categories.split(/\s+/).includes(category);
      entry.hidden = !matches;
      if (matches) {
        sectionHasMatches = true;
        visibleEntries++;
      }
    }
    for (const group of groups) {
      group.hidden = !group.querySelector('[data-categories]:not([hidden])');
    }
    section.hidden = !sectionHasMatches;
    if (navLink) navLink.hidden = !sectionHasMatches;
    if (sectionHasMatches) visibleTargets.push(target);
  }

  filterStatus.textContent = `Showing ${visibleEntries} of ${totalEntries} entries.`;
  return visibleTargets;
}

function getSectionTarget(hash) {
  if (!hash) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

function updateRoute(category, fromLocation = false) {
  const url = new URL(location.href);
  const originalHash = url.hash;
  filterSelect.value = category;
  const visibleTargets = applyWorkFilter(category);
  updateHeaderOffset();

  if (getSectionTarget(url.hash)?.closest('[hidden]') && visibleTargets.length) {
    url.hash = visibleTargets[0];
  }
  if (url.searchParams.get('filter') !== category) {
    url.searchParams.set('filter', category);
  }
  if (url.href !== location.href) {
    try {
      if (fromLocation) history.replaceState(null, '', url.href);
      else history.pushState(null, '', url.href);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
      // Some file:// browsers disallow changing the query with the History API.
      if (fromLocation) location.replace(url.href);
      else location.assign(url.href);
      return;
    }
  }
  if (fromLocation || url.hash !== originalHash) {
    getSectionTarget(url.hash)?.scrollIntoView();
  }
}

function syncRouteFromLocation() {
  const category = new URLSearchParams(location.search).get('filter');
  updateRoute(filterCategories.has(category) ? category : 'all', true);
}

function updateHeaderOffset() {
  const height = Math.ceil(siteHeader.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--site-header-offset', `${height}px`);
}

workFilter.hidden = false;
filterSelect.addEventListener('change', () => updateRoute(filterSelect.value));
window.addEventListener('popstate', syncRouteFromLocation);
syncRouteFromLocation();
new ResizeObserver(updateHeaderOffset).observe(siteHeader);
