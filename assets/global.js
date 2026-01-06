document.addEventListener('change', function (event) {
  if (event.target.closest('.collection-filters')) {
    event.target.closest('form').submit();
  }
});
