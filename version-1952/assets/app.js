(function () {
  'use strict';

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

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.hidden = !menu.hidden;
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
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
      }, 5200);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupGlobalSearch() {
    Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="query"]');
        var query = input ? input.value.trim() : '';
        var target = './all.html';
        if (query) {
          target += '?query=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var region = scope.querySelector('[data-region-filter]');
      var type = scope.querySelector('[data-type-filter]');
      var year = scope.querySelector('[data-year-filter]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var params = new URLSearchParams(window.location.search);

      if (input && params.get('query')) {
        input.value = params.get('query');
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var selectedRegion = normalize(region ? region.value : '');
        var selectedType = normalize(type ? type.value : '');
        var selectedYear = normalize(year ? year.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
          var matchesType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
          var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
          var show = matchesQuery && matchesRegion && matchesType && matchesYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      apply();
    });
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var src = shell.getAttribute('data-video-source');
      var loaded = false;
      var hls = null;

      function playVideo() {
        if (!video) {
          return;
        }
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {});
        }
      }

      function loadVideo() {
        if (!video || !src) {
          return;
        }
        shell.classList.add('is-playing');
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          return;
        }
        video.src = src;
        playVideo();
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          loadVideo();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!loaded) {
            loadVideo();
          }
        });
        video.addEventListener('ended', function () {
          shell.classList.remove('is-playing');
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupFilters();
    setupPlayers();
  });
})();
