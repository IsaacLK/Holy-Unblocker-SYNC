import faq from '../faq.js';
import resolveRoute from '../resolveRoute.js';
import { ThemeLink } from '../ThemeElements.js';

export default function FAQ() {
	const sections = [];

	for (let i = 0; i < faq.length; i++) {
		const { q, a } = faq[i];

		sections.push(
			<section key={i}>
				<h1>{q}</h1>
				<p>{a}</p>
			</section>
		);
	}

	return (
		<main className="faq">
			{sections}
			<p style={{ marginTop: 30, opacity: 0.75 }}>
				Not what you're looking for?{' '}
				<ThemeLink to={resolveRoute('/', 'contact')}>Contact Us</ThemeLink>.
			</p>
		</main>
	);
}
