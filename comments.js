// Create web server
// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var comments = require('./comments.js');
var db = require('./db.js');

var server = http.createServer(function (req, res) {

    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);

    if (uri === '/comments') {
        if (req.method === 'GET') {
            comments.getComments(function (err, data) {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.write('Error: ' + err);
                    res.end();
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(data);
                    res.end();
                }
            });
        } else if (req.method === 'POST') {
            var body = '';
            req.on('data', function (chunk) {
                body += chunk;
            });
            req.on('end', function () {
                comments.addComment(JSON.parse(body), function (err, data) {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.write('Error: ' + err);
                        res.end();
                    } else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.write(data);
                        res.end();
                    }
                });
            });
        }
    } else {
        fs.exists(filename, function (exists) {
            if (!exists) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                res.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) {
                filename += '/index.html';
            }

            fs.readFile(filename, 'binary', function (err, file) {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.write(err + '\n');
                    res.end();
                    return;
                }

                res.writeHead(200);
                res.write(file, 'binary');
                res.end();
            });
        });
    }
});

server.listen(8080);
console.log('Server running at http://