(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    var scope = document.querySelector('[data-filter-scope]');
    if (!input || !scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function uniqueValues(items, key) {
    var seen = Object.create(null);
    return items.map(function (item) {
      return item[key];
    }).filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function getSearchParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      region: params.get('region') || '',
      type: params.get('type') || '',
      year: params.get('year') || ''
    };
  }

  function createSearchCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = '' +
      '<a href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
      '  <div class="movie-poster">' +
      '    <div class="poster-fallback">' + escapeHtml(movie.title) + '</div>' +
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '    <span class="poster-badge">' + escapeHtml(movie.region) + '</span>' +
      '    <span class="poster-play">▶</span>' +
      '  </div>' +
      '  <div class="movie-card-body">' +
      '    <h3>' + escapeHtml(movie.title) + '</h3>' +
      '    <p>' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '    <div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
      '  </div>' +
      '</a>';
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_DATA) {
      return;
    }
    var data = window.MOVIE_DATA;
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var regionSelect = document.querySelector('[data-search-region]');
    var typeSelect = document.querySelector('[data-search-type]');
    var yearSelect = document.querySelector('[data-search-year]');
    var params = getSearchParams();

    fillSelect(regionSelect, uniqueValues(data, 'region'));
    fillSelect(typeSelect, uniqueValues(data, 'type'));
    fillSelect(yearSelect, uniqueValues(data, 'year'));

    if (input) {
      input.value = params.q;
    }
    if (regionSelect) {
      regionSelect.value = params.region;
    }
    if (typeSelect) {
      typeSelect.value = params.type;
    }
    if (yearSelect) {
      yearSelect.value = params.year;
    }

    function render() {
      var query = normalize(input && input.value);
      var region = regionSelect && regionSelect.value;
      var type = typeSelect && typeSelect.value;
      var year = yearSelect && yearSelect.value;
      var matches = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genreRaw,
          movie.oneLine,
          movie.tags.join(' '),
          movie.categoryName
        ].join(' '));
        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (region && movie.region !== region) {
          return false;
        }
        if (type && movie.type !== type) {
          return false;
        }
        if (year && movie.year !== year) {
          return false;
        }
        return true;
      }).slice(0, 160);

      results.innerHTML = '';
      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'detail-article';
        empty.innerHTML = '<h2>没有找到匹配影片</h2><p>可以尝试更换关键词、地区、类型或年份继续搜索。</p>';
        results.appendChild(empty);
        return;
      }
      matches.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var params = new URLSearchParams();
        if (input && input.value) {
          params.set('q', input.value);
        }
        if (regionSelect && regionSelect.value) {
          params.set('region', regionSelect.value);
        }
        if (typeSelect && typeSelect.value) {
          params.set('type', typeSelect.value);
        }
        if (yearSelect && yearSelect.value) {
          params.set('year', yearSelect.value);
        }
        var nextUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState(null, '', nextUrl);
        render();
      });
    }

    [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  function initPlayer() {
    var video = document.querySelector('[data-video-source]');
    var button = document.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var hlsInstance = null;
    var started = false;

    function hideCover() {
      button.classList.add('is-hidden');
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    function startPlayback() {
      var source = video.getAttribute('data-video-source');
      if (!source) {
        return;
      }
      hideCover();
      if (started) {
        playVideo();
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            video.src = source;
            playVideo();
          }
        });
      } else {
        video.src = source;
        playVideo();
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!started) {
        startPlayback();
      }
    });
    video.addEventListener('play', hideCover);
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayer();
  });
})();
