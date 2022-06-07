import Cookies from 'js-cookie';
import { useEffect } from 'react';

import { RH_API } from '../../consts.js';
import { Obfuscated } from '../../obfuscate.js';
import { RammerheadAPI, StrShuffler } from '../../RammerheadAPI.js';

export default function Rammerhead(props) {
	useEffect(() => {
		void (async function () {
			let error_cause;

			try {
				const api = new RammerheadAPI(RH_API);

				// according to our NGINX config
				if (process.env.NODE_ENV === 'production') {
					Cookies.set('auth_proxy', 1, {
						domain: `.${global.location.host}`,
						expires: 1000 * 60 * 60 * 24 * 7, // 1 week
						secure: global.location.protocol === 'https:',
						sameSite: 'lax',
					});
				}

				error_cause = 'Rammerhead server is unreachable.';
				await fetch(RH_API);
				error_cause = undefined;

				error_cause = 'Unable to check if the saved session exists.';
				if (
					!localStorage.rammerhead_session ||
					!(await api.sessionexists(localStorage.rammerhead_session))
				) {
					error_cause = 'Unable to create a new Rammerhead session.';
					const session = await api.newsession();
					error_cause = undefined;
					localStorage.rammerhead_session = session;
				}

				const session = localStorage.rammerhead_session;

				error_cause = undefined;

				error_cause = 'Unable to edit a Rammerhead session.';
				await api.editsession(session, false, true);
				error_cause = undefined;

				error_cause = 'Unable to retrieve shuffled dictionary.';
				const dict = await api.shuffleDict(session);
				error_cause = undefined;

				const shuffler = new StrShuffler(dict);

				global.location.replace(
					new URL(
						`${session}/${shuffler.shuffle(
							props.compat_layout.current.destination
						)}`,
						RH_API
					)
				);
			} catch (error) {
				props.compat_layout.current.report(error, error_cause, 'Rammerhead');
			}
		})();
	}, [props.compat_layout]);

	return (
		<main className="compat">
			Loading <Obfuscated>Rammerhead</Obfuscated>...
		</main>
	);
}
