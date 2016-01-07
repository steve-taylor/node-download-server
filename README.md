Node.js public/private download server
====

    npm install --save download-server

This is a small library and app to implement a file download server that is capable
of serving public and private files.

Private files cannot be downloaded unless requested via a URL that contains a valid
temporary download key. Temporary download keys are generated via an API call.

This download server can run as a standalone app or be included as a library in any
Node.js app.

The following options are available:

| Option        | Default value (standalone only) | Description                                                         |
| ------------- | ------------------------------- | ------------------------------------------------------------------- |
| `apiKey`      |                                 | Shared secret key for requesting new download links to be generated |
| `publicDir`   |                                 | The local directory containing publicly downloadable files          |
| `publicPath`  | `"/public"`                     | The base path of publicly downloadable file URLs                    |
| `privateDir`  |                                 | The local directory containing privately downloadable files         |
| `privatePath` | `"/private"`                    | The base path of privately downloadable file URLs                   |
| `port`        | `3000`                          | The port on which the server runs                                   |
| `ttl`         | `300`                           | The number of seconds from creation after which links expire        |

If `publicDir` is not specified, this server will not serve public files. If `privateDir` and/or `apiKey`
are not specified, this server will not serve private files, nor will it take requests to generate temporary
download keys.

Here's an example of running this as a standalone app:

	node main \
	    --apiKey secret123
	    --publicDir /path/to/public
	    --privateDir /path/to/private

This starts an instance that serves public and private files on port 3000 with a temporary download key
expiry of 300 seconds.

Here's an example of embedding this in a Node.js app:

    var downloadServer = require('download-server');
    
    var _server = null;
    
    downloadServer.start({
        apiKey: 'secret123',
        publicDir: '/path/to/public',
        publicPath: '/public',
        privateDir: '/path/to/private',
        privatePath: '/private',
        port: 3000,
        ttl: 300
    }, function(server) {
        _server = server;
        console.log('Download server started on port 3000');
    });
    
    // ...
    
    // Stop the download server
    downloadServer.stop(_server);

More documentation to follow...