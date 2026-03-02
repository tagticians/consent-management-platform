/**
 * CMP Admin — Configuration Dashboard
 */
(function () {
  'use strict';

  // =========================================================================
  // Theme presets
  // =========================================================================
  var THEMES = {
    'clean-light': {
      name: 'Clean Light',
      theme: {
        primaryColor: '#2563eb', primaryHoverColor: '#1d4ed8',
        backgroundColor: '#ffffff', textColor: '#1f2937',
        secondaryTextColor: '#6b7280', borderColor: '#e5e7eb',
        overlayColor: 'rgba(0,0,0,0.4)', toggleOffColor: '#d1d5db',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '12px', buttonBorderRadius: '8px'
      }
    },
    'dark-mode': {
      name: 'Dark Mode',
      theme: {
        primaryColor: '#3b82f6', primaryHoverColor: '#60a5fa',
        backgroundColor: '#1e293b', textColor: '#f1f5f9',
        secondaryTextColor: '#94a3b8', borderColor: '#334155',
        overlayColor: 'rgba(0,0,0,0.6)', toggleOffColor: '#475569',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '12px', buttonBorderRadius: '8px'
      }
    },
    'minimal': {
      name: 'Minimal',
      theme: {
        primaryColor: '#111827', primaryHoverColor: '#374151',
        backgroundColor: '#ffffff', textColor: '#111827',
        secondaryTextColor: '#9ca3af', borderColor: '#f3f4f6',
        overlayColor: 'rgba(0,0,0,0.3)', toggleOffColor: '#e5e7eb',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '8px', buttonBorderRadius: '6px'
      }
    },
    'corporate': {
      name: 'Corporate',
      theme: {
        primaryColor: '#1e40af', primaryHoverColor: '#1e3a8a',
        backgroundColor: '#ffffff', textColor: '#1e293b',
        secondaryTextColor: '#64748b', borderColor: '#cbd5e1',
        overlayColor: 'rgba(15,23,42,0.5)', toggleOffColor: '#cbd5e1',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '6px', buttonBorderRadius: '4px'
      }
    },
    'nature': {
      name: 'Nature',
      theme: {
        primaryColor: '#059669', primaryHoverColor: '#047857',
        backgroundColor: '#ffffff', textColor: '#064e3b',
        secondaryTextColor: '#6b7280', borderColor: '#d1fae5',
        overlayColor: 'rgba(6,78,59,0.35)', toggleOffColor: '#d1d5db',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '12px', buttonBorderRadius: '8px'
      }
    },
    'warm': {
      name: 'Warm',
      theme: {
        primaryColor: '#d97706', primaryHoverColor: '#b45309',
        backgroundColor: '#fffbeb', textColor: '#451a03',
        secondaryTextColor: '#92400e', borderColor: '#fde68a',
        overlayColor: 'rgba(69,26,3,0.35)', toggleOffColor: '#d6d3d1',
        fontFamily: "Georgia, 'Times New Roman', serif",
        borderRadius: '10px', buttonBorderRadius: '6px'
      }
    },
    'purple': {
      name: 'Purple',
      theme: {
        primaryColor: '#7c3aed', primaryHoverColor: '#6d28d9',
        backgroundColor: '#ffffff', textColor: '#1f2937',
        secondaryTextColor: '#6b7280', borderColor: '#e5e7eb',
        overlayColor: 'rgba(0,0,0,0.4)', toggleOffColor: '#d1d5db',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '16px', buttonBorderRadius: '10px'
      }
    },
    'slate-dark': {
      name: 'Slate Dark',
      theme: {
        primaryColor: '#6366f1', primaryHoverColor: '#818cf8',
        backgroundColor: '#0f172a', textColor: '#e2e8f0',
        secondaryTextColor: '#64748b', borderColor: '#1e293b',
        overlayColor: 'rgba(0,0,0,0.7)', toggleOffColor: '#334155',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: '12px', buttonBorderRadius: '8px'
      }
    }
  };

  // =========================================================================
  // GCM parameter options
  // =========================================================================
  var GCM_OPTIONS = [
    'ad_storage', 'ad_user_data', 'ad_personalization',
    'analytics_storage', 'functionality_storage',
    'personalization_storage', 'security_storage'
  ];

  // =========================================================================
  // State
  // =========================================================================
  var config = null;
  var activeSection = 'general';
  var activeThemeId = null;
  var previewView = 'banner';

  // =========================================================================
  // Init
  // =========================================================================
  function init() {
    loadConfig(function () {
      renderThemeGrid();
      renderCategories();
      populateFields();
      bindEvents();
      updatePreview();
      updateEmbedCode();
    });
  }

  function loadConfig(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/cmp-config.json', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try { config = JSON.parse(xhr.responseText); } catch (e) { config = getDefaultConfig(); }
      } else {
        config = getDefaultConfig();
      }
      callback();
    };
    xhr.onerror = function () { config = getDefaultConfig(); callback(); };
    xhr.send();
  }

  function getDefaultConfig() {
    return {
      banner: {
        position: 'bottom', layout: 'bar', logo: null,
        title: 'We value your privacy',
        description: 'We use cookies and similar technologies to enhance your browsing experience, analyse traffic, and personalise content.',
        primaryButtonText: 'Accept All', rejectButtonText: 'Reject All',
        settingsButtonText: 'Manage Preferences', saveButtonText: 'Save Preferences',
        prefsTitle: 'Cookie Preferences',
        prefsDescription: 'Choose which types of cookies you would like to allow. Your preferences will be saved and can be changed at any time.',
        floatingButton: { position: 'bottom-left', icon: 'cookie', backgroundColor: null, textColor: null, size: 44 },
        theme: JSON.parse(JSON.stringify(THEMES['clean-light'].theme))
      },
      categories: [
        { id: 'necessary', name: 'Strictly Necessary', description: 'Essential cookies for the website to function.', required: true, gcmParameters: ['security_storage'] },
        { id: 'analytics', name: 'Analytics', description: 'Help us understand how visitors use our website.', required: false, gcmParameters: ['analytics_storage'] },
        { id: 'marketing', name: 'Marketing', description: 'Used to deliver relevant advertisements.', required: false, gcmParameters: ['ad_storage', 'ad_user_data', 'ad_personalization'] },
        { id: 'functional', name: 'Functional', description: 'Enable enhanced functionality.', required: false, gcmParameters: ['functionality_storage'] },
        { id: 'personalization', name: 'Personalization', description: 'Allow personalized content.', required: false, gcmParameters: ['personalization_storage'] }
      ],
      cookieName: 'cmp_consent', cookieDuration: 365,
      consentMode: { waitForUpdate: 500 }
    };
  }

  // =========================================================================
  // Populate form fields from config
  // =========================================================================
  function populateFields() {
    var b = config.banner;
    var t = b.theme;

    // General
    el('cfg-title').value = b.title || '';
    el('cfg-description').value = b.description || '';
    el('cfg-prefs-title').value = b.prefsTitle || '';
    el('cfg-prefs-desc').value = b.prefsDescription || '';
    el('cfg-accept-text').value = b.primaryButtonText || '';
    el('cfg-reject-text').value = b.rejectButtonText || '';
    el('cfg-settings-text').value = b.settingsButtonText || '';
    el('cfg-save-text').value = b.saveButtonText || '';
    el('cfg-position').value = b.position || 'bottom';
    el('cfg-cookie-duration').value = config.cookieDuration || 365;

    // Logo
    if (b.logo) {
      el('logo-preview-img').src = b.logo;
      el('logo-preview').style.display = '';
      el('logo-placeholder').style.display = 'none';
    }

    // Floating button
    var fb = b.floatingButton || {};
    el('cfg-fb-position').value = fb.position || 'bottom-left';
    el('cfg-fb-icon').value = fb.icon || 'cookie';
    el('cfg-fb-size').value = fb.size || 44;
    setColourField('clr-fb-bg', fb.backgroundColor || b.theme.primaryColor);
    setColourField('clr-fb-text', fb.textColor || '#ffffff');
    updateFbPreview();

    // Appearance
    setColourField('clr-primary', t.primaryColor);
    setColourField('clr-primary-hover', t.primaryHoverColor);
    setColourField('clr-bg', t.backgroundColor);
    setColourField('clr-text', t.textColor);
    setColourField('clr-secondary-text', t.secondaryTextColor);
    setColourField('clr-border', t.borderColor);
    setColourField('clr-toggle-off', t.toggleOffColor || '#d1d5db');

    el('cfg-font').value = t.fontFamily || '';
    el('cfg-border-radius').value = t.borderRadius || '12px';
    el('cfg-btn-radius').value = t.buttonBorderRadius || '8px';

    detectActiveTheme();
  }

  function setColourField(id, value) {
    el(id).value = value;
    el(id + '-hex').value = value;
  }

  function readFieldsToConfig() {
    var b = config.banner;
    b.title = el('cfg-title').value;
    b.description = el('cfg-description').value;
    b.prefsTitle = el('cfg-prefs-title').value;
    b.prefsDescription = el('cfg-prefs-desc').value;
    b.primaryButtonText = el('cfg-accept-text').value;
    b.rejectButtonText = el('cfg-reject-text').value;
    b.settingsButtonText = el('cfg-settings-text').value;
    b.saveButtonText = el('cfg-save-text').value;
    b.position = el('cfg-position').value;
    config.cookieDuration = parseInt(el('cfg-cookie-duration').value, 10) || 365;

    // Floating button
    if (!b.floatingButton) b.floatingButton = {};
    b.floatingButton.position = el('cfg-fb-position').value;
    b.floatingButton.icon = el('cfg-fb-icon').value;
    b.floatingButton.size = parseInt(el('cfg-fb-size').value, 10) || 44;
    var fbBgVal = el('clr-fb-bg-hex').value;
    var fbTextVal = el('clr-fb-text-hex').value;
    b.floatingButton.backgroundColor = fbBgVal;
    b.floatingButton.textColor = fbTextVal;

    var t = b.theme;
    t.primaryColor = el('clr-primary-hex').value;
    t.primaryHoverColor = el('clr-primary-hover-hex').value;
    t.backgroundColor = el('clr-bg-hex').value;
    t.textColor = el('clr-text-hex').value;
    t.secondaryTextColor = el('clr-secondary-text-hex').value;
    t.borderColor = el('clr-border-hex').value;
    t.toggleOffColor = el('clr-toggle-off-hex').value;
    t.fontFamily = el('cfg-font').value;
    t.borderRadius = el('cfg-border-radius').value;
    t.buttonBorderRadius = el('cfg-btn-radius').value;

    readCategoriesToConfig();
  }

  // =========================================================================
  // Theme grid
  // =========================================================================
  function renderThemeGrid() {
    var grid = el('theme-grid');
    var html = '';
    for (var id in THEMES) {
      if (!THEMES.hasOwnProperty(id)) continue;
      var t = THEMES[id];
      html +=
        '<div class="theme-card" data-theme="' + id + '">' +
          '<div class="theme-card-colours">' +
            '<div class="theme-swatch" style="background:' + t.theme.primaryColor + '"></div>' +
            '<div class="theme-swatch" style="background:' + t.theme.backgroundColor + '"></div>' +
            '<div class="theme-swatch" style="background:' + t.theme.textColor + '"></div>' +
          '</div>' +
          '<div class="theme-card-name">' + t.name + '</div>' +
        '</div>';
    }
    grid.innerHTML = html;
  }

  function detectActiveTheme() {
    var t = config.banner.theme;
    activeThemeId = null;
    for (var id in THEMES) {
      if (!THEMES.hasOwnProperty(id)) continue;
      var preset = THEMES[id].theme;
      if (preset.primaryColor === t.primaryColor &&
          preset.backgroundColor === t.backgroundColor &&
          preset.textColor === t.textColor) {
        activeThemeId = id;
        break;
      }
    }
    var cards = document.querySelectorAll('.theme-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('active', cards[i].getAttribute('data-theme') === activeThemeId);
    }
  }

  function applyTheme(id) {
    if (!THEMES[id]) return;
    config.banner.theme = JSON.parse(JSON.stringify(THEMES[id].theme));
    populateFields();
    updatePreview();
  }

  // =========================================================================
  // Categories
  // =========================================================================
  function renderCategories() {
    var list = el('categories-list');
    var html = '';
    config.categories.forEach(function (cat, idx) {
      var reqBadge = cat.required ? '<span class="category-required-badge">Required</span>' : '';
      var gcmTags = '';
      (cat.gcmParameters || []).forEach(function (p) {
        gcmTags += '<span class="gcm-tag">' + p + '</span>';
      });

      html +=
        '<div class="category-card" data-index="' + idx + '">' +
          '<div class="category-card-header">' +
            '<h3>' + escapeHtml(cat.name) + ' ' + reqBadge + '</h3>' +
            '<div class="category-card-actions">' +
              (cat.required ? '' : '<button class="btn btn-danger btn-sm" data-action="delete-cat" data-index="' + idx + '">Remove</button>') +
            '</div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field">' +
              '<label class="field-label">ID</label>' +
              '<input type="text" class="input cat-id" value="' + escapeHtml(cat.id) + '" ' + (cat.required ? 'disabled' : '') + '>' +
            '</div>' +
            '<div class="field">' +
              '<label class="field-label">Display Name</label>' +
              '<input type="text" class="input cat-name" value="' + escapeHtml(cat.name) + '">' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field-label">Description</label>' +
            '<textarea class="input textarea cat-desc" rows="2">' + escapeHtml(cat.description) + '</textarea>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field-label">Required (cannot be disabled by user)</label>' +
            '<label style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
              '<input type="checkbox" class="cat-required" ' + (cat.required ? 'checked' : '') + '> This category is always enabled' +
            '</label>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field-label">Google Consent Mode Parameters</label>' +
            '<div class="gcm-checkboxes" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">' +
              gcmCheckboxes(cat.gcmParameters) +
            '</div>' +
          '</div>' +
        '</div>';
    });
    list.innerHTML = html;
  }

  function gcmCheckboxes(selected) {
    var html = '';
    GCM_OPTIONS.forEach(function (opt) {
      var checked = selected && selected.indexOf(opt) !== -1 ? 'checked' : '';
      html += '<label style="display:flex;align-items:center;gap:4px;font-size:12px;font-family:monospace;color:#6b7280;">' +
        '<input type="checkbox" class="cat-gcm" value="' + opt + '" ' + checked + '> ' + opt +
        '</label>';
    });
    return html;
  }

  function readCategoriesToConfig() {
    var cards = document.querySelectorAll('.category-card');
    var cats = [];
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var gcmInputs = card.querySelectorAll('.cat-gcm:checked');
      var gcm = [];
      for (var j = 0; j < gcmInputs.length; j++) {
        gcm.push(gcmInputs[j].value);
      }
      cats.push({
        id: card.querySelector('.cat-id').value.trim(),
        name: card.querySelector('.cat-name').value.trim(),
        description: card.querySelector('.cat-desc').value.trim(),
        required: card.querySelector('.cat-required').checked,
        gcmParameters: gcm
      });
    }
    config.categories = cats;
  }

  function addCategory() {
    readCategoriesToConfig();
    config.categories.push({
      id: 'custom_' + Date.now(),
      name: 'New Category',
      description: 'Description of this cookie category.',
      required: false,
      gcmParameters: []
    });
    renderCategories();
    updatePreview();
  }

  function deleteCategory(idx) {
    readCategoriesToConfig();
    config.categories.splice(idx, 1);
    renderCategories();
    updatePreview();
  }

  // =========================================================================
  // Preview
  // =========================================================================
  function updatePreview() {
    readFieldsToConfig();
    var container = el('preview-container');
    container.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'cmp-preview-wrap' + (previewView === 'prefs' ? ' prefs-view' : '');

    if (previewView === 'banner') {
      wrap.appendChild(buildPreviewBanner());
    } else {
      wrap.appendChild(buildPreviewPrefs());
    }

    container.appendChild(wrap);
  }

  function buildPreviewBanner() {
    var b = config.banner;
    var t = b.theme;

    var div = document.createElement('div');
    div.style.cssText =
      'background:' + t.backgroundColor + ';color:' + t.textColor + ';' +
      'font-family:' + t.fontFamily + ';padding:20px 24px;' +
      'box-shadow:0 -4px 24px rgba(0,0,0,0.1);';

    var logoHtml = '';
    if (b.logo) {
      logoHtml = '<img src="' + escapeHtml(b.logo) + '" style="height:32px;width:auto;margin-right:10px;">';
    }

    div.innerHTML =
      '<div style="display:flex;align-items:center;margin-bottom:8px;">' + logoHtml +
        '<strong style="font-size:15px;">' + escapeHtml(b.title) + '</strong></div>' +
      '<p style="font-size:12px;line-height:1.5;color:' + t.secondaryTextColor + ';margin-bottom:14px;">' +
        escapeHtml(b.description) + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button style="background:' + t.primaryColor + ';color:#fff;border:none;padding:8px 16px;border-radius:' + t.buttonBorderRadius + ';font-size:12px;font-weight:600;cursor:pointer;">' + escapeHtml(b.primaryButtonText) + '</button>' +
        '<button style="background:transparent;color:' + t.textColor + ';border:1px solid ' + t.borderColor + ';padding:8px 16px;border-radius:' + t.buttonBorderRadius + ';font-size:12px;font-weight:600;cursor:pointer;">' + escapeHtml(b.rejectButtonText) + '</button>' +
        '<button style="background:transparent;color:' + t.primaryColor + ';border:none;padding:8px 10px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:underline;">' + escapeHtml(b.settingsButtonText) + '</button>' +
      '</div>';

    return div;
  }

  function buildPreviewPrefs() {
    var b = config.banner;
    var t = b.theme;

    var panel = document.createElement('div');
    panel.style.cssText =
      'background:' + t.backgroundColor + ';color:' + t.textColor + ';' +
      'font-family:' + t.fontFamily + ';padding:24px;border-radius:' + t.borderRadius + ';' +
      'box-shadow:0 20px 60px rgba(0,0,0,0.15);max-width:420px;width:100%;';

    var logoHtml = '';
    if (b.logo) {
      logoHtml = '<img src="' + escapeHtml(b.logo) + '" style="height:24px;width:auto;margin-right:8px;">';
    }

    var catsHtml = '';
    config.categories.forEach(function (cat) {
      var badge = cat.required
        ? '<span style="font-size:9px;font-weight:700;text-transform:uppercase;color:' + t.primaryColor + ';background:' + t.primaryColor + '14;padding:2px 6px;border-radius:8px;margin-left:6px;">Always on</span>'
        : '';
      var toggleBg = cat.required ? t.primaryColor : t.toggleOffColor;
      var toggleDot = cat.required ? 'translateX(16px)' : 'translateX(0)';

      catsHtml +=
        '<div style="padding:14px 0;' + (cat !== config.categories[config.categories.length - 1] ? 'border-bottom:1px solid ' + t.borderColor + ';' : '') + '">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div style="flex:1;">' +
              '<div style="display:flex;align-items:center;">' +
                '<span style="font-size:12px;font-weight:600;">' + escapeHtml(cat.name) + '</span>' + badge +
              '</div>' +
              '<div style="font-size:11px;color:' + t.secondaryTextColor + ';margin-top:3px;line-height:1.4;">' + escapeHtml(cat.description) + '</div>' +
            '</div>' +
            '<div style="width:36px;height:20px;background:' + toggleBg + ';border-radius:20px;position:relative;flex-shrink:0;margin-left:12px;">' +
              '<div style="width:14px;height:14px;background:#fff;border-radius:50%;position:absolute;top:3px;left:3px;transform:' + toggleDot + ';box-shadow:0 1px 2px rgba(0,0,0,0.12);"></div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });

    panel.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
        '<div style="display:flex;align-items:center;">' + logoHtml +
          '<strong style="font-size:15px;">' + escapeHtml(b.prefsTitle || 'Cookie Preferences') + '</strong>' +
        '</div>' +
        '<span style="cursor:pointer;font-size:18px;color:' + t.secondaryTextColor + ';width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;">&times;</span>' +
      '</div>' +
      '<p style="font-size:11px;color:' + t.secondaryTextColor + ';line-height:1.5;margin-bottom:14px;">' +
        escapeHtml(b.prefsDescription || '') + '</p>' +
      catsHtml +
      '<div style="display:flex;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid ' + t.borderColor + ';">' +
        '<button style="background:' + t.primaryColor + ';color:#fff;border:none;padding:8px 16px;border-radius:' + t.buttonBorderRadius + ';font-size:12px;font-weight:600;cursor:pointer;">' + escapeHtml(b.saveButtonText) + '</button>' +
        '<button style="background:transparent;color:' + t.textColor + ';border:1px solid ' + t.borderColor + ';padding:8px 16px;border-radius:' + t.buttonBorderRadius + ';font-size:12px;font-weight:600;cursor:pointer;">' + escapeHtml(b.primaryButtonText) + '</button>' +
      '</div>';

    return panel;
  }

  // =========================================================================
  // Embed code
  // =========================================================================
  function updateEmbedCode() {
    var scriptEl = el('embed-script');
    var gtmEl = el('embed-gtm');

    var scriptCode =
      '<!-- Consent Management Platform -->\n' +
      '<script src="https://cmp.martechtherapy.com/banner/cmp.js"\n' +
      '        data-cmp-config="https://cmp.martechtherapy.com/cmp-config.json"><\/script>';

    var gtmCode =
      '<script>\n' +
      '  // Load CMP banner via GTM Custom HTML tag\n' +
      '  // Trigger: All Pages, firing priority: high\n' +
      '  (function() {\n' +
      '    var s = document.createElement("script");\n' +
      '    s.src = "https://cmp.martechtherapy.com/banner/cmp.js";\n' +
      '    s.setAttribute("data-cmp-config", "https://cmp.martechtherapy.com/cmp-config.json");\n' +
      '    document.head.appendChild(s);\n' +
      '  })();\n' +
      '<\/script>';

    scriptEl.textContent = scriptCode;
    gtmEl.textContent = gtmCode;
  }

  // =========================================================================
  // Save config
  // =========================================================================
  function saveConfig() {
    readFieldsToConfig();
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/config', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      if (xhr.status === 200) {
        toast('Configuration saved');
      } else {
        toast('Failed to save: ' + xhr.statusText);
      }
    };
    xhr.onerror = function () { toast('Failed to save configuration'); };
    xhr.send(JSON.stringify(config, null, 2));
  }

  function exportConfig() {
    readFieldsToConfig();
    var blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'cmp-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Config exported');
  }

  function importConfig(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        config = JSON.parse(e.target.result);
        populateFields();
        renderCategories();
        updatePreview();
        updateEmbedCode();
        toast('Config imported');
      } catch (err) {
        toast('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // Floating button preview
  // =========================================================================
  var FB_ICONS = {
    cookie: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="15" r="1" fill="currentColor"/><circle cx="14" cy="7" r="0.5" fill="currentColor"/><circle cx="17" cy="15" r="0.5" fill="currentColor"/></svg>',
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v5c0 5.25 3.75 10.2 9 11.4 5.25-1.2 9-6.15 9-11.4V7l-9-5z"/><path d="M9 12l2 2 4-4"/></svg>',
    fingerprint: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.3 2.7-6 6-6 1.8 0 3.4.8 4.5 2"/><path d="M12 10c-1.1 0-2 .9-2 2 0 4.2-1.2 7-2.8 8.5"/><path d="M12 10c1.1 0 2 .9 2 2 0 3-.8 5.5-2 7.5"/><path d="M14 12c0 1.5-.2 3-.6 4.5"/></svg>',
    lock: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
  };

  function updateFbPreview() {
    var btn = el('fb-preview-btn');
    if (!btn) return;
    var icon = el('cfg-fb-icon').value || 'cookie';
    var bg = el('clr-fb-bg-hex').value || config.banner.theme.primaryColor;
    var color = el('clr-fb-text-hex').value || '#ffffff';
    var size = (parseInt(el('cfg-fb-size').value, 10) || 44) + 'px';

    btn.style.width = size;
    btn.style.height = size;
    btn.style.background = bg;
    btn.style.color = color;
    btn.innerHTML = FB_ICONS[icon] || FB_ICONS.cookie;
  }

  // =========================================================================
  // Logo upload
  // =========================================================================
  function handleLogoFile(file) {
    if (!file || !file.type.match(/^image\//)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      config.banner.logo = e.target.result;
      el('logo-preview-img').src = e.target.result;
      el('logo-preview').style.display = '';
      el('logo-placeholder').style.display = 'none';
      updatePreview();
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    config.banner.logo = null;
    el('logo-preview').style.display = 'none';
    el('logo-placeholder').style.display = '';
    updatePreview();
  }

  // =========================================================================
  // Event binding
  // =========================================================================
  function bindEvents() {
    // Sidebar nav
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var section = this.getAttribute('data-section');
        switchSection(section);
      });
    });

    // Theme cards
    el('theme-grid').addEventListener('click', function (e) {
      var card = e.target.closest('.theme-card');
      if (card) {
        applyTheme(card.getAttribute('data-theme'));
      }
    });

    // Colour pickers — sync picker <-> hex input
    document.querySelectorAll('.colour-picker').forEach(function (picker) {
      var hexInput = el(picker.id + '-hex');
      picker.addEventListener('input', function () {
        hexInput.value = picker.value;
        updatePreview();
      });
      hexInput.addEventListener('input', function () {
        if (/^#[0-9a-f]{6}$/i.test(hexInput.value)) {
          picker.value = hexInput.value;
          updatePreview();
        }
      });
    });

    // All other inputs — debounced preview
    var debounceTimer;
    document.querySelectorAll('.input, .select').forEach(function (inp) {
      inp.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () { updatePreview(); }, 150);
      });
    });

    // Preview tabs
    document.querySelectorAll('.preview-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.preview-tab').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        previewView = this.getAttribute('data-view');
        updatePreview();
      });
    });

    // Buttons
    el('btn-save').addEventListener('click', saveConfig);
    el('btn-export').addEventListener('click', exportConfig);
    el('btn-preview').addEventListener('click', function () {
      readFieldsToConfig();
      window.open('/?preview=1', '_blank');
    });
    el('btn-import').addEventListener('click', function () { el('import-file-input').click(); });
    el('import-file-input').addEventListener('change', function () {
      if (this.files.length > 0) importConfig(this.files[0]);
    });
    el('btn-add-category').addEventListener('click', addCategory);

    // Category delete (delegated)
    el('categories-list').addEventListener('click', function (e) {
      if (e.target.getAttribute('data-action') === 'delete-cat') {
        var idx = parseInt(e.target.getAttribute('data-index'), 10);
        deleteCategory(idx);
      }
    });

    // Category field changes — update preview
    el('categories-list').addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        readCategoriesToConfig();
        updatePreview();
      }, 200);
    });

    // Logo upload
    var uploadZone = el('logo-upload-zone');
    uploadZone.addEventListener('click', function (e) {
      if (e.target.closest('.logo-remove')) return;
      el('logo-file-input').click();
    });
    el('logo-file-input').addEventListener('change', function () {
      if (this.files.length > 0) handleLogoFile(this.files[0]);
    });
    el('logo-remove').addEventListener('click', function (e) {
      e.stopPropagation();
      removeLogo();
    });

    // Drag & drop
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('drag-over');
    });
    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) handleLogoFile(e.dataTransfer.files[0]);
    });

    // Floating button controls
    ['cfg-fb-position', 'cfg-fb-icon', 'cfg-fb-size'].forEach(function (id) {
      el(id).addEventListener('change', function () { updateFbPreview(); updatePreview(); });
      el(id).addEventListener('input', function () { updateFbPreview(); });
    });
    el('fb-preview-btn').addEventListener('click', function () {
      // Cycle through icons on click
      var iconKeys = Object.keys(FB_ICONS);
      var current = el('cfg-fb-icon').value;
      var idx = iconKeys.indexOf(current);
      var next = iconKeys[(idx + 1) % iconKeys.length];
      el('cfg-fb-icon').value = next;
      updateFbPreview();
    });

    // Copy buttons
    document.querySelectorAll('.code-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = el(btn.getAttribute('data-target'));
        navigator.clipboard.writeText(target.textContent).then(function () {
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
        });
      });
    });
  }

  // =========================================================================
  // Section switching
  // =========================================================================
  function switchSection(section) {
    activeSection = section;
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-section') === section);
    });
    document.querySelectorAll('.panel').forEach(function (panel) {
      panel.style.display = 'none';
    });
    var target = el('section-' + section);
    if (target) target.style.display = '';

    if (section === 'embed') updateEmbedCode();
    if (section === 'categories') renderCategories();
  }

  // =========================================================================
  // Helpers
  // =========================================================================
  function el(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function toast(msg) {
    var t = el('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  // =========================================================================
  // Boot
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
