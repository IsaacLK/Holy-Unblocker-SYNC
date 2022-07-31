import { Script } from '../../CompatLayout.js';
import { Obfuscated } from '../../obfuscate.js';
import { useEffect, useRef, useState } from 'react';

export default function Flash(props) {
	const player = useRef();
	const container = useRef();
	const [ruffleLoaded, setRuffleLoaded] = useState(false);
	const ruffleBundle = useRef();

	useEffect(() => {
		(async function () {
			let errorCause;

			try {
				errorCause = 'Error loading Ruffle player.';
				await ruffleBundle.current.promise;
				errorCause = undefined;

				const ruffle = global.RufflePlayer.newest();
				player.current = ruffle.createPlayer();
				container.current.append(player.current);

				player.current.addEventListener('loadeddata', () => {
					setRuffleLoaded(true);
				});

				player.current.addEventListener('error', (event) => {
					throw event.error;
				});

				player.current.load({
					url: props.compatLayout.current.destination.toString(),
				});
			} catch (error) {
				props.compatLayout.current.report(error, errorCause, 'Rammerhead');
			}
		})();

		return () => {
			player.current.remove();
		};
	}, [props.compatLayout, ruffleBundle]);

	return (
		<main
			className="compat-flash"
			data-loaded={Number(ruffleLoaded)}
			ref={container}
		>
			<Script src="/ruffle/ruffle.js" ref={ruffleBundle} />
			{!ruffleLoaded && (
				<>
					Loading <Obfuscated>Flash Player</Obfuscated>...
				</>
			)}
		</main>
	);
}
