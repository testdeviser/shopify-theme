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

document.addEventListener('input', function (event) {
  if (
    !event.target.classList.contains('price-range-min') &&
    !event.target.classList.contains('price-range-max')
  ) {
    return;
  }

  const container = event.target.closest('.price-range');
  if (!container) return;

  const minSlider = container.querySelector('.price-range-min');
  const maxSlider = container.querySelector('.price-range-max');

  const minInput = container.querySelector('.price-min-input');
  const maxInput = container.querySelector('.price-max-input');

  const minLabel = container.querySelector('.price-min-label');
  const maxLabel = container.querySelector('.price-max-label');

  let minVal = parseInt(minSlider.value, 10);
  let maxVal = parseInt(maxSlider.value, 10);

  // Prevent overlap
  if (minVal >= maxVal) {
    if (event.target === minSlider) {
      minVal = maxVal - 1;
      minSlider.value = minVal;
    } else {
      maxVal = minVal + 1;
      maxSlider.value = maxVal;
    }
  }

  // Update hidden inputs (Shopify filters)
  minInput.value = minVal;
  maxInput.value = maxVal;

  // Update visible labels (Shopify money format expects cents)
  if (window.Shopify && Shopify.formatMoney) {
    minLabel.textContent = Shopify.formatMoney(minVal * 100);
    maxLabel.textContent = Shopify.formatMoney(maxVal * 100);
  } else {
    // Fallback
    minLabel.textContent = minVal;
    maxLabel.textContent = maxVal;
  }

  // Trigger AJAX filter update
  minInput.dispatchEvent(new Event('change', { bubbles: true }));
});
 (function () {
  let wheelLock = false;

  document.addEventListener(
    'wheel',
    function (event) {
      const slider = event.target.closest(
        '.price-range-min, .price-range-max'
      );
      if (!slider) return;

      event.preventDefault();

      // Prevent rapid-fire wheel events
      if (wheelLock) return;
      wheelLock = true;
      setTimeout(() => (wheelLock = false), 40);

      const min = Number(slider.min);
      const max = Number(slider.max);
      let value = Number(slider.value);

      // Normalize scroll direction → EXACTLY 1 step
      if (event.deltaY < 0) {
        value += 1;
      } else {
        value -= 1;
      }

      // Clamp
      value = Math.max(min, Math.min(max, value));
      slider.value = value;

      // Fire existing Shopify filter logic
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    },
    { passive: false }
  );
})();
