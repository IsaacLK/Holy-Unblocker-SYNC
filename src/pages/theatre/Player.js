import '../../styles/TheatrePlayer.scss';

import {
	ArrowDropDown,
	ArrowDropUp,
	ArrowLeft,
	ArrowRight,
	ChevronLeft,
	Close,
	Fullscreen,
	Panorama,
	Star,
	StarBorder,
	VideogameAsset,
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';

import { DB_API, THEATRE_CDN } from '../../consts.js';
import { encryptURL } from '../../cryptURL.js';
import isAbortError from '../../isAbortError.js';
import { Obfuscated } from '../../obfuscate.js';
import resolve_proxy from '../../ProxyResolver.js';
import resolveRoute from '../../resolveRoute.js';
import { TheatreAPI } from '../../TheatreCommon.js';

async function resolve_src(src, type, setting) {
	switch (type) {
		case 'proxy':
			return await resolve_proxy(src, setting);
		case 'embed':
			return src;
		case 'flash':
			return `${resolveRoute('/compat/', 'flash')}#${encryptURL(src)} `;
		case 'emulator':
		case 'emulator.gba':
		case 'emulator.nes':
		case 'emulator.genesis':
			return new URL(
				'./html5/webretro/?' +
					new URLSearchParams({
						rom: src,
						core: 'autodetect',
					}),
				THEATRE_CDN
			).toString();
		default:
			throw new TypeError(`Unrecognized target: ${type}`);
	}
}

export default function Player(props) {
	const [favorited, set_favorited] = useState(() =>
		props.layout.current.settings.favorites.includes(props.id)
	);
	const [panorama, set_panorama] = useState(false);
	const [controls_expanded, set_controls_expanded] = useState(false);
	const [error, set_error] = useState();
	const error_cause = useRef();
	const [data, set_data] = useState();
	const iframe = useRef();
	const controls_open = useRef();
	const [resolved_src, set_resolved_src] = useState();
	const controls_popup = useRef();
	const [seen, _set_seen] = useState(() =>
		props.layout.current.settings.seen_games.includes(props.id)
	);

	useEffect(() => {
		const abort = new AbortController();

		async function set_seen(value) {
			const seen = props.layout.current.settings.seen_games;

			if (value) {
				seen.push(props.id);
			} else {
				const i = seen.indexOf(props.id);
				seen.splice(i, 1);
			}

			props.layout.current.set_settings({
				...props.layout.current.settings,
				seen_games: seen,
			});

			_set_seen(value);
		}

		void (async function () {
			const api = new TheatreAPI(DB_API, abort.signal);

			try {
				error_cause.current = 'Unable to fetch game info';
				const data = await api.show(props.id);
				error_cause.current = undefined;
				error_cause.current = 'Unable to resolve game location';
				const resolved_src = await resolve_src(
					new URL(data.src, THEATRE_CDN).toString(),
					data.type,
					props.layout.current.settings.proxy
				);
				error_cause.current = undefined;
				set_data(data);
				set_resolved_src(resolved_src);

				if (!seen) {
					error_cause.current = 'Unable to update plays';
					await api.plays(props.id);
					set_seen(true);
					error_cause.current = undefined;
				}
			} catch (error) {
				if (!isAbortError(error)) {
					console.error(error);
					set_error(error);
				}
			}
		})();

		return () => abort.abort();
	}, [seen, props.id, props.layout]);

	function focus_listener() {
		if (!iframe.current) {
			return;
		}

		iframe.current.contentWindow.focus();

		if (
			document.activeElement &&
			!iframe.current.contains(document.activeElement)
		) {
			document.activeElement.blur();
			document.activeElement.dispatchEvent(new Event('blur'));
		}
	}

	useEffect(() => {
		window.addEventListener('focus', focus_listener);

		focus_listener();

		return () => window.removeEventListener('focus', focus_listener);
	}, [data]);

	if (error) {
		return (
			<main className="error">
				<p>An error occurreds when loading the entry:</p>
				<pre>
					<Obfuscated>{error_cause.current || error.toString()}</Obfuscated>
				</pre>
			</main>
		);
	}

	if (!data) {
		return (
			<main
				className="theatre-player loading"
				data-panorama={Number(panorama)}
				data-controls={Number(controls_expanded)}
			>
				<div className="frame"></div>
				<div className="title">
					{
						// eslint-disable-next-line jsx-a11y/heading-has-content
						<h3 className="name" />
					}
					<div className="shift-right"></div>
					<div className="button" />
					<div className="button" />
					<div className="button" />
					<div className="button" />
				</div>
			</main>
		);
	}

	const controls = [];

	for (const control of data.controls) {
		const visuals = [];

		for (const key of control.keys) {
			switch (key) {
				case 'arrows':
					visuals.push(
						<div key={key} className="move">
							<ArrowDropUp className="control-key" />
							<ArrowLeft className="control-key" />
							<ArrowDropDown className="control-key" />
							<ArrowRight className="control-key" />
						</div>
					);
					break;
				case 'wasd':
					visuals.push(
						<div key={key} className="move">
							<div className="control-key">W</div>
							<div className="control-key">A</div>
							<div className="control-key">S</div>
							<div className="control-key">D</div>
						</div>
					);
					break;
				default:
					visuals.push(
						<div key={key} className={`control-key key-${key}`}>
							{key}
						</div>
					);
					break;
			}
		}

		controls.push(
			<div key={control.label} className="control">
				<div className="visuals">{visuals}</div>
				<span className="label">{control.label}</span>
			</div>
		);
	}

	return (
		<main
			className="theatre-player"
			data-panorama={Number(panorama)}
			data-controls={Number(controls_expanded)}
		>
			<div className="frame">
				<iframe
					ref={iframe}
					title="Embed"
					onLoad={() => {
						iframe.current.contentWindow.addEventListener('keydown', event => {
							if (event.target === iframe.current.contentWindow.document.body) {
								switch (event.code) {
									case 'Space':
									case 'ArrowUp':
									case 'ArrowDown':
									case 'ArrowLeft':
									case 'ArrowRight':
										event.preventDefault();
										break;
									// no default
								}
							}
						});
					}}
					onClick={focus_listener}
					onFocus={focus_listener}
					src={resolved_src}
				/>
				<div
					tabIndex={0}
					className="controls"
					ref={controls_popup}
					onBlur={event => {
						if (
							!event.target.contains(event.relatedTarget) &&
							!controls_open.current.contains(event.relatedTarget)
						) {
							set_controls_expanded(false);
						}
					}}
				>
					<Close
						className="close"
						onClick={() => set_controls_expanded(false)}
					/>
					<div className="controls">{controls}</div>
				</div>
			</div>
			<div className="title">
				<h3 className="name">
					<Obfuscated>{data.name}</Obfuscated>
				</h3>
				<div className="shift-right"></div>
				<div
					className="button"
					onClick={() => {
						focus_listener();
						iframe.current.requestFullscreen();
					}}
				>
					<Fullscreen />
				</div>
				{controls.length !== 0 && (
					<div
						className="button"
						tabIndex={0}
						ref={controls_open}
						onClick={async () => {
							set_controls_expanded(!controls_expanded);
							controls_popup.current.focus();
						}}
					>
						<VideogameAsset />
					</div>
				)}
				<div
					className="button"
					onClick={() => {
						const favorites = props.layout.current.settings.favorites;
						const i = favorites.indexOf(props.id);

						if (i === -1) {
							favorites.push(props.id);
						} else {
							favorites.splice(i, 1);
						}

						props.layout.current.set_settings({
							...props.layout.current.settings,
							favorites,
						});

						set_favorited(true);
					}}
				>
					{favorited ? <Star /> : <StarBorder />}
				</div>
				<div
					className="button"
					onClick={async () => {
						set_panorama(!panorama);

						if (!panorama) {
							focus_listener();
						}
					}}
				>
					{panorama ? <ChevronLeft /> : <Panorama />}
				</div>
			</div>
		</main>
	);
}
