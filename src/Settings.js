import { useEffect, useMemo, useRef, useState } from 'react';

export default class Settings {
	constructor(key, defaultSettings) {
		this.key = key;
		this.defaultSettings = defaultSettings;
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

		for (const key in this.defaultSettings) {
			if (this.validValue(key, parsed[key])) {
				settings[key] = parsed[key];
			} else {
				settings[key] = this.defaultSettings[key];
				updated = true;
			}
		}

		this.value = settings;

		if (updated) {
			localStorage[this.key] = JSON.stringify(this.value);
		}
	}
	validValue(key, value) {
		return typeof value === typeof this.defaultSettings[key];
	}
	get(key) {
		return this.value[key];
	}
	setObject(object) {
		let updated = false;

		for (const key in object) {
			if (this.validValue(key, object[key])) {
				this.value[key] = object[key];
				updated = true;
			}
		}

		if (updated) localStorage[this.key] = JSON.stringify(this.value);

		return updated;
	}
	set(key, value) {
		if (typeof key === 'object') return this.setObject(key);

		if (!this.validValue(key, value)) return false;

		this.value[key] = value;
		localStorage[this.key] = JSON.stringify(this.value);
		return true;
	}
}

export function useSettings(key, create) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const settings = useMemo(() => new Settings(key, create()), []);
	const [current, setCurrent] = useState({ ...settings.value });
	const oldCurrent = useRef(current);

	useEffect(() => {
		if (oldCurrent.current !== current) settings.set(current);
	}, [settings, current]);

	return [current, setCurrent];
}
