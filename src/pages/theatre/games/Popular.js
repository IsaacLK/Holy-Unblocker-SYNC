import '../../../styles/TheatreCategory.scss';
import { ItemList, TheatreAPI } from '../../../TheatreCommon.js';
import { ThemeLink } from '../../../ThemeElements.js';
import { DB_API } from '../../../consts.js';
import isAbortError from '../../../isAbortError.js';
import { Obfuscated } from '../../../obfuscate.js';
import resolveRoute from '../../../resolveRoute.js';
import SearchBar from '../Search.js';
import categories from './categories.js';
import { ArrowForward } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const entryLimit = 8;
const loadingCategories = {
	total: NaN,
	entries: [],
};

for (const category of categories)
	for (let i = 0; i < entryLimit; i++)
		loadingCategories.entries.push({
			id: i,
			loading: true,
			category: category.id,
		});

export default function Popular() {
	const category = categories.map((category) => category.id).join(',');

	const [data, setData] = useState(loadingCategories);

	const [error, setError] = useState();
	const main = useRef();

	useEffect(() => {
		const abort = new AbortController();

		(async function () {
			const api = new TheatreAPI(DB_API, abort.signal);

			try {
				const data = await api.category({
					sort: 'plays',
					category,
					limitPerCategory: entryLimit,
				});

				setData(data);
			} catch (error) {
				if (!isAbortError(error)) {
					console.error(error);
					setError(error);
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

	for (const category of categories)
		_categories[category.id] = {
			entries: [],
			category,
		};

	for (const item of data.entries)
		_categories[item.category].entries.push(item);

	return (
		<main ref={main} className="theatre-category">
			<SearchBar
				showCategory
				category={category}
				placeholder="Search by game name"
			/>
			{Object.values(_categories).map((section) => {
				return (
					<section className="expand" key={section.category.id}>
						<div className="name">
							<h1>{category.name}</h1>
							<Link
								to={`${resolveRoute('/theatre/', 'category')}?id=${
									section.category.id
								}`}
								className="theme-link see-all"
							>
								See All
								<ArrowForward />
							</Link>
						</div>
						<ItemList className="items flex" items={section.entries} />
					</section>
				);
			})}
		</main>
	);
}
