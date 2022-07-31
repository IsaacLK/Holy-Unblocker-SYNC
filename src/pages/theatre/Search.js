import '../../styles/TheatreSearch.scss';
import { TheatreAPI } from '../../TheatreCommon.js';
import { ThemeInputBar } from '../../ThemeElements.js';
import { DB_API } from '../../consts.js';
import isAbortError from '../../isAbortError.js';
import { Obfuscated } from '../../obfuscate.js';
import resolveRoute from '../../resolveRoute.js';
import categories from './games/categories';
import { Search } from '@mui/icons-material';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LIMIT = 8;

export default function SearchBar({ category, placeholder, showCategory }) {
	const navigate = useNavigate();
	const input = useRef();
	const [categoryData, setCategoryData] = useState({
		total: 0,
		entries: [],
	});
	const [lastSelect, setLastSelect] = useState(-1);
	const [inputFocused, setInputFocused] = useState(false);
	const searchAbort = useRef();
	const bar = useRef();

	async function search(query) {
		if (searchAbort.current !== undefined) {
			searchAbort.current.abort();
		}

		searchAbort.current = new AbortController();

		const api = new TheatreAPI(DB_API, searchAbort.current.signal);

		try {
			const categoryData = await api.category({
				sort: 'search',
				search: query,
				limit: LIMIT,
				category: category,
			});

			setCategoryData(categoryData);
		} catch (error) {
			if (!isAbortError(error)) {
				console.error(error);
			}
		}
	}

	const renderSuggested = inputFocused && categoryData.entries.length !== 0;

	return (
		<div
			className="theatre-search-bar"
			data-focused={Number(inputFocused)}
			data-suggested={Number(renderSuggested)}
			ref={bar}
			onBlur={(event) => {
				if (!bar.current.contains(event.relatedTarget)) {
					setInputFocused(false);
				}
			}}
		>
			<ThemeInputBar>
				<Search className="icon" />
				<input
					ref={input}
					type="text"
					className="thin-pad-left"
					placeholder={placeholder}
					onFocus={(event) => {
						setInputFocused(true);
						setLastSelect(-1);
						search(event.target.value);
					}}
					onClick={(event) => {
						setInputFocused(true);
						setLastSelect(-1);
						search(event.target.value);
					}}
					onKeyDown={(event) => {
						let preventDefault = true;

						switch (event.code) {
							case 'Escape':
								setInputFocused(false);
								break;
							case 'ArrowDown':
							case 'ArrowUp':
								{
									const lastI = lastSelect;

									let next;

									switch (event.code) {
										case 'ArrowDown':
											if (lastI >= categoryData.length - 1) {
												next = 0;
											} else {
												next = lastI + 1;
											}
											break;
										case 'ArrowUp':
											if (lastI <= 0) {
												next = categoryData.length - 1;
											} else {
												next = lastI - 1;
											}
											break;
										// no default
									}

									setLastSelect(next);
								}
								break;
							case 'Enter':
								{
									const entry = categoryData.entries[lastSelect];

									if (entry) {
										input.current.blur();
										setInputFocused(false);
										navigate(
											`${resolveRoute('/theatre/', 'player')}?id=${entry.id}`
										);
									}
								}
								break;
							default:
								preventDefault = false;
								break;
							// no default
						}

						if (preventDefault) {
							event.preventDefault();
						}
					}}
					onChange={(event) => {
						search(event.target.value);
						setLastSelect(-1);
					}}
				></input>
			</ThemeInputBar>
			<div
				className="suggested"
				onMouseLeave={() => {
					setLastSelect(-1);
				}}
			>
				{renderSuggested &&
					categoryData.entries.map((entry, i) => (
						<Link
							tabIndex={0}
							key={entry.id}
							onClick={() => setInputFocused(false)}
							onMouseOver={() => setLastSelect(i)}
							to={`${resolveRoute('/theatre/', 'player')}?id=${entry.id}`}
							className={clsx('option', i === lastSelect && 'hover')}
						>
							<div className="name">
								<Obfuscated ellipsis>{entry.name}</Obfuscated>
							</div>
							{showCategory && entry.category[0] && (
								<div className="category">
									{
										categories.find(
											(category) => category.id === entry.category[0]
										)?.name
									}
								</div>
							)}
						</Link>
					))}
			</div>
		</div>
	);
}
