/**
 * BugBite Widget — Lightweight bug reporting for web apps.
 * Embed with: <script src="https://bugbite.dev/widget.js" data-project="PROJECT_ID"></script>
 * @version 1.0.0
 */
(function () {
  'use strict';

  // --- Determine our script element ---
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      var mySrc = 'widget.js';
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.indexOf(mySrc) !== -1) {
          return scripts[i];
        }
      }
      return null;
    })();

  if (!currentScript) {
    console.warn('[BugBite] Could not locate the widget script tag. Aborting.');
    return;
  }

  // --- Read config ---
  var projectId = currentScript.getAttribute('data-project');
  if (!projectId) {
    console.warn('[BugBite] Missing "data-project" attribute on widget script tag. Widget will not render.');
    return;
  }

  // --- Deduplication: prevent multiple instances for the same project ---
  var INSTANCE_ATTR = 'data-bugbite-instance';
  if (document.querySelector('[' + INSTANCE_ATTR + '="' + projectId + '"]')) {
    return;
  }

  // --- Parse API origin from script src ---
  var apiOrigin;
  try {
    var parser = document.createElement('a');
    parser.href = currentScript.src;
    apiOrigin = parser.protocol + '//' + parser.host;
  } catch (e) {
    apiOrigin = window.location.origin;
  }

  var API_URL = apiOrigin + '/api/reports';
  var HTML2CANVAS_CDN = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

  // --- Unique CSS prefix for scoping ---
  var PREFIX = 'bb_' + projectId.replace(/-/g, '').substring(0, 8);

  // --- Icons (inline SVG) ---
  function bugIcon(w, h) {
    w = w || 20; h = h || 20;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:' + w + 'px;height:' + h + 'px;flex-shrink:0;"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>';
  }

  function closeIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  function checkIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  }

  function spinIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:24px;height:24px;animation:' + PREFIX + '_spin 0.8s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>';
  }

  // --- Inject styles ---
  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-bugbite-style', projectId);
  styleEl.textContent = [
    '@keyframes ' + PREFIX + '_spin{to{transform:rotate(360deg);}}',
    '@keyframes ' + PREFIX + '_fadein{from{opacity:0;}to{opacity:1;}}',
    '@keyframes ' + PREFIX + '_slideup{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}',
    '.' + PREFIX + '_container *,' + '.' + PREFIX + '_container *::before,' + '.' + PREFIX + '_container *::after{box-sizing:border-box;}',
    '.' + PREFIX + '_container{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:1.5;color:#111827;}',
    '.' + PREFIX + '_btn{all:unset;cursor:pointer;box-sizing:border-box;position:fixed;bottom:20px;right:20px;z-index:2147483646;display:flex;align-items:center;gap:8px;background:#4f46e5;color:#fff;padding:12px 18px;border-radius:28px;box-shadow:0 4px 14px rgba(79,70,229,0.35),0 1px 3px rgba(0,0,0,0.1);font-weight:600;font-size:14px;transition:transform 0.15s ease,box-shadow 0.15s ease,background 0.15s ease;user-select:none;}',
    '.' + PREFIX + '_btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(79,70,229,0.45);background:#4338ca;}',
    '.' + PREFIX + '_btn:active{transform:translateY(0);}',
    '.' + PREFIX + '_overlay{all:initial;position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;animation:' + PREFIX + '_fadein 0.15s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;}',
    '.' + PREFIX + '_modal{all:initial;background:#fff;border-radius:16px;width:90vw;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);animation:' + PREFIX + '_slideup 0.2s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;display:block;color:#111827;}',
    '.' + PREFIX + '_header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0 24px;}',
    '.' + PREFIX + '_title{font-size:18px;font-weight:700;color:#111827;display:flex;align-items:center;gap:10px;}',
    '.' + PREFIX + '_title_icon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:#e0e7ff;color:#4f46e5;}',
    '.' + PREFIX + '_close{all:unset;cursor:pointer;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;color:#9ca3af;transition:background 0.15s,color 0.15s;}',
    '.' + PREFIX + '_close:hover{background:#f3f4f6;color:#374151;}',
    '.' + PREFIX + '_body{padding:20px 24px;}',
    '.' + PREFIX + '_field{margin-bottom:16px;}',
    '.' + PREFIX + '_label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;}',
    '.' + PREFIX + '_textarea{all:unset;display:block;width:100%;min-height:100px;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;color:#111827;background:#f9fafb;transition:border-color 0.15s,box-shadow 0.15s;resize:vertical;box-sizing:border-box;font-family:inherit;}',
    '.' + PREFIX + '_textarea:focus{border-color:#4f46e5;box-shadow:0 0 0 3px #e0e7ff;}',
    '.' + PREFIX + '_textarea::placeholder{color:#9ca3af;}',
    '.' + PREFIX + '_input{all:unset;display:block;width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;color:#111827;background:#f9fafb;transition:border-color 0.15s,box-shadow 0.15s;box-sizing:border-box;font-family:inherit;}',
    '.' + PREFIX + '_input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px #e0e7ff;}',
    '.' + PREFIX + '_input::placeholder{color:#9ca3af;}',
    '.' + PREFIX + '_ss_area{position:relative;border-radius:10px;overflow:hidden;border:1.5px solid #e5e7eb;background:#f3f4f6;min-height:120px;display:flex;align-items:center;justify-content:center;}',
    '.' + PREFIX + '_ss_img{display:block;width:100%;max-height:240px;object-fit:cover;}',
    '.' + PREFIX + '_ss_placeholder{color:#9ca3af;font-size:13px;text-align:center;padding:20px;}',
    '.' + PREFIX + '_ss_loading{display:flex;flex-direction:column;align-items:center;gap:8px;padding:30px;color:#9ca3af;font-size:13px;}',
    '.' + PREFIX + '_actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:0 24px 20px 24px;}',
    '.' + PREFIX + '_btn_cancel{all:unset;cursor:pointer;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;color:#4b5563;background:#f3f4f6;transition:background 0.15s;box-sizing:border-box;font-family:inherit;}',
    '.' + PREFIX + '_btn_cancel:hover{background:#e5e7eb;}',
    '.' + PREFIX + '_btn_submit{all:unset;cursor:pointer;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;color:#fff;background:#4f46e5;transition:background 0.15s,transform 0.15s;box-sizing:border-box;font-family:inherit;}',
    '.' + PREFIX + '_btn_submit:hover{background:#4338ca;}',
    '.' + PREFIX + '_btn_submit:active{transform:scale(0.97);}',
    '.' + PREFIX + '_btn_submit:disabled{opacity:0.5;cursor:not-allowed;}',
    '.' + PREFIX + '_success{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;}',
    '.' + PREFIX + '_success_icon{color:#22c55e;margin-bottom:16px;}',
    '.' + PREFIX + '_success_title{font-size:18px;font-weight:700;color:#111827;margin-bottom:6px;}',
    '.' + PREFIX + '_success_text{font-size:14px;color:#6b7280;max-width:280px;}',
    '.' + PREFIX + '_error{all:initial;margin:0 24px 12px 24px;padding:10px 14px;border-radius:10px;background:#fef2f2;color:#ef4444;font-size:13px;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;display:block;}',
    '.' + PREFIX + '_branding{text-align:center;padding:0 24px 16px 24px;font-size:11px;color:#9ca3af;}',
    '.' + PREFIX + '_label_opt{font-weight:400;color:#9ca3af;}',
    '@media (max-width:540px){.' + PREFIX + '_btn_label{display:none;}.' + PREFIX + '_btn{padding:14px;border-radius:50%;}.' + PREFIX + '_modal{width:95vw;max-height:95vh;border-radius:12px;}.' + PREFIX + '_header{padding:16px 18px 0 18px;}.' + PREFIX + '_body{padding:16px 18px;}.' + PREFIX + '_actions{padding:0 18px 16px 18px;}.' + PREFIX + '_ss_img{max-height:160px;}}',
  ].join('\n');
  document.head.appendChild(styleEl);

  // --- Container ---
  var container = document.createElement('div');
  container.className = PREFIX + '_container';
  container.setAttribute(INSTANCE_ATTR, projectId);
  container.style.cssText = 'position:fixed;bottom:0;right:0;z-index:2147483646;pointer-events:none;';
  document.body.appendChild(container);

  // --- State ---
  var state = {
    isOpen: false,
    isSubmitting: false,
    isSuccess: false,
    error: '',
    screenshot: null,
    screenshotLoading: false,
    html2canvasLoaded: false,
  };

  // --- Helper: make an element ---
  function el(tag, cls, attrs, children) {
    var e = document.createElement(tag);
    if (cls) e.className = PREFIX + '_' + cls;
    if (attrs) {
      for (var k in attrs) {
        if (k === 'style') e.style.cssText = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k === 'text') e.textContent = attrs[k];
        else if (k === 'disabled') e.disabled = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string') e.appendChild(document.createTextNode(children[i]));
        else e.appendChild(children[i]);
      }
    }
    return e;
  }

  // --- Click handler ---
  function on(elm, evt, fn) {
    elm.addEventListener(evt, fn);
  }

  // --- Render ---
  function render() {
    container.innerHTML = '';

    // Floating button
    if (!state.isOpen && !state.isSuccess) {
      var btn = el('button', 'btn', {}, [
        el('span', 'btn_icon', { html: bugIcon(20, 20) }),
        el('span', 'btn_label', { text: 'Report a Bug' }),
      ]);
      btn.style.pointerEvents = 'auto';
      on(btn, 'click', openModal);
      container.appendChild(btn);
      return;
    }

    // Success: small reset button
    if (state.isSuccess && !state.isOpen) {
      var rbtn = el('button', 'btn', {}, [
        el('span', 'btn_icon', { html: bugIcon(20, 20) }),
        el('span', 'btn_label', { text: 'Report a Bug' }),
      ]);
      rbtn.style.pointerEvents = 'auto';
      on(rbtn, 'click', function () { state.isSuccess = false; render(); });
      container.appendChild(rbtn);
      return;
    }

    // --- Overlay ---
    var overlay = el('div', 'overlay');
    on(overlay, 'click', function (e) { if (e.target === overlay) closeModal(); });

    // Modal
    var modal = el('div', 'modal');

    // Success inside modal
    if (state.isSuccess) {
      modal.appendChild(el('div', 'success', {}, [
        el('div', 'success_icon', { html: checkIcon() }),
        el('div', 'success_title', { text: "Thanks! Report sent." }),
        el('div', 'success_text', { text: "Your bug report has been submitted. We'll review it and follow up if needed." }),
      ]));
      overlay.appendChild(modal);
      container.appendChild(overlay);
      return;
    }

    // Header
    var header = el('div', 'header');
    header.appendChild(el('div', 'title', {}, [
      el('span', 'title_icon', { html: bugIcon(20, 20) }),
      document.createTextNode('Report a Bug'),
    ]));
    var closeBtn = el('button', 'close', { html: closeIcon() });
    on(closeBtn, 'click', closeModal);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Error
    if (state.error) {
      modal.appendChild(el('div', 'error', { text: state.error }));
    }

    // Body
    var body = el('div', 'body');

    // Description
    var descField = el('div', 'field');
    descField.appendChild(el('label', 'label', { text: 'What happened?' }));
    var textarea = el('textarea', 'textarea', { placeholder: 'Describe the bug you encountered...' });
    on(textarea, 'input', function () { state.error = ''; });
    descField.appendChild(textarea);
    body.appendChild(descField);

    // Screenshot
    var ssField = el('div', 'field');
    ssField.appendChild(el('label', 'label', { text: 'Screenshot' }));
    var ssArea = el('div', 'ss_area');
    if (state.screenshotLoading) {
      ssArea.innerHTML = '<div class="' + PREFIX + '_ss_loading">' + spinIcon() + 'Capturing page...</div>';
    } else if (state.screenshot) {
      var img = el('img', 'ss_img', { src: state.screenshot, alt: 'Page screenshot' });
      ssArea.appendChild(img);
    } else {
      ssArea.innerHTML = '<div class="' + PREFIX + '_ss_placeholder">Screenshot not available</div>';
    }
    ssField.appendChild(ssArea);
    body.appendChild(ssField);

    // Email
    var emailField = el('div', 'field');
    var emailLabel = el('label', 'label');
    emailLabel.innerHTML = 'Your email <span class="' + PREFIX + '_label_opt">(optional)</span>';
    emailField.appendChild(emailLabel);
    var emailInput = el('input', 'input', { type: 'email', placeholder: 'you@example.com' });
    emailField.appendChild(emailInput);
    body.appendChild(emailField);

    modal.appendChild(body);

    // Actions
    var actions = el('div', 'actions');
    var cancelBtn = el('button', 'btn_cancel', { text: 'Cancel' });
    on(cancelBtn, 'click', closeModal);
    actions.appendChild(cancelBtn);

    var submitBtn = el('button', 'btn_submit', {
      text: state.isSubmitting ? 'Sending...' : 'Send Report',
      disabled: state.isSubmitting,
    });
    on(submitBtn, 'click', function () { handleSubmit(textarea, emailInput); });
    actions.appendChild(submitBtn);
    modal.appendChild(actions);

    // Branding
    modal.appendChild(el('div', 'branding', { text: 'Powered by BugBite' }));

    overlay.appendChild(modal);
    container.appendChild(overlay);
  }

  // --- Lazy-load html2canvas ---
  function loadHtml2Canvas() {
    return new Promise(function (resolve, reject) {
      if (state.html2canvasLoaded) { resolve(window.html2canvas); return; }
      if (typeof window.html2canvas === 'function') {
        state.html2canvasLoaded = true;
        resolve(window.html2canvas);
        return;
      }
      var script = document.createElement('script');
      script.src = HTML2CANVAS_CDN;
      script.onload = function () {
        state.html2canvasLoaded = true;
        if (typeof window.html2canvas === 'function') resolve(window.html2canvas);
        else reject(new Error('html2canvas loaded but not available'));
      };
      script.onerror = function () { reject(new Error('Failed to load html2canvas from CDN')); };
      document.head.appendChild(script);
    });
  }

  // --- Capture screenshot ---
  function captureScreenshot() {
    state.screenshotLoading = true;
    render();

    loadHtml2Canvas()
      .then(function (html2canvas) {
        var docHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          document.documentElement.clientHeight
        );
        var scale = docHeight > 4000 ? 0.5 : docHeight > 2000 ? 0.75 : 1;
        return html2canvas(document.body, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: docHeight,
        });
      })
      .then(function (canvas) {
        state.screenshot = canvas.toDataURL('image/png', 0.8);
        state.screenshotLoading = false;
        state.error = '';
        render();
      })
      .catch(function (err) {
        console.warn('[BugBite] Screenshot capture failed:', err.message || err);
        state.screenshot = null;
        state.screenshotLoading = false;
        render();
      });
  }

  // --- Open modal ---
  function openModal() {
    state.isOpen = true;
    state.isSuccess = false;
    state.isSubmitting = false;
    state.error = '';
    state.screenshot = null;
    state.screenshotLoading = false;
    render();
    captureScreenshot();
  }

  // --- Close modal ---
  function closeModal() {
    state.isOpen = false;
    state.isSubmitting = false;
    state.error = '';
    render();
  }

  // --- Handle submit ---
  function handleSubmit(textareaEl, emailEl) {
    var description = (textareaEl.value || '').trim();
    if (!description) {
      state.error = 'Please describe the bug before submitting.';
      render();
      return;
    }

    state.isSubmitting = true;
    state.error = '';
    render();

    var payload = {
      project_id: projectId,
      description: description,
      screenshot: state.screenshot || null,
      browser_info: {
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        url: window.location.href,
        language: navigator.language,
        platform: navigator.platform,
      },
      reporter_email: (emailEl.value || '').trim() || null,
    };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (resp) {
        if (!resp.ok) {
          return resp.json().then(function (data) {
            throw new Error(data.error || 'Request failed with status ' + resp.status);
          });
        }
        return resp.json();
      })
      .then(function () {
        state.isSubmitting = false;
        state.isSuccess = true;
        state.isOpen = false;
        state.error = '';
        render();
      })
      .catch(function (err) {
        console.error('[BugBite] Submit failed:', err.message || err);
        state.isSubmitting = false;
        state.error = 'Failed to send report: ' + (err.message || 'Unknown error') + '. Please try again.';
        render();
      });
  }

  // --- Initial render ---
  render();
})();
