/* eslint-disable */
importScripts('/uv/uv.sw.js');
const sw = new UVServiceWorker();

self.addEventListener('fetch', event => {
	event.respondWith(sw.fetch(event));
});

RequestContext = class extends RequestContext {
	constructor(...args) {
		super(...args);
		this.credentials = 'include';
	}
}