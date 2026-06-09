(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function() {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
        if (!grids.length) {
            return;
        }
        var query = new URLSearchParams(window.location.search).get("q") || "";
        var searchPageInput = document.querySelector("[data-search-page-input]");
        if (searchPageInput) {
            searchPageInput.value = query;
        }
        grids.forEach(function(grid) {
            var section = grid.closest("section") || document;
            var searchInput = section.querySelector("[data-card-search]") || searchPageInput;
            var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-filter-button]"));
            var empty = section.querySelector("[data-empty-state]");
            if (searchInput && query && !searchInput.value) {
                searchInput.value = query;
            }
            var currentType = "all";
            function apply() {
                var search = normalize(searchInput ? searchInput.value : query);
                var visible = 0;
                Array.prototype.slice.call(grid.querySelectorAll("[data-card]")).forEach(function(card) {
                    var type = normalize(card.getAttribute("data-type"));
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matchSearch = !search || haystack.indexOf(search) !== -1;
                    var matchType = currentType === "all" || type.indexOf(normalize(currentType)) !== -1;
                    var show = matchSearch && matchType;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }
            if (searchInput) {
                searchInput.addEventListener("input", apply);
            }
            buttons.forEach(function(button) {
                button.addEventListener("click", function() {
                    currentType = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function(item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.setupMoviePlayer = function(playUrl) {
        var video = document.querySelector("[data-movie-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var button = document.querySelector("[data-player-button]");
        if (!video || !playUrl) {
            return;
        }
        var attached = false;
        var hls = null;
        function start() {
            if (!attached) {
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = playUrl;
                } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(playUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = playUrl;
                }
                video.controls = true;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (button && button !== overlay) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function() {
            if (video.paused || !attached) {
                start();
            }
        });
        window.addEventListener("beforeunload", function() {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function() {
        initMenu();
        initHero();
        initCardFilters();
    });
})();
