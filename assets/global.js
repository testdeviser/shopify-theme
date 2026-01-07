
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

