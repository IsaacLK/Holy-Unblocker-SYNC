import '../styles/Proxy.scss';

import { NorthWest, Search } from '@mui/icons-material';
import BareClient from 'bare-client';
import clsx from 'clsx';
import { createRef, useMemo, useRef, useState } from 'react';

import { BARE_API } from '../consts.js';
import engines from '../engines.js';
import isAbortError from '../isAbortError';
import { Obfuscated } from '../obfuscate.js';
import resolveRoute from '../resolveRoute.js';
import SearchBuilder from '../SearchBuilder.js';
import ServiceFrame from '../ServiceFrame.js';
import textContent from '../textContent.js';
import { ThemeInputBar, ThemeLink } from '../ThemeElements.js';

function SearchBar(props) {
	const input = useRef();
	const input_value = useRef();
	const last_input = useRef();
	const [last_select, set_last_select] = useState(-1);
	const [omnibox_entries, set_omnibox_entries] = useState([]);
	const [input_focused, set_input_focused] = useState(false);
	const service_frame = useRef();
	const abort = useRef();
	const bare = useMemo(() => new BareClient(BARE_API), []);

	const format = useMemo(
		() => props.layout.current.settings.search,
		[props.layout]
	);

	let engine;

	for (let _engine of engines) {
		if (_engine.format === format) {
			engine = _engine;
			break;
		}
	}

	if (engine === undefined) {
		engine = engines[0];
	}

	async function on_input() {
		if (input_value.current !== input.current.value) {
			input_value.current = input.current.value;

			const entries = [];

			try {
				if (abort.current !== undefined) {
					abort.current.abort();
				}

				abort.current = new AbortController();

				const outgoing = await bare.fetch(
					'https://www.bing.com/AS/Suggestions?' +
						new URLSearchParams({
							qry: input.current.value,
							cvid: '\u0001',
							bareServer: true,
						}),
					{
						signal: abort.current.signal,
					}
				);

				if (outgoing.ok) {
					const text = await outgoing.text();

					for (let [, phrase] of text.matchAll(
						/<span class="sa_tm_text">(.*?)<\/span>/g
					)) {
						entries.push(phrase);
					}
				} else {
					throw await outgoing.text();
				}
			} catch (error) {
				// likely abort error
				if (error.message === 'Failed to fetch') {
					console.error('Error fetching Bare server.');
				} else if (!isAbortError(error)) {
					throw error;
				}
			}

			set_omnibox_entries(entries);
		}
	}

	function search_submit() {
		let value;

		if (last_select === -1 || last_input.current === 'input') {
			value = input.current.value;
		} else {
			value = textContent(omnibox_entries[last_select]);
			input.current.value = value;
		}

		const builder = new SearchBuilder(props.layout.current.settings.search);

		set_input_focused(false);
		service_frame.current.proxy(builder.query(input.current.value));
		on_input();
	}

	const render_suggested = input_focused && omnibox_entries.length !== 0;
	const suggested_list = [];

	if (render_suggested) {
		for (let i = 0; i < omnibox_entries.length; i++) {
			const text = createRef();

			suggested_list.push(
				<div
					key={i}
					tabIndex={0}
					className={clsx('option', i === last_select && 'hover')}
					onClick={() => {
						last_input.current = 'select';
						input.current.value = text.current.textContent;
						search_submit();
					}}
					onMouseOver={() => {
						set_last_select(i);
					}}
				>
					<Search className="search" />
					<span
						className="text"
						ref={text}
						dangerouslySetInnerHTML={{
							__html: omnibox_entries[i],
						}}
					/>
					<NorthWest className="open" />
				</div>
			);
		}
	}

	const form = useRef();
	const suggested = useRef();

	return (
		<>
			<ServiceFrame ref={service_frame} layout={props.layout} />
			<form
				className="omnibox"
				data-suggested={Number(render_suggested)}
				data-focused={Number(input_focused)}
				onSubmit={event => {
					event.preventDefault();
					search_submit();
				}}
				onBlur={event => {
					if (!form.current.contains(event.relatedTarget)) {
						set_input_focused(false);
					}
				}}
				ref={form}
			>
				<ThemeInputBar>
					<Search className="icon" />
					<input
						type="text"
						placeholder={`Search ${engine.name} or type a URL`}
						required={last_select === -1}
						autoComplete="off"
						className="thin-pad-left"
						list="proxy-omnibox"
						ref={input}
						onInput={on_input}
						onFocus={() => {
							on_input();
							set_input_focused(true);
							set_last_select(-1);
						}}
						onClick={() => {
							on_input();
							set_input_focused(true);
							set_last_select(-1);
						}}
						onChange={() => {
							last_input.current = 'input';
							set_last_select(-1);
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
										let last_i = last_select;

										let next;

										switch (event.code) {
											case 'ArrowDown':
												if (last_i >= omnibox_entries.length - 1) {
													next = 0;
												} else {
													next = last_i + 1;
												}
												break;
											case 'ArrowUp':
												if (last_i <= 0) {
													next = omnibox_entries.length - 1;
												} else {
													next = last_i - 1;
												}
												break;
											case 'Enter':
												search_submit();
												break;
											// no default
										}

										last_input.current = 'select';

										set_last_select(next);
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
					/>
				</ThemeInputBar>
				<div
					ref={suggested}
					className="suggested"
					onMouseLeave={() => {
						set_last_select(-1);
					}}
				>
					{suggested_list}
				</div>
			</form>
		</>
	);
}

export default function Proxies(props) {
	return (
		<main className="proxy">
			<SearchBar layout={props.layout} />
			<p>
				<Obfuscated>
					If you're having issues with the proxy, try troubleshooting your
					problem by looking at the
				</Obfuscated>{' '}
				<ThemeLink to={resolveRoute('/', 'faq')}>
					<Obfuscated>FAQ</Obfuscated>
				</ThemeLink>
				.
			</p>
		</main>
	);
}
