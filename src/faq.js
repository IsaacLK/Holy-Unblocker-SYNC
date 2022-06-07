import { TN_DISCORD_URL } from './consts.js';
import { Obfuscated } from './obfuscate.js';
import resolveRoute from './resolveRoute.js';
import { ObfuscatedThemeA, ThemeLink } from './ThemeElements.js';

const faq = [
	{
		q: (
			<>
				<Obfuscated>How can I self-host Holy Unblocker?</Obfuscated>
			</>
		),
		a: (
			<>
				<Obfuscated>
					You can self-host/deploy Holy Unblocker by using our all-in-one script
				</Obfuscated>{' '}
				<ObfuscatedThemeA href="https://github.com/e9x/website-aio#website-aio">
					here
				</ObfuscatedThemeA>
				.
			</>
		),
	},
	{
		q: <>How do I get more links?.</>,
		a: (
			<>
				<Obfuscated>You can join the</Obfuscated>{' '}
				<ObfuscatedThemeA href={TN_DISCORD_URL}>
					<Obfuscated>TitaniumNetwork Discord Server</Obfuscated>
				</ObfuscatedThemeA>{' '}
				<Obfuscated>to receive more links. Go to</Obfuscated>{' '}
				<ObfuscatedThemeA href="https://discord.com/channels/419123358698045453/743648232717942805">
					<Obfuscated>#proxy-commands</Obfuscated>
				</ObfuscatedThemeA>{' '}
				and type:
				<code className="obfuscated">
					<Obfuscated>/proxy</Obfuscated>
				</code>
				<Obfuscated>, select HolyUnblocker, then enter.</Obfuscated>
			</>
		),
	},
	{
		q: <>Where is this website's source code?</>,
		a: (
			<>
				The source code to this website can be found in our{' '}
				<ObfuscatedThemeA href="https://git.holy.how/holy/website">
					Git repository
				</ObfuscatedThemeA>
				.
			</>
		),
	},
	{
		q: (
			<>
				Is my information on the <Obfuscated>proxy</Obfuscated> secure?
			</>
		),
		a: (
			<>
				We do not collect any data, your information is only as secure as the
				sites you are accessing. For privacy concerns, you can review our{' '}
				<ThemeLink to={resolveRoute('/', 'privacy')}>Privacy Policy</ThemeLink>.
			</>
		),
	},
];

export default faq;
