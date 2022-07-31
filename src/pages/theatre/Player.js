import '../../styles/TheatrePlayer.scss';
import resolveProxy from '../../ProxyResolver.js';
import { TheatreAPI } from '../../TheatreCommon.js';
import { DB_API, THEATRE_CDN } from '../../consts.js';
import { encryptURL } from '../../cryptURL.js';
import isAbortError from '../../isAbortError.js';
import { Obfuscated } from '../../obfuscate.js';
import resolveRoute from '../../resolveRoute.js';
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

async function resolveSrc(src, type, setting) {
	switch (type) {
		case 'proxy':
			return await resolveProxy(src, setting);
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
	const [favorited, setFavorited] = useState(() =>
		props.layout.current.settings.favorites.includes(props.id)
	);
	const [panorama, setPanorama] = useState(false);
	const [controlsExpanded, setControlsExpanded] = useState(false);
	const [error, setError] = useState();
	const errorCause = useRef();
	const [data, setData] = useState();
	const iframe = useRef();
	const controlsOpen = useRef();
	const [resolvedSrc, setResolvedSrc] = useState();
	const controlsPopup = useRef();
	const [seen, _setSeen] = useState(() =>
		props.layout.current.settings.seen_games.includes(props.id)
	);

	useEffect(() => {
		const abort = new AbortController();

		async function setSeen(value) {
			const seen = props.layout.current.settings.seen_games;

			if (value) {
				seen.push(props.id);
			} else {
				const i = seen.indexOf(props.id);
				seen.splice(i, 1);
			}

			props.layout.current.setSettings({
				...props.layout.current.settings,
				seen_games: seen,
			});

			_setSeen(value);
		}

		(async function () {
			const api = new TheatreAPI(DB_API, abort.signal);

			try {
				errorCause.current = 'Unable to fetch game info';
				const data = await api.show(props.id);
				errorCause.current = undefined;
				errorCause.current = 'Unable to resolve game location';
				const resolvedSrc = await resolveSrc(
					new URL(data.src, THEATRE_CDN).toString(),
					data.type,
					props.layout.current.settings.proxy
				);
				errorCause.current = undefined;
				setData(data);
				setResolvedSrc(resolvedSrc);

				if (!seen) {
					errorCause.current = 'Unable to update plays';
					await api.plays(props.id);
					setSeen(true);
					errorCause.current = undefined;
				}
			} catch (error) {
				if (!isAbortError(error)) {
					console.error(error);
					setError(error);
				}
			}
		})();

		return () => abort.abort();
	}, [seen, props.id, props.layout]);

	function focusListener() {
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
		window.addEventListener('focus', focusListener);

		focusListener();

		return () => window.removeEventListener('focus', focusListener);
	}, [data]);

	if (error) {
		return (
			<main className="error">
				<p>An error occurreds when loading the entry:</p>
				<pre>
					<Obfuscated>{errorCause.current || error.toString()}</Obfuscated>
				</pre>
			</main>
		);
	}

	if (!data) {
		return (
			<main
				className="theatre-player loading"
				data-panorama={Number(panorama)}
				data-controls={Number(controlsExpanded)}
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
			data-controls={Number(controlsExpanded)}
		>
			<div className="frame">
				<iframe
					ref={iframe}
					title="Embed"
					onLoad={() => {
						iframe.current.contentWindow.addEventListener(
							'keydown',
							(event) => {
								if (
									event.target === iframe.current.contentWindow.document.body
								) {
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
							}
						);
					}}
					onClick={focusListener}
					onFocus={focusListener}
					src={resolvedSrc}
				/>
				<div
					tabIndex={0}
					className="controls"
					ref={controlsPopup}
					onBlur={(event) => {
						if (
							!event.target.contains(event.relatedTarget) &&
							!controlsOpen.current.contains(event.relatedTarget)
						) {
							setControlsExpanded(false);
						}
					}}
				>
					<Close className="close" onClick={() => setControlsExpanded(false)} />
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
						focusListener();
						iframe.current.requestFullscreen();
					}}
				>
					<Fullscreen />
				</div>
				{controls.length !== 0 && (
					<div
						className="button"
						tabIndex={0}
						ref={controlsOpen}
						onClick={async () => {
							setControlsExpanded(!controlsExpanded);
							controlsPopup.current.focus();
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

						props.layout.current.setSettings({
							...props.layout.current.settings,
							favorites,
						});

						setFavorited(favorites.includes(props.id));
					}}
				>
					{favorited ? <Star /> : <StarBorder />}
				</div>
				<div
					className="button"
					onClick={async () => {
						setPanorama(!panorama);

						if (!panorama) {
							focusListener();
						}
					}}
				>
					{panorama ? <ChevronLeft /> : <Panorama />}
				</div>
			</div>
		</main>
	);
}
