import { Marked } from "marked";
import { useMemo } from "react";
import { highlight } from "../lib/highlight";

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      return `<pre><code>${highlight(text, (lang ?? "").split(/\s+/)[0])}</code></pre>\n`;
    },
    link({ href, title, tokens }) {
      const inner = this.parser.parseInline(tokens);
      const external = /^https?:\/\//i.test(href);
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noopener"' : ""}>${inner}</a>`;
    },
  },
});

interface Props {
  source: string;
  /** "explain" styles a list so each point starts with its piece of code. */
  variant?: "explain";
}

/** Lesson text. The Markdown comes from this site's own lesson files. */
export function Markdown({ source, variant }: Props) {
  const html = useMemo(() => marked.parse(source, { async: false }), [source]);
  return <div className={variant === "explain" ? "prose prose--explain" : "prose"} dangerouslySetInnerHTML={{ __html: html }} />;
}
