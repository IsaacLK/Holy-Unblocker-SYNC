'use strict';

const { join } = require('path');

const paths = require('../config/paths');

const ST_OUTPUT = join(paths.appPublic, 'stomp');

void (async function () {
	const { default: Builder } = await import('stomp');

	const builder = new Builder(ST_OUTPUT);

	console.log('Bundling Stomp...');
	await builder.build();
	console.log('Bundle created');
})();
