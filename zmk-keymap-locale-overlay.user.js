// ==UserScript==
// @name ZMK Keymap Editor – Locale Overlay
// @namespace http://tampermonkey.net/
// @version 1.0.0
// @description Translates displayed key labels in the ZMK Keymap Editor to your keyboard locale
// @author krola1
// @match https://nickcoutsos.github.io/keymap-editor/*
// @grant GM_setValue
// @grant GM_getValue
// @run-at document-idle
// ==/UserScript==

/*
 * ZMK Keymap Editor – Locale Overlay
 * ----------------------------------
 *
 * Installation
 *   1. Install the Tampermonkey (Chrome/Edge/Firefox) or Violentmonkey
 *      browser extension.
 *   2. Open this file's raw URL in your browser and confirm the install
 *      prompt, or paste the contents into a new userscript.
 *   3. Visit https://nickcoutsos.github.io/keymap-editor/ — a small
 *      "🌐 Locale Overlay" panel appears in the bottom-right corner.
 *
 * Usage
 *   - Pick your locale from the dropdown; key labels in the editor are
 *     replaced visually with what your OS will actually produce.
 *   - Untick "Enabled" to temporarily turn the overlay off.
 *   - Hover any translated key to peek at the original ZMK keycode.
 *
 * Adding a new layout
 *   Edit the LAYOUTS object below. Each entry is:
 *
 *     <iso-code>: {
 *       label: 'Human readable name',
 *       map: {
 *         <ZMK_CODE>: '<replacement text>',
 *         ...
 *       }
 *     }
 *
 *   ZMK codes are written exactly as they appear in the editor's title
 *   attribute, e.g. APOS, SEMI, LBKT, N1, LS(N2), etc. The replacement
 *   value is whatever string you want displayed on the key.
 *
 * Scope
 *   This script is PURELY VISUAL. It never edits the keymap, never
 *   touches React state, and never sends anything anywhere. The data
 *   that the editor exports is exactly what you typed in — only the
 *   on-screen labels change.
 *
 * Source files consulted to determine DOM targeting
 *   nickcoutsos/keymap-editor:
 *     - app/src/Keyboard/Keys/KeyValue.js
 *         Each keycode is rendered as
 *           <span className={styles.code}
 *                 title={`(${source.code}) ${source.description}`}>
 *             {icon || source.symbol || source.code || <NullKey/>}
 *           </span>
 *         → the `title` attribute is the most reliable source of the
 *           original ZMK code; visible text is symbol-or-code and
 *           sometimes an <Icon/>.
 *     - app/src/Keyboard/Keys/styles.module.css
 *         Uses CSS Modules, so class names are hashed at build time
 *         (e.g. `_code_ab12c`). We therefore do NOT select by class
 *         name; we select by the `title="(CODE) ..."` pattern instead.
 *     - app/src/Keyboard/Keys/Key.js
 *         Wraps everything in <div class="<hashed>key" data-label=...>
 *         and also renders a `behaviour-binding` span with no title
 *         attribute — naturally excluded by our title-based selector.
 */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Storage shims (fall back to localStorage when GM_* isn't granted,
  // e.g. when pasted into the devtools console for debugging).
  // ------------------------------------------------------------------
  const storage = {
    get(key, def) {
      try {
        if (typeof GM_getValue === 'function') return GM_getValue(key, def);
      } catch (_) { /* sandbox */ }
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return def;
        return JSON.parse(raw);
      } catch (_) { return def; }
    },
    set(key, val) {
      try {
        if (typeof GM_setValue === 'function') { GM_setValue(key, val); return; }
      } catch (_) { /* sandbox */ }
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) { /* ignore */ }
    }
  };

  // ------------------------------------------------------------------
  // Layout mapping tables
  //
  // Keys are ZMK codes as they appear in the editor's `title` attribute.
  // Use the bare code (e.g. "APOS") for the unshifted keycode; use the
  // full modifier form (e.g. "LS(N2)") for shifted/composite codes that
  // the editor exposes that way. Values are the on-screen replacement.
  // ------------------------------------------------------------------
  const LAYOUTS = {
    us: {
      label: 'US – no translation',
      map: {}
    },

    // Norwegian Bokmål (ISO nb_NO). Physical key positions are the
    // ZMK / US codes; values are what the key actually produces when
    // the OS layout is Norwegian.
    nb: {
      label: 'Norwegian (nb)',
      map: {
        // Letter row extensions
        APOS: 'Æ',
        SQT:  'Æ',
        SEMI: 'Ø',
        LBKT: 'Å',
        RBKT: '¨',

        // Other ANSI punctuation that moves on the Norwegian layout
        BSLH: "'",
        SLASH: '-',
        MINUS: '+',
        EQUAL: '\\',
        GRAVE: '|',
        NUBS: '<',         // non-US backslash, present on ISO boards

        // Shifted variants (when the editor encodes them as LS(...))
        'LS(APOS)':  'Æ',
        'LS(SQT)':   'Æ',
        'LS(SEMI)':  'Ø',
        'LS(LBKT)':  'Å',
        'LS(RBKT)':  '^',
        'LS(BSLH)':  '*',
        'LS(SLASH)': '_',
        'LS(MINUS)': '?',
        'LS(EQUAL)': '`',
        'LS(GRAVE)': '§',
        'LS(NUBS)':  '>',

        // Number row shifted symbols differ from US on Norwegian
        'LS(N1)': '!',
        'LS(N2)': '"',
        'LS(N3)': '#',
        'LS(N4)': '¤',
        'LS(N5)': '%',
        'LS(N6)': '&',
        'LS(N7)': '/',
        'LS(N8)': '(',
        'LS(N9)': ')',
        'LS(N0)': '='
      }
    },

    // Partial - expand as needed
    sv: {
      label: 'Swedish (sv)',
      map: {
        APOS: 'Ä',
        SQT:  'Ä',
        SEMI: 'Ö',
        LBKT: 'Å',
        RBKT: '¨',
        BSLH: "'",
        SLASH: '-',
        MINUS: '+',
        EQUAL: '\\',
        GRAVE: '§',
        NUBS:  '<'
      }
    },

    // Partial - expand as needed
    fi: {
      label: 'Finnish (fi)',
      map: {
        APOS: 'Ä',
        SQT:  'Ä',
        SEMI: 'Ö',
        LBKT: 'Å',
        RBKT: '¨',
        BSLH: "'",
        SLASH: '-',
        MINUS: '+',
        EQUAL: '\\',
        GRAVE: '§',
        NUBS:  '<'
      }
    },

    // Partial - expand as needed
    de: {
      label: 'German (de)',
      map: {
        APOS: 'Ä',
        SQT:  'Ä',
        SEMI: 'Ö',
        LBKT: 'Ü',
        RBKT: '+',
        BSLH: '#',
        SLASH: '-',
        MINUS: 'ß',
        EQUAL: '´',
        GRAVE: '^',
        NUBS:  '<',
        Y:    'Z',
        Z:    'Y'
      }
    }
  };

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const state = {
    layout:    storage.get('locale_overlay_layout', 'nb'),
    enabled:   storage.get('locale_overlay_enabled', true),
    collapsed: storage.get('locale_overlay_collapsed', false)
  };
  if (!LAYOUTS[state.layout]) state.layout = 'nb';

  function currentMap() {
    return (LAYOUTS[state.layout] && LAYOUTS[state.layout].map) || {};
  }

  // ------------------------------------------------------------------
  // DOM targeting
  //
  // KeyValue.js sets title={`(${source.code}) ${source.description}`}.
  // We therefore look for any <span> whose title matches that exact
  // pattern. This avoids the hashed CSS-module class name and naturally
  // skips the `behaviour-binding` span (which has no title).
  // ------------------------------------------------------------------
  const SELECTOR = 'span[title^="("]';
  const TITLE_RE = /^\(([^)]+)\)\s/;

  function extractCode(span) {
    const t = span.getAttribute('title');
    if (!t) return null;
    const m = TITLE_RE.exec(t);
    return m ? m[1] : null;
  }

  // True if the span renders simple text (i.e. not an <Icon> or NullKey).
  // We refuse to overwrite spans that contain child elements so that
  // FontAwesome icons keep working.
  function isPlainTextSpan(span) {
    return span.childElementCount === 0;
  }

  function translateNode(span) {
    if (!(span instanceof Element)) return;
    if (!span.matches(SELECTOR)) return;

    const code = extractCode(span);
    if (!code) return;

    // Cache original visible text on the first visit.
    if (!span.hasAttribute('data-original')) {
      if (!isPlainTextSpan(span)) return; // icon/NullKey – leave alone
      span.setAttribute('data-original', span.textContent);
    }
    const original = span.getAttribute('data-original');

    const map = currentMap();
    const translated = Object.prototype.hasOwnProperty.call(map, code)
      ? map[code]
      : null;

    if (state.enabled && translated !== null && isPlainTextSpan(span)) {
      if (span.textContent !== translated) span.textContent = translated;
      span.setAttribute('data-locale-overlay-translated', '1');
      bindHover(span);
    } else {
      // Restore original whenever we're disabled or have no translation.
      if (isPlainTextSpan(span) && span.textContent !== original) {
        span.textContent = original;
      }
      span.removeAttribute('data-locale-overlay-translated');
      span.classList.remove('locale-overlay-hint');
    }
  }

  // ------------------------------------------------------------------
  // Hover: temporarily reveal the original keycode
  // ------------------------------------------------------------------
  function onEnter(e) {
    const span = e.currentTarget;
    if (!state.enabled) return;
    if (span.getAttribute('data-locale-overlay-translated') !== '1') return;
    const original = span.getAttribute('data-original');
    if (original === null) return;
    span.textContent = original;
    span.classList.add('locale-overlay-hint');
  }
  function onLeave(e) {
    const span = e.currentTarget;
    if (span.getAttribute('data-locale-overlay-translated') !== '1') {
      span.classList.remove('locale-overlay-hint');
      return;
    }
    const code = extractCode(span);
    const map = currentMap();
    if (code && Object.prototype.hasOwnProperty.call(map, code)) {
      span.textContent = map[code];
    }
    span.classList.remove('locale-overlay-hint');
  }
  function bindHover(span) {
    if (span.getAttribute('data-locale-overlay-bound') === '1') return;
    span.addEventListener('mouseenter', onEnter);
    span.addEventListener('mouseleave', onLeave);
    span.setAttribute('data-locale-overlay-bound', '1');
  }

  // ------------------------------------------------------------------
  // Apply / observe
  // ------------------------------------------------------------------
  function applyTranslations(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(SELECTOR).forEach(translateNode);
  }

  let observer = null;
  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.target instanceof Element) {
          translateNode(m.target);
          continue;
        }
        m.addedNodes && m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches && node.matches(SELECTOR)) translateNode(node);
          if (node.querySelectorAll) {
            node.querySelectorAll(SELECTOR).forEach(translateNode);
          }
        });
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['title']
    });
  }

  // ------------------------------------------------------------------
  // Styles (hover hint + floating panel)
  // ------------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('locale-overlay-styles')) return;
    const style = document.createElement('style');
    style.id = 'locale-overlay-styles';
    style.textContent = `
      .locale-overlay-hint {
        font-style: italic;
        opacity: 0.65;
      }
      #locale-overlay-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                     Helvetica, Arial, sans-serif;
        font-size: 13px;
        color: #fff;
        background: rgba(30, 30, 34, 0.92);
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        min-width: 200px;
        user-select: none;
      }
      #locale-overlay-panel .lo-header {
        padding: 8px 12px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      #locale-overlay-panel .lo-header .lo-caret {
        font-size: 10px;
        opacity: 0.7;
      }
      #locale-overlay-panel .lo-body {
        padding: 4px 12px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #locale-overlay-panel[data-collapsed="true"] .lo-body {
        display: none;
      }
      #locale-overlay-panel select {
        width: 100%;
        padding: 4px 6px;
        background: #1e1e22;
        color: #fff;
        border: 1px solid #444;
        border-radius: 4px;
        font: inherit;
      }
      #locale-overlay-panel label.lo-enabled {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  // ------------------------------------------------------------------
  // Floating UI panel
  // ------------------------------------------------------------------
  function buildPanel() {
    if (document.getElementById('locale-overlay-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'locale-overlay-panel';
    panel.setAttribute('data-collapsed', String(state.collapsed));

    const header = document.createElement('div');
    header.className = 'lo-header';
    header.innerHTML = '<span>🌐 Locale Overlay</span><span class="lo-caret"></span>';
    const caret = header.querySelector('.lo-caret');
    const updateCaret = () => { caret.textContent = state.collapsed ? '▸' : '▾'; };
    updateCaret();
    header.addEventListener('click', () => {
      state.collapsed = !state.collapsed;
      panel.setAttribute('data-collapsed', String(state.collapsed));
      storage.set('locale_overlay_collapsed', state.collapsed);
      updateCaret();
    });

    const body = document.createElement('div');
    body.className = 'lo-body';

    // Layout dropdown – "us" forced to be the first option per spec.
    const select = document.createElement('select');
    const order = ['us', ...Object.keys(LAYOUTS).filter(k => k !== 'us')];
    for (const key of order) {
      if (!LAYOUTS[key]) continue;
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = LAYOUTS[key].label;
      if (key === state.layout) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', () => {
      state.layout = select.value;
      storage.set('locale_overlay_layout', state.layout);
      applyTranslations();
    });

    const enabledLbl = document.createElement('label');
    enabledLbl.className = 'lo-enabled';
    const enabled = document.createElement('input');
    enabled.type = 'checkbox';
    enabled.checked = !!state.enabled;
    enabled.addEventListener('change', () => {
      state.enabled = enabled.checked;
      storage.set('locale_overlay_enabled', state.enabled);
      applyTranslations();
    });
    enabledLbl.appendChild(enabled);
    enabledLbl.appendChild(document.createTextNode('Enabled'));

    body.appendChild(select);
    body.appendChild(enabledLbl);

    panel.appendChild(header);
    panel.appendChild(body);
    document.body.appendChild(panel);
  }

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  function init() {
    injectStyles();
    buildPanel();
    startObserver();

    // The React keyboard may not be in the DOM yet at document-idle.
    // Run an initial pass and poll briefly until the first key spans
    // appear, then let the MutationObserver take over.
    applyTranslations();
    let tries = 0;
    const poll = setInterval(() => {
      tries++;
      if (document.querySelector(SELECTOR)) {
        applyTranslations();
        clearInterval(poll);
      } else if (tries > 120) {           // ~60s
        clearInterval(poll);
      }
    }, 500);
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
