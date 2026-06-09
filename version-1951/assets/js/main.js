(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setText(node, value) {
    if (node) {
      node.textContent = value;
    }
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  selectAll('[data-slider]').forEach(function (slider) {
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('[data-slide-dot]', slider);
    var next = slider.querySelector('[data-slide-next]');
    var prev = slider.querySelector('[data-slide-prev]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
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

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  selectAll('[data-catalog]').forEach(function (catalog) {
    var searchInput = catalog.querySelector('[data-catalog-search]');
    var select = catalog.querySelector('[data-catalog-select]');
    var chips = selectAll('[data-filter-chip]', catalog);
    var cards = selectAll('[data-movie-card]', catalog);
    var empty = catalog.querySelector('[data-empty-state]');
    var activeChip = 'all';

    function cardText(card) {
      return (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta') + ' ' + card.getAttribute('data-tags')).toLowerCase();
    }

    function apply() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var selected = select ? select.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var genre = card.getAttribute('data-genre') || '';
        var type = card.getAttribute('data-type') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchSelect = selected === 'all' || genre.indexOf(selected) !== -1 || type.indexOf(selected) !== -1;
        var matchChip = activeChip === 'all' || genre.indexOf(activeChip) !== -1 || type.indexOf(activeChip) !== -1 || text.indexOf(activeChip.toLowerCase()) !== -1;
        var shouldShow = matchKeyword && matchSelect && matchChip;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeChip = chip.getAttribute('data-filter-chip') || 'all';
        apply();
      });
    });

    apply();
  });

  selectAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-button]');
    var status = shell.querySelector('[data-player-status]');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;
    var loading = false;

    function loadAndPlay() {
      if (!video || !stream || loading) {
        return;
      }
      loading = true;
      setText(status, '加载中');

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(function () {
            shell.classList.add('is-playing');
            setText(status, '');
          }).catch(function () {
            setText(status, '点击视频继续播放');
          });
        } else {
          shell.classList.add('is-playing');
          setText(status, '');
        }
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            setText(status, '播放加载异常，请重试');
            loading = false;
          });
        } else {
          playVideo();
        }
      } else {
        if (!video.src) {
          video.src = stream;
        }
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        loadAndPlay();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      loadAndPlay();
    });

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }
  });
})();
