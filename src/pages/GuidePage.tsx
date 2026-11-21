import { currentVersion, releases, type Release } from "../../content/changelog";
import { Markdown } from "../components/Markdown";
import { loadGuide, totals } from "../lib/course";
import { useLoaded, useScrollTop, useTitle } from "../lib/hooks";
import { href } from "../lib/router";

const titleStyle = { fontSize: "clamp(32px, 4.6vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14 } as const;

const dayAndTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const when = (iso: string) => dayAndTime.format(new Date(iso));

export function GuidePage({ tab }: { tab: "guide" | "about" }) {
  useScrollTop(`guide-${tab}`);
  useTitle(tab === "about" ? "About" : "Guide");
  return (
    <main className="page page--narrow">
      <nav className="tabs" aria-label="Guide pages">
        <a href={href.guide()} aria-current={tab === "guide" ? "page" : undefined}>
          Guide
        </a>
        <a href={href.about()} aria-current={tab === "about" ? "page" : undefined}>
          About
        </a>
      </nav>
      {tab === "about" ? <About /> : <Guide />}
    </main>
  );
}

function Guide() {
  const loaded = useLoaded(loadGuide, "guide");
  return (
    <>
      <h1 style={titleStyle}>How TururuCoding works</h1>
      {loaded.state === "ready" ? <Markdown source={loaded.value} /> : <p className="muted">Loading…</p>}
    </>
  );
}

function About() {
  const newest = releases[0];
  return (
    <>
      <h1 style={titleStyle}>About TururuCoding</h1>
      <p className="lead">
        A coding course built around one method: read the answer, understand it, copy it, twist it. It has {totals.tracks} tracks, {totals.units} units and {totals.lessons} lessons.
      </p>
      <p>
        You are using <strong>version {currentVersion}</strong>, finished on <time dateTime={newest.date}>{when(newest.date)}</time>.
      </p>

      <h2 className="sectionhead" style={{ marginTop: 34 }}>
        Version history
      </h2>
      <p className="muted" style={{ marginBottom: 14 }}>
        Every update gets an entry here, newest first. Click a version to read everything that changed.
      </p>
      <div className="revisions">
        {releases.map((release) => (
          <ReleaseRow key={release.version} release={release} />
        ))}
      </div>
    </>
  );
}

function ReleaseRow({ release }: { release: Release }) {
  return (
    <details className="revision" id={`v${release.version}`}>
      <summary>
        <span className="revision__num">
          <span className="visually-hidden">Version </span>
          {release.version}
        </span>
        <span className="revision__what">
          <strong>{release.title}</strong>
          <span>
            <InlineCode text={release.summary} />
          </span>
        </span>
        <time className="revision__when" dateTime={release.date}>
          {when(release.date)}
        </time>
      </summary>
      <div className="revision__details">
        <Markdown source={release.details} />
      </div>
    </details>
  );
}

/** Shows `code` parts of a plain sentence as code. */
function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? <code key={i}>{part.slice(1, -1)}</code> : <span key={i}>{part}</span>,
      )}
    </>
  );
}
