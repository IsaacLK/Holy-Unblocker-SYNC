import '../../styles/TheatreCategory.scss';

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { DB_API } from '../../consts.js';
import isAbortError from '../../isAbortError.js';
import { Obfuscated } from '../../obfuscate.js';
import resolveRoute from '../../resolveRoute.js';
import { useSettings } from '../../Settings.js';
import { ItemList, TheatreAPI } from '../../TheatreCommon.js';
import { ThemeSelect } from '../../ThemeElements.js';
import SearchBar from './Search.js';

const LIMIT = 30;

function create_loading(total) {
	const loading = {
		total,
		entries: [],
		loading: true,
	};

	for (let i = 0; i < LIMIT; i++) {
		loading.entries.push({
			id: i,
			loading: true,
		});
	}

	return loading;
}

export default function Category(props) {
	const [search, set_search] = useSearchParams({
		page: 0,
	});
	const page = parseInt(search.get('page'));
	const [last_total, set_last_total] = useState(LIMIT * 2);
	const [data, set_data] = useState(() => create_loading(last_total));
	const max_page = Math.floor(data.total / LIMIT);
	const error_cause = useRef();
	const [error, set_error] = useState();
	const [settings, set_settings] = useSettings(
		`theatre category ${props.id} settings`,
		() => ({
			sort: 'Most Popular',
		})
	);

	useEffect(() => {
		const abort = new AbortController();

		void (async function () {
			const api = new TheatreAPI(DB_API, abort.signal);
			let leastGreatest = false;
			let sort;

			switch (settings.sort) {
				case 'Least Popular':
					leastGreatest = true;
				// falls through
				case 'Most Popular':
					sort = 'plays';
					break;
				case 'Least Favorites':
					leastGreatest = true;
				// falls through
				case 'Most Favorites':
					sort = 'favorites';
					break;
				case 'Name (Z-A)':
					leastGreatest = true;
				// falls through
				case 'Name (A-Z)':
					sort = 'name';
					break;
				default:
					return set_settings({
						...settings,
						sort: 'Most Popular',
					});
			}

			try {
				error_cause.current = 'Unable to fetch the category data.';

				const data = await api.category({
					category: props.category,
					sort,
					leastGreatest,
					offset: page * LIMIT,
					limit: LIMIT,
				});

				error_cause.current = undefined;
				set_data(data);
				set_last_total(data.total);
			} catch (error) {
				if (isAbortError(error)) {
					set_error(error);
				}
			}
		})();

		return () => abort.abort();
	}, [page, props.category, set_settings, settings, settings.sort]);

	if (error) {
		return (
			<main className="error">
				<span>
					An error occured when loading the category:
					<br />
					<pre>{error_cause.current || error.toString()}</pre>
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
					<Link
						className="theme-link"
						to={resolveRoute('/', 'faq')}
						target="_parent"
					>
						Support
					</Link>{' '}
					or{' '}
					<Link
						className="theme-link"
						to={resolveRoute('/', 'contact')}
						target="_parent"
					>
						Contact Us
					</Link>
					.
				</p>
			</main>
		);
	}

	return (
		<main className={clsx('theatre-category')}>
			<SearchBar category={props.category} placeholder={props.placeholder} />
			<section>
				<div className="name">
					<h1>
						<Obfuscated ellipsis>{props.name}</Obfuscated>
					</h1>
					<ThemeSelect
						className="sort"
						defaultValue={settings.sort}
						style={{ width: 160, flex: 'none' }}
						onChange={event => {
							set_data(create_loading(last_total));
							set_settings({
								...settings,
								sort: event.target.value,
							});
							set_search({
								...Object.fromEntries(search),
								page: 0,
							});
						}}
					>
						<option value="Most Popular">Most Popular</option>
						<option value="Least Popular">Least Popular</option>
						<option value="Name (A-Z)">Name (A-Z)</option>
						<option value="Name (Z-A)">Name (Z-A)</option>
					</ThemeSelect>
				</div>
				<ItemList className="items" items={data.entries} />
			</section>
			<div className={clsx('pages', max_page === 0 && 'useless')}>
				<ChevronLeft
					className={clsx('button', !page && 'disabled')}
					onClick={() => {
						if (!data.loading && page) {
							set_search({
								...Object.fromEntries(search),
								page: Math.max(page - 1, 0),
							});
						}
					}}
				/>
				<ChevronRight
					className={clsx('button', page >= max_page && 'disabled')}
					onClick={() => {
						if (!data.loading && page < max_page) {
							set_search({
								...Object.fromEntries(search),
								page: page + 1,
							});
						}
					}}
				/>
			</div>
		</main>
	);
}
