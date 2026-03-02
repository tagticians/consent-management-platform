const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, 'cmp-config.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(function (req, res) {
  const method = req.method;
  let urlPath = req.url.split('?')[0];

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Save config
  if (method === 'POST' && urlPath === '/api/config') {
    let body = '';
    req.on('data', function (chunk) { body += chunk; });
    req.on('end', function () {
      try {
        // Validate JSON
        var parsed = JSON.parse(body);
        fs.writeFile(CONFIG_PATH, JSON.stringify(parsed, null, 2), 'utf8', function (err) {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to write config' }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          }
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Routes
  if (urlPath === '/') {
    urlPath = '/test-page/index.html';
  } else if (urlPath === '/admin' || urlPath === '/admin/') {
    urlPath = '/admin/index.html';
  }

  // Resolve file path safely
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + urlPath);
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, function () {
  console.log('');
  console.log('  CMP Dev Server running:');
  console.log('');
  console.log('    Test page:  http://localhost:' + PORT + '/');
  console.log('    Admin:      http://localhost:' + PORT + '/admin');
  console.log('    Banner JS:  http://localhost:' + PORT + '/banner/cmp.js');
  console.log('    Config:     http://localhost:' + PORT + '/cmp-config.json');
  console.log('');
});
