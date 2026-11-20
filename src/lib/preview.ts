/**
 * Builds the page that runs inside the preview frame.
 *
 * The files from the editor are combined into one HTML document:
 *   <link rel="stylesheet" href="style.css">  becomes  <style>…</style>
 *   <script src="script.js"></script>         becomes  <script>…</script>
 *   images/…                                  points at the sample images of this site
 *
 * A small helper script is added. It sends console output and errors to the
 * lesson page, runs the lesson's checks, and keeps links and forms from
 * replacing the preview with another site.
 *
 * The frame is sandboxed without "allow-same-origin": code typed in a lesson
 * can never read this site's storage (your progress or your device key).
 */
import type { Files } from "./lesson";

export const SANDBOX = "allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox";

/** Runs inside the preview. Kept on one line so error line numbers match the editor. */
const helperSource = (token: string) =>
  `(function(){var T=${JSON.stringify(token)};var P=window.parent;` +
  `function send(m){m.tc=T;try{P.postMessage(m,"*")}catch(e){}}` +
  `function show(v){if(typeof v==="string")return v;if(v instanceof Error)return v.name+": "+v.message;if(v instanceof Element){var h=v.outerHTML;return h.length>200?h.slice(0,200)+"…":h}if(typeof v==="function")return "function "+(v.name||"")+"()";try{var s=JSON.stringify(v,null,1);return s===undefined?String(v):s.replace(/\\n\\s*/g," ")}catch(e){return String(v)}}` +
  `["log","info","warn","error","debug"].forEach(function(k){var o=console[k];console[k]=function(){var a=[].slice.call(arguments);send({type:"console",level:k==="debug"?"log":k,text:a.map(show).join(" ")});if(o)o.apply(console,a)}});` +
  `window.addEventListener("error",function(e){if(e.target&&e.target!==window&&e.target.tagName){var t=e.target;send({type:"console",level:"error",text:"Could not load "+t.tagName.toLowerCase()+": "+(t.getAttribute("src")||t.getAttribute("href")||"")});return}send({type:"console",level:"error",text:(e.message||"Error")+(e.lineno?" (line "+e.lineno+")":"")})},true);` +
  `window.addEventListener("unhandledrejection",function(e){send({type:"console",level:"error",text:"Uncaught (in promise) "+show(e.reason)})});` +
  `function note(t){var d=document.getElementById("tc-note");if(!d){d=document.createElement("div");d.id="tc-note";d.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;padding:8px 12px;font:14px/1.4 system-ui,sans-serif;color:#16243a;background:#ffe24d;border:2px solid #16243a;border-radius:3px;white-space:pre-wrap";(document.body||document.documentElement).appendChild(d)}d.textContent=t;clearTimeout(note.t);note.t=setTimeout(function(){d.remove()},6000)}` +
  `document.addEventListener("click",function(e){var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;if(!a||e.defaultPrevented)return;var h=a.getAttribute("href")||"";if(h.charAt(0)==="#"){e.preventDefault();var el=h.length>1?document.getElementById(decodeURIComponent(h.slice(1))):document.documentElement;if(el)el.scrollIntoView({behavior:"smooth"});else note("No element has the id \\""+h.slice(1)+"\\".");return}if(/^(mailto:|tel:)/i.test(h)){e.preventDefault();note("This link would open: "+h);return}if(/^(https?:)?\\/\\//i.test(h)){e.preventDefault();window.open(a.href,"_blank","noopener");return}e.preventDefault();send({type:"navigate",href:h})});` +
  `window.addEventListener("submit",function(e){if(e.defaultPrevented)return;e.preventDefault();var f=e.target,L=[];try{new FormData(f).forEach(function(v,k){L.push(k+" = "+(typeof v==="string"?v:"(file)"))})}catch(x){}note(L.length?"Form sent with:\\n"+L.join("\\n"):"Form sent, but no field has a name, so no data would be sent.")});` +
  `window.addEventListener("message",function(e){var d=e.data;if(!d||d.tc!==T||d.type!=="run-checks")return;var r=d.tests.map(function(t){try{return !!(new Function("return ("+t+")")())}catch(x){return false}});send({type:"checks",id:d.id,results:r})});` +
  `function size(){var e=document.documentElement;if(!e)return;var h=Math.ceil(e.getBoundingClientRect().height);if(h&&h!==size.h){size.h=h;send({type:"size",height:h})}}` +
  `function ready(){send({type:"ready"});size();if(window.ResizeObserver)new ResizeObserver(size).observe(document.documentElement)}if(document.readyState==="complete")ready();else window.addEventListener("load",ready)})();`;

