import './styles/ThemeElements.scss';
import { ObfuscatedA } from './obfuscate.js';
import { ExpandMore } from '@mui/icons-material';
import clsx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

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

export function ThemeSelect(props) {
	// ref target
	const input = useRef();
	const container = useRef();
	const [lastSelect, setLastSelect] = useState(-1);
	const [open, setOpen] = useState(false);

	function setSelected(value) {
		_setSelected(value);
		setOpen(false);

		if (typeof props.onChange === 'function')
			setTimeout(() => props.onChange({ target: input.current }));
	}

	const { className, onChange, children, ...attributes } = props;

	const list = [];

	const options = [];
	const availableOptions = [];

	let defaultSelected = 0;

	for (const child of children) {
		if (child.type === 'option') {
			const option = {
				name: child.props.children,
				value: child.props.value,
				disabled: 'disabled' in child.props,
			};

			if (option.value === (props.value || props.defaultValue)) {
				defaultSelected = options.length;
			}

			if (!option.disabled) {
				availableOptions.push(options.length);
			}

			options.push(option);
		}
	}

	const [selected, _setSelected] = useState(defaultSelected);

	for (let i = 0; i < options.length; i++) {
		const option = options[i];

		list.push(
			<div
				className={clsx(
					'plain-option',
					i === lastSelect && 'hover',
					option.disabled && 'disabled'
				)}
				key={i}
				onClick={() => {
					if (!option.disabled) {
						setSelected(i);
					}
				}}
				onMouseOver={() => {
					if (!option.disabled) {
						setLastSelect(i);
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
			onKeyDown={(event) => {
				let preventDefault = true;

				switch (event.code) {
					case 'ArrowDown':
					case 'ArrowUp':
						{
							const lastI = lastSelect;
							const lastIAvailable = availableOptions.indexOf(
								[...availableOptions].sort(
									(a, b) => Math.abs(a - lastI) - Math.abs(b - lastI)
								)[0]
							);

							let next;

							switch (event.code) {
								case 'ArrowDown':
									if (lastIAvailable === availableOptions.length - 1) {
										next = 0;
									} else {
										next = lastIAvailable + 1;
										if (options[lastI].disabled) {
											next--;
										}
									}
									break;
								case 'ArrowUp':
									if (lastIAvailable === 0) {
										next = availableOptions.length - 1;
									} else {
										next = lastIAvailable - 1;
										if (options[lastI].disabled) {
											next--;
										}
									}
									break;
								// no default
							}

							const nextI = availableOptions[next];

							setLastSelect(nextI);

							if (!open) setSelected(nextI);
						}
						break;
					case 'Enter':
						if (open) setSelected(lastSelect);
						else setOpen(true);
						break;
					case 'Space':
						setOpen(true);
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
			onBlur={(event) => {
				if (!event.target.contains(event.relatedTarget)) setOpen(false);
			}}
		>
			<input ref={input} value={options[selected]?.value} readOnly hidden />
			<div
				className="toggle"
				onClick={() => {
					setOpen(!open);
					setLastSelect(selected);
					container.current.focus();
				}}
			>
				{options[selected]?.name}
				<ExpandMore />
			</div>
			<div
				className="list"
				onMouseLeave={() => {
					setLastSelect(-1);
				}}
			>
				{list}
			</div>
		</div>
	);
}
