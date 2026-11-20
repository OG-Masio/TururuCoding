#!/usr/bin/env node
/**
 * Builds src/lib/themes.ts from real VS Code theme files.
 *
 * Nothing here runs when the site is built or published. It is only needed to
 * add or refresh a theme. The colors it writes are checked into the repository.
 *
 * Where the theme files come from:
 *   - tm-themes (npm): the original JSON files of popular VS Code themes,
 *     collected by the Shiki project, each under its own license.
 *   - A few themes that tm-themes does not carry, cloned from their repositories.
 *
 * To run it again:
 *   mkdir theme-src && cd theme-src && npm init -y && npm install tm-themes
 *   git clone --depth 1 https://github.com/ahmadawais/shades-of-purple-vscode extra/shades-of-purple-vscode
 *   git clone --depth 1 https://github.com/wesbos/cobalt2-vscode extra/cobalt2-vscode
 *   git clone --depth 1 https://github.com/johnpapa/vscode-winteriscoming extra/vscode-winteriscoming
 *   git clone --depth 1 https://github.com/enkia/tokyo-night-vscode-theme extra/tokyo-night-vscode-theme
 *   cd .. && node scripts/build-themes.mjs theme-src
 *
 * For every theme it reads the editor colors and resolves the color of each kind
 * of code (tag, attribute, string, …) the way VS Code does, by TextMate scope.
 * For "whole site" mode it derives page colors from the same theme and makes
 * sure text stays readable (WCAG contrast).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(process.argv[2] ?? "theme-src");
const tm = (name) => join(src, "node_modules", "tm-themes", "themes", `${name}.json`);
const extra = (path) => join(src, "extra", path);

/**
 * The themes, in the order they are shown. `hi` is the accent used for the
 * highlighter (buttons, the twist marker): a color from the theme's own palette.
 * Without it, the theme's button or focus color is used.
 */
