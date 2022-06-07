import { ThemeSelect } from '../../ThemeElements.js';

export default function Appearance(props) {
	return (
		<section>
			<div>
				<span>Theme:</span>
				<ThemeSelect
					defaultValue={props.layout.current.settings.theme}
					onChange={event => {
						props.layout.current.set_settings({
							...props.layout.current.settings,
							theme: event.target.value,
						});
					}}
				>
					<option value="day">Day</option>
					<option value="night">Night</option>
				</ThemeSelect>
			</div>
		</section>
	);
}