const escapeScript = (code: string) => code.replace(/<\/script/gi, "<\\/script");
const escapeStyle = (code: string) => code.replace(/<\/style/gi, "<\\/style");

/** Where the sample images live on this site. */
export const sandboxBase = (): string => {
  const base = import.meta.env?.BASE_URL ?? "/";
  const origin = typeof location !== "undefined" ? location.origin : "";
  return `${origin}${base}sandbox/`;
};

const attr = (tag: string, name: string): string | null => {
  const m = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
};

export interface BuildOptions {
  /** Which file to show. Defaults to index.html. */
  entry?: string;
  /** Random text that marks messages from this preview. */
  token: string;
  /** Address of the folder that holds sample images. */
  assetBase: string;
}

export function buildPreview(files: Files, options: BuildOptions): string {
  const entry = options.entry && options.entry in files ? options.entry : "index.html" in files ? "index.html" : Object.keys(files).find((f) => f.endsWith(".html"));
  let html = entry ? files[entry] : "";

  // A lesson with only CSS or only JavaScript still needs a page to run in.
  if (!entry) {
    const css = Object.keys(files).filter((f) => f.endsWith(".css"));
    const js = Object.keys(files).filter((f) => f.endsWith(".js"));
    html =
      `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n` +
      css.map((f) => `<link rel="stylesheet" href="${f}">`).join("\n") +
      `\n</head>\n<body>\n` +
      js.map((f) => `<script src="${f}"></script>`).join("\n") +
      `\n</body>\n</html>\n`;
  }

  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = attr(tag, "rel");
    const href = attr(tag, "href");
    if (rel && /stylesheet/i.test(rel) && href && href in files) return `<style data-file="${href}">\n${escapeStyle(files[href])}</style>`;
    return tag;
  });

  html = html.replace(/<script\b([^>]*)>\s*<\/script>/gi, (tag, attrs: string) => {
    const src = attr(`<script ${attrs}>`, "src");
    if (src && src in files) {
      const rest = attrs.replace(/\bsrc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "").trim();
      return `<script data-file="${src}"${rest ? " " + rest : ""}>\n${escapeScript(files[src])}</script>`;
    }
    return tag;
  });

  // Sample images that come with the site: images/bird.svg and so on.
  html = html
    .replace(/(\b(?:src|href|poster)\s*=\s*["'])(?:\.\/)?images\//gi, `$1${options.assetBase}images/`)
    .replace(/(url\(\s*["']?)(?:\.\/)?images\//gi, `$1${options.assetBase}images/`);

  const helper = `<script data-tc-helper>${helperSource(options.token)}</script>`;
  const head = /<head\b[^>]*>/i.exec(html);
  if (head) return html.slice(0, head.index + head[0].length) + helper + html.slice(head.index + head[0].length);
  const htmlTag = /<html\b[^>]*>/i.exec(html);
  if (htmlTag) return html.slice(0, htmlTag.index + htmlTag[0].length) + helper + html.slice(htmlTag.index + htmlTag[0].length);
  const doctype = /<!doctype[^>]*>/i.exec(html);
  if (doctype) return html.slice(0, doctype.index + doctype[0].length) + helper + html.slice(doctype.index + doctype[0].length);
  return helper + html;
}

/** One HTML file with the CSS and JavaScript inside it, for downloading your work. */
export function buildStandalone(files: Files, entry?: string): string {
  const name = entry && entry in files ? entry : "index.html" in files ? "index.html" : Object.keys(files).find((f) => f.endsWith(".html"));
  if (!name) return Object.values(files).join("\n");
  let html = files[name];
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = attr(tag, "rel");
    const href = attr(tag, "href");
    if (rel && /stylesheet/i.test(rel) && href && href in files) return `<style>\n${escapeStyle(files[href])}</style>`;
    return tag;
  });
  html = html.replace(/<script\b([^>]*)>\s*<\/script>/gi, (tag, attrs: string) => {
    const src = attr(`<script ${attrs}>`, "src");
    if (src && src in files) return `<script>\n${escapeScript(files[src])}</script>`;
    return tag;
  });
  return html;
}

export const newToken = (): string => {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};
