import { HU_DISCORD_URL } from '../consts.js';
import { Obfuscated } from '../obfuscate.js';
import { ObfuscatedThemeA } from '../ThemeElements.js';

export default function Contact(props) {
	return (
		<main className="legal contact">
			<h1>Contact:</h1>
			<ul>
				<li>
					GitHub:{' '}
					<ObfuscatedThemeA href="https://git.holy.how/holy">
						<Obfuscated>https://git.holy.how/holy</Obfuscated>
					</ObfuscatedThemeA>
				</li>
				<li>
					Email:{' '}
					<ObfuscatedThemeA href="mailto:support@holy.how">
						<Obfuscated>support@holy.how</Obfuscated>
					</ObfuscatedThemeA>
				</li>
				<li>
					<Obfuscated>Discord</Obfuscated>:{' '}
					<ObfuscatedThemeA href={HU_DISCORD_URL}>
						<Obfuscated>{HU_DISCORD_URL}</Obfuscated>
					</ObfuscatedThemeA>
				</li>
			</ul>
		</main>
	);
}
