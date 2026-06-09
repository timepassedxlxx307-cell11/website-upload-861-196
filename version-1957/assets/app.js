(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    function readText(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
        var searchInput = panel.querySelector("[data-filter='movie-search']");
        var yearSelect = panel.querySelector("[data-filter='movie-year']");
        var typeSelect = panel.querySelector("[data-filter='movie-type']");
        var count = panel.querySelector("[data-visible-count]");
        var list = panel.parentElement.querySelector("[data-movie-list]");
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query && searchInput) {
            searchInput.value = query;
        }

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = readText(card);
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                var matchesType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1;
                var shouldShow = matchesKeyword && matchesYear && matchesType;

                card.classList.toggle("is-hidden", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [searchInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });
})();

function setupMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-player-start]");
    var hlsPlayer = null;
    var initialized = false;

    if (!video) {
        return;
    }

    function initialize() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        initialize();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
