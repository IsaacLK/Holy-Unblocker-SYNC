import engines from '../../engines.js';
import { Obfuscated } from '../../obfuscate.js';
import { ThemeSelect } from '../../ThemeElements.js';

export default function Search(props) {
	return (
		<section>
			<div>
				<span>
					<Obfuscated>Proxy</Obfuscated>:
				</span>
				<ThemeSelect
					onChange={event =>
						props.layout.current.set_settings({
							...props.layout.current.settings,
							proxy: event.target.value,
						})
					}
					defaultValue={props.layout.current.settings.proxy}
				>
					<option value="automatic">Automatic (Default)</option>
					<option value="ultraviolet">Ultraviolet</option>
					<option value="rammerhead">Rammerhead</option>
					<option value="stomp">Stomp</option>
				</ThemeSelect>
			</div>
			<div>
				<span>
					<Obfuscated>Search Engine</Obfuscated>:
				</span>
				<ThemeSelect
					onChange={event =>
						props.layout.current.set_settings({
							...props.layout.current.settings,
							search: event.target.value,
						})
					}
					defaultValue={props.layout.current.settings.search}
				>
					{engines.map(({ name, format }) => (
						<option key={format} value={format}>
							{name}
						</option>
					))}
				</ThemeSelect>
			</div>
		</section>
	);
}
