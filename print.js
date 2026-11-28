const pdfButton = document.querySelector('#download-pdf');
let restoreAfterPrint = null;

// Also runs for Ctrl+P, not only for the button.
window.addEventListener('beforeprint', () => {
  if (restoreAfterPrint) return;
  const root = document.documentElement;
  const theme = root.dataset.theme;
  const closedLists = [...document.querySelectorAll('details:not([open])')];
  const title = document.title;

  root.dataset.theme = 'hope';
  for (const list of closedLists) list.open = true;
  // The browser suggests the page title as the saved PDF's file name.
  document.title = 'Portfolio_Wisit_Jiamsan';

  restoreAfterPrint = () => {
    document.title = title;
    root.dataset.theme = theme;
    for (const list of closedLists) list.open = false;
  };
});

window.addEventListener('afterprint', () => {
  restoreAfterPrint?.();
  restoreAfterPrint = null;
});

pdfButton.addEventListener('click', async () => {
  pdfButton.disabled = true;
  // Lazy images that were never scrolled into view would print blank.
  const images = [...document.images];
  for (const image of images) image.loading = 'eager';
  await Promise.allSettled(images.map(image => image.decode()));
  pdfButton.disabled = false;
  window.print();
});

pdfButton.hidden = false;
