import express from 'express'
import bodyParser from 'body-parser'
import NodeCache from 'node-cache'
import randomstring from 'randomstring'

function now() {
	return Math.floor(new Date().getTime() / 1000);
}

export default {
	start({publicDir, publicPath, privateDir, privatePath, apiKey, port, ttl}, onStarted) {

		const app = express();

		if (publicDir && publicPath) {
			app.use(publicPath, express.static(publicDir));
		}

		const cache = new NodeCache({stdTTL: ttl});

		if (privateDir && privatePath && apiKey) {

			app.use('/api', bodyParser.json());

			app.post('/api/1/createLink', (req, res) => {
				if (req.get('apiKey') == apiKey) {

					const downloadKey = randomstring.generate(128);

					// Store in the cache.
					cache.set(downloadKey, { filename: req.body.filename, expires: now() + ttl }, (err, success) => {
						if (!err && success) {
							res.send({link: `${privatePath}${req.body.filename}?key=${downloadKey}`});
						} else {
							res.status(500).send({message: 'Caching failed'});
						}
					});
				} else {
					res.sendStatus(401);
				}
			});

			app.get(`${privatePath}/:filename`, (req, res) => {
				if (req.query.key) {
					cache.get(req.query.key, (err, value) => {
						if (!err && value) {
							if (req.params.filename && `/${req.params.filename}` == value.filename) {
								if (value.expires >= now()) {
									res.download(`${privateDir}/${value.filename}`);
								} else {
									res.status(404).send('Expired link');
									console.log(`Link expired ${now() - value.expires} seconds ago`);
								}
							} else {
								res.sendStatus(404);
								console.warn(`Filename mismatch. Expected: ${value.filename} -- Actual: /${req.params.filename}`);
							}
						} else {
							res.sendStatus(404);
						}
					});
				} else {
					res.sendStatus(404);
				}
			});
		}

		const server = app.listen(port, () => {
			if (onStarted) {
				onStarted({_server: server});
			}
		});
	},

	stop(wrappedServer) {
		if (wrappedServer && wrappedServer._server) {
			wrappedServer._server.close();
		}
	}
}
