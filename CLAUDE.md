# Consent Management Platform (CMP)

## Project Goal

Build an open-source, self-hosted Consent Management Platform with an injectable cookie banner and full Google Consent Mode v2 support. The platform allows website owners to collect and manage cookie consent in compliance with privacy regulations (GDPR, ePrivacy) while integrating seamlessly with Google Tag Manager and Google Analytics.

This is an **iterative project** — features are being added incrementally. Expect the codebase to evolve across multiple sessions. Prioritize working, shippable increments over large-scale rewrites.

## Architecture

```
bob001-consent-management-app/
├── server.js              # Node.js HTTP dev server (vanilla, no framework)
├── cmp-config.json        # Central configuration file (banner text, categories, theme, GCM params)
├── package.json           # Project metadata (no dependencies yet — zero-dep server)
├── banner/
│   └── cmp.js             # Injectable cookie banner script (vanilla JS IIFE, Google Consent Mode v2)
├── admin/
│   ├── index.html         # Admin dashboard UI (single-page, sidebar navigation)
│   ├── admin.css           # Admin styles
│   └── admin.js            # Admin logic (config editing, live preview, import/export)
└── test-page/
    └── index.html          # Test page with diagnostics (consent state, GCM params, dataLayer log)
```

### Key Design Decisions

- **Zero dependencies**: The dev server uses only Node.js built-in modules (`http`, `fs`, `path`). No Express, no build tools, no bundlers.
- **Vanilla JS everywhere**: The banner script (`banner/cmp.js`) is a self-contained IIFE with no external dependencies. It must remain lightweight and embeddable on any website via a single `<script>` tag.
- **Config-driven**: All banner behavior (text, categories, theme, GCM parameters) is controlled by `cmp-config.json`. The admin UI reads and writes this file via `POST /api/config`.
- **Google Consent Mode v2**: The banner pushes `consent` commands (`default` and `update`) to `window.dataLayer` using the `gtag()` pattern. All seven GCM parameters are managed: `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage`, `personalization_storage`, `security_storage`.

## Running the Project

```bash
npm run dev     # Starts dev server on http://localhost:3000
```

- Test page: `http://localhost:3000/`
- Admin panel: `http://localhost:3000/admin`
- Banner script: `http://localhost:3000/banner/cmp.js`
- Config JSON: `http://localhost:3000/cmp-config.json`

## Security Considerations

### Before Every Commit, Check For:

1. **No secrets in tracked files**: Never commit `.env`, API keys, credentials, or tokens. Add sensitive files to `.gitignore` before they are ever staged.
2. **`.mcp.json` contains local config**: This file may contain MCP server tokens or project-specific paths. Verify it does not contain secrets before committing. Consider adding it to `.gitignore`.
3. **CORS is wide open**: `server.js` sets `Access-Control-Allow-Origin: *`. This is fine for local dev but must be locked down before any production deployment.
4. **No input sanitization on the config API**: `POST /api/config` accepts arbitrary JSON and writes it to disk. In production, this endpoint needs authentication and validation.
5. **Path traversal**: The server has a basic `startsWith(ROOT)` check but no symlink resolution. Review any file-serving changes carefully.
6. **Cookie flags**: The consent cookie is set without `Secure` or `HttpOnly` flags. `Secure` should be added for production HTTPS deployments.
7. **XSS via config values**: The banner uses `escapeHtml()` for user-facing strings — do not bypass this when adding new config fields that render in the DOM.

### `.gitignore` Recommendations

Ensure the following are in `.gitignore` before pushing to GitHub:
- `node_modules/`
- `.env` / `.env.*`
- `.mcp.json` (contains local MCP server config)
- Any uploaded logo files if stored locally

## Refactoring Guidelines

As the codebase grows, consider these refactors when the right time comes:

1. **`banner/cmp.js` is monolithic (~620 lines)**: When adding features (A/B testing, consent logging, multi-language), split into modules. Keep the IIFE wrapper but organize internally into separate concerns (config, cookies, GCM, DOM, controller).
2. **`server.js` handles both static files and API**: When adding more API endpoints (consent logs, analytics, user management), extract route handlers into a `routes/` directory or adopt a lightweight framework.
3. **Admin panel is a single HTML/JS/CSS set**: If the admin grows significantly (user management, analytics dashboard, multi-site support), consider migrating to a component framework. Until then, vanilla JS is fine.
4. **CSS-in-JS in the banner**: The banner injects styles via string concatenation. If theming becomes more complex, consider generating a CSS template or using CSS custom properties.
5. **No tests yet**: Add tests before the codebase exceeds ~10 files. Start with integration tests for the config API and unit tests for GCM state building logic.
6. **No linter/formatter configured**: Add ESLint and Prettier once collaborative development begins to maintain consistent style.

## Coding Conventions

- Use `var` and ES5 syntax in `banner/cmp.js` (must run in all browsers without transpilation)
- Modern JS (ES6+) is acceptable in `server.js`, `admin/admin.js`, and any Node.js tooling
- HTML output must use `escapeHtml()` — never insert raw config values into the DOM
- Keep the banner script self-contained — no external dependencies, no imports
- Config changes flow through `cmp-config.json` — do not hardcode banner behavior
