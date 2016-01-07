var express = require('express'),
	bodyParser = require('body-parser'),
	NodeCache = require('node-cache'),
	randomstring = require('randomstring');

function now() {
	return Math.floor(new Date().getTime() / 1000);
}

module.exports = {
	start: function(options, onStarted) {
		var publicDir = options.publicDir,
			publicPath = options.publicPath,
			privateDir = options.privateDir,
			privatePath = options.privatePath,
			apiKey = options.apiKey,
			port = options.port,
			ttl = options.ttl;

		var app = express();

		if (publicDir && publicPath) {
			app.use(publicPath, express.static(publicDir));
		}

		var cache = new NodeCache({stdTTL: ttl});

		if (privateDir && privatePath && apiKey) {

			app.use('/api', bodyParser.json());

			app.post('/api/1/createLink', function(req, res) {
				if (req.get('apiKey') == apiKey) {

					var downloadKey = randomstring.generate(128);

					// Store in the cache.
					cache.set(downloadKey, { filename: req.body.filename, expires: now() + ttl }, function(err, success) {
						if (!err && success) {
							res.send({link: privatePath + req.body.filename + '?key=' + downloadKey});
						} else {
							res.status(500).send({message: 'Caching failed'});
						}
					});
				} else {
					res.sendStatus(401);
				}
			});

			app.get(privatePath + '/:filename', function(req, res) {
				if (req.query.key) {
					cache.get(req.query.key, function(err, value) {
						if (!err && value) {
							if (req.params.filename && '/' + req.params.filename == value.filename) {
								if (value.expires >= now()) {
									res.download(privateDir + '/' + value.filename);
								} else {
									res.status(404).send('Expired link');
									console.log('Link expired ' + (now() - value.expires) + ' seconds ago');
								}
							} else {
								res.sendStatus(404);
								console.warn('Filename mismatch. Expected: ' + value.filename + ' -- Actual: /' + req.params.filename);
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

		var server = app.listen(port, function() {
			if (onStarted) {
				onStarted({_server: server});
			}
		});
	},

	stop: function(wrappedServer) {
		if (wrappedServer && wrappedServer._server) {
			wrappedServer._server.close();
		}
	}
}
