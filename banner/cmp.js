/**
 * Consent Management Platform (CMP) - Injectable Banner
 * Google Consent Mode v2 compatible
 *
 * Usage:
 *   <script src="cmp.js" data-cmp-config="/path/to/cmp-config.json"></script>
 *   OR
 *   <script>window.CMP_CONFIG = { ... };</script>
 *   <script src="cmp.js"></script>
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Default configuration (overridden by external config)
  // ---------------------------------------------------------------------------
  var DEFAULT_CONFIG = {
    banner: {
      position: 'bottom',
      layout: 'bar',
      cardPosition: 'right',
      backdrop: false,
      logo: null,
      title: 'We value your privacy',
      description: 'We use cookies to enhance your experience.',
      primaryButtonText: 'Accept All',
      rejectButtonText: 'Reject All',
      settingsButtonText: 'Manage Preferences',
      saveButtonText: 'Save Preferences',
      prefsTitle: 'Cookie Preferences',
      prefsDescription: 'Choose which types of cookies you would like to allow. Your preferences will be saved and can be changed at any time.',
      floatingButton: {
        position: 'bottom-left',
        icon: 'cookie',
        backgroundColor: null,
        textColor: null,
        size: 44
      },
      theme: {
        primaryColor: '#2563eb',
        primaryHoverColor: '#1d4ed8',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        secondaryTextColor: '#6b7280',
        borderColor: '#e5e7eb',
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        toggleOffColor: '#d1d5db',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '12px',
        buttonBorderRadius: '8px'
      }
    },
    categories: [
      { id: 'necessary', name: 'Strictly Necessary', description: 'Essential cookies.', required: true, gcmParameters: ['security_storage'] },
      { id: 'analytics', name: 'Analytics', description: 'Analytics cookies.', required: false, gcmParameters: ['analytics_storage'] },
      { id: 'marketing', name: 'Marketing', description: 'Marketing cookies.', required: false, gcmParameters: ['ad_storage', 'ad_user_data', 'ad_personalization'] },
      { id: 'functional', name: 'Functional', description: 'Functional cookies.', required: false, gcmParameters: ['functionality_storage'] },
      { id: 'personalization', name: 'Personalization', description: 'Personalization cookies.', required: false, gcmParameters: ['personalization_storage'] }
    ],
    cookieName: 'cmp_consent',
    cookieDuration: 365,
    consentMode: { waitForUpdate: 500 }
  };

  var ALL_GCM_PARAMS = [
    'ad_storage', 'ad_user_data', 'ad_personalization',
    'analytics_storage', 'functionality_storage',
    'personalization_storage', 'security_storage'
  ];

  // ---------------------------------------------------------------------------
  // Floating button icon SVGs
  // ---------------------------------------------------------------------------
  var ICONS = {
    cookie: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="15" r="1" fill="currentColor"/><circle cx="14" cy="7" r="0.5" fill="currentColor"/><circle cx="17" cy="15" r="0.5" fill="currentColor"/></svg>',
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v5c0 5.25 3.75 10.2 9 11.4 5.25-1.2 9-6.15 9-11.4V7l-9-5z"/><path d="M9 12l2 2 4-4"/></svg>',
    fingerprint: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.3 2.7-6 6-6 1.8 0 3.4.8 4.5 2"/><path d="M12 10c-1.1 0-2 .9-2 2 0 4.2-1.2 7-2.8 8.5"/><path d="M12 10c1.1 0 2 .9 2 2 0 3-.8 5.5-2 7.5"/><path d="M14 12c0 1.5-.2 3-.6 4.5"/></svg>',
    lock: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
  };

  // ---------------------------------------------------------------------------
  // Utility helpers
  // ---------------------------------------------------------------------------
  function deepMerge(target, source) {
    var result = {};
    var key;
    for (key in target) {
      if (target.hasOwnProperty(key)) result[key] = target[key];
    }
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) &&
          typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])
        ) {
          result[key] = deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------------------------------------------------------------------------
  // Cookie helpers
  // ---------------------------------------------------------------------------
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      try { return JSON.parse(decodeURIComponent(match[2])); } catch (e) { return null; }
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
  }

  // ---------------------------------------------------------------------------
  // DataLayer / Google Consent Mode helpers
  // ---------------------------------------------------------------------------
  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
  }

  function gtag() {
    ensureDataLayer();
    window.dataLayer.push(arguments);
  }

  function buildGcmState(consentState, config) {
    var gcm = {};
    ALL_GCM_PARAMS.forEach(function (param) { gcm[param] = 'denied'; });
    gcm['security_storage'] = 'granted';
    config.categories.forEach(function (cat) {
      if (cat.required || consentState[cat.id]) {
        cat.gcmParameters.forEach(function (param) { gcm[param] = 'granted'; });
      }
    });
    return gcm;
  }

  function pushGcmDefault(config) {
    var defaults = {};
    ALL_GCM_PARAMS.forEach(function (param) { defaults[param] = 'denied'; });
    defaults['security_storage'] = 'granted';
    if (config.consentMode && config.consentMode.waitForUpdate) {
      defaults['wait_for_update'] = config.consentMode.waitForUpdate;
    }
    gtag('consent', 'default', defaults);
  }

  function pushGcmUpdate(consentState, config) {
    var gcm = buildGcmState(consentState, config);
    gtag('consent', 'update', gcm);
    ensureDataLayer();
    window.dataLayer.push({
      event: 'cmp_consent_update',
      cmp_consent: JSON.parse(JSON.stringify(consentState)),
      cmp_gcm: JSON.parse(JSON.stringify(gcm))
    });
  }

  // ---------------------------------------------------------------------------
  // Styles — all rules scoped under #cmp-banner or #cmp-prefs-overlay IDs
  // to avoid specificity conflicts with host page styles.
  // ---------------------------------------------------------------------------
  function buildStyles(config) {
    var t = config.banner.theme;
    var pos = config.banner.position;
    var fb = config.banner.floatingButton || {};
    var fbSize = (fb.size || 44) + 'px';
    var fbBg = fb.backgroundColor || t.primaryColor;
    var fbColor = fb.textColor || '#ffffff';

    // Floating button position
    var fbPos = fb.position || 'bottom-left';
    var fbPosCSS = '';
    switch (fbPos) {
      case 'bottom-right': fbPosCSS = 'bottom: 20px; right: 20px;'; break;
      case 'top-left':     fbPosCSS = 'top: 20px; left: 20px;'; break;
      case 'top-right':    fbPosCSS = 'top: 20px; right: 20px;'; break;
      default:             fbPosCSS = 'bottom: 20px; left: 20px;'; break;
    }

    var rules = [];

    // -- Global reset scoped to CMP containers --
    rules.push(
      '#cmp-backdrop, #cmp-banner, #cmp-banner *, #cmp-prefs-overlay, #cmp-prefs-overlay * {' +
        'box-sizing: border-box;' +
        'line-height: normal;' +
      '}'
    );

    var layout = config.banner.layout || 'bar';
    var cardPos = config.banner.cardPosition || 'right';
    var backdrop = config.banner.backdrop;

    // ====== BACKDROP ======
    if (backdrop) {
      rules.push(
        '#cmp-backdrop {' +
          'all: initial;' +
          'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999998;' +
          'background: ' + t.overlayColor + ';' +
          '-webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);' +
          'animation: cmpFadeIn 0.2s ease-out;' +
          'box-sizing: border-box;' +
        '}'
      );
    }

    // ====== BANNER ======
    if (layout === 'card') {
      // Card layout: floating card positioned left or right
      var cardHoriz = cardPos === 'left' ? 'left: 20px;' : 'right: 20px;';
      var cardVert = pos === 'top' ? 'top: 20px;' : 'bottom: 20px;';
      var slideFrom = cardPos === 'left' ? '-120%' : '120%';

      rules.push(
        '#cmp-banner {' +
          'all: initial;' +
          'position: fixed;' +
          cardVert + cardHoriz +
          'z-index: 999999;' +
          'width: 400px; max-width: calc(100vw - 40px);' +
          'font-family: ' + t.fontFamily + ';' +
          'color: ' + t.textColor + ';' +
          'background: ' + t.backgroundColor + ';' +
          'border-radius: ' + t.borderRadius + ';' +
          'box-shadow: 0 8px 32px rgba(0,0,0,0.15);' +
          'padding: 24px 28px;' +
          'animation: cmpCardSlideIn 0.35s ease-out;' +
          'box-sizing: border-box;' +
          'line-height: normal;' +
        '}'
      );
      rules.push(
        '@keyframes cmpCardSlideIn {' +
          'from { transform: translateX(' + slideFrom + '); opacity:0; }' +
          'to { transform: translateX(0); opacity:1; }' +
        '}'
      );
    } else {
      // Bar layout: full-width top or bottom bar
      rules.push(
        '#cmp-banner {' +
          'all: initial;' +
          'position: fixed;' +
          (pos === 'top' ? 'top: 0;' : 'bottom: 0;') +
          'left: 0; right: 0; z-index: 999999;' +
          'font-family: ' + t.fontFamily + ';' +
          'color: ' + t.textColor + ';' +
          'background: ' + t.backgroundColor + ';' +
          'box-shadow: 0 ' + (pos === 'top' ? '4px' : '-4px') + ' 32px rgba(0,0,0,0.10);' +
          'padding: 24px 28px;' +
          'animation: cmpSlideIn 0.35s ease-out;' +
          'box-sizing: border-box;' +
          'line-height: normal;' +
        '}'
      );
      rules.push(
        '@keyframes cmpSlideIn {' +
          'from { transform: translateY(' + (pos === 'top' ? '-100%' : '100%') + '); opacity:0; }' +
          'to { transform: translateY(0); opacity:1; }' +
        '}'
      );
    }
    rules.push('#cmp-banner * { box-sizing: border-box; margin: 0; padding: 0; }');
    rules.push('#cmp-banner-inner { max-width: 1200px; margin: 0 auto; }');
    rules.push('#cmp-banner-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }');
    rules.push('#cmp-banner-logo { height: 32px; width: auto; display: block; }');
    rules.push('#cmp-banner h2 { font-size: 17px; font-weight: 700; color: ' + t.textColor + '; font-family: ' + t.fontFamily + '; }');
    rules.push('#cmp-banner p { font-size: 14px; line-height: 1.55; color: ' + t.secondaryTextColor + '; margin-bottom: 18px; font-family: ' + t.fontFamily + '; }');

    // Card layout: stack buttons vertically
    if (layout === 'card') {
      rules.push('#cmp-banner-buttons { display: flex; flex-direction: column; gap: 8px; }');
      rules.push('#cmp-banner-buttons button { width: 100%; }');
    } else {
      rules.push('#cmp-banner-buttons { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }');
    }
    rules.push(
      '#cmp-banner-buttons button {' +
        'font-family: ' + t.fontFamily + '; font-size: 14px; font-weight: 600; padding: 10px 22px;' +
        'border-radius: ' + t.buttonBorderRadius + '; cursor: pointer;' +
        'transition: all 0.15s ease; border: none; line-height: 1;' +
      '}'
    );
    rules.push('#cmp-banner-buttons button:active { transform: scale(0.97); }');
    rules.push('#cmp-btn-accept { background: ' + t.primaryColor + '; color: #fff; }');
    rules.push('#cmp-btn-accept:hover { background: ' + t.primaryHoverColor + '; }');
    rules.push('#cmp-btn-reject { background: transparent; color: ' + t.textColor + '; border: 1px solid ' + t.borderColor + ' !important; }');
    rules.push('#cmp-btn-reject:hover { background: rgba(0,0,0,0.03); }');
    rules.push('#cmp-btn-settings { background: transparent; color: ' + t.primaryColor + '; text-decoration: underline; padding: 10px 12px; }');
    rules.push('#cmp-btn-settings:hover { color: ' + t.primaryHoverColor + '; }');

    // Card responsive: full-width on narrow viewports
    if (layout === 'card') {
      rules.push(
        '@media (max-width: 480px) {' +
          '#cmp-banner { width: calc(100vw - 20px); left: 10px; right: 10px; }' +
        '}'
      );
    }

    // ====== PREFERENCES OVERLAY ======
    rules.push(
      '#cmp-prefs-overlay {' +
        'all: initial;' +
        'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000000;' +
        'background: ' + t.overlayColor + ';' +
        'display: flex; align-items: center; justify-content: center;' +
        'font-family: ' + t.fontFamily + ';' +
        'color: ' + t.textColor + ';' +
        'animation: cmpFadeIn 0.2s ease-out;' +
        'box-sizing: border-box;' +
        'line-height: normal;' +
      '}'
    );
    rules.push('@keyframes cmpFadeIn { from { opacity:0; } to { opacity:1; } }');

    // ====== PREFERENCES PANEL ======
    // Use #cmp-prefs-panel as the ID scope for all child styles to beat any host-page specificity.
    var P = '#cmp-prefs-panel';
    rules.push(
      P + ' {' +
        'background: ' + t.backgroundColor + ';' +
        'border-radius: ' + t.borderRadius + ';' +
        'max-width: 520px; width: 92vw; max-height: 85vh;' +
        'display: flex; flex-direction: column;' +
        'box-shadow: 0 25px 60px rgba(0,0,0,0.18);' +
        'animation: cmpScaleIn 0.25s ease-out;' +
        'overflow: hidden;' +
        'color: ' + t.textColor + ';' +
        'font-family: ' + t.fontFamily + ';' +
        'box-sizing: border-box;' +
        'line-height: normal;' +
        'margin: 0; padding: 0;' +
      '}'
    );
    rules.push('@keyframes cmpScaleIn { from { transform: scale(0.96); opacity:0; } to { transform: scale(1); opacity:1; } }');

    // Panel children reset — only reset margin, let padding be set by specific rules
    rules.push(P + ' * { box-sizing: border-box; margin: 0; padding: 0; }');

    // Header
    rules.push(P + ' .cmp-prefs-head { padding: 24px 28px 0 28px; flex-shrink: 0; }');
    rules.push(P + ' .cmp-prefs-head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }');
    rules.push(P + ' .cmp-prefs-head-left { display: flex; align-items: center; gap: 10px; }');
    rules.push(P + ' #cmp-prefs-logo { height: 28px; width: auto; display: block; }');
    rules.push(
      P + ' #cmp-prefs-close {' +
        'width: 32px; height: 32px; border-radius: 50%; border: none;' +
        'background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;' +
        'color: ' + t.secondaryTextColor + '; font-size: 20px; transition: background 0.15s;' +
        'font-family: ' + t.fontFamily + '; line-height: 1;' +
      '}'
    );
    rules.push(P + ' #cmp-prefs-close:hover { background: rgba(0,0,0,0.06); }');
    rules.push(P + ' .cmp-prefs-head h2 { font-size: 18px; font-weight: 700; color: ' + t.textColor + '; font-family: ' + t.fontFamily + '; }');
    rules.push(P + ' .cmp-prefs-head p { font-size: 13px; color: ' + t.secondaryTextColor + '; line-height: 1.5; padding: 8px 0 16px 0; font-family: ' + t.fontFamily + '; }');

    // Scrollable body
    rules.push(P + ' .cmp-prefs-body { flex: 1; overflow-y: auto; padding: 0 28px; }');

    // Category items
    rules.push(P + ' .cmp-category { padding: 18px 0; border-bottom: 1px solid ' + t.borderColor + '; }');
    rules.push(P + ' .cmp-category:last-child { border-bottom: none; }');
    rules.push(P + ' .cmp-category-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }');
    rules.push(P + ' .cmp-category-info { flex: 1; min-width: 0; }');
    rules.push(P + ' .cmp-category-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }');
    rules.push(P + ' .cmp-category-name { font-size: 14px; font-weight: 600; color: ' + t.textColor + '; font-family: ' + t.fontFamily + '; }');
    rules.push(
      P + ' .cmp-category-badge {' +
        'font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;' +
        'color: ' + t.primaryColor + '; background: ' + hexToRgba(t.primaryColor, 0.08) + ';' +
        'padding: 2px 8px; border-radius: 10px; white-space: nowrap;' +
        'font-family: ' + t.fontFamily + '; display: inline-block;' +
      '}'
    );
    rules.push(P + ' .cmp-category-desc { font-size: 13px; color: ' + t.secondaryTextColor + '; line-height: 1.45; font-family: ' + t.fontFamily + '; }');

    // Toggle switch
    rules.push(P + ' .cmp-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }');
    rules.push(P + ' .cmp-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }');
    rules.push(
      P + ' .cmp-toggle-slider {' +
        'position: absolute; top: 0; left: 0; right: 0; bottom: 0;' +
        'background: ' + t.toggleOffColor + '; border-radius: 24px; cursor: pointer; transition: background 0.2s;' +
      '}'
    );
    rules.push(
      P + ' .cmp-toggle-slider::before {' +
        'content: ""; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px;' +
        'background: #fff; border-radius: 50%; transition: transform 0.2s;' +
        'box-shadow: 0 1px 3px rgba(0,0,0,0.12);' +
      '}'
    );
    rules.push(P + ' .cmp-toggle input:checked + .cmp-toggle-slider { background: ' + t.primaryColor + '; }');
    rules.push(P + ' .cmp-toggle input:checked + .cmp-toggle-slider::before { transform: translateX(20px); }');
    rules.push(P + ' .cmp-toggle input:disabled + .cmp-toggle-slider { opacity: 0.5; cursor: default; }');

    // Footer
    rules.push(
      P + ' .cmp-prefs-foot {' +
        'padding: 16px 28px 24px 28px; flex-shrink: 0;' +
        'border-top: 1px solid ' + t.borderColor + ';' +
        'display: flex; gap: 10px; flex-wrap: wrap;' +
      '}'
    );
    rules.push(
      P + ' .cmp-prefs-foot button {' +
        'font-family: ' + t.fontFamily + '; font-size: 14px; font-weight: 600; padding: 10px 22px;' +
        'border-radius: ' + t.buttonBorderRadius + '; cursor: pointer; transition: all 0.15s ease; border: none; line-height: 1;' +
      '}'
    );
    rules.push(P + ' .cmp-prefs-foot button:active { transform: scale(0.97); }');
    rules.push(P + ' #cmp-prefs-save { background: ' + t.primaryColor + '; color: #fff; }');
    rules.push(P + ' #cmp-prefs-save:hover { background: ' + t.primaryHoverColor + '; }');
    rules.push(P + ' #cmp-prefs-accept { background: transparent; color: ' + t.textColor + '; border: 1px solid ' + t.borderColor + ' !important; }');
    rules.push(P + ' #cmp-prefs-accept:hover { background: rgba(0,0,0,0.03); }');
    rules.push(P + ' #cmp-prefs-reject { background: transparent; color: ' + t.secondaryTextColor + '; }');
    rules.push(P + ' #cmp-prefs-reject:hover { color: ' + t.textColor + '; }');

    // ====== FLOATING RE-OPEN BUTTON ======
    rules.push(
      '#cmp-reopen-btn {' +
        'all: initial;' +
        'position: fixed; ' + fbPosCSS + ' z-index: 999998;' +
        'width: ' + fbSize + '; height: ' + fbSize + '; border-radius: 50%;' +
        'background: ' + fbBg + '; color: ' + fbColor + '; border: none; cursor: pointer;' +
        'display: flex; align-items: center; justify-content: center;' +
        'box-shadow: 0 2px 12px rgba(0,0,0,0.2); transition: transform 0.15s, background 0.15s;' +
        'box-sizing: border-box;' +
      '}'
    );
    rules.push('#cmp-reopen-btn:hover { transform: scale(1.1); }');
    rules.push('#cmp-reopen-btn svg { display: block; }');

    return rules.join('\n');
  }

  function hexToRgba(hex, alpha) {
    // Handle shorthand and standard hex
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return 'rgba(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ',' + alpha + ')';
    }
    return 'rgba(0,0,0,' + alpha + ')';
  }

  function injectStyles(config) {
    var existing = document.getElementById('cmp-styles');
    if (existing) existing.remove();

    var style = document.createElement('style');
    style.id = 'cmp-styles';
    style.textContent = buildStyles(config);
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // DOM construction
  // ---------------------------------------------------------------------------
  function createBanner(config, onAccept, onReject, onSettings) {
    var b = config.banner;
    var el = document.createElement('div');
    el.id = 'cmp-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');

    var logoHtml = '';
    if (b.logo) {
      logoHtml = '<img id="cmp-banner-logo" src="' + escapeHtml(b.logo) + '" alt="Logo">';
    }

    el.innerHTML =
      '<div id="cmp-banner-inner">' +
        '<div id="cmp-banner-header">' + logoHtml + '<h2>' + escapeHtml(b.title) + '</h2></div>' +
        '<p>' + escapeHtml(b.description) + '</p>' +
        '<div id="cmp-banner-buttons">' +
          '<button id="cmp-btn-accept">' + escapeHtml(b.primaryButtonText) + '</button>' +
          '<button id="cmp-btn-reject">' + escapeHtml(b.rejectButtonText) + '</button>' +
          '<button id="cmp-btn-settings">' + escapeHtml(b.settingsButtonText) + '</button>' +
        '</div>' +
      '</div>';

    el.querySelector('#cmp-btn-accept').addEventListener('click', onAccept);
    el.querySelector('#cmp-btn-reject').addEventListener('click', onReject);
    el.querySelector('#cmp-btn-settings').addEventListener('click', onSettings);
    return el;
  }

  function createPreferencesPanel(config, currentState, onSave, onAcceptAll, onRejectAll, onClose) {
    var b = config.banner;
    var overlay = document.createElement('div');
    overlay.id = 'cmp-prefs-overlay';

    var logoHtml = '';
    if (b.logo) {
      logoHtml = '<img id="cmp-prefs-logo" src="' + escapeHtml(b.logo) + '" alt="Logo">';
    }

    var categoriesHtml = '';
    config.categories.forEach(function (cat) {
      var checked = cat.required || currentState[cat.id] ? 'checked' : '';
      var disabled = cat.required ? 'disabled' : '';
      var badge = cat.required ? '<span class="cmp-category-badge">Always on</span>' : '';

      categoriesHtml +=
        '<div class="cmp-category">' +
          '<div class="cmp-category-header">' +
            '<div class="cmp-category-info">' +
              '<div class="cmp-category-name-row">' +
                '<span class="cmp-category-name">' + escapeHtml(cat.name) + '</span>' +
                badge +
              '</div>' +
              '<div class="cmp-category-desc">' + escapeHtml(cat.description) + '</div>' +
            '</div>' +
            '<label class="cmp-toggle">' +
              '<input type="checkbox" data-category="' + cat.id + '" ' + checked + ' ' + disabled + '>' +
              '<span class="cmp-toggle-slider"></span>' +
            '</label>' +
          '</div>' +
        '</div>';
    });

    overlay.innerHTML =
      '<div id="cmp-prefs-panel" role="dialog" aria-label="Cookie preferences">' +
        '<div class="cmp-prefs-head">' +
          '<div class="cmp-prefs-head-row">' +
            '<div class="cmp-prefs-head-left">' + logoHtml +
              '<h2>' + escapeHtml(b.prefsTitle || 'Cookie Preferences') + '</h2>' +
            '</div>' +
            '<button id="cmp-prefs-close" aria-label="Close">&times;</button>' +
          '</div>' +
          '<p>' + escapeHtml(b.prefsDescription || '') + '</p>' +
        '</div>' +
        '<div class="cmp-prefs-body">' +
          categoriesHtml +
        '</div>' +
        '<div class="cmp-prefs-foot">' +
          '<button id="cmp-prefs-save">' + escapeHtml(b.saveButtonText) + '</button>' +
          '<button id="cmp-prefs-accept">' + escapeHtml(b.primaryButtonText) + '</button>' +
          '<button id="cmp-prefs-reject">' + escapeHtml(b.rejectButtonText) + '</button>' +
        '</div>' +
      '</div>';

    overlay.querySelector('#cmp-prefs-save').addEventListener('click', function () {
      var state = {};
      var toggles = overlay.querySelectorAll('input[data-category]');
      for (var i = 0; i < toggles.length; i++) {
        state[toggles[i].getAttribute('data-category')] = toggles[i].checked;
      }
      onSave(state);
    });

    overlay.querySelector('#cmp-prefs-accept').addEventListener('click', onAcceptAll);
    overlay.querySelector('#cmp-prefs-reject').addEventListener('click', onRejectAll);
    overlay.querySelector('#cmp-prefs-close').addEventListener('click', onClose);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) onClose();
    });

    return overlay;
  }

  function createReopenButton(config, onClick) {
    var fb = config.banner.floatingButton || {};
    var iconId = fb.icon || 'cookie';
    var iconSvg = ICONS[iconId] || ICONS.cookie;

    var btn = document.createElement('button');
    btn.id = 'cmp-reopen-btn';
    btn.setAttribute('aria-label', 'Manage cookie preferences');
    btn.title = 'Cookie preferences';
    btn.innerHTML = iconSvg;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ---------------------------------------------------------------------------
  // Main CMP Controller
  // ---------------------------------------------------------------------------
  function ConsentManager(config) {
    this.config = config;
    this.consentState = null;
    this.bannerEl = null;
    this.backdropEl = null;
    this.prefsEl = null;
    this.reopenBtnEl = null;
    this._callbacks = [];
  }

  ConsentManager.prototype.init = function () {
    injectStyles(this.config);
    pushGcmDefault(this.config);

    var saved = getCookie(this.config.cookieName);
    if (saved && saved.categories) {
      this.consentState = saved.categories;
      pushGcmUpdate(this.consentState, this.config);
      this._showReopenButton();
      this._fireCallbacks(this.consentState);
    } else {
      this._showBanner();
    }
  };

  ConsentManager.prototype._showBanner = function () {
    var self = this;
    if (this.config.banner.backdrop) {
      this.backdropEl = document.createElement('div');
      this.backdropEl.id = 'cmp-backdrop';
      document.body.appendChild(this.backdropEl);
    }
    this.bannerEl = createBanner(
      this.config,
      function () { self._acceptAll(); },
      function () { self._rejectAll(); },
      function () { self._showPreferences(); }
    );
    document.body.appendChild(this.bannerEl);
  };

  ConsentManager.prototype._hideBanner = function () {
    if (this.backdropEl) { this.backdropEl.remove(); this.backdropEl = null; }
    if (this.bannerEl) { this.bannerEl.remove(); this.bannerEl = null; }
  };

  ConsentManager.prototype._showReopenButton = function () {
    if (this.reopenBtnEl) return;
    var self = this;
    this.reopenBtnEl = createReopenButton(this.config, function () { self._showPreferences(); });
    document.body.appendChild(this.reopenBtnEl);
  };

  ConsentManager.prototype._hideReopenButton = function () {
    if (this.reopenBtnEl) { this.reopenBtnEl.remove(); this.reopenBtnEl = null; }
  };

  ConsentManager.prototype._showPreferences = function () {
    if (this.prefsEl) return;
    var self = this;
    var current = this.consentState || {};

    this.prefsEl = createPreferencesPanel(
      this.config, current,
      function (state) { self._closePrefs(); self._saveConsent(state); },
      function () { self._closePrefs(); self._acceptAll(); },
      function () { self._closePrefs(); self._rejectAll(); },
      function () { self._closePrefs(); }
    );
    document.body.appendChild(this.prefsEl);
  };

  ConsentManager.prototype._closePrefs = function () {
    if (this.prefsEl) { this.prefsEl.remove(); this.prefsEl = null; }
  };

  ConsentManager.prototype._acceptAll = function () {
    var state = {};
    this.config.categories.forEach(function (cat) { state[cat.id] = true; });
    this._saveConsent(state);
  };

  ConsentManager.prototype._rejectAll = function () {
    var state = {};
    this.config.categories.forEach(function (cat) {
      state[cat.id] = cat.required ? true : false;
    });
    this._saveConsent(state);
  };

  ConsentManager.prototype._saveConsent = function (state) {
    this.consentState = state;
    var record = {
      categories: state,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    setCookie(this.config.cookieName, JSON.stringify(record), this.config.cookieDuration);
    pushGcmUpdate(state, this.config);
    this._hideBanner();
    this._showReopenButton();
    this._fireCallbacks(state);
  };

  ConsentManager.prototype.onConsentChange = function (callback) {
    this._callbacks.push(callback);
    if (this.consentState) callback(this.consentState);
  };

  ConsentManager.prototype._fireCallbacks = function (state) {
    this._callbacks.forEach(function (cb) {
      try { cb(state); } catch (e) { console.error('[CMP] Callback error:', e); }
    });
  };

  ConsentManager.prototype.getConsent = function () {
    return this.consentState ? JSON.parse(JSON.stringify(this.consentState)) : null;
  };

  ConsentManager.prototype.getGcmState = function () {
    if (!this.consentState) return null;
    return buildGcmState(this.consentState, this.config);
  };

  ConsentManager.prototype.resetConsent = function () {
    deleteCookie(this.config.cookieName);
    this.consentState = null;
    this._hideReopenButton();
    this._closePrefs();
    pushGcmDefault(this.config);
    this._showBanner();
  };

  ConsentManager.prototype.showPreferences = function () {
    this._showPreferences();
  };

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  function loadConfig(callback) {
    if (window.CMP_CONFIG) {
      callback(deepMerge(DEFAULT_CONFIG, window.CMP_CONFIG));
      return;
    }
    var scripts = document.querySelectorAll('script[data-cmp-config]');
    if (scripts.length > 0) {
      var configUrl = scripts[scripts.length - 1].getAttribute('data-cmp-config');
      var xhr = new XMLHttpRequest();
      xhr.open('GET', configUrl, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            callback(deepMerge(DEFAULT_CONFIG, JSON.parse(xhr.responseText)));
          } catch (e) {
            console.error('[CMP] Failed to parse config:', e);
            callback(DEFAULT_CONFIG);
          }
        } else {
          console.error('[CMP] Failed to load config: HTTP ' + xhr.status);
          callback(DEFAULT_CONFIG);
        }
      };
      xhr.onerror = function () {
        console.error('[CMP] Failed to load config');
        callback(DEFAULT_CONFIG);
      };
      xhr.send();
      return;
    }
    callback(DEFAULT_CONFIG);
  }

  function boot() {
    loadConfig(function (config) {
      var cmp = new ConsentManager(config);
      window.CMP = cmp;
      cmp.init();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
