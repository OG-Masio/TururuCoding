import { useLoaded } from "../lib/hooks";
import { getPrefs, setPrefs, useStoreVersion, type Prefs } from "../lib/store";
import { DEFAULT_THEME, loadThemes } from "../lib/theme";
import type { ThemePalette } from "../lib/themes";

/** What a tile needs to draw a small sample. */
interface Sample {
  id: string;
  name: string;
  bg: string;
  fg: string;
  punct: string;
  tag: string;
  attr: string;
  string: string;
  storage: string;
  number: string;
  comment: string;
  paper: string;
  ink: string;
  hi: string;
}

const tururu: Sample = {
  id: DEFAULT_THEME,
  name: "TururuCoding",
  bg: "#12284a",
  fg: "#e7eef9",
  punct: "#9db3d6",
  tag: "#8fd3ff",
  attr: "#ffd479",
  string: "#b6f0a4",
  storage: "#ffa8c5",
  number: "#ffcf8a",
  comment: "#8ea3c4",
  paper: "#eef3e4",
  ink: "#16243a",
  hi: "#ffe24d",
};

const sampleOf = (t: ThemePalette): Sample => ({
  id: t.id,
  name: t.name,
  bg: t.code.bg,
  fg: t.code.fg,
  punct: t.tok.punct,
  tag: t.tok.tag,
  attr: t.tok.attr,
  string: t.tok.string,
  storage: t.tok.storage,
  number: t.tok.number,
  comment: t.tok.comment,
  paper: t.site.paper,
  ink: t.site.ink,
  hi: t.site.hi,
});

function Tile({ sample, selected }: { sample: Sample; selected: boolean }) {
  const c = (color: string) => ({ color });
  return (
    <button type="button" role="radio" aria-checked={selected} className="themetile" onClick={() => setPrefs({ codeTheme: sample.id })}>
      <span className="themetile__code" style={{ background: sample.bg, color: sample.fg }} aria-hidden="true">
        <span style={c(sample.punct)}>&lt;</span>
        <span style={c(sample.tag)}>h1</span> <span style={c(sample.attr)}>class</span>
        <span style={c(sample.punct)}>=</span>
        <span style={c(sample.string)}>"hi"</span>
        <span style={c(sample.punct)}>&gt;</span>Hello<span style={c(sample.punct)}>&lt;/</span>
        <span style={c(sample.tag)}>h1</span>
        <span style={c(sample.punct)}>&gt;</span>
        {"\n"}
        <span style={c(sample.storage)}>const</span> n <span style={c(sample.punct)}>=</span> <span style={c(sample.number)}>42</span>
        <span style={c(sample.punct)}>;</span> <span style={c(sample.comment)}>// note</span>
      </span>
      <span className="themetile__name" style={{ background: sample.paper, color: sample.ink }}>
        <span>{sample.name}</span>
        <span className="themetile__dot" style={{ background: sample.hi, borderColor: sample.ink }} aria-hidden="true" />
      </span>
    </button>
  );
}

/** The gallery of themes in Settings. */
export function ThemePicker() {
  useStoreVersion();
  const prefs = getPrefs();
  const list = useLoaded(loadThemes, "themes");
  const all = list.state === "ready" ? list.value : [];
  const dark = all.filter((t) => t.dark);
  const light = all.filter((t) => !t.dark);
  const current = all.find((t) => t.id === prefs.codeTheme);
  const usesVsCodeTheme = prefs.codeTheme !== DEFAULT_THEME;

  return (
    <>
      <p style={{ maxWidth: "68ch" }}>
        Pick the colors you like to work in. Besides TururuCoding's own look, there {all.length === 1 ? "is" : "are"} {all.length || 45} of the best-known VS Code themes. The
        colors come from each theme's own files.
      </p>

      <div role="radiogroup" aria-label="Theme">
        <h3 className="themegroup">TururuCoding</h3>
        <div className="themegrid">
          <Tile sample={tururu} selected={!usesVsCodeTheme} />
        </div>

        {list.state === "loading" ? <p className="muted">Loading the themes…</p> : null}

        {dark.length ? (
          <>
            <h3 className="themegroup">Dark themes</h3>
            <div className="themegrid">
              {dark.map((t) => (
                <Tile key={t.id} sample={sampleOf(t)} selected={prefs.codeTheme === t.id} />
              ))}
            </div>
          </>
        ) : null}

        {light.length ? (
          <>
            <h3 className="themegroup">Light themes</h3>
            <div className="themegrid">
              {light.map((t) => (
                <Tile key={t.id} sample={sampleOf(t)} selected={prefs.codeTheme === t.id} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {current ? (
        <p className="small muted" style={{ marginTop: 14 }}>
          {current.name} is made by {current.by} ({current.license} license).{" "}
          <a href={current.url} target="_blank" rel="noopener">
            Open the theme's page
          </a>
        </p>
      ) : null}

      <label className="choice" style={{ marginTop: 18 }}>
        <input type="checkbox" checked={prefs.themeWholeSite} onChange={(e) => setPrefs({ themeWholeSite: e.target.checked })} disabled={!usesVsCodeTheme} />
        <span>
          <strong>Use the theme for the whole site.</strong>
          <br />
          <span className="small muted">
            On: the pages, the menu and the buttons take the theme's colors too. Off: only the code areas change, and the pages keep the TururuCoding paper.
          </span>
        </span>
      </label>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="paper">Paper</label>
        <select id="paper" value={prefs.theme} onChange={(e) => setPrefs({ theme: e.target.value as Prefs["theme"] })} disabled={usesVsCodeTheme && prefs.themeWholeSite}>
          <option value="auto">Same as this device</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <p className="field__help">The color of the pages when a theme does not color them: with the TururuCoding theme, or with "whole site" off.</p>
      </div>
    </>
  );
}