const LIST = [
  // ── dark
  { id: "dark-plus", name: "Dark+ (VS Code default)", file: tm("dark-plus"), by: "Microsoft", url: "https://github.com/microsoft/vscode", license: "MIT" },
  { id: "one-dark-pro", hi: "#61afef", name: "One Dark Pro", file: tm("one-dark-pro"), by: "binaryify", url: "https://github.com/Binaryify/OneDark-Pro", license: "MIT" },
  { id: "dracula", hi: "#bd93f9", name: "Dracula", file: tm("dracula"), by: "Dracula Theme", url: "https://github.com/dracula/visual-studio-code", license: "MIT" },
  { id: "github-dark", hi: "#2f81f7", name: "GitHub Dark", file: tm("github-dark-default"), by: "GitHub", url: "https://github.com/primer/github-vscode-theme", license: "MIT" },
  { id: "github-dark-dimmed", hi: "#539bf5", name: "GitHub Dark Dimmed", file: tm("github-dark-dimmed"), by: "GitHub", url: "https://github.com/primer/github-vscode-theme", license: "MIT" },
  { id: "night-owl", hi: "#c792ea", name: "Night Owl", file: tm("night-owl"), by: "Sarah Drasner", url: "https://github.com/sdras/night-owl-vscode-theme", license: "MIT" },
  { id: "tokyo-night", hi: "#7aa2f7", name: "Tokyo Night", file: tm("tokyo-night"), by: "enkia", url: "https://github.com/enkia/tokyo-night-vscode-theme", license: "MIT" },
  { id: "tokyo-night-storm", hi: "#7aa2f7", name: "Tokyo Night Storm", file: extra("tokyo-night-vscode-theme/themes/tokyo-night-storm-color-theme.json"), by: "enkia", url: "https://github.com/enkia/tokyo-night-vscode-theme", license: "MIT" },
  { id: "catppuccin-mocha", name: "Catppuccin Mocha", file: tm("catppuccin-mocha"), by: "Catppuccin", url: "https://github.com/catppuccin/vscode", license: "MIT" },
  { id: "catppuccin-macchiato", name: "Catppuccin Macchiato", file: tm("catppuccin-macchiato"), by: "Catppuccin", url: "https://github.com/catppuccin/vscode", license: "MIT" },
  { id: "catppuccin-frappe", name: "Catppuccin Frappé", file: tm("catppuccin-frappe"), by: "Catppuccin", url: "https://github.com/catppuccin/vscode", license: "MIT" },
  { id: "monokai", hi: "#f92672", name: "Monokai", file: tm("monokai"), by: "Microsoft (Monokai by Wimer Hazenberg)", url: "https://github.com/microsoft/vscode", license: "MIT" },
  { id: "nord", hi: "#88c0d0", name: "Nord", file: tm("nord"), by: "Sven Greb", url: "https://github.com/nordtheme/visual-studio-code", license: "MIT" },
  { id: "gruvbox-dark", hi: "#fabd2f", name: "Gruvbox Dark", file: tm("gruvbox-dark-medium"), by: "jdinhify (Gruvbox by Pavel Pertsev)", url: "https://github.com/jdinhify/vscode-theme-gruvbox", license: "MIT" },
  { id: "ayu-dark", name: "Ayu Dark", file: tm("ayu-dark"), by: "teabyii", url: "https://github.com/ayu-theme/vscode-ayu", license: "MIT" },
  { id: "ayu-mirage", name: "Ayu Mirage", file: tm("ayu-mirage"), by: "teabyii", url: "https://github.com/ayu-theme/vscode-ayu", license: "MIT" },
  { id: "palenight", hi: "#c792ea", name: "Material Palenight", file: tm("material-theme-palenight"), by: "Material Theme", url: "https://github.com/antfu/vsc-material-theme", license: "Apache-2.0" },
  { id: "material-ocean", name: "Material Ocean", file: tm("material-theme-ocean"), by: "Material Theme", url: "https://github.com/antfu/vsc-material-theme", license: "Apache-2.0" },
  { id: "synthwave-84", hi: "#ff7edb", name: "SynthWave '84", file: tm("synthwave-84"), by: "Robb Owen", url: "https://github.com/robb0wen/synthwave-vscode", license: "MIT" },
  { id: "shades-of-purple", hi: "#fad000", name: "Shades of Purple", file: extra("shades-of-purple-vscode/themes/shades-of-purple-color-theme.json"), by: "Ahmad Awais", url: "https://github.com/ahmadawais/shades-of-purple-vscode", license: "MIT" },
  { id: "cobalt2", hi: "#ffc600", name: "Cobalt2", file: extra("cobalt2-vscode/theme/cobalt2.json"), by: "Wes Bos", url: "https://github.com/wesbos/cobalt2-vscode", license: "MIT" },
  { id: "winter-is-coming", hi: "#00bff9", name: "Winter is Coming", file: extra("vscode-winteriscoming/themes/WinterIsComing-dark-blue-color-theme.json"), by: "John Papa", url: "https://github.com/johnpapa/vscode-winteriscoming", license: "MIT" },
  { id: "solarized-dark", hi: "#b58900", name: "Solarized Dark", file: tm("solarized-dark"), by: "Microsoft (Solarized by Ethan Schoonover)", url: "https://github.com/microsoft/vscode", license: "MIT" },
  { id: "rose-pine", hi: "#ebbcba", name: "Rosé Pine", file: tm("rose-pine"), by: "Rosé Pine", url: "https://github.com/rose-pine/vscode", license: "MIT" },
  { id: "rose-pine-moon", name: "Rosé Pine Moon", file: tm("rose-pine-moon"), by: "Rosé Pine", url: "https://github.com/rose-pine/vscode", license: "MIT" },
  { id: "everforest-dark", hi: "#dbbc7f", name: "Everforest Dark", file: tm("everforest-dark"), by: "sainnhe", url: "https://github.com/sainnhe/everforest-vscode", license: "MIT" },
  { id: "kanagawa", hi: "#7e9cd8", name: "Kanagawa", file: tm("kanagawa-wave"), by: "paccodes (Kanagawa by rebelot)", url: "https://github.com/paccodes/kanagawa-vscode-theme", license: "MIT" },
  { id: "andromeda", hi: "#00e8c6", name: "Andromeda", file: tm("andromeeda"), by: "Eliver Lara", url: "https://github.com/EliverLara/Andromeda", license: "MIT" },
  { id: "horizon", name: "Horizon", file: tm("horizon"), by: "Alexander Nanberg (Horizon by Jonathan Olaleye)", url: "https://github.com/alexandernanberg/horizon-theme-vscode", license: "MIT" },
  { id: "poimandres", name: "Poimandres", file: tm("poimandres"), by: "pmndrs", url: "https://github.com/drcmda/poimandres-theme", license: "MIT" },
  { id: "vitesse-dark", hi: "#e6cc77", name: "Vitesse Dark", file: tm("vitesse-dark"), by: "Anthony Fu", url: "https://github.com/antfu/vscode-theme-vitesse", license: "MIT" },
  // ── light
  { id: "light-plus", name: "Light+ (VS Code default)", file: tm("light-plus"), by: "Microsoft", url: "https://github.com/microsoft/vscode", license: "MIT" },
  { id: "github-light", hi: "#0969da", name: "GitHub Light", file: tm("github-light-default"), by: "GitHub", url: "https://github.com/primer/github-vscode-theme", license: "MIT" },
  { id: "one-light", hi: "#4078f2", name: "One Light", file: tm("one-light"), by: "Mahmoud Ali", url: "https://github.com/akamud/vscode-theme-onelight", license: "MIT" },
  { id: "solarized-light", hi: "#b58900", name: "Solarized Light", file: tm("solarized-light"), by: "Microsoft (Solarized by Ethan Schoonover)", url: "https://github.com/microsoft/vscode", license: "MIT" },
  { id: "catppuccin-latte", name: "Catppuccin Latte", file: tm("catppuccin-latte"), by: "Catppuccin", url: "https://github.com/catppuccin/vscode", license: "MIT" },
  { id: "ayu-light", hi: "#ffaa33", name: "Ayu Light", file: tm("ayu-light"), by: "teabyii", url: "https://github.com/ayu-theme/vscode-ayu", license: "MIT" },
  { id: "tokyo-night-light", name: "Tokyo Night Light", file: extra("tokyo-night-vscode-theme/themes/tokyo-night-light-color-theme.json"), by: "enkia", url: "https://github.com/enkia/tokyo-night-vscode-theme", license: "MIT" },
  { id: "night-owl-light", name: "Night Owl Light", file: tm("night-owl-light"), by: "Sarah Drasner", url: "https://github.com/sdras/night-owl-vscode-theme", license: "MIT" },
  { id: "gruvbox-light", hi: "#d79921", name: "Gruvbox Light", file: tm("gruvbox-light-medium"), by: "jdinhify (Gruvbox by Pavel Pertsev)", url: "https://github.com/jdinhify/vscode-theme-gruvbox", license: "MIT" },
  { id: "rose-pine-dawn", name: "Rosé Pine Dawn", file: tm("rose-pine-dawn"), by: "Rosé Pine", url: "https://github.com/rose-pine/vscode", license: "MIT" },
  { id: "everforest-light", hi: "#dfa000", name: "Everforest Light", file: tm("everforest-light"), by: "sainnhe", url: "https://github.com/sainnhe/everforest-vscode", license: "MIT" },
  { id: "winter-is-coming-light", name: "Winter is Coming Light", file: extra("vscode-winteriscoming/themes/WinterIsComing-light-color-theme.json"), by: "John Papa", url: "https://github.com/johnpapa/vscode-winteriscoming", license: "MIT" },
  { id: "vitesse-light", hi: "#bda437", name: "Vitesse Light", file: tm("vitesse-light"), by: "Anthony Fu", url: "https://github.com/antfu/vscode-theme-vitesse", license: "MIT" },
  { id: "material-lighter", hi: "#7c4dff", name: "Material Lighter", file: tm("material-theme-lighter"), by: "Material Theme", url: "https://github.com/antfu/vsc-material-theme", license: "Apache-2.0" },
];

