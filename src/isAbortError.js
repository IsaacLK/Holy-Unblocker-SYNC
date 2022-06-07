const messages = [
	'The operation was aborted.',
	'The operation was aborted. ', // error contains space at end on firefox
	'The user aborted a request.',
];

/**
 *
 * @param {Error} error
 */
export default function isAbortError(error) {
	return messages.includes(error.message);
}
