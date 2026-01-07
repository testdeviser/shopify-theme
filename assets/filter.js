
/*
  assets/filter.js

  Purpose:
  - Wire up the collection filters UI so changes update the URL and fetch
    an updated section fragment via AJAX.
  - Handle sort selection which updates `sort_by` in the URL and refreshes
    the product grid section.
  - Provide a small client-side collection search for the list-collections
    page (filters displayed collections already present in DOM).

  Flow summary:
  1. On change inside `.collection-filters`, serialize form values into URL
     search params and push a new history state.
  2. Fetch the current page with `&section_id={sectionId}` to get the
     rendered section HTML and swap `#ProductGridContainer`.
  3. `#SortSelect` behaves similarly but preserves existing filter params.
*/

// Listen for changes on filter controls inside a `.collection-filters` form.
document.addEventListener('change', function (event) {
  const form = event.target.closest('.collection-filters');
  if (!form) return;

  const section = document.getElementById('CollectionSection');
  if (!section) return;

  const sectionId = section.dataset.sectionId;
  if (!sectionId) return;

  const url = new URL(window.location.href);
  const formData = new FormData(form);

  // Remove old filter and pagination params so we can replace them with new
  // values from the form. We remove `page` to reset pagination on new filters.
  [...url.searchParams.keys()].forEach(key => {
    if (key.startsWith('filter.') || key.startsWith('page')) {
      url.searchParams.delete(key);
    }
  });

  for (const [key, value] of formData.entries()) {
    url.searchParams.append(key, value);
  }

  // Update browser URL (push state) then fetch the updated section HTML
  history.pushState({}, '', url);

  // Fetch SECTION HTML and replace the grid container content for a seamless update
  fetch(`${url.pathname}${url.search}&section_id=${sectionId}`)
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newGrid = doc.querySelector('#ProductGridContainer');
      if (!newGrid) return;

      document.querySelector('#ProductGridContainer').innerHTML = newGrid.innerHTML;
    })
    .catch(err => console.error('Fetch failed:', err));
});

// Handle sort select changes. It preserves other filter params then updates sort_by.
document.getElementById('SortSelect')?.addEventListener('change', function() {
  const sortValue = this.value;
  const section = document.getElementById('CollectionSection');
  if (!section) return;

  const sectionId = section.dataset.sectionId;
  const url = new URL(window.location.href);

  // Keep existing filter params if a dedicated filters form exists.
  // Many themes name the form differently; if you use a different id, adapt here.
  const filtersForm = document.getElementById('FiltersForm');
  if (filtersForm) {
    const formData = new FormData(filtersForm);
    [...formData.entries()].forEach(([key, value]) => url.searchParams.set(key, value));
  }

  // Add sort_by
  url.searchParams.set('sort_by', sortValue);

  // Update URL and fetch the updated section fragment to refresh the product grid.
  history.pushState({}, '', url);

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
 
// Simple client-side search for the collections grid on the list-collections page.
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('collectionSearchInput');
  const collectionsContainer = document.getElementById('CollectionSection');

  if (!input || !collectionsContainer) return;

  const collectionCards = Array.from(collectionsContainer.querySelectorAll('.collection-card'));

  input.addEventListener('keyup', function () {
    const searchValue = this.value.toLowerCase().trim();

    collectionCards.forEach(card => {
      const titleEl = card.querySelector('.collection-card__content p');
      if (!titleEl) return;

      const title = titleEl.textContent.toLowerCase();

      // Toggle visibility. Keeping `display` manipulation simple for this UI.
      if (title.includes(searchValue)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
