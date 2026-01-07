
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

document.getElementById('SortSelect')?.addEventListener('change', function() {
  const sortValue = this.value;
  const section = document.getElementById('CollectionSection');
  if (!section) return;

  const sectionId = section.dataset.sectionId;
  const url = new URL(window.location.href);

  // Keep existing filter params
  const filtersForm = document.getElementById('FiltersForm');
  if (filtersForm) {
    const formData = new FormData(filtersForm);
    [...formData.entries()].forEach(([key, value]) => url.searchParams.set(key, value));
  }

  // Add sort_by
  url.searchParams.set('sort_by', sortValue);

  // Update URL
  history.pushState({}, '', url);

  // Fetch updated section
  fetch(`${url.pathname}${url.search}&section_id=${sectionId}`)
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newGrid = doc.querySelector('#ProductGridContainer');
      if (!newGrid) return;
      document.querySelector('#ProductGridContainer').innerHTML = newGrid.innerHTML;
    });
});

window.addEventListener('popstate', () => location.reload());
 
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('collectionSearchInput');
  const collectionsContainer = document.getElementById('CollectionSection');

  if (!input || !collectionsContainer) return;

  const collectionCards = Array.from(
    collectionsContainer.querySelectorAll('.collection-card')
  );

  input.addEventListener('keyup', function () {
    const searchValue = this.value.toLowerCase().trim();

    collectionCards.forEach(card => {
      const titleEl = card.querySelector('.collection-card__content p');
      if (!titleEl) return;

      const title = titleEl.textContent.toLowerCase();

      if (title.includes(searchValue)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
