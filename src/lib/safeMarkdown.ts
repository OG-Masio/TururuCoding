/**
 * Markdown from the AI tutor, made safe to show.
 *
 * Lesson text comes from this site's own files, so it may contain HTML. An
 * answer from a model is different: nothing in it is trusted. Every piece of
 * raw HTML is shown as text, links can only go to web pages, and images are
 * never loaded.
 */
import { Marked } from "marked";
import { highlight } from "./highlight";

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const LANGUAGES: Record<string, string> = { html: "html", htm: "html", xml: "html", css: "css", js: "js", javascript: "js", jsx: "jsx", ts: "ts", typescript: "ts", tsx: "tsx" };

const safe = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    code({ text, lang }) {
      const language = LANGUAGES[(lang ?? "").trim().split(/\s+/)[0].toLowerCase()];
      return `<pre><code>${language ? highlight(text, language) : escapeHtml(text)}</code></pre>\n`;
    },
    link({ href, tokens }) {
      const inner = this.parser.parseInline(tokens);
      return /^https?:\/\//i.test(href) ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : inner;
    },
    image({ text }) {
      return escapeHtml(text);
    },
  },
});

export const renderSafeMarkdown = (source: string): string => safe.parse(source, { async: false });
