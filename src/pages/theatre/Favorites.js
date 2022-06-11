import '../../styles/TheatreCategory.scss';

import { useEffect, useState } from 'react';

import { DB_API } from '../../consts.js';
import { Obfuscated } from '../../obfuscate.js';
import { ItemList, TheatreAPI } from '../../TheatreCommon.js';

const FETCH_FAILED = /TypeError: Failed to fetch/;

export default function Favorites(props) {
	const [data, set_data] = useState(() =>
		props.layout.current.settings.favorites.map(id => ({
			loading: true,
			id,
		}))
	);

	useEffect(() => {
		const abort = new AbortController();

		void (async function () {
			const api = new TheatreAPI(DB_API, abort.signal);
			const data = [];

			for (const id of props.layout.current.settings.favorites) {
				try {
					data.push(await api.show(id));
				} catch (error) {
					// cancelled? page unload?
					if (!FETCH_FAILED.test(error)) {
						console.warn('Unable to fetch entry:', id, error);
						props.layout.current.settings.favorites.splice(
							props.layout.current.settings.favorites.indexOf(id),
							1
						);
					}
				}
			}

			// update settings
			props.layout.current.set_settings({
				...props.layout.current.settings,
			});

			set_data(data);
		})();

		return () => abort.abort();
	}, [props.layout]);

	if (props.layout.current.settings.favorites.length === 0) {
		return (
			<main className="error">
				<p>You haven't added any favorites.</p>
			</main>
		);
	} else {
		return (
			<main className="theatre-category">
				<section>
					<div className="name">
						<h1>
							<Obfuscated>Favorites</Obfuscated>
						</h1>
					</div>
					<div className="items">
						<ItemList items={data} />
					</div>
				</section>
			</main>
		);
	}
}
