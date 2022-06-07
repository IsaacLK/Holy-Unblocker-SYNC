import DatabaseAPI from './DatabaseAPI.js';

export default class CompatAPI extends DatabaseAPI {
	async compat(host) {
		return await this.fetch(`./compat/${host}/`);
	}
}
