import { href } from "../lib/router";

export function Missing({ what = "page" }: { what?: string }) {
  return (
    <main className="page page--narrow">
      <h1 style={{ fontSize: 34, marginBottom: 12 }}>There is no {what} at this address</h1>
      <p className="lead">The link may be old, or it has a typing mistake.</p>
      <p>
        <a className="btn btn--primary" href={href.map()}>
          Open the map
        </a>
      </p>
    </main>
  );
}
