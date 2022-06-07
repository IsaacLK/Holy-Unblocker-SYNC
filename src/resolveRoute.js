import process from 'process';

import routes from './routes.js';

export default function resolveRoute(dir, page, absolute = true) {
	let pages;
	let route_i;

	for (route_i = 0; route_i < routes.length; route_i++) {
		const route = routes[route_i];

		if (dir === route.dir) {
			pages = route.pages;
			break;
		}
	}

	if (pages === undefined) {
		throw new Error(`Unknown directory ${dir}`);
	}

	let res_dir = '';
	let res_file = '';

	if (page !== '') {
		switch (process.env.REACT_APP_ROUTER) {
			case 'id': {
				const index = pages.indexOf(page);

				if (index === -1) {
					throw new TypeError(`Unknown page ${page}`);
				}

				res_file = `${index}.html`;
				break;
			}
			default:
			case 'file':
				res_file = `${page}.html`;
				break;
		}
	}

	if (dir === '/') {
		res_dir = '/';
	} else {
		switch (process.env.REACT_APP_ROUTER) {
			case 'id': {
				res_dir = `/${route_i}/`;
				break;
			}
			default:
			case 'file':
				res_dir = dir;
				break;
		}
	}

	if (absolute) {
		return `${res_dir}${res_file}`;
	} else {
		return res_file;
	}
}
