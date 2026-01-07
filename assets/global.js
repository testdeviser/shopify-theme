
 /** Default config */
const rangeSlider_min = 0;
const rangeSlider_max = 60;

document.querySelector('#RangeSlider .range-slider-val-left').style.width = `${rangeSlider_min + (100 - rangeSlider_max)}%`;
document.querySelector('#RangeSlider .range-slider-val-right').style.width = `${rangeSlider_min + (100 - rangeSlider_max)}%`;
 
document.querySelector('#RangeSlider .range-slider-val-range').style.left = `${rangeSlider_min}%`;
document.querySelector('#RangeSlider .range-slider-val-range').style.right = `${(100 - rangeSlider_max)}%`;

document.querySelector('#RangeSlider .range-slider-handle-left').style.left = `${rangeSlider_min}%`;
document.querySelector('#RangeSlider .range-slider-handle-right').style.left = `${rangeSlider_max}%`;

document.querySelector('#RangeSlider .range-slider-tooltip-left').style.left = `${rangeSlider_min}%`;
document.querySelector('#RangeSlider .range-slider-tooltip-right').style.left = `${rangeSlider_max}%`;

document.querySelector('#RangeSlider .range-slider-tooltip-left .range-slider-tooltip-text').innerText = rangeSlider_min;
document.querySelector('#RangeSlider .range-slider-tooltip-right .range-slider-tooltip-text').innerText = rangeSlider_max;

document.querySelector('#RangeSlider .range-slider-input-left').value = rangeSlider_min;
document.querySelector('#RangeSlider .range-slider-input-left').addEventListener( 'input', e => {
	e.target.value = Math.min(e.target.value, e.target.parentNode.childNodes[5].value - 1);
	var value = (100 / ( parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.value) - (100 / (parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.min);

	var children = e.target.parentNode.childNodes[1].childNodes;
	children[1].style.width = `${value}%`;
	children[5].style.left = `${value}%`;
	children[7].style.left = `${value}%`;
	children[11].style.left = `${value}%`;

	children[11].childNodes[1].innerHTML = e.target.value;
});

document.querySelector('#RangeSlider .range-slider-input-right').value = rangeSlider_max;
document.querySelector('#RangeSlider .range-slider-input-right').addEventListener( 'input', e => {
	e.target.value = Math.max(e.target.value, e.target.parentNode.childNodes[3].value - (-1));
	var value = (100 / ( parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.value) - (100 / ( parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.min);

	var children = e.target.parentNode.childNodes[1].childNodes;
	children[3].style.width = `${100-value}%`;
	children[5].style.right = `${100-value}%`;
	children[9].style.left = `${value}%`;
	children[13].style.left = `${value}%`;

	children[13].childNodes[1].innerHTML = e.target.value;
});
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

