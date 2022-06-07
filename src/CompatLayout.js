import './styles/Compat.scss';
import './styles/ThemeElements.scss';

import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { decryptURL } from './cryptURL.js';
import { ObfuscateLayout, Obfuscated } from './obfuscate.js';
import resolveRoute from './resolveRoute.js';
import { ThemeA, ThemeLink } from './ThemeElements.js';

function load_script(src) {
	const script = document.createElement('script');
	script.src = src;
	script.async = true;

	const promise = new Promise((resolve, reject) => {
		script.addEventListener('load', () => {
			resolve();
		});

		script.addEventListener('error', () => {
			reject();
		});
	});

	document.body.append(script);

	return [promise, script];
}

function create_promise_external() {
	let promise_external;
	const promise = new Promise((resolve, reject) => {
		promise_external = { resolve, reject };
	});
	return [promise, promise_external];
}

export const ScriptsOrder = forwardRef(function ScriptsOrder(props, ref) {
	let [promise, promise_external] = useMemo(create_promise_external, []);

	useImperativeHandle(ref, () => ({
		promise,
	}));

	useEffect(() => {
		const abort = new AbortController();
		const scripts = [];

		void (async function () {
			for (let child of props.children) {
				if (child.type !== Script) {
					continue;
				}

				const [promise, script] = load_script(child.props.src);

				scripts.push(script);

				try {
					await promise;
				} catch (error) {
					promise_external.reject();
				}
			}

			promise_external.resolve();
		})();

		return () => {
			abort.abort();
			for (let script of scripts) {
				script.remove();
			}
		};
	}, [promise, promise_external, props.children]);

	return <></>;
});

export const Script = forwardRef(function Script(props, ref) {
	let [promise, promise_external] = useMemo(create_promise_external, []);

	useImperativeHandle(ref, () => ({
		promise,
	}));

	useEffect(() => {
		const [promise, script] = load_script(props.src);

		promise.then(promise_external.resolve).catch(promise_external.reject);

		return () => {
			script.remove();
		};
	}, [promise, promise_external, props.src]);

	return <></>;
});

export default forwardRef(function CompatLayout(props, ref) {
	const location = useLocation();

	const [error, set_error] = useState();

	useImperativeHandle(
		ref,
		() => ({
			get destination() {
				if (location.hash === '') {
					throw new Error('No hash was provided');
				}

				return new URL(decryptURL(location.hash.slice(1)));
			},
			report(error, cause, origin) {
				console.error(error);

				set_error({
					error,
					cause,
					origin,
				});
			},
		}),
		[location]
	);

	return (
		<>
			<ObfuscateLayout />
			{error ? (
				<main className="error">
					{' '}
					<span>
						An error occured when loading{' '}
						<Obfuscated>{error.origin}</Obfuscated>:
						<br />
						<pre>{error.cause || error.error.toString()}</pre>
					</span>
					<p>
						Try again by clicking{' '}
						<ThemeA
							href="i:"
							onClick={event => {
								event.preventDefault();
								global.location.reload();
							}}
						>
							here
						</ThemeA>
						.
						<br />
						If this problem still occurs, check our{' '}
						<ThemeLink to={resolveRoute('/', 'faq')} target="_parent">
							FAQ
						</ThemeLink>{' '}
						or{' '}
						<ThemeLink to={resolveRoute('/', 'contact')} target="_parent">
							Contact Us
						</ThemeLink>
						.
					</p>
				</main>
			) : (
				<Outlet />
			)}
		</>
	);
});
