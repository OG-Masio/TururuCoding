import { Markdown } from "../components/Markdown";
import { loadGuide } from "../lib/course";
import { useLoaded, useScrollTop, useTitle } from "../lib/hooks";

export function GuidePage() {
  useScrollTop("guide");
  useTitle("Guide");
  const loaded = useLoaded(loadGuide, "guide");
  return (
    <main className="page page--narrow">
      <h1 style={{ fontSize: "clamp(32px, 4.6vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14 }}>How TururuCoding works</h1>
      {loaded.state === "ready" ? <Markdown source={loaded.value} /> : <p className="muted">Loading…</p>}
    </main>
  );
}
