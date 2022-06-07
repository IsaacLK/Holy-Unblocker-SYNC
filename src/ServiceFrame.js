import './styles/Service.scss';

import { ChevronLeft, Fullscreen, Public } from '@mui/icons-material';
import BareClient from 'bare-client';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { BARE_API } from './consts.js';
import { decryptURL, encryptURL } from './cryptURL.js';
import { Notification } from './Notifications.js';
import { Obfuscated } from './obfuscate.js';
import resolve_proxy from './ProxyResolver.js';

export default forwardRef(function ServiceFrame(props, ref) {
	const iframe = useRef();
	const proxy = useRef();
	const [search, set_search] = useSearchParams();
	const [first_load, set_first_load] = useState(false);
	const [revoke_icon, set_revoke_icon] = useState(false);
	const bare = useMemo(() => new BareClient(BARE_API), []);
	const links_tried = useMemo(() => new WeakMap(), []);

	const src = useMemo(() => {
		if (search.has('query')) {
			return decryptURL(search.get('query'));
		} else {
			return '';
		}
	}, [search]);
	const [title, set_title] = useState(src);
	const [icon, set_icon] = useState('');

	useEffect(() => {
		window.ifr = iframe.current;

		if (src) {
			void (async function () {
				try {
					const proxied_src = await resolve_proxy(
						src,
						props.layout.current.settings.proxy
					);

					iframe.current.contentWindow.location.replace(proxied_src);
				} catch (error) {
					console.error(error);
					props.layout.current.notifications.current.add(
						<Notification
							title="Unable to find compatible proxy"
							description={error.message}
							type="error"
						/>
					);
				}
			})();
		} else {
			set_first_load(false);
			set_title('');
			set_icon('');
			iframe.current.contentWindow.location.assign('about:blank');
		}
	}, [props.layout, src]);

	useImperativeHandle(ref, () => ({
		proxy(src) {
			search.has('query') && decryptURL(search.get('query'));
			set_search({
				...Object.fromEntries(search),
				query: encryptURL(src),
			});
		},
	}));

	useEffect(() => {
		function focus_listener() {
			if (!iframe.current) {
				return;
			}

			iframe.current.contentWindow.focus();
		}

		window.addEventListener('focus', focus_listener);

		return () => {
			window.removeEventListener('focus', focus_listener);
		};
	}, [iframe]);

	useEffect(() => {
		let interval;

		async function test_proxy_update() {
			if (!iframe.current) {
				clearInterval(interval);
				return;
			}

			const { contentWindow } = iframe.current;

			let location;

			// * didn't hook our call to new Function
			try {
				location = new contentWindow.Function('return location')();
			} catch (error) {
				// possibly an x-frame error
				return;
			}

			let title;

			if (location === contentWindow.location) {
				title = src;
			} else {
				const current_title = contentWindow.document.title;

				if (current_title) {
					title = current_title;
				} else {
					title = location.toString();
				}

				const selector =
					contentWindow.document.querySelector('link[rel*="icon"]');

				let icon;

				if (selector !== null && selector.href !== '') {
					icon = selector.href;
				} else {
					icon = new URL('/favicon.ico', location).toString();
				}

				if (!links_tried.has(location)) {
					links_tried.set(location, new Set());
				}

				if (!links_tried.get(location).has(icon)) {
					links_tried.get(location).add(icon);

					const outgoing = await bare.fetch(icon);

					set_icon(URL.createObjectURL(await outgoing.blob()));
					set_revoke_icon(true);
				}
			}

			set_title(title);
		}

		interval = setInterval(test_proxy_update, 100);
		test_proxy_update();
		return () => clearInterval(interval);
	}, [proxy, bare, src, iframe, links_tried]);

	useEffect(() => {
		document.documentElement.dataset.service = Number(Boolean(src));
	}, [src]);

	return (
		<div className="service">
			<div className="buttons">
				<ChevronLeft
					className="button"
					onClick={() => {
						search.delete('query');
						set_search(search);
					}}
				/>
				{icon ? (
					<img
						className="icon"
						alt=""
						src={icon}
						onError={() => set_icon('')}
						onLoad={() => {
							if (revoke_icon) {
								URL.revokeObjectURL(icon);
								set_revoke_icon(false);
							}
						}}
					/>
				) : (
					<Public className="icon" />
				)}
				<p className="title">
					<Obfuscated ellipsis>{title}</Obfuscated>
				</p>
				<div className="shift-right"></div>
				<Fullscreen
					className="button"
					onClick={() => iframe.current.requestFullscreen()}
				/>
			</div>
			<iframe
				className="embed"
				title="embed"
				ref={iframe}
				data-first-load={Number(first_load)}
				onLoad={() => {
					if (src !== '') {
						set_first_load(true);
					}
				}}
			></iframe>
		</div>
	);
});
