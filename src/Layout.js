import NotificationsManager from './Notifications.js';
import { useSettings } from './Settings.js';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useLocation } from 'react-router-dom';

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

	// lastPage === undefined on refresh
	const lastPage = useRef();

	if (lastPage.current !== location.pathname) {
		if (lastPage.current) {
			scrolls.set(lastPage.current, new Scroll());
		}

		if (scrolls.has(location.pathname)) {
			scrolls.get(location.pathname).scroll();
		}

		lastPage.current = location.pathname;
	}

	return <></>;
}

function TabMode() {
	const [tab, setTab] = useState(false);

	useEffect(() => {
		function keydown(event) {
			if (event.code === 'Tab') {
				setTab(true);
			}
		}

		function mousedown() {
			setTab(false);
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

	const theme = useMemo(
		() =>
			matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night',
		[]
	);

	const [settings, setSettings] = useSettings('global settings', () => ({
		theme,
		proxy: 'automatic',
		search: 'https://www.google.com/search?q=%s',
		favorites: [],
		seen_games: [],
	}));

	const [cloak, setCloak] = useSettings('cloak settings', () => ({
		value: '',
		title: '',
		icon: '',
	}));

	useImperativeHandle(ref, () => ({
		notifications,
		settings,
		setSettings,
		cloak,
		setCloak,
	}));

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
