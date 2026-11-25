(() => {
  const storageKey = 'portfolio-theme';
  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeColor.content = theme === 'hope' ? '#edf1f5' : '#10151f';
  }

  let theme = 'hope';
  try {
    if (localStorage.getItem(storageKey) === 'despair') theme = 'despair';
  } catch {
    // The theme can still change for this page when storage is blocked.
  }
  applyTheme(theme);

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('#theme-toggle');
    function updateToggleLabel() {
      const label = `Switch to ${theme === 'hope' ? 'Despair' : 'Hope'} theme`;
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }
    updateToggleLabel();
    toggle.addEventListener('click', () => {
      theme = theme === 'hope' ? 'despair' : 'hope';
      applyTheme(theme);
      updateToggleLabel();
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // Keep using the selected theme without persisting it.
      }
    });
    toggle.hidden = false;
  }, { once: true });
})();
