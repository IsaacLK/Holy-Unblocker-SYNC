import '../styles/Home.scss';
import { ThemeButton } from '../ThemeElements.js';
import { Obfuscated } from '../obfuscate.js';

export default function Home(props) {
	return (
		<main className="home">
			<h1>
				<Obfuscated>End Internet Censorship.</Obfuscated>
			</h1>
			<h2>
				<Obfuscated>Privacy right at your fingertips.</Obfuscated>
			</h2>
			<ThemeButton onClick={() => props.main_layout.current.set_expanded(true)}>
				<Obfuscated>Get Started</Obfuscated>
			</ThemeButton>
		</main>
	);
}
