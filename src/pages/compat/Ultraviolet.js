import { Script, ScriptsOrder } from '../../CompatLayout.js';
import { BARE_API } from '../../consts.js';
import { Obfuscated } from '../../obfuscate.js';
import { useEffect, useRef } from 'react';

/**
 * @callback UVEncode
 * @argument {string} decoded
 * @returns {string} encoded
 */

/**
 * @callback UVDecode
 * @argument {string} encoded
 * @returns {string} decoded
 */

/**
 * @typedef {object} UVConfig
 * @property {string} bare
 * @property {string} handler
 * @property {string} bundle
 * @property {string} config
 * @property {string} sw
 * @property {UVEncode} encodeUrl
 * @property {UVDecode} decodeUrl
 */
export default function Ultraviolet(props) {
	const uvBundle = useRef();

	useEffect(() => {
		(async function () {
			let errorCause;

			try {
				if (
					process.env.NODE_ENV !== 'development' &&
					global.location.protocol !== 'https:'
				) {
					errorCause = 'Stomp must be used under HTTPS.';
					throw new Error(errorCause);
				}

				if (!('serviceWorker' in navigator)) {
					errorCause = "Your browser doesn't support service workers.";
					throw new Error(errorCause);
				}

				errorCause = 'Failure loading the Ultraviolet bundle.';
				await uvBundle.current.promise;
				errorCause = undefined;

				/**
				 * @type {UVConfig}
				 */
				const config = global.__uv$config;

				// register sw
				errorCause = 'Failure registering the Ultraviolet Service Worker.';
				await navigator.serviceWorker.register('/uv/sw.js', {
					scope: config.prefix,
					updateViaCache: 'none',
				});
				errorCause = undefined;

				errorCause = 'Bare server is unreachable.';
				{
					const bare = await fetch(BARE_API);
					if (!bare.ok) {
						throw await bare.json();
					}
				}
				errorCause = undefined;

				global.location.replace(
					new URL(
						config.encodeUrl(props.compatLayout.current.destination),
						new URL(config.prefix, global.location)
					)
				);
			} catch (error) {
				props.compatLayout.current.report(error, errorCause, 'Ultraviolet');
			}
		})();
	}, [props.compatLayout]);

	return (
		<main className="compat">
			<ScriptsOrder ref={uvBundle}>
				<Script src="/uv/uv.bundle.js" />
				<Script src="/uv/uv.config.js" />
			</ScriptsOrder>
			Loading <Obfuscated>Ultraviolet</Obfuscated>...
		</main>
	);
}