// ------------------------------------------------------------------- JSONC

/** Theme files may have comments and trailing commas. */
function parseJsonc(text) {
  let out = "";
  let i = 0;
  let inString = false;
  while (i < text.length) {
    const c = text[i];
    if (inString) {
      out += c;
      if (c === "\\") out += text[++i];
      else if (c === '"') inString = false;
      i++;
    } else if (c === '"') {
      inString = true;
      out += c;
      i++;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
    } else if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i + 2);
      i = i < 0 ? text.length : i + 2;
    } else {
      out += c;
      i++;
    }
  }
  // trailing commas: a comma followed only by white space and } or ]
  let cleaned = "";
  inString = false;
  for (let k = 0; k < out.length; k++) {
    const c = out[k];
    if (inString) {
      cleaned += c;
      if (c === "\\") cleaned += out[++k];
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      cleaned += c;
    } else if (c === ",") {
      let j = k + 1;
      while (j < out.length && /\s/.test(out[j])) j++;
      if (out[j] !== "}" && out[j] !== "]") cleaned += c;
    } else cleaned += c;
  }
  return JSON.parse(cleaned);
}

// ------------------------------------------------------------------ colors

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));

/** "#rgb", "#rgba", "#rrggbb" or "#rrggbbaa" to [r, g, b, a]. */
function parse(hex) {
  if (typeof hex !== "string" || !/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex.trim())) return null;
  let h = hex.trim().slice(1);
  if (h.length <= 4) h = [...h].map((c) => c + c).join("");
  const n = (k) => parseInt(h.slice(k, k + 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
}

const toHex = ([r, g, b]) => "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");

