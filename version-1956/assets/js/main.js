(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    selectAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardMatches(card, query, region, type, year) {
        var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.textContent
        ].join(' ').toLowerCase();

        var queryOk = !query || text.indexOf(query) !== -1;
        var regionOk = !region || normalize(card.getAttribute('data-region')) === region;
        var typeOk = !type || normalize(card.getAttribute('data-type')) === type;
        var yearOk = !year || normalize(card.getAttribute('data-year')) === year;

        return queryOk && regionOk && typeOk && yearOk;
    }

    function runFilter(scope) {
        var queryInput = scope.querySelector('[data-card-filter]');
        var regionSelect = scope.querySelector('[data-filter-region]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var query = normalize(queryInput && queryInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);

        selectAll('[data-card]', scope).forEach(function (card) {
            card.classList.toggle('is-hidden', !cardMatches(card, query, region, type, year));
        });
    }

    selectAll('.section-wrap, .search-workbench').forEach(function (scope) {
        var fields = selectAll('[data-card-filter], [data-filter-region], [data-filter-type], [data-filter-year]', scope);
        if (!fields.length) {
            return;
        }
        fields.forEach(function (field) {
            field.addEventListener('input', function () {
                runFilter(scope);
            });
            field.addEventListener('change', function () {
                runFilter(scope);
            });
        });
    });

    var searchScope = document.querySelector('[data-global-search]');
    if (searchScope) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var input = searchScope.querySelector('[data-card-filter]');
        if (input && q) {
            input.value = q;
            runFilter(searchScope);
        }
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var current = 0;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });

        activate(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }
    }
})();
