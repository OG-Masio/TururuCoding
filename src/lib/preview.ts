import type { LessonFile, Mode } from './lessons';

// React and Babel are served by this site (public/vendor), so previews don't
// depend on outside servers. Absolute URLs, because the preview frame is "about:srcdoc".
const vendor = (file: string) => `${location.origin}/vendor/${file}`;

// Sends console.log output and errors from the preview up to the lesson page,
// so they can be shown in the Console panel under the preview.
const ERROR_CATCHER = `<script>
(function () {
  // The preview runs in a locked-down frame where the real localStorage is blocked.
  // This stand-in keeps the same API and saves through the lesson page instead.
  var data = __SEED__;
  var store = {
    getItem: function (k) { k = String(k); return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem: function (k, v) { data[String(k)] = String(v); sync(); },
    removeItem: function (k) { delete data[String(k)]; sync(); },
    clear: function () { data = {}; sync(); },
    key: function (i) { return Object.keys(data)[i] || null; },
    get length() { return Object.keys(data).length; }
  };
  function sync() { try { parent.postMessage({ tururu: 'storage', data: data }, '*'); } catch (e) {} }
  try { Object.defineProperty(window, 'localStorage', { value: store, configurable: true }); } catch (e) {}

  function fmt(v) {
    if (typeof v === 'string') return v;
    if (v instanceof Error) return v.name + ': ' + v.message;
    try { return JSON.stringify(v, null, 2); } catch (e) { return String(v); }
  }
  var NOISE = /in-browser Babel transformer|Download the React DevTools/;
  function send(level, args) {
    var text = Array.prototype.map.call(args, fmt).join(' ');
    if (NOISE.test(text)) return;
    try { parent.postMessage({ tururu: 'console', level: level, text: text }, '*'); } catch (e) {}
  }
  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var orig = console[level];
    console[level] = function () { send(level, arguments); orig.apply(console, arguments); };
  });
  window.addEventListener('error', function (e) { send('error', [e.message]); });
  window.addEventListener('unhandledrejection', function (e) { send('error', ['Unhandled promise error: ' + fmt(e.reason)]); });
})();
</script>`;

function get(files: LessonFile[], name: string) {
  return files.find((f) => f.name === name)?.code;
}

function buildWeb(files: LessonFile[], head: string): string {
  let html = get(files, 'index.html') ?? '<body></body>';
  // Inline every linked .css and .js file so the preview works without a server.
  for (const f of files) {
    if (f.name.endsWith('.css')) {
      const re = new RegExp(`<link[^>]*href=["']\\.?/?${escapeRe(f.name)}["'][^>]*>`, 'g');
      html = html.replace(re, () => `<style>\n${f.code}\n</style>`);
    }
    if (f.name.endsWith('.js')) {
      const re = new RegExp(`<script([^>]*)src=["']\\.?/?${escapeRe(f.name)}["']([^>]*)>\\s*</script>`, 'g');
      html = html.replace(re, (_m, a: string, b: string) => {
        const attrs = (a + b).replace(/\s*defer\s*/g, ' ');
        return `<script${attrs}>\n${f.code}\n</script>`;
      });
    }
  }
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + head);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => m + head);
  return head + html;
}

function toBrowserReact(code: string): string {
  return code
    // In the browser preview every file shares one script, and React is a global,
    // so import lines are dropped. (The VS Code version keeps them.)
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?[ \t]*$/gm, '')
    .replace(/^\s*import\s+['"][^'"]+['"];?[ \t]*$/gm, '')
    .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
    .replace(/export\s+default\s+\w+;?/g, '')
    .replace(/export\s+(function|const|let)/g, '$1');
}

function buildReact(files: LessonFile[], head: string): string {
  const css = files.filter((f) => f.name.endsWith('.css')).map((f) => f.code).join('\n');
  // Components other than App.jsx load first, then App.jsx.
  const jsx = files.filter((f) => /\.(jsx|js)$/.test(f.name));
  jsx.sort((a, b) => (a.name === 'App.jsx' ? 1 : b.name === 'App.jsx' ? -1 : 0));
  const code = jsx.map((f) => `// ${f.name}\n${toBrowserReact(f.code)}`).join('\n\n');
  return `<!doctype html><html><head><meta charset="utf-8">${head}
<style>${css}</style>
<script src="${vendor('react.development.js')}"></script><script src="${vendor('react-dom.development.js')}"></script><script src="${vendor('babel.min.js')}"></script>
</head><body><div id="root"></div>
<script type="text/babel" data-presets="react">
const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Fragment } = React;
${code}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script></body></html>`;
}

function buildCode(files: LessonFile[]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<!doctype html><body style="font-family:system-ui;padding:16px;color:#333">
<p><b>This lesson runs on your computer, not in the browser.</b><br>Download the VS Code folder and follow the steps in its README.</p>
${files.map((f) => `<h4>${esc(f.name)}</h4><pre style="background:#f4f4f4;padding:8px;overflow:auto">${esc(f.code)}</pre>`).join('')}
</body>`;
}

// `storage` is what the preview saved in localStorage last time (see ERROR_CATCHER).
export function buildPreview(mode: Mode, files: LessonFile[], storage: Record<string, string> = {}): string {
  // "<" is escaped so saved text can never close the script tag early.
  const head = ERROR_CATCHER.replace('__SEED__', () => JSON.stringify(storage).replace(/</g, '\\u003c'));
  if (mode === 'react') return buildReact(files, head);
  if (mode === 'code') return buildCode(files);
  return buildWeb(files, head);
}

const SANDBOX_KEY = 'tururu.sandbox.';
export function readSandboxStorage(lessonId: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SANDBOX_KEY + lessonId) ?? '{}');
  } catch {
    return {};
  }
}
export function writeSandboxStorage(lessonId: string, data: unknown) {
  try {
    const clean: Record<string, string> = {};
    if (data && typeof data === 'object') for (const [k, v] of Object.entries(data)) clean[k] = String(v);
    localStorage.setItem(SANDBOX_KEY + lessonId, JSON.stringify(clean));
  } catch {
    /* storage blocked: the preview still works, it just won't remember */
  }
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
