(function (root) {
    root.initializeMoviePlayer = function (address) {
        var video = document.getElementById('movie-player');
        var button = document.getElementById('player-start');
        var ready = false;
        var hlsInstance = null;

        if (!video || !button || !address) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = address;
            } else if (root.Hls && root.Hls.isSupported()) {
                hlsInstance = new root.Hls();
                hlsInstance.loadSource(address);
                hlsInstance.attachMedia(video);
            } else {
                video.src = address;
            }

            ready = true;
        }

        function play() {
            prepare();
            button.classList.add('is-hidden');
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (ready && !video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
        root.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})(window);
