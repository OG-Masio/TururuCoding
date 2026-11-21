/**
 * Format: fixes the indentation of a whole file, the way "Format Document" does in VS Code.
 *
 * It uses js-beautify, the same formatter VS Code uses for HTML. It moves code
 * to the right place and never rewrites it: <br> stays <br>, and a line is never
 * broken in the middle of a sentence. The formatter is only loaded when it is
 * first used.
 */

const shared = { indent_size: 2, indent_char: " ", preserve_newlines: true, max_preserve_newlines: 2, end_with_newline: false };

const cssOptions = { ...shared, newline_between_rules: true, selector_separator_newline: true, space_around_combinator: true };

const jsOptions = { ...shared, brace_style: "collapse,preserve-inline" as const, space_before_conditional: true, keep_array_indentation: false };

const htmlOptions = {
  ...shared,
  // <head> and <body> are indented inside <html>, like in the lessons.
  indent_inner_html: true,
  // Never break a long line: where a line ends can change what the page shows.
  wrap_line_length: 0,
  wrap_attributes: "auto" as const,
  extra_liners: [],
  indent_scripts: "normal" as const,
  content_unformatted: ["pre", "textarea"],
  css: cssOptions,
  js: jsOptions,
};

const kindOf = (filename: string): "html" | "css" | "js" | null => {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "css") return "css";
  if (ext === "js" || ext === "mjs" || ext === "json") return "js";
  return null;
};

/** Can this kind of file be formatted? */
export const canFormat = (filename: string) => kindOf(filename) !== null;

/** Returns the code with tidy indentation. The code itself is not changed. */
export async function formatCode(code: string, filename: string): Promise<string> {
  const kind = kindOf(filename);
  if (!kind || code.trim() === "") return code;
  const loaded = await import("js-beautify");
  const beautify = "default" in loaded && loaded.default ? loaded.default : loaded;
  // The package's types do not know "collapse,preserve-inline" (keep short { } on one line), so the options are passed as they are.
  const tidy = kind === "html" ? beautify.html(code, htmlOptions as never) : kind === "css" ? beautify.css(code, cssOptions) : beautify.js(code, jsOptions as never);
  // Keep the last line break the way it was, so formatting twice changes nothing.
  return code.endsWith("\n") ? tidy.replace(/\n*$/, "\n") : tidy.replace(/\n+$/, "");
}
