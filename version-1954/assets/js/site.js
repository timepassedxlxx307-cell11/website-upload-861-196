(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var target = parseInt(dot.getAttribute('data-hero-target'), 10);
                showSlide(target);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    });

    document.querySelectorAll('[data-card-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-card-text') || card.textContent || '').toLowerCase();
                card.classList.toggle('hidden-card', query.length > 0 && text.indexOf(query) === -1);
            });
        });
    });

    function startVideo(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-button');
        var stream = shell.getAttribute('data-stream');

        if (!video || !stream) {
            return;
        }

        if (!video.getAttribute('data-ready')) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = stream;
            }
            video.setAttribute('data-ready', 'true');
        }

        if (button) {
            button.classList.add('is-hidden');
        }

        var playAction = video.play();
        if (playAction && typeof playAction.catch === 'function') {
            playAction.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    document.querySelectorAll('.video-shell').forEach(function (shell) {
        var button = shell.querySelector('.player-button');
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startVideo(shell);
            });
        }
        shell.addEventListener('click', function (event) {
            if (event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                return;
            }
            startVideo(shell);
        });
    });

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function renderSearch() {
        var container = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-page-input]');
        if (!container || !window.MOVIE_INDEX) {
            return;
        }

        var query = getQueryValue('q').trim();
        if (input) {
            input.value = query;
        }

        var normalized = query.toLowerCase();
        var results = window.MOVIE_INDEX.filter(function (movie) {
            if (!normalized) {
                return movie.rank <= 60;
            }
            return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 300);

        if (!results.length) {
            container.innerHTML = '<div class="empty-state">未找到匹配影片，可以尝试更换关键词。</div>';
            return;
        }

        container.innerHTML = results.map(function (movie) {
            var tagHtml = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card" data-card-text="' + escapeHtml(movie.searchText) + '">',
                '    <a class="poster-link" href="' + escapeHtml(movie.href) + '" aria-label="' + escapeHtml(movie.title) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
                '        <div class="poster-glow"></div>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="meta-row">',
                '            <a href="' + escapeHtml(movie.categoryHref) + '">' + escapeHtml(movie.categoryName) + '</a>',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '        </div>',
                '        <h2><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h2>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-row">' + tagHtml + '</div>',
                '    </div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    renderSearch();
})();
