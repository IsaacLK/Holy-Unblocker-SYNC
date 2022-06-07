import process from 'process';

import { useEffect, useRef } from 'react';

import { Script } from '../../CompatLayout.js';
import { BARE_API } from '../../consts.js';
import { Obfuscated } from '../../obfuscate.js';

export default function Rammerhead(props) {
	const bootstrapper = useRef();

	useEffect(() => {
		void (async function () {
			let error_cause;

			try {
				if (
					process.env.NODE_ENV !== 'development' &&
					global.location.protocol !== 'https:'
				) {
					error_cause = 'Stomp must be used under HTTPS.';
					throw new Error(error_cause);
				}

				if (!('serviceWorker' in navigator)) {
					error_cause = "Your browser doesn't support service workers.";
					throw new Error(error_cause);
				}

				error_cause = 'Failure loading the Stomp bootstrapper.';
				await bootstrapper.current.promise;
				error_cause = undefined;

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

				error_cause = 'Failure registering the Stomp Service Worker.';
				await boot.ready;
				error_cause = undefined;

				error_cause = 'Bare server is unreachable.';
				{
					const bare = await fetch(BARE_API);
					if (!bare.ok) {
						throw await bare.json();
					}
				}
				error_cause = undefined;

				global.location.replace(
					boot.html(props.compat_layout.current.destination)
				);
			} catch (error) {
				props.compat_layout.current.report(error, error_cause, 'Stomp');
			}
		})();
	}, [props.compat_layout, bootstrapper]);

	return (
		<main className="compat">
			<Script src="/stomp/bootstrapper.js" ref={bootstrapper} />
			Loading <Obfuscated>Stomp</Obfuscated>...
		</main>
	);
}
