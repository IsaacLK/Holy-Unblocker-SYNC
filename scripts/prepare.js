'use strict';

try {
	const husky = require('husky');
	husky.install();
} catch (error) {
	console.warn('Husky not installed');
}
