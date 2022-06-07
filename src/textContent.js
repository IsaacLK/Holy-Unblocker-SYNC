const buffer = /*#__PURE__*/ document.createElement('div');

export default function textContent(html) {
	buffer.innerHTML = html;
	const { textContent } = buffer;
	buffer.innerHTML = '';
	return textContent;
}
