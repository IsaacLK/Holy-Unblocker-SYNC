import '../styles/Proxy.scss';
import SearchBuilder from '../SearchBuilder.js';
import ServiceFrame from '../ServiceFrame.js';
import { ThemeInputBar, ThemeLink } from '../ThemeElements.js';
import { BARE_API } from '../consts.js';
import engines from '../engines.js';
import isAbortError from '../isAbortError';
import { Obfuscated } from '../obfuscate.js';
import resolveRoute from '../resolveRoute.js';
import textContent from '../textContent.js';
import { NorthWest, Search } from '@mui/icons-material';
import BareClient from '@tomphttp/bare-client';
import clsx from 'clsx';
import { createRef, useMemo, useRef, useState } from 'react';

function SearchBar(props) {
	const input = useRef();
	const inputValue = useRef();
	const lastInput = useRef();
	const [lastSelect, setLastSelect] = useState(-1);
	const [omniboxEntries, setOmniboxEntries] = useState([]);
	const [inputFocused, setInputFocused] = useState(false);
	const serviceFrame = useRef();
	const abort = useRef();
	const bare = useMemo(() => new BareClient(BARE_API), []);

	const engine =
		engines.find(
			(engine) => engine.format === props.layout.current.settings.search
		) || engines[0];

	async function onInput() {
		if (inputValue.current !== input.current.value) {
			inputValue.current = input.current.value;

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

				if (!outgoing.ok) {
					throw await outgoing.text();
				}

				const text = await outgoing.text();

				for (const [, phrase] of text.matchAll(
					/<span class="sa_tm_text">(.*?)<\/span>/g
				))
					entries.push(phrase);
			} catch (error) {
				// likely abort error
				if (error.message === 'Failed to fetch') {
					console.error('Error fetching Bare server.');
				} else if (!isAbortError(error)) {
					throw error;
				}
			}

			setOmniboxEntries(entries);
		}
	}

	function searchSubmit() {
		let value;

		if (lastSelect === -1 || lastInput.current === 'input') {
			value = input.current.value;
		} else {
			value = textContent(omniboxEntries[lastSelect]);
			input.current.value = value;
		}

		const builder = new SearchBuilder(props.layout.current.settings.search);

		setInputFocused(false);
		serviceFrame.current.proxy(builder.query(input.current.value));
		onInput();
	}

	const renderSuggested = inputFocused && omniboxEntries.length !== 0;

	const form = useRef();
	const suggested = useRef();

	return (
		<>
			<ServiceFrame ref={serviceFrame} layout={props.layout} />
			<form
				className="omnibox"
				data-suggested={Number(renderSuggested)}
				data-focused={Number(inputFocused)}
				onSubmit={(event) => {
					event.preventDefault();
					searchSubmit();
				}}
				onBlur={(event) => {
					if (!form.current.contains(event.relatedTarget)) {
						setInputFocused(false);
					}
				}}
				ref={form}
			>
				<ThemeInputBar>
					<Search className="icon" />
					<input
						type="text"
						placeholder={`Search ${engine.name} or type a URL`}
						required={lastSelect === -1}
						autoComplete="off"
						className="thin-pad-left"
						list="proxy-omnibox"
						ref={input}
						onInput={onInput}
						onFocus={() => {
							onInput();
							setInputFocused(true);
							setLastSelect(-1);
						}}
						onClick={() => {
							onInput();
							setInputFocused(true);
							setLastSelect(-1);
						}}
						onChange={() => {
							lastInput.current = 'input';
							setLastSelect(-1);
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
												if (lastI >= omniboxEntries.length - 1) {
													next = 0;
												} else {
													next = lastI + 1;
												}
												break;
											case 'ArrowUp':
												if (lastI <= 0) {
													next = omniboxEntries.length - 1;
												} else {
													next = lastI - 1;
												}
												break;
											case 'Enter':
												searchSubmit();
												break;
											// no default
										}

										lastInput.current = 'select';

										setLastSelect(next);
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
					/>
				</ThemeInputBar>
				<div
					ref={suggested}
					className="suggested"
					onMouseLeave={() => {
						setLastSelect(-1);
					}}
				>
					{renderSuggested &&
						omniboxEntries.map((entry, i) => {
							const text = createRef();

							return (
								<div
									key={i}
									tabIndex={0}
									className={clsx('option', i === lastSelect && 'hover')}
									onClick={() => {
										lastInput.current = 'select';
										input.current.value = text.current.textContent;
										searchSubmit();
									}}
									onMouseOver={() => {
										setLastSelect(i);
									}}
								>
									<Search className="search" />
									<span
										className="text"
										ref={text}
										dangerouslySetInnerHTML={{
											__html: entry,
										}}
									/>
									<NorthWest className="open" />
								</div>
							);
						})}
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
