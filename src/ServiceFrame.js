import './styles/Service.scss';
import { Notification } from './Notifications.js';
import resolveProxy from './ProxyResolver.js';
import { BARE_API } from './consts.js';
import { decryptURL, encryptURL } from './cryptURL.js';
import { Obfuscated } from './obfuscate.js';
import {
	ChevronLeft,
	Fullscreen,
	OpenInNew,
	Public,
} from '@mui/icons-material';
import BareClient from '@tomphttp/bare-client';
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

export default forwardRef(function ServiceFrame(props, ref) {
	const iframe = useRef();
	const [search, setSearch] = useSearchParams();
	const [firstLoad, setFirstLoad] = useState(false);
	const [revokeIcon, setRevokeIcon] = useState(false);
	const [lastSrc, setLastSrc] = useState('');
	const bare = useMemo(() => new BareClient(BARE_API), []);
	const linksTried = useMemo(() => new WeakMap(), []);

	const src = useMemo(() => {
		if (search.has('query')) {
			return decryptURL(search.get('query'));
		} else {
			return '';
		}
	}, [search]);
	const [title, setTitle] = useState(src);
	const [icon, setIcon] = useState('');

	useEffect(() => {
		window.ifr = iframe.current;

		if (src) {
			(async function () {
				try {
					const proxiedSrc = await resolveProxy(
						src,
						props.layout.current.settings.proxy
					);

					iframe.current.contentWindow.location.href = proxiedSrc;
					setLastSrc(proxiedSrc);
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
			setFirstLoad(false);
			setTitle('');
			setIcon('');
			iframe.current.contentWindow.location.href = 'about:blank';
			setLastSrc('about:blank');
		}
	}, [props.layout, src]);

	useImperativeHandle(ref, () => ({
		proxy(src) {
			search.has('query') && decryptURL(search.get('query'));
			setSearch({
				...Object.fromEntries(search),
				query: encryptURL(src),
			});
		},
	}));

	useEffect(() => {
		function focusListener() {
			if (!iframe.current) {
				return;
			}

			iframe.current.contentWindow.focus();
		}

		window.addEventListener('focus', focusListener);

		return () => {
			window.removeEventListener('focus', focusListener);
		};
	}, [iframe]);

	const testProxyUpdate = useCallback(
		async function testProxyUpdate() {
			if (!iframe.current) {
				return;
			}

			const { contentWindow } = iframe.current;

			// * didn't hook our call to new Function
			try {
				setLastSrc(contentWindow.location.href);
			} catch (error) {
				// possibly an x-frame error
				return;
			}

			const location = new contentWindow.Function('return location')();

			let title;

			if (location === contentWindow.location) {
				title = src;
			} else {
				const currentTitle = contentWindow.document.title;

				if (currentTitle) {
					title = currentTitle;
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

				if (!linksTried.has(location)) {
					linksTried.set(location, new Set());
				}

				if (!linksTried.get(location).has(icon)) {
					linksTried.get(location).add(icon);

					const outgoing = await bare.fetch(icon);

					setIcon(URL.createObjectURL(await outgoing.blob()));
					setRevokeIcon(true);
				}
			}

			setTitle(title);
		},
		[bare, linksTried, src]
	);

	useEffect(() => {
		const interval = setInterval(testProxyUpdate, 50);
		testProxyUpdate();
		return () => clearInterval(interval);
	}, [testProxyUpdate]);

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
						setSearch(search);
					}}
				/>
				{icon ? (
					<img
						className="icon"
						alt=""
						src={icon}
						onError={() => setIcon('')}
						onLoad={() => {
							if (revokeIcon) {
								URL.revokeObjectURL(icon);
								setRevokeIcon(false);
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
				<a href={lastSrc} className="button">
					<OpenInNew />
				</a>
				<Fullscreen
					className="button"
					onClick={() => iframe.current.requestFullscreen()}
				/>
			</div>
			<iframe
				className="embed"
				title="embed"
				ref={iframe}
				data-first-load={Number(firstLoad)}
				onLoad={() => {
					testProxyUpdate();

					if (src !== '') {
						setFirstLoad(true);
					}
				}}
			></iframe>
		</div>
	);
});
