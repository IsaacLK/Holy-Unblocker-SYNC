import { Check } from '@mui/icons-material';
import BareClient from 'bare-client';
import { useRef } from 'react';

import { BARE_API } from '../../consts.js';
import { Notification } from '../../Notifications.js';
import { Obfuscated } from '../../obfuscate.js';
import { ThemeButton, ThemeInputBar } from '../../ThemeElements.js';

const bare = new BareClient(BARE_API);

/**
 *
 * @param {string} url
 * @returns {{title:string,icon:string,url:string}}
 */
async function extract_data(url) {
	const response = await bare.fetch(url, {
		redirect: 'follow',
	});

	if (!response.ok) {
		throw new Error(`Response was not OK. Got ${response.status}`);
	}

	const parser = new DOMParser();

	const dom = parser.parseFromString(`${await response.text()}`, 'text/html');

	const base = document.createElement('base');
	base.href = url;

	dom.head.append(base);

	let icon;
	let title;

	{
		const selector = dom.querySelector('link[rel*="icon"]');

		if (selector !== null && selector.href !== '') {
			icon = selector.href;
		} else {
			icon = new URL('/favicon.ico', url).toString();
		}
	}

	const outgoing = await bare.fetch(icon);

	icon = await blobToDataURL(
		new Blob([await outgoing.arrayBuffer()], {
			type: outgoing.headers.get('content-type'),
		})
	);

	{
		const selector = dom.querySelector('title');

		if (selector !== null && selector.textContent !== '') {
			title = selector.textContent;
		} else {
			const url = response.finalURL;
			title = `${url.host}${url.pathname}${url.search}${url.query}`;
		}
	}

	return { icon, title, url: response.finalURL };
}

const whitespace = /\s+/;
const protocol = /^\w+:/;

function resolve_url(input) {
	if (input.match(protocol)) {
		return input;
	} else if (input.includes('.') && !input.match(whitespace)) {
		return `http://${input}`;
	} else {
		throw new Error('Bad URL');
	}
}

async function blobToDataURL(blob) {
	const reader = new FileReader();

	return new Promise((resolve, reject) => {
		reader.addEventListener('load', () => resolve(reader.result));
		reader.addEventListener('error', reject);
		reader.readAsDataURL(blob);
	});
}

export default function TabCloak(props) {
	const input = useRef();

	async function onSubmit() {
		try {
			const resolved = resolve_url(input.current.value);

			let title, icon, url;

			switch (resolved) {
				case 'about:blank':
					title = 'about:blank';
					icon = 'none';
					url = 'about:blank';
					break;
				default:
					props.layout.current.notifications.current.add(
						<Notification description="Fetching..." type="info" />
					);

					({ title, icon, url } = await extract_data(resolved));

					break;
			}

			input.current.value = url;

			props.layout.current.set_cloak({
				title,
				icon,
				url,
			});

			props.layout.current.notifications.current.add(
				<Notification description="Cloak set" type="success" />
			);
		} catch (error) {
			props.layout.current.notifications.current.add(
				<Notification
					title="Unable to fetch cloak"
					description={error.message}
					type="error"
				/>
			);
		}
	}

	return (
		<section>
			<div>
				<Obfuscated>
					Tab Cloaking allows you to disguise Holy Unblocker as any website such
					as your school's home page, new tab, etc.
				</Obfuscated>
			</div>
			<div>
				<span>
					<Obfuscated>URL</Obfuscated>:
				</span>
				<form
					onSubmit={event => {
						event.preventDefault();
						onSubmit();
					}}
				>
					<ThemeInputBar>
						<input
							className="thin-pad-right"
							defaultValue={props.layout.current.cloak.url}
							placeholder="https://example.org/"
							ref={input}
						/>
						<Check onClick={onSubmit} className="button right" />
					</ThemeInputBar>
				</form>
			</div>
			<div>
				<ThemeButton
					onClick={() => {
						props.layout.current.set_cloak({
							title: '',
							icon: '',
							url: '',
						});

						input.current.value = '';

						props.layout.current.notifications.current.add(
							<Notification description="Cloak reset" type="info" />
						);
					}}
				>
					<Obfuscated>Reset Cloak</Obfuscated>
				</ThemeButton>
			</div>
		</section>
	);
}
