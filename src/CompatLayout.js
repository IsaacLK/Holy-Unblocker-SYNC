import './styles/Compat.scss';
import './styles/ThemeElements.scss';
import { ThemeA, ThemeLink } from './ThemeElements.js';
import { decryptURL } from './cryptURL.js';
import { ObfuscateLayout, Obfuscated } from './obfuscate.js';
import resolveRoute from './resolveRoute.js';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function loadScript(src) {
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

function createPromiseExternal() {
	let promiseExternal;
	const promise = new Promise((resolve, reject) => {
		promiseExternal = { resolve, reject };
	});
	return [promise, promiseExternal];
}

export const ScriptsOrder = forwardRef(function ScriptsOrder(props, ref) {
	const [promise, promiseExternal] = useMemo(createPromiseExternal, []);

	useImperativeHandle(ref, () => ({
		promise,
	}));

	useEffect(() => {
		const abort = new AbortController();
		const scripts = [];

		(async function () {
			for (const child of props.children) {
				if (child.type !== Script) {
					continue;
				}

				const [promise, script] = loadScript(child.props.src);

				scripts.push(script);

				try {
					await promise;
				} catch (error) {
					promiseExternal.reject();
				}
			}

			promiseExternal.resolve();
		})();

		return () => {
			abort.abort();
			for (const script of scripts) {
				script.remove();
			}
		};
	}, [promise, promiseExternal, props.children]);

	return <></>;
});

export const Script = forwardRef(function Script(props, ref) {
	const [promise, promiseExternal] = useMemo(createPromiseExternal, []);

	useImperativeHandle(ref, () => ({
		promise,
	}));

	useEffect(() => {
		const [promise, script] = loadScript(props.src);

		promise.then(promiseExternal.resolve).catch(promiseExternal.reject);

		return () => {
			script.remove();
		};
	}, [promise, promiseExternal, props.src]);

	return <></>;
});

export default forwardRef(function CompatLayout(props, ref) {
	const location = useLocation();

	const [error, setError] = useState();

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

				setError({
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
							onClick={(event) => {
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
