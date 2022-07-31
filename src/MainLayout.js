import './styles/Navigation.scss';
import './styles/Footer.scss';
import Footer from './Footer.js';
import { ReactComponent as HatBeta } from './assets/hat-beta.svg';
import { ReactComponent as HatDev } from './assets/hat-dev.svg';
import { ReactComponent as HatPlain } from './assets/hat.svg';
import { ObfuscateLayout, Obfuscated, ObfuscatedA } from './obfuscate.js';
import categories from './pages/theatre/games/categories.js';
import resolveRoute from './resolveRoute.js';
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
import process from 'process';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

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
	const [expanded, setExpanded] = useState(false);

	useImperativeHandle(
		ref,
		() => ({
			expanded,
			setExpanded,
		}),
		[expanded, setExpanded]
	);

	useEffect(() => {
		function keydown(event) {
			if (expanded && event.key === 'Escape') {
				setExpanded(false);
			}
		}

		document.addEventListener('keydown', keydown);

		return () => document.removeEventListener('keydown', keydown);
	}, [expanded]);

	useEffect(() => {
		document.documentElement.dataset.expanded = Number(expanded);
	}, [expanded]);

	function closeMenu() {
		setExpanded(false);
	}

	return (
		<>
			<ObfuscateLayout />
			<nav ref={nav} className="fixed-wide">
				<div className="button" onClick={() => setExpanded(true)}>
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
				<div className="cover fixed-wide" onClick={closeMenu}></div>
				<div tabIndex={0} className="menu">
					<div className="top">
						<div className="button" onClick={closeMenu}>
							<Menu />
						</div>
						<Link to="/" className="entry logo" onClick={closeMenu}>
							<Hat />
						</Link>
					</div>
					<div className="menu-list">
						<MenuTab
							route={resolveRoute('/', '')}
							name="Home"
							iconFilled={<Home />}
							iconOutlined={<HomeOutlined />}
							onClick={closeMenu}
						/>
						<MenuTab
							route={resolveRoute('/', 'proxy')}
							name="Proxy"
							iconFilled={<WebAsset />}
							onClick={closeMenu}
						/>
						<MenuTab
							route={resolveRoute('/', 'faq')}
							name="FAQ"
							iconFilled={<QuestionMark />}
							onClick={closeMenu}
						/>

						<div className="bar" />

						<MenuTab
							route={resolveRoute('/theatre/', 'apps')}
							name="Apps"
							iconFilled={<Apps />}
							onClick={closeMenu}
						/>

						<MenuTab
							route={resolveRoute('/theatre/', 'favorites')}
							name="Favorites"
							iconFilled={<StarRounded />}
							iconOutlined={<StarOutlineRounded />}
							onClick={closeMenu}
						/>

						<div className="bar" />

						<div className="title">
							<Obfuscated>Games</Obfuscated>
						</div>

						<MenuTab
							route={resolveRoute('/theatre/games/', '')}
							name="Popular"
							iconFilled={<SortRounded />}
							onClick={closeMenu}
						/>
						<MenuTab
							route={resolveRoute('/theatre/games/', 'all')}
							name="All"
							iconFilled={<List />}
							onClick={closeMenu}
						/>
						<div className="title">Genre</div>
						<div className="genres">
							{categories.map((category) => (
								<Link
									key={category.id}
									to={`${resolveRoute('/theatre/', 'category')}?id=${
										category.id
									}`}
									className="entry text"
									onClick={() => setExpanded(false)}
								>
									<Obfuscated>{category.short || category.name}</Obfuscated>
								</Link>
							))}
						</div>
					</div>
				</div>
				<Outlet />
				<Footer />
			</div>
		</>
	);
});
