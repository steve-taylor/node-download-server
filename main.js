console.log('Initializing...')
require('babel/register')({
	stage: 0
});
console.log('Done.\n');

require('./lib/main');