/** Puts a possibly see-through color on top of a solid one. */
function over(color, background) {
  const c = parse(color);
  const b = parse(background);
  if (!c) return null;
  if (!b || c[3] >= 1) return toHex(c);
  return toHex([0, 1, 2].map((k) => c[k] * c[3] + b[k] * (1 - c[3])));
}

/** `amount` of b mixed into a (0 = all a, 1 = all b). */
function mix(a, b, amount) {
  const x = parse(a);
  const y = parse(b);
  return toHex([0, 1, 2].map((k) => x[k] * (1 - amount) + y[k] * amount));
}

function luminance(hex) {
  const [r, g, b] = parse(hex).map((v, i) => {
    if (i === 3) return v;
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function saturation(hex) {
  const [r, g, b] = parse(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/** Moves `color` away from `background` until the contrast is at least `min`. */
function readable(color, background, min) {
  if (contrast(color, background) >= min) return color;
  const target = luminance(background) < 0.4 ? "#ffffff" : "#000000";
  for (let step = 0.05; step <= 1.001; step += 0.05) {
    const candidate = mix(color, target, step);
    if (contrast(candidate, background) >= min) return candidate;
  }
  return target;
}

// ------------------------------------------------------------------ scopes

/**
 * The color a theme gives to a piece of code, by TextMate scope.
 * `stack` goes from the outermost scope to the innermost.
 */
function resolveScope(tokenColors, stack, setting = "foreground") {
  let best = null;
  tokenColors.forEach((rule, order) => {
    // VS Code takes each setting from the most specific rule that has it.
    if (!rule.settings || rule.settings[setting] === undefined) return;
    if (setting === "foreground" && !parse(rule.settings.foreground)) return;
    const selectors = (Array.isArray(rule.scope) ? rule.scope : String(rule.scope ?? "").split(",")).map((s) => s.trim()).filter(Boolean);
    for (const selector of selectors) {
      const parts = selector.split(/\s+/).filter((p) => p !== ">" && !p.startsWith("-"));
      if (!parts.length) continue;
      // the last part must match a scope on the stack; earlier parts must match scopes before it, in order
      for (let depth = stack.length - 1; depth >= 0; depth--) {
        const last = parts[parts.length - 1];
        if (!matches(stack[depth], last)) continue;
        let at = depth - 1;
        let ok = true;
        for (let p = parts.length - 2; p >= 0; p--) {
          while (at >= 0 && !matches(stack[at], parts[p])) at--;
          if (at < 0) {
            ok = false;
            break;
          }
          at--;
        }
        if (!ok) continue;
        const score = [depth, last.split(".").length, parts.length, order];
        if (!best || compare(score, best.score) > 0) best = { score, settings: rule.settings };
        break;
      }
    }
  });
  return best ? best.settings[setting] : null;
}

const matches = (scope, selector) => scope === selector || scope.startsWith(selector + ".");
const compare = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
};

const HTML = ["text.html.derivative", "meta.tag.structure.div.start.html"];
const JS = ["source.js"];
const CSS = ["source.css", "meta.property-list.css"];

/** What each kind of code is called in VS Code. The first stack that has a color wins. */
const ROLES = {
  comment: [[...JS, "comment.line.double-slash.js"], ["text.html.derivative", "comment.block.html"]],
  keyword: [[...JS, "keyword.control.conditional.js"], [...JS, "keyword.control.js"]],
  storage: [[...JS, "meta.var.expr.js", "storage.type.js"], [...JS, "storage.type.js"]],
  string: [[...JS, "string.quoted.double.js"], [...HTML, "meta.attribute.class.html", "string.quoted.double.html"]],
  number: [[...JS, "constant.numeric.decimal.js"]],
  constant: [[...JS, "constant.language.boolean.true.js"], [...JS, "constant.language.js"]],
  tag: [[...HTML, "entity.name.tag.html"]],
  attr: [[...HTML, "meta.attribute.class.html", "entity.other.attribute-name.html"]],
  punct: [[...HTML, "punctuation.definition.tag.begin.html"]],
  property: [[...JS, "meta.var.expr.js", "variable.other.property.js"], [...JS, "meta.object-literal.key.js"]],
  cssprop: [[...CSS, "meta.property-name.css", "support.type.property-name.css"]],
  cssclass: [["source.css", "meta.selector.css", "entity.other.attribute-name.class.css"]],
  cssvalue: [[...CSS, "meta.property-value.css", "support.constant.property-value.css"]],
  function: [[...JS, "meta.function-call.js", "entity.name.function.js"], [...JS, "entity.name.function.js"]],
  variable: [[...JS, "meta.var.expr.js", "variable.other.readwrite.js"], [...JS, "variable.other.readwrite.js"]],
  type: [[...JS, "meta.class.js", "entity.name.type.class.js"], [...JS, "entity.name.type.js"]],
  operator: [[...JS, "keyword.operator.assignment.js"]],
  invalid: [[...JS, "invalid.illegal.js"]],
};

// ------------------------------------------------------------------- build

const first = (...values) => values.find((v) => typeof v === "string" && parse(v)) ?? null;

function build(entry) {
  if (!existsSync(entry.file)) throw new Error(`Theme file not found: ${entry.file}`);
  const theme = parseJsonc(readFileSync(entry.file, "utf8"));
  const colors = theme.colors ?? {};
  const tokenColors = theme.tokenColors ?? [];
  const global = tokenColors.find((r) => !r.scope && r.settings)?.settings ?? {};

  const bgRaw = first(colors["editor.background"], global.background);
  if (!bgRaw) throw new Error(`${entry.id}: no editor background`);
  const bg = over(bgRaw, "#000000");
  const dark = luminance(bg) < 0.3;
  const fgRaw = over(first(colors["editor.foreground"], colors.foreground, global.foreground) ?? (dark ? "#d4d4d4" : "#333333"), bg);
  // Plain text in code is what a learner reads most. It gets at least normal reading contrast.
  const fg = readable(fgRaw, bg, 4.5);
  const solid = (value, on = bg) => (first(value) ? over(value, on) : null);

  // ── the code area
  let bar = solid(first(colors["editorGroupHeader.tabsBackground"], colors["tab.inactiveBackground"], colors["sideBar.background"]));
  if (!bar || contrast(bar, bg) < 1.04) bar = mix(bg, fg, dark ? 0.07 : 0.05);
  const line = mix(bg, fg, 0.2);
  const dim = readable(solid(colors["editorLineNumber.foreground"]) ?? mix(bg, fg, 0.5), bg, 3.2);
  let selection = solid(colors["editor.selectionBackground"]);
  if (!selection || contrast(selection, bg) < 1.25) selection = mix(bg, fg, 0.26);
  let activeLine = solid(colors["editor.lineHighlightBackground"]);
  if (!activeLine || contrast(activeLine, bg) > 1.5) activeLine = mix(bg, fg, 0.06);
  const cursor = readable(solid(colors["editorCursor.foreground"]) ?? fg, bg, 3);

  const tok = {};
  let italicComments = false;
  for (const [role, stacks] of Object.entries(ROLES)) {
    let color = null;
    for (const stack of stacks) {
      color = resolveScope(tokenColors, stack);
      if (color) break;
    }
    tok[role] = color ? over(color, bg) : fgRaw;
    if (role === "comment") italicComments = /italic/.test(resolveScope(tokenColors, stacks[0], "fontStyle") ?? "");
  }
  if (tok.invalid === fgRaw) tok.invalid = solid(first(colors.errorForeground, colors["editorError.foreground"])) ?? (dark ? "#ff7b72" : "#c62828");
  // The theme's own colors are kept. Only a color that is really hard to read is made a little stronger.
  for (const role of Object.keys(tok)) tok[role] = readable(tok[role], bg, role === "comment" ? 3 : 3.5);

  const red = readable(solid(first(colors["terminal.ansiRed"], colors.errorForeground, colors["editorError.foreground"])) ?? tok.invalid, bg, 4.5);
  const yellow = readable(solid(first(colors["terminal.ansiYellow"], colors["editorWarning.foreground"])) ?? (dark ? "#e5c07b" : "#8a6d00"), bg, 4.5);

  // ── the pages, when the theme is used for the whole site
  let paper = solid(colors["sideBar.background"]) ?? bg;
  // A theme whose side bar has the editor's color: make the page a little darker, so code areas stand out.
  if (contrast(paper, bg) < 1.03) paper = mix(bg, "#000000", dark ? 0.16 : 0.035);
  const ink = readable(fg, paper, 9);
  const paper2 = mix(paper, ink, 0.075);
  const pencil = readable(mix(ink, paper, 0.3), paper2, 4.6);
  const rule = mix(paper, ink, 0.2);
  const ruleStrong = mix(paper, ink, 0.4);

  const accentCandidates = [
    colors["button.background"],
    colors["activityBarBadge.background"],
    colors["focusBorder"],
    colors["textLink.foreground"],
    colors["editorCursor.foreground"],
    tok.keyword,
  ]
    .map((c) => solid(c, paper))
    .filter(Boolean);
  const hi = entry.hi ?? accentCandidates.find((c) => saturation(c) > 0.3 && contrast(c, paper) >= 1.9) ?? accentCandidates.find((c) => contrast(c, paper) >= 1.9) ?? ink;
  const labelOn = (color) => (contrast("#ffffff", color) >= contrast("#101418", color) ? "#ffffff" : "#101418");
  const hiInk = labelOn(hi);
  // The same accent inside the code area (the active tab, the marked lines). It must show on the code background.
  const codeHi = contrast(hi, bg) >= 2.4 ? hi : readable(hi, bg, 2.4);

  const green = solid(first(colors["terminal.ansiGreen"], colors["gitDecoration.addedResourceForeground"], colors["editorGutter.addedBackground"]), paper) ?? (dark ? "#62d394" : "#146c3c");
  const done = readable(green, paper, 4.5);
  const link = readable(solid(first(colors["textLink.foreground"], colors["terminal.ansiBlue"]), paper) ?? tok.function, paper, 5);
  const warn = readable(red, paper, 4.5);

  return {
    id: entry.id,
    name: entry.name,
    dark,
    by: entry.by,
    url: entry.url,
    license: entry.license,
    italicComments,
    code: { bg, fg, bar, line, dim, selection, activeLine, cursor, error: red, warn: yellow, hi: codeHi, hiInk: labelOn(codeHi) },
    tok,
    site: { paper, paper2, ink, pencil, rule, ruleStrong, hi, hiInk, done, link, warn },
  };
}

const built = LIST.map(build);

// Report anything a person should look at.
for (const t of built) {
  const notes = [];
  if (contrast(t.code.fg, t.code.bg) < 7) notes.push(`code text ${contrast(t.code.fg, t.code.bg).toFixed(1)}`);
  if (contrast(t.site.ink, t.site.paper) < 9) notes.push(`page text ${contrast(t.site.ink, t.site.paper).toFixed(1)}`);
  if (contrast(t.site.hiInk, t.site.hi) < 4.5) notes.push(`accent label ${contrast(t.site.hiInk, t.site.hi).toFixed(1)}`);
  console.log(`${t.dark ? "dark " : "light"} ${t.id.padEnd(24)} bg ${t.code.bg} fg ${t.code.fg} tag ${t.tok.tag} attr ${t.tok.attr} str ${t.tok.string} hi ${t.site.hi} ${notes.join(", ")}`);
}

const header = `/**
 * Colors of popular VS Code themes.
 *
 * GENERATED by scripts/build-themes.mjs from the themes' own files. Do not edit by hand.
 * Every theme belongs to its authors. See THEMES.md for names, links and licenses.
 */

export interface ThemePalette {
  id: string;
  name: string;
  dark: boolean;
  /** Who made the theme, and where it lives. */
  by: string;
  url: string;
  license: string;
  italicComments: boolean;
  /** The code area: editor, answer boxes, console. */
  code: { bg: string; fg: string; bar: string; line: string; dim: string; selection: string; activeLine: string; cursor: string; error: string; warn: string; hi: string; hiInk: string };
  /** One color per kind of code. */
  tok: Record<
    | "comment" | "keyword" | "storage" | "string" | "number" | "constant" | "tag" | "attr" | "punct" | "property"
    | "cssprop" | "cssclass" | "cssvalue" | "function" | "variable" | "type" | "operator" | "invalid",
    string
  >;
  /** The pages, when the theme colors the whole site. */
  site: { paper: string; paper2: string; ink: string; pencil: string; rule: string; ruleStrong: string; hi: string; hiInk: string; done: string; link: string; warn: string };
}

export const themes: ThemePalette[] = `;

writeFileSync(join(root, "src", "lib", "themes.ts"), header + JSON.stringify(built, null, 2) + ";\n");

const credits =
  `# Themes\n\nThe color themes in Settings use the colors of well-known VS Code themes. The colors were read from\neach theme's own files by \`scripts/build-themes.mjs\`. Every theme belongs to its authors and is used\nunder its license. TururuCoding is not connected to any of them.\n\n| Theme | By | License | Source |\n| --- | --- | --- | --- |\n` +
  built.map((t) => `| ${t.name} | ${t.by} | ${t.license} | ${t.url} |`).join("\n") +
  `\n\nMonokai Pro is a paid theme and is not included. The classic Monokai that ships with VS Code is.\n`;
writeFileSync(join(root, "THEMES.md"), credits);
console.log(`\nWrote ${built.length} themes to src/lib/themes.ts and THEMES.md`);
