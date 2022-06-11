import '../../../styles/TheatreCategory.scss';

import { ArrowForward } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { DB_API } from '../../../consts.js';
import isAbortError from '../../../isAbortError.js';
import { Obfuscated } from '../../../obfuscate.js';
import resolveRoute from '../../../resolveRoute.js';
import { ItemList, TheatreAPI } from '../../../TheatreCommon.js';
import { ThemeLink } from '../../../ThemeElements.js';
import SearchBar from '../Search.js';
import categories from './categories.js';

const LIMIT = 8;
const loading_categories = {
	total: NaN,
	entries: [],
};

for (const category in categories) {
	for (let i = 0; i < LIMIT; i++) {
		loading_categories.entries.push({
			id: i,
			loading: true,
			category,
		});
	}
}

export default function Popular() {
	const category = Object.keys(categories).join(',');

	const [data, set_data] = useState(loading_categories);

	const [error, set_error] = useState();
	const main = useRef();

	useEffect(() => {
		const abort = new AbortController();

		void (async function () {
			const api = new TheatreAPI(DB_API, abort.signal);

			try {
				const data = await api.category({
					sort: 'plays',
					category,
					limitPerCategory: LIMIT,
				});

				set_data(data);
			} catch (error) {
				if (!isAbortError(error)) {
					console.error(error);
					set_error(error);
				}
			}
		})();

		return () => abort.abort();
	}, [category]);

	if (error) {
		return (
			<main className="error">
				<span>
					An error occured when loading popular <Obfuscated>games</Obfuscated>
					:
					<br />
					<pre>{error.toString()}</pre>
				</span>
				<p>
					Try again by clicking{' '}
					<a
						href="i:"
						onClick={event => {
							event.preventDefault();
							global.location.reload();
						}}
					>
						here
					</a>
					.
					<br />
					If this problem still occurs, check{' '}
					<ThemeLink to={resolveRoute('/', 'faq')} target="_parent">
						Support
					</ThemeLink>{' '}
					or{' '}
					<ThemeLink to={resolveRoute('/', 'contact')} target="_parent">
						Contact Us
					</ThemeLink>
					.
				</p>
			</main>
		);
	}

	const _categories = {};

	for (const category in categories) {
		_categories[category] = [];
	}

	for (const item of data.entries) {
		_categories[item.category].push(item);
	}

	const jsx_categories = [];

	for (const id in _categories) {
		let name;

		for (const i in categories) {
			if (id === i) {
				name = categories[i].name;
			}
		}

		jsx_categories.push(
			<section className="expand" key={id}>
				<div className="name">
					<h1>{name}</h1>
					<Link
						to={`${resolveRoute('/theatre/', 'category')}?id=${id}`}
						className="theme-link see-all"
					>
						See All
						<ArrowForward />
					</Link>
				</div>
				<ItemList className="items flex" items={_categories[id]} />
			</section>
		);
	}

	return (
		<main ref={main} className="theatre-category">
			<SearchBar category={category} placeholder="Search by game name" />
			{jsx_categories}
		</main>
	);
}
