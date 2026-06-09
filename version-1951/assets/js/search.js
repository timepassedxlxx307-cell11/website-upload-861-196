(function () {
  var input = document.querySelector('[data-global-search]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function card(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.region || item.type) + '</span>',
      '<span class="poster-duration">' + escapeHtml(item.duration) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h2 class="card-title"><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>·</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '<p class="card-summary">' + escapeHtml(item.oneLine) + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function search(keyword) {
    var query = String(keyword || '').trim().toLowerCase();
    var list = catalogEntries.filter(function (item) {
      if (!query) {
        return true;
      }
      var text = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, 120);

    if (results) {
      results.innerHTML = list.map(card).join('');
    }
    if (empty) {
      empty.style.display = list.length ? 'none' : 'block';
    }
  }

  if (input) {
    input.value = initial;
    input.addEventListener('input', function () {
      search(input.value);
    });
  }

  search(initial);
})();
