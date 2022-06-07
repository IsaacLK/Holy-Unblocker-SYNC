import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useLocation } from 'react-router-dom';

import NotificationsManager from './Notifications.js';
import { useSettings } from './Settings.js';

export const THEMES = ['night', 'day'];

class Scroll {
	constructor(
		x = document.documentElement.scrollLeft,
		y = document.documentElement.scrollTop
	) {
		this.x = x;
		this.y = y;
	}
	scroll() {
		document.documentElement.scrollTo(this.x, this.y);
	}
}

function ScrollManager() {
	const location = useLocation();
	const _scrolls = useRef(new Map());
	const { current: scrolls } = _scrolls;

	// last_page === undefined on refresh
	const last_page = useRef();

	if (last_page.current !== location.pathname) {
		if (last_page.current) {
			scrolls.set(last_page.current, new Scroll());
		}

		if (scrolls.has(location.pathname)) {
			scrolls.get(location.pathname).scroll();
		}

		last_page.current = location.pathname;
	}

	return <></>;
}

function TabMode() {
	const [tab, set_tab] = useState(false);

	useEffect(() => {
		function keydown(event) {
			if (event.code === 'Tab') {
				set_tab(true);
			}
		}

		function mousedown() {
			set_tab(false);
		}

		document.documentElement.dataset.tab = Number(tab);

		document.addEventListener('keydown', keydown);
		document.addEventListener('mousedown', mousedown);

		return () => {
			document.removeEventListener('keydown', keydown);
			document.removeEventListener('mousedown', mousedown);
		};
	}, [tab]);

	return <></>;
}

export default forwardRef(function Layout(props, ref) {
	const notifications = useRef();

	const theme = useMemo(() => {
		const { matches: prefers_light } = matchMedia(
			'(prefers-color-scheme: light)'
		);

		return prefers_light ? 'day' : 'night';
	}, []);

	const [settings, set_settings] = useSettings('global settings', () => ({
		theme,
		proxy: 'automatic',
		search: 'https://www.google.com/search?q=%s',
		favorites: [],
		seen_games: [],
	}));

	const [cloak, set_cloak] = useSettings('cloak settings', () => ({
		value: '',
		title: '',
		icon: '',
	}));

	useImperativeHandle(
		ref,
		() => ({
			notifications,
			settings,
			set_settings,
			cloak,
			set_cloak,
		})
		// [settings, set_settings, cloak, set_cloak]
	);

	useEffect(() => {
		document.documentElement.dataset.theme = settings.theme;
	}, [settings.theme]);

	useEffect(() => {
		const icon = document.querySelector('link[rel="icon"]');

		if (cloak.title === '') {
			document.title = 'Holy Unblocker';
		} else {
			document.title = cloak.title;
		}

		let href;

		switch (cloak.icon) {
			case '':
				href = '/favicon.ico';
				break;
			case 'none':
				href = 'data:,';
				break;
			default:
				href = cloak.icon;
				break;
		}

		icon.href = href;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cloak]);

	return (
		<>
			<TabMode />
			<NotificationsManager ref={notifications} />
			<ScrollManager />
		</>
	);
});
