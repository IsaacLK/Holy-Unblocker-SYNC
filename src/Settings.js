import { useEffect, useMemo, useRef, useState } from 'react';

export default class Settings {
	/**
	 *
	 * @param {string} key
	 * @param {object.<string, Serializable>} default_settings
	 */
	constructor(key, default_settings) {
		this.key = key;
		this.default_settings = default_settings;
		this.load();
	}
	load() {
		if (localStorage[this.key] === undefined) {
			localStorage[this.key] = '{}';
		}

		let parsed;

		try {
			parsed = JSON.parse(localStorage[this.key]);
		} catch (error) {
			parsed = {};
		}

		const settings = {};
		Reflect.setPrototypeOf(settings, null);

		let updated = false;

		for (const key in this.default_settings) {
			if (this.valid_value(key, parsed[key])) {
				settings[key] = parsed[key];
			} else {
				settings[key] = this.default_settings[key];
				updated = true;
			}
		}

		this.value = settings;

		if (updated) {
			localStorage[this.key] = JSON.stringify(this.value);
		}
	}
	valid_value(key, value) {
		return typeof value === typeof this.default_settings[key];
	}
	get(key) {
		return this.value[key];
	}
	set_object(object) {
		let updated = false;

		for (const key in object) {
			if (this.valid_value(key, object[key])) {
				this.value[key] = object[key];
				updated = true;
			}
		}

		if (updated) {
			localStorage[this.key] = JSON.stringify(this.value);
		}

		return updated;
	}
	set(key, value) {
		if (typeof key === 'object') {
			this.set_object(key);
			return;
		}

		if (this.valid_value(key, value)) {
			this.value[key] = value;
			localStorage[this.key] = JSON.stringify(this.value);
			return true;
		} else {
			return false;
		}
	}
}

export function useSettings(key, create) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const settings = useMemo(() => new Settings(key, create()), []);
	const [current, set_current] = useState({ ...settings.value });
	const old_current = useRef(current);

	useEffect(() => {
		if (old_current.current !== current) {
			settings.set(current);
		}
	}, [settings, current]);

	return [current, set_current];
}
