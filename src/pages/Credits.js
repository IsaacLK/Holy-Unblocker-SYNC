import { ObfuscatedThemeA } from '../ThemeElements.js';
import { Obfuscated } from '../obfuscate.js';

export default function Credits() {
	return (
		<main className="legal credits">
			<h2>Credits</h2>

			<h4>Development</h4>

			<ul>
				<li>
					<Obfuscated>
						sexyduceduce - Frontend Developer, Ultraviolet
					</Obfuscated>
				</li>
				<li>
					<Obfuscated>Device - Frontend Developer, Stomp</Obfuscated>
				</li>
				<li>
					<Obfuscated>OlyB - Frontend Developer, WebRetro</Obfuscated>
				</li>
				<li>
					<Obfuscated>luphoria - Backend Developer</Obfuscated>
				</li>
				<li>
					<Obfuscated>Ender - Backend Developer</Obfuscated>
				</li>
				<li>
					<Obfuscated>011011000110111101101100 - Rammerhead</Obfuscated>
				</li>
			</ul>

			<h2>
				<Obfuscated>Proxy Scripts</Obfuscated>
			</h2>

			<ul>
				<li>
					<Obfuscated>Rammerhead:</Obfuscated>{' '}
					<ObfuscatedThemeA href="https://github.com/binary-person/rammerhead">
						<Obfuscated>https://github.com/binary-person/rammerhead</Obfuscated>
					</ObfuscatedThemeA>
				</li>
				<li>
					<Obfuscated>Ultraviolet:</Obfuscated>{' '}
					<ObfuscatedThemeA href="https://github.com/titaniumnetwork-dev/Ultraviolet">
						<Obfuscated>
							https://github.com/titaniumnetwork-dev/Ultraviolet
						</Obfuscated>
					</ObfuscatedThemeA>
				</li>
				<li>
					<Obfuscated>Stomp:</Obfuscated>{' '}
					<ObfuscatedThemeA href="https://github.com/sysce/stomp">
						<Obfuscated>https://github.com/sysce/stomp</Obfuscated>
					</ObfuscatedThemeA>
				</li>
			</ul>
		</main>
	);
}
