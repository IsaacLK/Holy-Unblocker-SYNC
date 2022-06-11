export default class DatabaseAPI {
	/**
	 *
	 * @param {string} server
	 * @param {AbortSignal} [signal]
	 */
	constructor(server, signal) {
		this.server = server;
		this.signal = signal;
	}
	/**
	 *
	 * @param {object} params
	 * @returns {object}
	 */
	sort_params(params) {
		const result = {};

		for (const param in params) {
			switch (typeof params[param]) {
				case 'undefined':
				case 'object':
					break;
				default:
					result[param] = params[param];
					break;
			}
		}

		return result;
	}
	/**
	 *
	 * @param {string} url
	 * @param {object} init
	 * @returns
	 */
	async fetch(url, init = {}) {
		const outgoing = await fetch(new URL(url, this.server), {
			...init,
			signal: this.signal,
		});

		const json = await outgoing.json();

		if (!outgoing.ok) {
			const error = new Error(json.message);
			error.statusCode = json.statusCode;
			throw error;
		}

		return json;
	}
}
