import '../../styles/TheatreCategory.scss';
import { useSettings } from '../../Settings.js';
import { ItemList, TheatreAPI } from '../../TheatreCommon.js';
import { ThemeSelect } from '../../ThemeElements.js';
import { DB_API } from '../../consts.js';
import isAbortError from '../../isAbortError.js';
import { Obfuscated } from '../../obfuscate.js';
import resolveRoute from '../../resolveRoute.js';
import SearchBar from './Search.js';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const LIMIT = 30;

function createLoading(total) {
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

export default function Category({
	name,
	category,
	placeholder,
	id,
	showCategory,
}) {
	const [search, setSearch] = useSearchParams({
		page: 0,
	});
	const page = parseInt(search.get('page'));
	const [lastTotal, setLastTotal] = useState(LIMIT * 2);
	const [data, setData] = useState(() => createLoading(lastTotal));
	const maxPage = Math.floor(data.total / LIMIT);
	const errorCause = useRef();
	const [error, setError] = useState();
	const [settings, setSettings] = useSettings(
		`theatre category ${id} settings`,
		() => ({
			sort: 'Most Popular',
		})
	);

	useEffect(() => {
		const abort = new AbortController();

		(async function () {
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
					return setSettings({
						...settings,
						sort: 'Most Popular',
					});
			}

			try {
				errorCause.current = 'Unable to fetch the category data.';

				const data = await api.category({
					category,
					sort,
					leastGreatest,
					offset: page * LIMIT,
					limit: LIMIT,
				});

				errorCause.current = undefined;
				setData(data);
				setLastTotal(data.total);
			} catch (error) {
				if (isAbortError(error)) setError(error);
			}
		})();

		return () => abort.abort();
	}, [page, category, setSettings, settings, settings.sort]);

	if (error)
		return (
			<main className="error">
				<span>
					An error occured when loading the category:
					<br />
					<pre>{errorCause.current || error.toString()}</pre>
				</span>
				<p>
					Try again by clicking{' '}
					<a
						href="i:"
						onClick={(event) => {
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

	return (
		<main className={clsx('theatre-category')}>
			<SearchBar
				showCategory={showCategory}
				category={category}
				placeholder={placeholder}
			/>
			<section>
				<div className="name">
					<h1>
						<Obfuscated ellipsis>{name}</Obfuscated>
					</h1>
					<ThemeSelect
						className="sort"
						defaultValue={settings.sort}
						style={{ width: 160, flex: 'none' }}
						onChange={(event) => {
							setData(createLoading(lastTotal));
							setSettings({
								...settings,
								sort: event.target.value,
							});
							setSearch({
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
			<div className={clsx('pages', maxPage === 0 && 'useless')}>
				<ChevronLeft
					className={clsx('button', !page && 'disabled')}
					onClick={() => {
						if (!data.loading && page) {
							setSearch({
								...Object.fromEntries(search),
								page: Math.max(page - 1, 0),
							});
						}
					}}
				/>
				<ChevronRight
					className={clsx('button', page >= maxPage && 'disabled')}
					onClick={() => {
						if (!data.loading && page < maxPage) {
							setSearch({
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
