const rangeSlider_min = 0;

const slider = document.querySelector('#RangeSlider');
const maxpriceinput = document.querySelector('#max-price-input');
let maxPrice = slider.getAttribute('data-max-price');

// Convert to float first (in case it has decimals), then to integer
maxPrice = parseInt(parseFloat(maxPrice) + 100);
maxpriceinput.value = maxPrice;

console.log(maxPrice);
const rangeSlider_max = maxPrice ; 
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
  if (
    !event.target.classList.contains('price-range-min') &&
    !event.target.classList.contains('price-range-max')
  ) {
    return;
  }

  const slider = event.target;
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
    if (slider === minSlider) {
      minVal = maxVal - 1;
      minSlider.value = minVal;
    } else {
      maxVal = minVal + 1;
      maxSlider.value = maxVal;
    }
  }

  // Update Shopify filter inputs
  minInput.value = minVal;
  maxInput.value = maxVal;

  // Trigger Search & Discovery AJAX filtering
  minInput.dispatchEvent(new Event('change', { bubbles: true }));
  maxInput.dispatchEvent(new Event('change', { bubbles: true }));
});


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

