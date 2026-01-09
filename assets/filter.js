/*
  assets/global.js

  Purpose:
  - Implements the interactive range slider used by the `price_range` filter
    on collection pages and the Ajax search suggestions used by
    `#AjaxSearchForm`.

  Notes:
  - The DOM for the slider may not exist on every page. Guard against null
    references to avoid script errors on pages without the slider.
  - A small amount of normalization is applied to `data-max-price` to
    convert from cents to an integer price for the UI.
*/
(function () {
  const container = document.getElementById('ActiveFilters');
  if (!container) return;

  // -------------------------
  // ADD FILTER PILL
  // -------------------------
  function addFilterPill({ type, label, name, value }) {
    // Prevent duplicates
    if (
      (type === 'price' && container.querySelector('[data-filter-type="price"]')) ||
      container.querySelector(`[data-input-id="${name}"][data-input-value="${value}"]`)
    ) {
      return;
    }

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'active-filter';

    if (type === 'price') {
      pill.dataset.filterType = 'price';
    } else {
      pill.dataset.inputId = name;
      pill.dataset.inputValue = value;
    }

    pill.innerHTML = `${label} <span class="active-filter-remove">×</span>`;
    container.appendChild(pill);
  }

  // -------------------------
  // REMOVE FILTER PILL
  // -------------------------
  function removeFilterPill(el) {
    if (el) el.remove();
  }

  // -------------------------
  // LISTEN: checkbox filters
  // -------------------------
  document.addEventListener('change', function (event) {
    const input = event.target;

    // Ignore non-filter inputs
    if (!input.name || input.type !== 'checkbox') return;

    if (input.checked) {
      addFilterPill({
        type: 'list',
        label: input.closest('label')?.innerText.trim(),
        name: input.name,
        value: input.value
      });
    } else {
      const pill = container.querySelector(
        `[data-input-id="${input.name}"][data-input-value="${input.value}"]`
      );
      removeFilterPill(pill);
    }
  });

  // -------------------------
  // LISTEN: price filters
  // -------------------------
  function syncPricePill() {
    const min = document.querySelector('.price-min-input')?.value;
    const max = document.querySelector('.price-max-input')?.value;

    const existing = container.querySelector('[data-filter-type="price"]');
    if (existing) existing.remove();

    if (!min && !max) return;

    addFilterPill({
      type: 'price',
      label: `${min || 0} – ${max}`,
    });
  }

  document.querySelectorAll('.price-min-input, .price-max-input').forEach(input => {
    input.addEventListener('change', syncPricePill);
  });

  // -------------------------
  // CLICK: remove pill
  // -------------------------
  container.addEventListener('click', function (event) {
    const pill = event.target.closest('.active-filter');
    if (!pill) return;

    // Remove visually immediately
    pill.remove();

    // PRICE FILTER
    if (pill.dataset.filterType === 'price') {
      const minInput = document.querySelector('.price-min-input');
      const maxInput = document.querySelector('.price-max-input');

      minInput.value = '';
      maxInput.value = '';

      minInput.dispatchEvent(new Event('change', { bubbles: true }));
      maxInput.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // NORMAL FILTER
    const input = document.querySelector(
      `input[name="${pill.dataset.inputId}"][value="${pill.dataset.inputValue}"]`
    );

    if (input) {
      input.checked = false;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

})();

(function () {
  const container = document.getElementById('ActiveFilters');
  const sortSelect = document.querySelector('select[name="sort_by"]');
  if (!container || !sortSelect) return;

  // -------------------------
  // ADD / UPDATE SORT PILL
  // -------------------------
  function syncSortPill() {
    const value = sortSelect.value;
    const label = sortSelect.options[sortSelect.selectedIndex]?.text;

    // Remove existing sort pill
    const existing = container.querySelector('[data-filter-type="sort"]');
    if (existing) existing.remove();

    // Default sort → no pill
    if (!value || value === 'manual') return;

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'active-filter';
    pill.dataset.filterType = 'sort';

    pill.innerHTML = `${label} <span class="active-filter-remove">×</span>`;
    container.appendChild(pill);
  }

  // -------------------------
  // LISTEN SORT CHANGE
  // -------------------------
  sortSelect.addEventListener('change', syncSortPill);

  // -------------------------
  // REMOVE SORT ON CLICK
  // -------------------------
  container.addEventListener('click', function (event) {
    const pill = event.target.closest('[data-filter-type="sort"]');
    if (!pill) return;

    pill.remove();

    // Reset to default sorting
    sortSelect.value = 'manual';
    sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // -------------------------
  // INITIAL SYNC (page load)
  // -------------------------
  // syncSortPill();

})();


const rangeSlider_min = 0;

// Guard slider initialization to avoid runtime errors on pages without it
const slider = document.querySelector('#RangeSlider');
if (slider) {
  const maxpriceinput = document.querySelector('#max-price-input');
  let maxPrice = slider.getAttribute('data-max-price');

  // Convert to float first (in case it has decimals), then to integer and
  // add a small buffer (non-invasive) so the UI has room to move.
  maxPrice = parseInt(Math.ceil(parseFloat(maxPrice))+1,10);
  // maxPrice = Math.ceil(parseFloat(maxPrice));

  if (maxpriceinput) maxpriceinput.value = maxPrice;

  console.log(maxPrice);
  const rangeSlider_max = maxPrice;
  const inputLeft = slider.querySelector('.range-slider-input-left');
  const inputRight = slider.querySelector('.range-slider-input-right');

  const handleLeft = slider.querySelector('.range-slider-handle-left');
  const handleRight = slider.querySelector('.range-slider-handle-right');
  const rangeBar = slider.querySelector('.range-slider-val-range');

  const tooltipLeft = slider.querySelector('.range-slider-tooltip-left');
  const tooltipRight = slider.querySelector('.range-slider-tooltip-right');
  const tooltipLeftText = tooltipLeft.querySelector('.range-slider-tooltip-text');
  const tooltipRightText = tooltipRight.querySelector('.range-slider-tooltip-text');

  inputLeft.min = rangeSlider_min;
  inputLeft.max = rangeSlider_max;
  inputLeft.value = rangeSlider_min;

  inputRight.min = rangeSlider_min;
  inputRight.max = rangeSlider_max;
  inputRight.value = rangeSlider_max;

function updateSlider() {
    // Calculate percentage positions
    let minPercent = ((inputLeft.value - rangeSlider_min) / (rangeSlider_max - rangeSlider_min)) * 100;
    let maxPercent = ((inputRight.value - rangeSlider_min) / (rangeSlider_max - rangeSlider_min)) * 100;

    // Update handles
    handleLeft.style.left = `${minPercent}%`;
    handleRight.style.left = `${maxPercent}%`;

    // Update range bar
    rangeBar.style.left = `${minPercent}%`;
    rangeBar.style.right = `${100 - maxPercent}%`;

    // Update tooltips text
    tooltipLeftText.innerText = inputLeft.value;
    tooltipRightText.innerText = inputRight.value;

    // Move tooltips to follow handles
    tooltipLeft.style.left = `calc(${minPercent}% - ${tooltipLeft.offsetWidth / 2}px)`;
    tooltipRight.style.left = `calc(${maxPercent}% - ${tooltipRight.offsetWidth / 2}px)`;
}

// Event listeners
inputLeft.addEventListener('input', () => {
    inputLeft.value = Math.min(inputLeft.value, inputRight.value - 1);
    updateSlider();
});

inputRight.addEventListener('input', () => {
    inputRight.value = Math.max(inputRight.value, parseInt(inputLeft.value) + 1);
    updateSlider();
});

// Initialize
updateSlider();

  document.addEventListener('input', function (event) {
    // Only react to slider inputs for the price range UI
    if (!event.target.classList.contains('price-range-min') && !event.target.classList.contains('price-range-max')) {
      return;
    }

    const sliderTarget = event.target;
    const container = document.querySelector('.price-range');
    if (!container) return;

    const minSlider = document.querySelector('.price-range-min');
    const maxSlider = document.querySelector('.price-range-max');

    const minInput = container.querySelector('.price-min-input');
    const maxInput = container.querySelector('.price-max-input');

    let minVal = parseInt(minSlider.value, 10);
    let maxVal = parseInt(maxSlider.value, 10);
   

    // Prevent overlap (Shopify-safe)
    if (minVal >= maxVal) {
      if (sliderTarget === minSlider) {
        minVal = maxVal - 1;
        minSlider.value = minVal;
      } else {
        maxVal = minVal + 1;
        maxSlider.value = maxVal;
      }
    }

    // Update Shopify filter inputs so normal form submission works
    if (minInput) minInput.value = minVal;
    if (maxInput) maxInput.value = maxVal;
     const containerActiveFilters = document.getElementById('ActiveFilters');
if (!containerActiveFilters) return;

let existingPriceFilter = containerActiveFilters.querySelector(
  '.active-filter[data-filter-type="price"]'
);

if (!existingPriceFilter) {
  containerActiveFilters.insertAdjacentHTML(
    'beforeend',
    `<button type="button" class="active-filter" data-filter-type="price">
      ${minVal} – ${maxVal} <span class="active-filter-remove">×</span>
    </button>`
  );
} else {
  existingPriceFilter.innerHTML = `
    ${minVal} – ${maxVal} <span class="active-filter-remove">×</span>
  `;
}

    // Trigger the same AJAX change as sliders by dispatching change events
    // if (minInput) minInput.dispatchEvent(new Event('change', { bubbles: true }));
    // if (maxInput) maxInput.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Initialize slider visuals if text inputs are changed directly
  function updateSliderFromInputs() {
    const sliderEl = document.getElementById('RangeSlider');
    if (!sliderEl) return;

    const inputLeft = sliderEl.querySelector('.range-slider-input-left');
    const inputRight = sliderEl.querySelector('.range-slider-input-right');
    const handleLeft = sliderEl.querySelector('.range-slider-handle-left');
    const handleRight = sliderEl.querySelector('.range-slider-handle-right');
    const rangeBar = sliderEl.querySelector('.range-slider-val-range');
    const tooltipLeftText = sliderEl.querySelector('.range-slider-tooltip-left .range-slider-tooltip-text');
    const tooltipRightText = sliderEl.querySelector('.range-slider-tooltip-right .range-slider-tooltip-text');

    const minInput = document.querySelector('.price-min-input');
    const maxInput = document.querySelector('.price-max-input');

    if (!minInput || !maxInput) return;

    let minVal = parseInt(minInput.value, 10);
    let maxVal = parseInt(maxInput.value, 10);

    const rangeMin = parseInt(inputLeft.min, 10);
    const rangeMax = parseInt(inputLeft.max, 10);

    // Clamp values
    minVal = Math.max(rangeMin, Math.min(minVal, maxVal - 1));
    maxVal = Math.min(rangeMax, Math.max(maxVal, minVal + 1));

    inputLeft.value = minVal;
    inputRight.value = maxVal;

    // Update slider positions
    const minPercent = ((minVal - rangeMin) / (rangeMax - rangeMin)) * 100;
    const maxPercent = ((maxVal - rangeMin) / (rangeMax - rangeMin)) * 100;

    handleLeft.style.left = `${minPercent}%`;
    handleRight.style.left = `${maxPercent}%`;
    rangeBar.style.left = `${minPercent}%`;
    rangeBar.style.right = `${100 - maxPercent}%`;

    tooltipLeftText.innerText = minVal;
    tooltipRightText.innerText = maxVal;
  }

  // Listen for direct edits to the canonical min/max inputs and update sliders
  document.querySelectorAll('.price-min-input, .price-max-input').forEach(input => {
    input.addEventListener('input', () => {
      updateSliderFromInputs();

      // Trigger the same AJAX change as sliders
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

} // end guard if (slider)


document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('AjaxSearchInput');
  const resultsContainer = document.getElementById('SearchResults');
  let timer;

  input.addEventListener('keyup', function() {
    const query = this.value.trim();
    clearTimeout(timer);

    if (!query) {
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
      return;
    }

    timer = setTimeout(() => {
      fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`)
        .then(res => res.json())
        .then(data => {
          const products = data.resources.results.products;
          if (!products.length) {
            resultsContainer.innerHTML = '<p style="padding:10px;">No products found</p>';
            resultsContainer.style.display = 'block';
            return;
          }

          resultsContainer.innerHTML = products.map(p => {
            const img = p.image || '//cdn.shopify.com/s/files/1/0000/0001/t/1/assets/no-image.png';
            return `
              <a href="${p.url}" class="search-result" style="display:flex;align-items:center;padding:5px 0;">
                <img src="${img}" alt="${p.title}" style="width:50px;height:50px;object-fit:cover;margin-right:10px;">
                <span>${p.title}</span>
              </a>
            `;
          }).join('');

          resultsContainer.style.display = 'block';
        })
        .catch(err => {
          console.error('Search error:', err);
          resultsContainer.style.display = 'none';
        });
    }, 250); // debounce 250ms
  });

  // Hide results if clicking outside
  document.addEventListener('click', function(e) {
    if (!document.getElementById('AjaxSearchForm').contains(e.target)) {
      resultsContainer.style.display = 'none';
    }
  });
});
  
// Function to update the slider handles from inputs
function updateSliderFromInputs() {
  const slider = document.getElementById('RangeSlider');
  if (!slider) return;

  const inputLeft = slider.querySelector('.range-slider-input-left');
  const inputRight = slider.querySelector('.range-slider-input-right');
  const handleLeft = slider.querySelector('.range-slider-handle-left');
  const handleRight = slider.querySelector('.range-slider-handle-right');
  const rangeBar = slider.querySelector('.range-slider-val-range');
  const tooltipLeftText = slider.querySelector('.range-slider-tooltip-left .range-slider-tooltip-text');
  const tooltipRightText = slider.querySelector('.range-slider-tooltip-right .range-slider-tooltip-text');

  const minInput = document.querySelector('.price-min-input');
  const maxInput = document.querySelector('.price-max-input');

  if (!minInput || !maxInput) return;

  let minVal = parseInt(minInput.value, 10);
  let maxVal = parseInt(maxInput.value, 10);

  const rangeMin = parseInt(inputLeft.min, 10);
  const rangeMax = parseInt(inputLeft.max, 10);

  // Clamp values
  minVal = Math.max(rangeMin, Math.min(minVal, maxVal - 1));
  maxVal = Math.min(rangeMax, Math.max(maxVal, minVal + 1));

  inputLeft.value = minVal;
  inputRight.value = maxVal;

  // Update slider positions
  const minPercent = ((minVal - rangeMin) / (rangeMax - rangeMin)) * 100;
  const maxPercent = ((maxVal - rangeMin) / (rangeMax - rangeMin)) * 100;

  handleLeft.style.left = `${minPercent}%`;
  handleRight.style.left = `${maxPercent}%`;
  rangeBar.style.left = `${minPercent}%`;
  rangeBar.style.right = `${100 - maxPercent}%`;

  tooltipLeftText.innerText = minVal;
  tooltipRightText.innerText = maxVal;
}

// Listen for changes on min/max input fields
document.querySelectorAll('.price-min-input, .price-max-input').forEach(input => {
  input.addEventListener('input', () => {
    updateSliderFromInputs();

    // Trigger the same AJAX change as sliders
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

