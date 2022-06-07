import { useEffect, useRef, useState } from 'react';

import { Script } from '../../CompatLayout.js';
import { Obfuscated } from '../../obfuscate.js';

export default function Flash(props) {
	const player = useRef();
	const container = useRef();
	const [ruffle_loaded, set_ruffle_loaded] = useState(false);
	const ruffle_bundle = useRef();

	useEffect(() => {
		void (async function () {
			let error_cause;

			try {
				error_cause = 'Error loading Ruffle player.';
				await ruffle_bundle.current.promise;
				error_cause = undefined;

				const ruffle = global.RufflePlayer.newest();
				player.current = ruffle.createPlayer();
				container.current.append(player.current);

				player.current.addEventListener('loadeddata', () => {
					set_ruffle_loaded(true);
				});

				player.current.addEventListener('error', event => {
					throw event.error;
				});

				player.current.load({
					url: props.compat_layout.current.destination.toString(),
				});
			} catch (error) {
				props.compat_layout.current.report(error, error_cause, 'Rammerhead');
			}
		})();

		return () => {
			player.current.remove();
		};
	}, [props.compat_layout, ruffle_bundle]);

	return (
		<main
			className="compat-flash"
			data-loaded={Number(ruffle_loaded)}
			ref={container}
		>
			<Script src="/ruffle/ruffle.js" ref={ruffle_bundle} />
			{!ruffle_loaded && (
				<>
					Loading <Obfuscated>Flash Player</Obfuscated>...
				</>
			)}
		</main>
	);
}
