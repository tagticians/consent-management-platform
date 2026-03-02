const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, 'cmp-config.json');

// ---------------------------------------------------------------------------
// Auth configuration
// ---------------------------------------------------------------------------
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
const COOKIE_NAME = 'cmp_session';

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
function createToken(expiresAt) {
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return payload + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Date.now()) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function parseCookies(req) {
  const cookies = {};
  const header = req.headers.cookie;
  if (!header) return cookies;
  header.split(';').forEach(function (part) {
    const eq = part.indexOf('=');
    if (eq === -1) return;
    const key = part.substring(0, eq).trim();
    const val = part.substring(eq + 1).trim();
    cookies[key] = decodeURIComponent(val);
  });
  return cookies;
}

function isAuthenticated(req) {
  if (!ADMIN_PASSWORD) return true; // No password set = no auth required (dev mode)
  const cookies = parseCookies(req);
  return verifyToken(cookies[COOKIE_NAME]);
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie',
    COOKIE_NAME + '=' + token +
    '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + SESSION_MAX_AGE
  );
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie',
    COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
  );
}

function redirectTo(res, location) {
  res.writeHead(302, { 'Location': location });
  res.end();
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req, callback) {
  let body = '';
  req.on('data', function (chunk) {
    body += chunk;
    if (body.length > 1e7) { req.destroy(); } // 10MB limit
  });
  req.on('end', function () { callback(body); });
}

// ---------------------------------------------------------------------------
// MIME types
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Login page HTML
// ---------------------------------------------------------------------------
function loginPageHtml(error) {
  const errorHtml = error
    ? '<div style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;padding:10px 16px;border-radius:8px;font-size:14px;margin-bottom:20px;">' + error + '</div>'
    : '';

  return '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">' +
    '<title>CMP Admin — Login</title>' +
    '<style>' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
        'background:#f8f9fb;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;}' +
      '.login-card{background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);' +
        'padding:40px;width:100%;max-width:400px;}' +
      '.login-brand{display:flex;align-items:center;gap:10px;margin-bottom:8px;}' +
      '.login-brand svg{flex-shrink:0;}' +
      '.login-brand span{font-size:18px;font-weight:700;color:#1f2937;}' +
      '.login-subtitle{font-size:13px;color:#6b7280;margin-bottom:28px;}' +
      'label{display:block;font-size:13px;font-weight:600;color:#1f2937;margin-bottom:6px;}' +
      'input[type=password]{width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;' +
        'font-size:14px;font-family:inherit;outline:none;transition:border-color 0.15s;}' +
      'input[type=password]:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.1);}' +
      'button{width:100%;margin-top:20px;padding:11px;background:#2563eb;color:#fff;border:none;' +
        'border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}' +
      'button:hover{background:#1d4ed8;}' +
      'button:active{transform:scale(0.98);}' +
    '</style></head><body>' +
    '<div class="login-card">' +
      '<div class="login-brand">' +
        '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#2563eb"/>' +
        '<path d="M8 14.5C8 11.46 10.46 9 13.5 9h1c3.04 0 5.5 2.46 5.5 5.5S17.54 20 14.5 20h-1C10.46 20 8 17.54 8 14.5z" stroke="#fff" stroke-width="2"/>' +
        '<circle cx="12.5" cy="14.5" r="1" fill="#fff"/><circle cx="15.5" cy="14.5" r="1" fill="#fff"/></svg>' +
        '<span>CMP Admin</span>' +
      '</div>' +
      '<p class="login-subtitle">Sign in to manage your consent banner</p>' +
      errorHtml +
      '<form method="POST" action="/admin/login">' +
        '<label for="password">Password</label>' +
        '<input type="password" id="password" name="password" placeholder="Enter admin password" autofocus required>' +
        '<button type="submit">Sign In</button>' +
      '</form>' +
    '</div>' +
    '</body></html>';
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------
const server = http.createServer(function (req, res) {
  const method = req.method;
  let urlPath = req.url.split('?')[0];

  // CORS headers (for banner script loaded cross-origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ---- Auth routes ----

  // Login page (GET)
  if (method === 'GET' && (urlPath === '/admin/login' || urlPath === '/admin/login/')) {
    if (!ADMIN_PASSWORD) {
      return redirectTo(res, '/admin');
    }
    if (isAuthenticated(req)) {
      return redirectTo(res, '/admin');
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(loginPageHtml(null));
    return;
  }

  // Login submit (POST)
  if (method === 'POST' && (urlPath === '/admin/login' || urlPath === '/admin/login/')) {
    if (!ADMIN_PASSWORD) {
      return redirectTo(res, '/admin');
    }
    readBody(req, function (body) {
      // Parse URL-encoded form data
      const params = new URLSearchParams(body);
      const password = params.get('password') || '';

      // Constant-time comparison to prevent timing attacks
      const pwBuffer = Buffer.from(password);
      const expectedBuffer = Buffer.from(ADMIN_PASSWORD);

      let match = false;
      if (pwBuffer.length === expectedBuffer.length) {
        match = crypto.timingSafeEqual(pwBuffer, expectedBuffer);
      }

      if (match) {
        const expiresAt = Date.now() + (SESSION_MAX_AGE * 1000);
        const token = createToken(expiresAt);
        setSessionCookie(res, token);
        redirectTo(res, '/admin');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(loginPageHtml('Incorrect password. Please try again.'));
      }
    });
    return;
  }

  // Logout
  if (urlPath === '/admin/logout' || urlPath === '/admin/logout/') {
    clearSessionCookie(res);
    redirectTo(res, '/admin/login');
    return;
  }

  // ---- Auth check for API ----
  if (method === 'POST' && urlPath === '/api/config') {
    if (!isAuthenticated(req)) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }
  }

  // ---- Protected admin routes ----
  if (urlPath.startsWith('/admin') && urlPath !== '/admin/login' && urlPath !== '/admin/login/') {
    if (!isAuthenticated(req)) {
      return redirectTo(res, '/admin/login');
    }
  }

  // ---- API: Save config ----
  if (method === 'POST' && urlPath === '/api/config') {
    readBody(req, function (body) {
      try {
        const parsed = JSON.parse(body);
        fs.writeFile(CONFIG_PATH, JSON.stringify(parsed, null, 2), 'utf8', function (err) {
          if (err) {
            sendJson(res, 500, { error: 'Failed to write config' });
          } else {
            sendJson(res, 200, { ok: true });
          }
        });
      } catch (e) {
        sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // ---- Static file routes ----
  if (urlPath === '/') {
    urlPath = '/test-page/index.html';
  } else if (urlPath === '/admin' || urlPath === '/admin/') {
    urlPath = '/admin/index.html';
  }

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

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
server.listen(PORT, function () {
  console.log('');
  console.log('  CMP Dev Server running:');
  console.log('');
  console.log('    Test page:  http://localhost:' + PORT + '/');
  console.log('    Admin:      http://localhost:' + PORT + '/admin');
  console.log('    Login:      http://localhost:' + PORT + '/admin/login');
  console.log('    Banner JS:  http://localhost:' + PORT + '/banner/cmp.js');
  console.log('    Config:     http://localhost:' + PORT + '/cmp-config.json');
  console.log('');
  if (!ADMIN_PASSWORD) {
    console.log('  ⚠  No ADMIN_PASSWORD set — admin is unprotected');
    console.log('     Set the ADMIN_PASSWORD environment variable to enable auth');
    console.log('');
  } else {
    console.log('  ✓  Admin authentication enabled');
    console.log('');
  }
});
