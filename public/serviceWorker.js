const CACHE_NAME = 'version-1';
const urlsToCache = ['index.html', 'offline.html'];

const self = this;

// Install SW
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Opened cache');

			return cache.addAll(urlsToCache);
		})
	);
});

// Listen for requests
self.addEventListener('fetch', (event) => {
	const requestUrl = new URL(event.request.url);
	if (
		requestUrl.origin !== self.location.origin ||
		event.request.method !== 'GET' ||
		event.request.mode !== 'navigate'
	) {
		return;
	}

	event.respondWith(
		fetch(event.request).catch(() => {
			return caches.match('offline.html');
		})
	);
});

// Activate the SW
self.addEventListener('activate', (event) => {
	const cacheWhitelist = [];
	cacheWhitelist.push(CACHE_NAME);

	event.waitUntil(
		caches.keys().then((cacheNames) =>
			Promise.all(
				cacheNames.map((cacheName) => {
					if (!cacheWhitelist.includes(cacheName)) {
						return caches.delete(cacheName);
					}
				})
			)
		)
	);
});
