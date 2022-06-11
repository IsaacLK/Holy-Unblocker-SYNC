import '../../styles/TheatreSearch.scss';

import { Search } from '@mui/icons-material';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { DB_API } from '../../consts.js';
import isAbortError from '../../isAbortError.js';
import { Obfuscated } from '../../obfuscate.js';
import resolveRoute from '../../resolveRoute.js';
import { TheatreAPI } from '../../TheatreCommon.js';
import { ThemeInputBar } from '../../ThemeElements.js';

const LIMIT = 8;

export default function SearchBar(props) {
	const navigate = useNavigate();
	const input = useRef();
	const [category_data, set_category_data] = useState({
		total: 0,
		entries: [],
	});
	const [last_select, set_last_select] = useState(-1);
	const [input_focused, set_input_focused] = useState(false);
	const search_abort = useRef();
	const bar = useRef();

	async function search(query) {
		if (search_abort.current !== undefined) {
			search_abort.current.abort();
		}

		search_abort.current = new AbortController();

		const api = new TheatreAPI(DB_API, search_abort.current.signal);

		try {
			const category_data = await api.category({
				sort: 'search',
				search: query,
				limit: LIMIT,
				category: props.category,
			});

			set_category_data(category_data);
		} catch (error) {
			if (!isAbortError(error)) {
				console.error(error);
			}
		}
	}

	const render_suggested = input_focused && category_data.entries.length !== 0;
	const suggested_list = [];

	if (render_suggested) {
		for (let i = 0; i < category_data.entries.length; i++) {
			const entry = category_data.entries[i];
			let category_name;

			const classes = ['option'];

			if (i === last_select) {
				classes.push('hover');
			}

			suggested_list.push(
				<Link
					tabIndex={0}
					key={entry.id}
					onClick={() => set_input_focused(false)}
					onMouseOver={() => set_last_select(i)}
					to={`${resolveRoute('/theatre/', 'player')}?id=${entry.id}`}
					className={clsx('option', i === last_select && 'hover')}
				>
					<div className="name">
						<Obfuscated ellipsis>{entry.name}</Obfuscated>
					</div>
					<div className="category">{category_name}</div>
				</Link>
			);
		}
	}

	return (
		<div
			className="theatre-search-bar"
			data-focused={Number(input_focused)}
			data-suggested={Number(render_suggested)}
			ref={bar}
			onBlur={event => {
				if (!bar.current.contains(event.relatedTarget)) {
					set_input_focused(false);
				}
			}}
		>
			<ThemeInputBar>
				<Search className="icon" />
				<input
					ref={input}
					type="text"
					className="thin-pad-left"
					placeholder={props.placeholder}
					onFocus={event => {
						set_input_focused(true);
						set_last_select(-1);
						search(event.target.value);
					}}
					onClick={event => {
						set_input_focused(true);
						set_last_select(-1);
						search(event.target.value);
					}}
					onKeyDown={event => {
						let prevent_default = true;

						switch (event.code) {
							case 'Escape':
								set_input_focused(false);
								break;
							case 'ArrowDown':
							case 'ArrowUp':
								{
									const last_i = last_select;

									let next;

									switch (event.code) {
										case 'ArrowDown':
											if (last_i >= category_data.length - 1) {
												next = 0;
											} else {
												next = last_i + 1;
											}
											break;
										case 'ArrowUp':
											if (last_i <= 0) {
												next = category_data.length - 1;
											} else {
												next = last_i - 1;
											}
											break;
										// no default
									}

									set_last_select(next);
								}
								break;
							case 'Enter':
								{
									const entry = category_data.entries[last_select];

									if (entry) {
										input.current.blur();
										set_input_focused(false);
										navigate(
											`${resolveRoute('/theatre/', 'player')}?id=${entry.id}`
										);
									}
								}
								break;
							default:
								prevent_default = false;
								break;
							// no default
						}

						if (prevent_default) {
							event.preventDefault();
						}
					}}
					onChange={event => {
						search(event.target.value);
						set_last_select(-1);
					}}
				></input>
			</ThemeInputBar>
			<div
				className="suggested"
				onMouseLeave={() => {
					set_last_select(-1);
				}}
			>
				{suggested_list}
			</div>
		</div>
	);
}
