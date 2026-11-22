import { TitleBlock } from "../components/TitleBlock";
import { findTrack } from "../lib/course";
import { useScrollTop, useTitle } from "../lib/hooks";
import { href } from "../lib/router";
import { Missing } from "./Missing";

export function CapstonePage({ trackId }: { trackId: string }) {
  useScrollTop(`capstone-${trackId}`);
  const track = findTrack(trackId);
  useTitle(track ? `Capstone: ${track.capstone.title}` : null);
  if (!track) return <Missing what="capstone" />;
  return (
    <main className="page page--narrow">
      <TitleBlock
        title={track.capstone.title}
        meta={
          <>
            <a href={href.map()}>Track {track.number}</a>
            <span>Capstone</span>
            <span>On your computer</span>
          </>
        }
      />
      <p className="lead">{track.capstone.summary}</p>

      <h2 className="sectionhead">What you build</h2>
      <ul className="outcomes">
        {track.capstone.youBuild.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 className="sectionhead">How a capstone works</h2>
      <div className="prose">
        <p>
          A capstone is built on your own computer, in VS Code, with the same tools working developers use. The site gives you the finished example first, then every step with
          its code and the reason for it. You copy it, then you twist it into your own version and put it online.
        </p>
        <p>It uses only what the units of this track taught:</p>
        <ul>
          {track.units.map((unit) => (
            <li key={unit.id}>
              <a href={href.unit(unit.id)}>
                Unit {unit.number}: {unit.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="callout callout--quiet">
        <p>
          <strong>This capstone is planned, not written yet.</strong> It is written when the units of track {track.number} are written.
        </p>
      </div>

      <p>
        <a href={href.map()}>Back to the map</a>
      </p>
    </main>
  );
}
