import { describe, expect, it } from "vitest";
import { variablesFor } from "../src/lib/theme";
import { themes } from "../src/lib/themes";

const channel = (hex: string, at: number) => {
  const s = parseInt(hex.slice(at, at + 2), 16) / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("themes", () => {
  it("has the list, with unique ids and credits", () => {
    expect(themes.length).toBeGreaterThanOrEqual(40);
    expect(new Set(themes.map((t) => t.id)).size).toBe(themes.length);
    for (const t of themes) {
      expect(t.by, t.id).not.toBe("");
      expect(t.url, t.id).toMatch(/^https:\/\/github\.com\//);
      expect(t.license, t.id).toMatch(/^(MIT|Apache-2\.0)$/);
    }
  });

  it("uses only solid hex colors", () => {
    for (const t of themes) {
      for (const color of [...Object.values(t.code), ...Object.values(t.tok), ...Object.values(t.site)]) expect(color, t.id).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("keeps the well-known colors of the originals", () => {
    const by = (id: string) => themes.find((t) => t.id === id)!;
    expect(by("dracula").code.bg).toBe("#282a36");
    expect(by("dracula").tok.tag).toBe("#ff79c6");
    expect(by("dracula").tok.string).toBe("#f1fa8c");
    expect(by("one-dark-pro").code.bg).toBe("#282c34");
    expect(by("one-dark-pro").tok.tag).toBe("#e06c75");
    expect(by("dark-plus").tok.tag).toBe("#569cd6");
    expect(by("dark-plus").tok.string).toBe("#ce9178");
    expect(by("night-owl").code.bg).toBe("#011627");
    expect(by("monokai").tok.tag).toBe("#f92672");
    expect(by("github-dark").code.bg).toBe("#0d1117");
    expect(by("tokyo-night").tok.string).toBe("#9ece6a");
    expect(by("nord").code.bg).toBe("#2e3440");
    expect(by("solarized-dark").code.bg).toBe("#002b36");
    expect(by("github-light").code.bg).toBe("#ffffff");
  });

  it("stays readable in the code area", () => {
    for (const t of themes) {
      expect(contrast(t.code.fg, t.code.bg), `${t.id} text`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.code.dim, t.code.bg), `${t.id} line numbers`).toBeGreaterThanOrEqual(3);
      expect(contrast(t.code.error, t.code.bg), `${t.id} errors`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.code.hiInk, t.code.hi), `${t.id} accent label`).toBeGreaterThanOrEqual(4.5);
      for (const [role, color] of Object.entries(t.tok)) {
        expect(contrast(color, t.code.bg), `${t.id} ${role}`).toBeGreaterThanOrEqual(role === "comment" ? 3 : 3.5);
      }
    }
  });

  it("stays readable on the pages when it colors the whole site", () => {
    for (const t of themes) {
      const s = t.site;
      expect(contrast(s.ink, s.paper), `${t.id} text`).toBeGreaterThanOrEqual(9);
      expect(contrast(s.ink, s.paper2), `${t.id} text on shaded rows`).toBeGreaterThanOrEqual(7);
      expect(contrast(s.pencil, s.paper2), `${t.id} small text`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.link, s.paper), `${t.id} links`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.done, s.paper), `${t.id} done`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.warn, s.paper), `${t.id} warnings`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.hiInk, s.hi), `${t.id} button label`).toBeGreaterThanOrEqual(4.5);
      // A dark theme has dark pages, a light theme light pages.
      expect(luminance(s.paper) < 0.3, `${t.id} paper matches`).toBe(t.dark);
    }
  });

  it("sets page colors only in whole-site mode", () => {
    const theme = themes[0];
    expect(variablesFor(theme, false)["--paper"]).toBeUndefined();
    expect(variablesFor(theme, false)["--code-bg"]).toBe(theme.code.bg);
    expect(variablesFor(theme, true)["--paper"]).toBe(theme.site.paper);
    expect(variablesFor(theme, true)["--tok-tag"]).toBe(theme.tok.tag);
  });
});
