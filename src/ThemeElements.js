import './styles/ThemeElements.scss';

import { ExpandMore } from '@mui/icons-material';
import clsx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ObfuscatedA } from './obfuscate.js';

export function ThemeButton(props) {
	const { children, className, ...attributes } = props;

	return (
		<button
			type="button"
			className={clsx('theme-button', className)}
			{...attributes}
		>
			{children}
		</button>
	);
}

export function ThemeInputBar(props) {
	const { children, className, ...attributes } = props;

	return (
		<div className={clsx('theme-input-bar', className)} {...attributes}>
			{children}
		</div>
	);
}

export function ObfuscatedThemeA(props) {
	const { children, className, ...attributes } = props;

	return (
		<ObfuscatedA className={clsx('theme-link', className)} {...attributes}>
			{children}
		</ObfuscatedA>
	);
}

export function ThemeA(props) {
	const { children, className, ...attributes } = props;

	return (
		<a className={clsx('theme-link', className)} {...attributes}>
			{children}
		</a>
	);
}

export function ThemeLink(props) {
	const { children, className, ...attributes } = props;

	return (
		<Link className={clsx('theme-link', className)} {...attributes}>
			{children}
		</Link>
	);
}

export const ThemeInput = forwardRef(function ThemeInput(props, ref) {
	const { children, className, ...attributes } = props;

	return (
		<input ref={ref} className={clsx('theme-input', className)} {...attributes}>
			{children}
		</input>
	);
});

// <select ref={dummy_ref} forwardRef={ref}>

export const ThemeSelect = forwardRef(function ThemeSelect(props, ref) {
	// ref target
	const input = useRef();
	const container = useRef();
	const [last_select, set_last_select] = useState(-1);
	const [open, set_open] = useState(false);

	async function set_selected(value) {
		await _set_selected(value);
		await set_open(false);

		if (typeof props.onChange === 'function') {
			props.onChange({ target: input.current });
		}
	}

	const { className, onChange, children, ...attributes } = props;

	const list = [];

	const options = [];
	const available_options = [];

	let default_selected = 0;

	for (const child of children) {
		if (child.type === 'option') {
			const option = {
				name: child.props.children,
				value: child.props.value,
				disabled: 'disabled' in child.props,
			};

			if (option.value === (props.value || props.defaultValue)) {
				default_selected = options.length;
			}

			if (!option.disabled) {
				available_options.push(options.length);
			}

			options.push(option);
		}
	}

	const [selected, _set_selected] = useState(default_selected);

	for (let i = 0; i < options.length; i++) {
		const option = options[i];

		list.push(
			<div
				className={clsx(
					'plain-option',
					i === last_select && 'hover',
					option.disabled && 'disabled'
				)}
				key={i}
				onClick={() => {
					if (!option.disabled) {
						set_selected(i);
					}
				}}
				onMouseOver={() => {
					if (!option.disabled) {
						set_last_select(i);
					}
				}}
			>
				{option.name}
			</div>
		);
	}

	return (
		<div
			{...attributes}
			tabIndex={0}
			className={clsx('theme-select', className)}
			data-open={Number(open)}
			ref={container}
			onKeyDown={event => {
				let prevent_default = true;

				switch (event.code) {
					case 'ArrowDown':
					case 'ArrowUp':
						{
							const last_i = last_select;
							const last_i_available = available_options.indexOf(
								[...available_options].sort(
									(a, b) => Math.abs(a - last_i) - Math.abs(b - last_i)
								)[0]
							);

							let next;

							switch (event.code) {
								case 'ArrowDown':
									if (last_i_available === available_options.length - 1) {
										next = 0;
									} else {
										next = last_i_available + 1;
										if (options[last_i].disabled) {
											next--;
										}
									}
									break;
								case 'ArrowUp':
									if (last_i_available === 0) {
										next = available_options.length - 1;
									} else {
										next = last_i_available - 1;
										if (options[last_i].disabled) {
											next--;
										}
									}
									break;
								// no default
							}

							const next_i = available_options[next];

							set_last_select(next_i);

							if (!open) {
								set_selected(next_i);
							}
						}
						break;
					case 'Enter':
						if (open) {
							set_selected(last_select);
						} else {
							set_open(true);
						}
						break;
					case 'Space':
						set_open(true);
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
			onBlur={event => {
				if (!event.target.contains(event.relatedTarget)) {
					set_open(false);
				}
			}}
		>
			<input ref={input} value={options[selected]?.value} readOnly hidden />
			<div
				className="toggle"
				onClick={async () => {
					set_open(!open);
					set_last_select(selected);
					container.current.focus();
				}}
			>
				{options[selected]?.name}
				<ExpandMore />
			</div>
			<div
				className="list"
				onMouseLeave={() => {
					set_last_select(-1);
				}}
			>
				{list}
			</div>
		</div>
	);
});
