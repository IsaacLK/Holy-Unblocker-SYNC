import { Script } from '../../CompatLayout.js';
import { BARE_API } from '../../consts.js';
import { Obfuscated } from '../../obfuscate.js';
import process from 'process';
import { useEffect, useRef } from 'react';

export default function Rammerhead(props) {
	const bootstrapper = useRef();

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

				errorCause = 'Failure loading the Stomp bootstrapper.';
				await bootstrapper.current.promise;
				errorCause = undefined;

				const { StompBoot } = global;

				const config = {
					bare: BARE_API,
					directory: '/stomp/',
				};

				if (process.env.NODE_ENV === 'development') {
					config.loglevel = StompBoot.LOG_TRACE;
					config.codec = StompBoot.CODEC_PLAIN;
				} else {
					config.loglevel = StompBoot.LOG_ERROR;
					config.codec = StompBoot.CODEC_XOR;
				}

				const boot = new StompBoot(config);

				errorCause = 'Failure registering the Stomp Service Worker.';
				await boot.ready;
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
					boot.html(props.compatLayout.current.destination)
				);
			} catch (error) {
				props.compatLayout.current.report(error, errorCause, 'Stomp');
			}
		})();
	}, [props.compatLayout, bootstrapper]);

	return (
		<main className="compat">
			<Script src="/stomp/bootstrapper.js" ref={bootstrapper} />
			Loading <Obfuscated>Stomp</Obfuscated>...
		</main>
	);
}
