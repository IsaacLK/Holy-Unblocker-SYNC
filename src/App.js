import './styles/App.scss';

import { Suspense, createRef, lazy } from 'react';
import { Route, Routes, useSearchParams } from 'react-router-dom';

import CompatLayout from './CompatLayout.js';
import Layout from './Layout.js';
import MainLayout from './MainLayout.js';
import categories from './pages/theatre/games/categories.js';
import resolveRoute from './resolveRoute.js';

const GamesPopular = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/theatre/games/Popular.js')
);
const TheatreFavorites = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/theatre/Favorites.js')
);
const TheatreCategory = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/theatre/Category.js')
);
const TheatrePlayer = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/theatre/Player.js')
);
const Home = lazy(() => import(/* webpackPrefetch: true */ './pages/Home.js'));
const Settings = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/Settings.js')
);
const SearchSettings = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/settings/Search.js')
);
const AppearanceSettings = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/settings/Appearance.js')
);
const TabCloakSettings = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/settings/TabCloak.js')
);
const FAQ = lazy(() => import(/* webpackPrefetch: true */ './pages/FAQ.js'));
const Contact = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/Contact.js')
);
const Privacy = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/Privacy.js')
);
const NotFound = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/NotFound.js')
);
const Proxy = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/Proxy.js')
);
const Credits = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/Credits.js')
);
const Terms = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/Terms.js')
);
const Ultraviolet = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/compat/Ultraviolet.js')
);
const Rammerhead = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/compat/Rammerhead.js')
);
const Stomp = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/compat/Stomp.js')
);
const Flash = lazy(() =>
	import(/* webpackPrefetch: true */ './pages/compat/Flash.js')
);

function PlayerProxy(props) {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');

	return (
		<Suspense fallback={<></>}>
			<TheatrePlayer {...props} key={id} id={id} />
		</Suspense>
	);
}

function CategoryProxy(props) {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');

	return (
		<Suspense fallback={<></>}>
			<TheatreCategory
				{...props}
				key={id}
				name={categories[id].name}
				category={id}
				id={id}
				placeholder="Search by game name"
			/>
		</Suspense>
	);
}

// https://reactrouter.com/docs/en/v6/getting-started/overview
export default function App() {
	const layout = createRef();
	const main_layout = createRef();
	const compat_layout = createRef();

	const layouts = {
		layout,
		main_layout,
		compat_layout,
	};

	return (
		<>
			<Layout ref={layout} />
			<Routes>
				<Route
					path={resolveRoute('/', '')}
					element={<MainLayout ref={main_layout} />}
				>
					<Route
						index
						element={
							<Suspense fallback={<></>}>
								<Home {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/', 'proxy', false)}
						element={
							<Suspense fallback={<></>}>
								<Proxy {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/', 'faq', false)}
						element={
							<Suspense fallback={<></>}>
								<FAQ {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/', 'contact', false)}
						element={
							<Suspense fallback={<></>}>
								<Contact {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/', 'privacy', false)}
						element={
							<Suspense fallback={<></>}>
								<Privacy {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/', 'terms', false)}
						element={
							<Suspense fallback={<></>}>
								<Terms {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/', 'credits', false)}
						element={
							<Suspense fallback={<></>}>
								<Credits {...layouts} />
							</Suspense>
						}
					/>
					<Route path={resolveRoute('/theatre/games/', '')}>
						<Route
							index
							element={
								<Suspense fallback={<></>}>
									<GamesPopular {...layouts} />
								</Suspense>
							}
						/>
						<Route
							path={resolveRoute('/theatre/games/', 'all', false)}
							element={
								<Suspense fallback={<></>}>
									<TheatreCategory
										name="All Games"
										id="all"
										key="all"
										category={Object.keys(categories).join(',')}
										placeholder="Search by game name"
										{...layouts}
									/>
								</Suspense>
							}
						/>
					</Route>
					<Route path={resolveRoute('/theatre/', '')}>
						<Route
							path={resolveRoute('/theatre/', 'player', false)}
							element={<PlayerProxy {...layouts} />}
						/>
						<Route
							path={resolveRoute('/theatre/', 'category', false)}
							element={<CategoryProxy {...layouts} />}
						/>
						<Route
							path={resolveRoute('/theatre/', 'favorites', false)}
							element={
								<Suspense fallback={<></>}>
									<TheatreFavorites {...layouts} />
								</Suspense>
							}
						/>
						<Route path={resolveRoute('/theatre/', 'apps', false)}>
							<Route
								index
								element={
									<Suspense fallback={<></>}>
										<TheatreCategory
											name="Apps"
											id="apps"
											key="apps"
											category="app"
											placeholder="Search by app name"
											{...layouts}
										/>
									</Suspense>
								}
							/>
						</Route>
					</Route>
					<Route
						path={resolveRoute('/settings/', '')}
						element={
							<Suspense fallback={<></>}>
								<Settings {...layouts} />
							</Suspense>
						}
					>
						<Route
							path={resolveRoute('/settings/', 'search', false)}
							element={
								<Suspense fallback={<></>}>
									<SearchSettings {...layouts} />
								</Suspense>
							}
						/>
						<Route
							path={resolveRoute('/settings/', 'appearance', false)}
							element={
								<Suspense fallback={<></>}>
									<AppearanceSettings {...layouts} />
								</Suspense>
							}
						/>
						<Route
							path={resolveRoute('/settings/', 'tabcloak', false)}
							element={
								<Suspense fallback={<></>}>
									<TabCloakSettings {...layouts} />
								</Suspense>
							}
						/>
					</Route>
					<Route
						path="*"
						element={
							<Suspense fallback={<></>}>
								<NotFound {...layouts} />
							</Suspense>
						}
					/>
				</Route>
				<Route
					path={resolveRoute('/compat/', '')}
					element={<CompatLayout ref={compat_layout} />}
				>
					<Route
						path={resolveRoute('/compat/', 'rammerhead', false)}
						element={
							<Suspense fallback={<></>}>
								<Rammerhead {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/compat/', 'stomp', false)}
						element={
							<Suspense fallback={<></>}>
								<Stomp {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/compat/', 'ultraviolet', false)}
						element={
							<Suspense fallback={<></>}>
								<Ultraviolet {...layouts} />
							</Suspense>
						}
					/>
					<Route
						path={resolveRoute('/compat/', 'flash', false)}
						element={
							<Suspense fallback={<></>}>
								<Flash {...layouts} />
							</Suspense>
						}
					/>
				</Route>
			</Routes>
		</>
	);
}
