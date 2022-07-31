import { RammerheadAPI, StrShuffler } from '../../RammerheadAPI.js';
import { RH_API } from '../../consts.js';
import { Obfuscated } from '../../obfuscate.js';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

export default function Rammerhead(props) {
	useEffect(() => {
		(async function () {
			let errorCause;

			try {
				const api = new RammerheadAPI(RH_API);

				// according to our NGINX config
				if (process.env.NODE_ENV === 'production')
					Cookies.set('auth_proxy', 1, {
						domain: `.${global.location.host}`,
						expires: 1000 * 60 * 60 * 24 * 7, // 1 week
						secure: global.location.protocol === 'https:',
						sameSite: 'lax',
					});

				errorCause = 'Rammerhead server is unreachable.';
				await fetch(RH_API);
				errorCause = undefined;

				errorCause = 'Unable to check if the saved session exists.';
				if (
					!localStorage.rammerhead_session ||
					!(await api.sessionExists(localStorage.rammerhead_session))
				) {
					errorCause = 'Unable to create a new Rammerhead session.';
					const session = await api.newSession();
					errorCause = undefined;
					localStorage.rammerhead_session = session;
				}

				const session = localStorage.rammerhead_session;

				errorCause = undefined;

				errorCause = 'Unable to edit a Rammerhead session.';
				await api.editSession(session, false, true);
				errorCause = undefined;

				errorCause = 'Unable to retrieve shuffled dictionary.';
				const dict = await api.shuffleDict(session);
				errorCause = undefined;

				const shuffler = new StrShuffler(dict);

				global.location.replace(
					new URL(
						`${session}/${shuffler.shuffle(
							props.compatLayout.current.destination
						)}`,
						RH_API
					)
				);
			} catch (error) {
				props.compatLayout.current.report(error, errorCause, 'Rammerhead');
			}
		})();
	}, [props.compatLayout]);

	return (
		<main className="compat">
			Loading <Obfuscated>Rammerhead</Obfuscated>...
		</main>
	);
}
