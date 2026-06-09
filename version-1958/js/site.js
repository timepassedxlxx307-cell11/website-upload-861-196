(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    var show = function (next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };

    var play = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var type = panel.querySelector('[data-type-filter]');
    var year = panel.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');

    var normalize = function (text) {
      return String(text || '').trim().toLowerCase();
    };

    var run = function () {
      var q = normalize(input ? input.value : '');
      var selectedType = normalize(type ? type.value : '');
      var selectedYear = normalize(year ? year.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var okSearch = !q || haystack.indexOf(q) !== -1;
        var okType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
        var okYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var ok = okSearch && okType && okYear;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    if (input) {
      input.addEventListener('input', run);
    }
    if (type) {
      type.addEventListener('change', run);
    }
    if (year) {
      year.addEventListener('change', run);
    }
  });

  var startPlayer = function (box) {
    var video = box.querySelector('video');
    var url = box.getAttribute('data-play-url');

    if (!video || !url) {
      return;
    }

    box.classList.add('is-playing');

    if (video.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    video.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = url;
    video.play().catch(function () {});
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
    var button = box.querySelector('[data-play-button]');
    var video = box.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(box);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(box);
        }
      });
    }
  });
})();
