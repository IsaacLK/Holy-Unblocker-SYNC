import clsx from 'clsx';
import { create } from 'random-seed';
import { memo, useEffect, useRef } from 'react';

const rand = create(navigator.userAgent + global.location.origin);

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

let used_chars = '';

function unused_char() {
	while (true) {
		const char = chars[rand(chars.length)];

		if (used_chars.includes(char)) {
			continue;
		}

		used_chars += char;

		return char;
	}
}

function classes() {
	const classes = [];

	for (let i = 0; i < 7; i++) {
		classes.push(unused_char());
	}

	return classes;
}

const junk_classes = classes();
const real_classes = classes();
const ellipsis_classes = classes();

const char_class = unused_char();
const string_class = unused_char();

export function ObfuscateLayout() {
	const style = useRef();

	useEffect(() => {
		const { sheet } = style.current;

		for (const junk of junk_classes) {
			sheet.insertRule(
				`.${string_class} .${junk}{position:absolute;z-index:-10;opacity:0}`
			);
		}

		// word
		sheet.insertRule(`.${string_class}>span{display:inline-block}`);

		for (const ellipsis of ellipsis_classes) {
			sheet.insertRule(`.${string_class} .${ellipsis}{display:inline}`);
		}
	}, []);

	return <style ref={style}></style>;
}

class ObfuscateContext {
	constructor(text) {
		this.rand = create(text + navigator.userAgent + global.location.origin);
	}
	ellipsis_class() {
		return ellipsis_classes[this.rand(ellipsis_classes.length)];
	}
	junk_class() {
		return junk_classes[this.rand(junk_classes.length)];
	}
	real_class() {
		return real_classes[this.rand(real_classes.length)];
	}
	random(chars, i, ci) {
		const r = this.rand(2);

		switch (r) {
			default:
				console.warn('Random for', r, 'not set...');
			// eslint-disable-next-line
			case 0:
				return (
					<span key={i} className={this.junk_class()}>
						{chars[chars.length - ci]}
					</span>
				);
			case 1:
				return (
					<span key={i} className={this.junk_class()}>
						{String.fromCharCode(chars[chars.length - ci - 1].charCodeAt() ^ i)}
					</span>
				);
		}
	}
}

/**
 *
 * @param {{text:string,ellipsis:boolean}} props
 * @returns {JSX.Element}
 */
export const ObfuscatedText = memo(function ObfuscatedText(props) {
	const context = new ObfuscateContext(props.text);

	const output = [];
	const words = props.text.split(' ');

	for (let wi = 0; wi < words.length; wi++) {
		const word = words[wi];
		const chars = word.split('');

		const added = [];

		for (let ci = 0; ci < chars.length; ci++) {
			const char = chars[ci];

			const content = [];

			const add_chars = context.rand.intBetween(1, 2);
			const real_at_i = context.rand(add_chars);

			for (let i = 0; i < add_chars; i++) {
				if (i === real_at_i) {
					content.push(
						<span key={`${wi}${ci}${i}`} className={context.real_class()}>
							{char}
						</span>
					);
				} else {
					content.push(context.random(chars, i, ci));
				}
			}

			added.push(
				<span key={`${wi}${ci}`} className={char_class}>
					{content}
				</span>
			);
		}

		output.push(
			<span
				className={clsx(props.ellipsis && context.ellipsis_class())}
				key={`${wi}`}
			>
				{added}
			</span>
		);

		if (wi !== words.length - 1) {
			output.push(' ');
		}
	}

	return <span className={string_class}>{output}</span>;
});

/**
 * @description A obfuscated text block. This will strip the input of all non-text elements.
 */
export const Obfuscated = memo(function Obfuscated(props) {
	let string = '';

	const stack = [
		{
			props,
		},
	];

	let toclone;
	while ((toclone = stack.pop())) {
		if (typeof toclone === 'string') {
			string += toclone;
		} else if (typeof toclone === 'object' && toclone !== undefined) {
			let children = toclone.props.children;

			if (!(children instanceof Array)) {
				children = [children];
			}

			const max = children.length;
			for (let i = 0; i < max; i++) {
				// append in reverse order
				const child = children[max - i - 1];
				stack.push(child);
			}
		}
	}

	return (
		<ObfuscatedText text={string} ellipsis={props.ellipsis}></ObfuscatedText>
	);
});

export function ObfuscatedA(props) {
	const { href, children, onClick, onMouseUp, target, ...attributes } = props;

	return (
		// eslint-disable-next-line jsx-a11y/anchor-is-valid
		<span
			{...attributes}
			onMouseUp={event => {
				if (event.button === 1) {
					if (typeof onMouseUp === 'function') {
						onMouseUp(event);
					}

					event.preventDefault();

					window.open(href, '_blank');
				}
			}}
			onClick={event => {
				if (typeof onClick === 'function') {
					onClick(event);
				}

				event.preventDefault();

				if (event.ctrlKey) {
					window.open(href, '_blank');
				} else {
					window.open(href, target || '_self');
				}
			}}
		>
			{children}
		</span>
	);
}
