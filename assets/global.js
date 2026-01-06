document.addEventListener('change', function (event) {
  const form = event.target.closest('.collection-filters');
  if (!form) return;

  const section = document.getElementById('CollectionSection');
  if (!section) return;

  const sectionId = section.dataset.sectionId;
  if (!sectionId) return;

  const url = new URL(window.location.href);
  const formData = new FormData(form);

  // Remove old filters
  [...url.searchParams.keys()].forEach(key => {
    if (key.startsWith('filter.') || key.startsWith('page')) {
      url.searchParams.delete(key);
    }
  });

  for (const [key, value] of formData.entries()) {
    url.searchParams.append(key, value);
  }

  history.pushState({}, '', url);

  // Fetch SECTION HTML
  fetch(`${url.pathname}${url.search}&section_id=${sectionId}`)
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newGrid = doc.querySelector('#ProductGridContainer');
      if (!newGrid) return;

      document.querySelector('#ProductGridContainer').innerHTML =
        newGrid.innerHTML;
    })
    .catch(err => console.error('Fetch failed:', err));
});
