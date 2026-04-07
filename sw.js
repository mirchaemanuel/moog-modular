const CACHE_NAME = 'moog-modular-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/state.js',
    '/js/audio/audio-context.js',
    '/js/audio/voice-manager.js',
    '/js/audio/parameters.js',
    '/js/ui/keyboard.js',
    '/js/ui/knobs.js',
    '/js/ui/visualizations.js',
    '/js/ui/wave-selectors.js',
    '/js/presets/built-in.js',
    '/js/presets/preset-manager.js',
    '/js/presets/user-presets.js',
    '/js/sequencer/demo-patterns.js',
    '/js/sequencer/demo-player.js',
    '/js/sequencer/song-player.js',
    '/js/sequencer/playback-manager.js',
    '/js/recorder/audio-recorder.js',
    '/js/recorder/song-recorder.js',
    '/js/utils/note-converter.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});
