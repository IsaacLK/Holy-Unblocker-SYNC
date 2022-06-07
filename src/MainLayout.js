import './styles/Navigation.scss';
import './styles/Footer.scss';

import process from 'process';

import {
	Apps,
	Home,
	HomeOutlined,
	List,
	Menu,
	QuestionMark,
	Settings,
	SortRounded,
	StarOutlineRounded,
	StarRounded,
	WebAsset,
} from '@mui/icons-material';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { ReactComponent as HatBeta } from './assets/hat-beta.svg';
import { ReactComponent as HatDev } from './assets/hat-dev.svg';
import { ReactComponent as HatPlain } from './assets/hat.svg';
import Footer from './Footer.js';
import { ObfuscateLayout, Obfuscated, ObfuscatedA } from './obfuscate.js';
import categories from './pages/theatre/games/categories.js';
import resolveRoute from './resolveRoute.js';

function Hat(props) {
	const { children, ...attributes } = props;

	switch (process.env.REACT_APP_HAT_BADGE) {
		case 'DEV':
			return <HatDev {...attributes}>{children}</HatDev>;
		case 'BETA':
			return <HatBeta {...attributes}>{children}</HatBeta>;
		default:
			return <HatPlain {...attributes}>{children}</HatPlain>;
	}
}

export function MenuTab(props) {
	const { route, href, iconFilled, iconOutlined, name, ...attributes } = props;
	const location = useLocation();
	const selected = location.pathname === route;
	const content = (
		<>
			<span className="icon">
				{(selected && iconFilled) || iconOutlined || iconFilled}
			</span>
			<span className="name">
				<Obfuscated ellipsis>{name}</Obfuscated>
			</span>
		</>
	);

	if (route === undefined) {
		return (
			<ObfuscatedA
				href={href}
				data-selected={Number(selected)}
				className="entry"
				{...attributes}
			>
				{content}
			</ObfuscatedA>
		);
	} else {
		return (
			<Link
				to={route}
				data-selected={Number(selected)}
				className="entry"
				{...attributes}
			>
				{content}
			</Link>
		);
	}
}

export default forwardRef(function Layout(props, ref) {
	const nav = useRef();
	const [expanded, set_expanded] = useState(false);

	useImperativeHandle(
		ref,
		() => ({
			expanded,
			set_expanded,
		}),
		[expanded, set_expanded]
	);

	useEffect(() => {
		function keydown(event) {
			if (expanded && event.key === 'Escape') {
				set_expanded(false);
			}
		}

		document.addEventListener('keydown', keydown);

		return () => document.removeEventListener('keydown', keydown);
	}, [expanded]);

	useEffect(() => {
		document.documentElement.dataset.expanded = Number(expanded);
	}, [expanded]);

	const ui_categories = [];

	for (let id in categories) {
		const { short, name } = categories[id];
		ui_categories.push(
			<Link
				key={id}
				to={`${resolveRoute('/theatre/', 'category')}?id=${id}`}
				className="entry text"
				onClick={() => {
					set_expanded(false);
				}}
			>
				<Obfuscated>{short || name}</Obfuscated>
			</Link>
		);
	}

	function close_menu() {
		set_expanded(false);
	}

	return (
		<>
			<ObfuscateLayout />
			<nav ref={nav} className="fixed-wide">
				<div className="button" onClick={() => set_expanded(true)}>
					<Menu />
				</div>
				<Link to="/" className="entry logo">
					<Hat />
				</Link>
				<div className="shift-right"></div>
				<Link className="button" to={resolveRoute('/settings/', 'search')}>
					<Settings />
				</Link>
			</nav>
			<div className="content">
				<div className="cover fixed-wide" onClick={close_menu}></div>
				<div tabIndex={0} className="menu">
					<div className="top">
						<div className="button" onClick={close_menu}>
							<Menu />
						</div>
						<Link to="/" className="entry logo" onClick={close_menu}>
							<Hat />
						</Link>
					</div>
					<div className="menu-list">
						<MenuTab
							route={resolveRoute('/', '')}
							name="Home"
							iconFilled={<Home />}
							iconOutlined={<HomeOutlined />}
							onClick={close_menu}
						/>
						<MenuTab
							route={resolveRoute('/', 'proxy')}
							name="Proxy"
							iconFilled={<WebAsset />}
							onClick={close_menu}
						/>
						<MenuTab
							route={resolveRoute('/', 'faq')}
							name="FAQ"
							iconFilled={<QuestionMark />}
							onClick={close_menu}
						/>

						<div className="bar" />

						<MenuTab
							route={resolveRoute('/theatre/', 'apps')}
							name="Apps"
							iconFilled={<Apps />}
							onClick={close_menu}
						/>

						<MenuTab
							route={resolveRoute('/theatre/', 'favorites')}
							name="Favorites"
							iconFilled={<StarRounded />}
							iconOutlined={<StarOutlineRounded />}
							onClick={close_menu}
						/>

						<div className="bar" />

						<div className="title">
							<Obfuscated>Games</Obfuscated>
						</div>

						<MenuTab
							route={resolveRoute('/theatre/games/', '')}
							name="Popular"
							iconFilled={<SortRounded />}
							onClick={close_menu}
						/>
						<MenuTab
							route={resolveRoute('/theatre/games/', 'all')}
							name="All"
							iconFilled={<List />}
							onClick={close_menu}
						/>
						<div className="title">Genre</div>
						<div className="genres">{ui_categories}</div>
					</div>
				</div>
				<Outlet />
				<Footer />
			</div>
		</>
	);
});
