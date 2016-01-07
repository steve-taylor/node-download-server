import commandLineArgs from 'command-line-args'
import server from './index'
import colors from 'colors';

const cli = commandLineArgs([
	{ name: 'publicDir', type: String },
	{ name: 'publicPath', type: String, defaultValue: '/public' },
	{ name: 'privateDir', type: String },
	{ name: 'privatePath', type: String, defaultValue: '/private' },
	{ name: 'apiKey', type: String },
	{ name: 'port', type: Number, defaultValue: 3000 },
	{ name: 'ttl', type: Number, defaultValue: 300 }
]);

const {publicDir, publicPath, privateDir, privatePath, apiKey, port, ttl} = cli.parse();

console.log('Starting the download server...\n');

server.start({publicDir, publicPath, privateDir, privatePath, apiKey, port, ttl}, () => {
	console.log(`Download server running.`);

	if (publicPath && publicDir && port) {
		console.log(` - Serving public files in ${publicDir.green} from ${`http://localhost:${port}${publicPath}`.underline.blue}`);
	}

	if (privatePath && privateDir && apiKey && port) {
		console.log(` - Serving private files in ${privateDir.green} from ${`http://localhost:${port}${privatePath}`.underline.blue}`);
		console.log(` - To create a link, POST ${'{ "filename": "/path/to/file" }'.bold.cyan} ${`(with the header apiKey: ${apiKey})`.italic} to ${`http://localhost:${port}/api/1/createLink`.underline.blue}`);
		if (ttl) {
			console.log(` - Links to private files expire ${ttl} seconds after they are created`);
		} else {
			console.warn(' - Links to private files never expire. Your cache will keep growing!'.bold.red);
		}
	}
});
