import { useEffect, useRef, useState } from "react";
import { download } from "../lib/download";
import { useScrollTop, useTitle } from "../lib/hooks";
import { getPrefs, setPrefs, store, useStoreVersion, type Prefs, type Rec } from "../lib/store";
import { deviceLink, linkDevice, serverInfo, syncNow, unlinkDevice, useSyncStatus } from "../lib/sync";

const time = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Accepts a whole device link or only the key. */
const readLink = (text: string): { key: string; server: string } => {
  const trimmed = text.trim();
  const m = /#tc-key=([A-Za-z0-9_-]+)/.exec(trimmed);
  if (!m) return { key: trimmed, server: "" };
  let server = "";
  try {
    const url = new URL(trimmed);
    if (url.origin !== window.location.origin) server = url.origin + url.pathname.replace(/\/+$/, "");
  } catch {
    /* only "#tc-key=…" was pasted */
  }
  return { key: m[1], server };
};

export function SettingsPage() {
  useStoreVersion();
  useScrollTop("settings");
  useTitle("Settings");
  const prefs = getPrefs();
  const sync = useSyncStatus();
  const [linkText, setLinkText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [server, setServer] = useState<{ found: boolean; configured: boolean } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    void serverInfo(sync.server).then((info) => alive && setServer(info));
    return () => {
      alive = false;
    };
  }, [sync.server]);

  const link = async () => {
    setBusy(true);
    setMessage(null);
    const { key, server: address } = readLink(linkText);
    const result = await linkDevice(key, address);
    setBusy(false);
    setMessage(result.message);
    if (result.ok) setLinkText("");
  };

  const restore = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { app?: string; records?: Record<string, Rec> };
      if (data.app !== "tururucoding" || !data.records) throw new Error("not a backup");
      const taken = store.importAll(data.records);
      setMessage(taken ? `Restored ${taken} ${taken === 1 ? "record" : "records"} from the backup.` : "This device already has everything that is in the backup.");
    } catch {
      setMessage("That file is not a TururuCoding backup.");
    }
  };

  const currentLink = deviceLink();

  return (
    <main className="page page--narrow">
      <h1 style={{ fontSize: "clamp(32px, 4.6vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Settings</h1>

      {message ? (
        <div className="callout callout--hi" role="status">
          <p>{message}</p>
        </div>
      ) : null}

      <h2 className="sectionhead">Look</h2>
      <div className="field">
        <label htmlFor="theme">Theme</label>
        <select id="theme" value={prefs.theme} onChange={(e) => setPrefs({ theme: e.target.value as Prefs["theme"] })}>
          <option value="auto">Same as this device</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <h2 className="sectionhead">Lessons</h2>
      <label className="choice">
        <input type="checkbox" checked={prefs.foldTwist} onChange={(e) => setPrefs({ foldTwist: e.target.checked })} />
        <span>
          <strong>Fold the twist answer until I click it.</strong>
          <br />
          <span className="small muted">Off: the twist answer is always open under the twist. On: you click once to open it, if you want to try first.</span>
        </span>
      </label>

      <h2 className="sectionhead">Your devices</h2>
      {sync.linked ? (
        <>
          <p>
            <strong>This device is linked.</strong> Your progress and your code sync with your other linked devices.
          </p>
          <p className="small muted">
            {sync.phase === "syncing"
              ? "Syncing now…"
              : sync.phase === "offline"
                ? "No connection right now. Changes are kept here and sent when you are back online."
                : sync.phase === "error"
                  ? (sync.error ?? "The last sync failed.")
                  : sync.lastSyncedAt
                    ? `Last synced ${time.format(sync.lastSyncedAt)}.`
                    : "Not synced yet."}{" "}
            {sync.pending ? `${sync.pending} ${sync.pending === 1 ? "change is" : "changes are"} waiting to be sent.` : ""}
          </p>
          <div className="row" style={{ marginBottom: 18 }}>
            <button type="button" className="btn" onClick={() => void syncNow()}>
              Sync now
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => setShowLink(!showLink)}>
              {showLink ? "Hide the device link" : "Link another device"}
            </button>
          </div>
          {showLink && currentLink ? (
            <>
              <p style={{ maxWidth: "64ch" }}>
                Open this link once on the other device (laptop, phone). <strong>It contains your device key, so treat it like a password.</strong> Anyone who has it can read
                and change your progress.
              </p>
              <div className="keybox">{currentLink}</div>
              <div className="row" style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(currentLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    } catch {
                      /* select it by hand */
                    }
                  }}
                >
                  {copied ? "Copied" : "Copy the link"}
                </button>
              </div>
            </>
          ) : null}
          <p>
            <button
              type="button"
              className="linkbtn"
              onClick={() => {
                unlinkDevice();
                setShowLink(false);
                setMessage("This device is no longer linked. What you did here stays on this device.");
              }}
            >
              Unlink this device
            </button>
          </p>
        </>
      ) : (
        <>
          <p style={{ maxWidth: "64ch" }}>
            <strong>This device is not linked.</strong> Your progress is saved in this browser only. To sync, open your device link once on this device, or paste the link or the
            key here.
          </p>
          {server && !server.found ? (
            <p className="small muted" style={{ maxWidth: "64ch" }}>
              This copy of the site has no sync server, which is normal when it runs on your own computer. Paste the whole device link and it will sync with the published site.
            </p>
          ) : null}
          {server && server.found && !server.configured ? (
            <p className="small muted" style={{ maxWidth: "64ch" }}>
              The sync server is here but has no device key yet. Run cloud-deploy.bat once more.
            </p>
          ) : null}
          <div className="field">
            <label htmlFor="device-link">Device link or key</label>
            <input id="device-link" type="password" autoComplete="off" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="https://…/#tc-key=…" />
            <p className="field__help">You got the device link when the site was published. Any linked device can show it again on this page.</p>
          </div>
          <button type="button" className="btn btn--primary" disabled={busy || !linkText.trim()} onClick={() => void link()}>
            {busy ? "Linking…" : "Link this device"}
          </button>
        </>
      )}

      <h2 className="sectionhead">Backup</h2>
      <p style={{ maxWidth: "64ch" }}>A backup is one file with your progress and all the code you wrote. Restoring never deletes anything: for each item the newer copy wins.</p>
      <div className="row">
        <button
          type="button"
          className="btn"
          onClick={() =>
            download(
              `tururucoding-backup-${new Date().toISOString().slice(0, 10)}.json`,
              JSON.stringify({ app: "tururucoding", version: 1, savedAt: new Date().toISOString(), records: store.exportAll() }, null, 1),
              "application/json",
            )
          }
        >
          Download a backup
        </button>
        <button type="button" className="btn btn--quiet" onClick={() => fileInput.current?.click()}>
          Restore from a backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void restore(file);
            e.target.value = "";
          }}
        />
      </div>

      <h2 className="sectionhead">This device</h2>
      <p style={{ maxWidth: "64ch" }}>
        Forget removes your progress and code from this browser only. {sync.linked ? "Your other devices and the server keep their copy, and this device is unlinked." : "This device is not linked, so there is no other copy unless you downloaded a backup."}
      </p>
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => {
          if (!window.confirm("Remove all progress and code from this browser?")) return;
          unlinkDevice();
          store.clearDevice();
          setMessage("Everything was removed from this browser.");
        }}
      >
        Forget everything on this device
      </button>
      {!store.storageWorks() ? (
        <div className="callout" style={{ marginTop: 20 }}>
          <p>
            <strong>This browser is not saving anything.</strong> Storage is blocked (private window, or a browser setting). Your progress will be gone when you close the tab.
          </p>
        </div>
      ) : null}
    </main>
  );
}
