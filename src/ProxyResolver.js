import CompatAPI from './CompatAPI.js';
import { DB_API, DEFAULT_PROXY } from './consts.js';
import { encryptURL } from './cryptURL.js';
import resolveRoute from './resolveRoute.js';

/**
 *
 * @param {string} src
 * @param {string} setting
 * @returns {string}
 */
export default async function resolve_proxy(src, setting) {
	if (setting === 'automatic') {
		const { host } = new URL(src);
		const api = new CompatAPI(DB_API);

		try {
			setting = (await api.compat(host)).proxy;
		} catch (error) {
			if (error.message === 'Not Found') {
				setting = DEFAULT_PROXY;
			} else {
				console.error(error);
				throw error;
			}
		}
	}

	let route;

	switch (setting) {
		case 'stomp':
			route = resolveRoute('/compat/', 'stomp');
			break;
		case 'ultraviolet':
			route = resolveRoute('/compat/', 'ultraviolet');
			break;
		default:
		case 'rammerhead':
			route = resolveRoute('/compat/', 'rammerhead');
			break;
	}

	return `${route}#${encryptURL(src)}`;
}
