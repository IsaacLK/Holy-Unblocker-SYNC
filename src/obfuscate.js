import clsx from 'clsx';
import { create } from 'random-seed';
import { memo, useEffect, useRef } from 'react';

const rand = create(navigator.userAgent + global.location.origin);

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

let usedChars = '';

function unusedChar() {
	while (true) {
		const char = chars[rand(chars.length)];

		if (usedChars.includes(char)) {
			continue;
		}

		usedChars += char;

		return char;
	}
}

function classes() {
	const classes = [];

	for (let i = 0; i < 7; i++) {
		classes.push(unusedChar());
	}

	return classes;
}

const junkClasses = classes();
const realClasses = classes();
const ellipsisClasses = classes();

const charClass = unusedChar();
const stringClass = unusedChar();

export function ObfuscateLayout() {
	const style = useRef();

	useEffect(() => {
		const { sheet } = style.current;

		for (const junk of junkClasses) {
			sheet.insertRule(
				`.${stringClass} .${junk}{position:absolute;z-index:-10;opacity:0}`
			);
		}

		// word
		sheet.insertRule(`.${stringClass}>span{display:inline-block}`);

		for (const ellipsis of ellipsisClasses) {
			sheet.insertRule(`.${stringClass} .${ellipsis}{display:inline}`);
		}
	}, []);

	return <style ref={style}></style>;
}

class ObfuscateContext {
	constructor(text) {
		this.rand = create(text + navigator.userAgent + global.location.origin);
	}
	ellipsisClass() {
		return ellipsisClasses[this.rand(ellipsisClasses.length)];
	}
	junkClass() {
		return junkClasses[this.rand(junkClasses.length)];
	}
	realClass() {
		return realClasses[this.rand(realClasses.length)];
	}
	random(chars, i, ci) {
		const r = this.rand(2);

		switch (r) {
			default:
				console.warn('Random for', r, 'not set...');
			// eslint-disable-next-line
			case 0:
				return (
					<span key={i} className={this.junkClass()}>
						{chars[chars.length - ci]}
					</span>
				);
			case 1:
				return (
					<span key={i} className={this.junkClass()}>
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

			const addChars = context.rand.intBetween(1, 2);
			const realAtI = context.rand(addChars);

			for (let i = 0; i < addChars; i++) {
				if (i === realAtI) {
					content.push(
						<span key={`${wi}${ci}${i}`} className={context.realClass()}>
							{char}
						</span>
					);
				} else {
					content.push(context.random(chars, i, ci));
				}
			}

			added.push(
				<span key={`${wi}${ci}`} className={charClass}>
					{content}
				</span>
			);
		}

		output.push(
			<span
				className={clsx(props.ellipsis && context.ellipsisClass())}
				key={`${wi}`}
			>
				{added}
			</span>
		);

		if (wi !== words.length - 1) {
			output.push(' ');
		}
	}

	return <span className={stringClass}>{output}</span>;
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
			onMouseUp={(event) => {
				if (event.button === 1) {
					if (typeof onMouseUp === 'function') {
						onMouseUp(event);
					}

					event.preventDefault();

					window.open(href, '_blank');
				}
			}}
			onClick={(event) => {
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
