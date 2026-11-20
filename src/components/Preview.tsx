import { useEffect, useMemo, useRef, useState } from "react";
import type { Check, Files } from "../lib/lesson";
import { SANDBOX, buildPreview, newToken, sandboxBase } from "../lib/preview";

export interface ConsoleEntry {
  level: "log" | "info" | "warn" | "error";
  text: string;
}

interface Props {
  files: Files;
  title: string;
  /** Wait this long after the last change before reloading. */
  delay?: number;
  checks?: Check[];
  onChecks?: (results: boolean[]) => void;
  onConsole?: (entries: ConsoleEntry[]) => void;
  /** Reports the height of the page inside, so a frame can grow to fit. */
  onHeight?: (height: number) => void;
  lazy?: boolean;
}

/** Runs the files in a sandboxed frame and reports what happens inside. */
export function Preview({ files, title, delay = 350, checks, onChecks, onConsole, onHeight, lazy }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const token = useMemo(newToken, []);
  const [entry, setEntry] = useState<string | undefined>(undefined);
  const [doc, setDoc] = useState(() => buildPreview(files, { token, assetBase: sandboxBase() }));
  const first = useRef(true);
  const entries = useRef<ConsoleEntry[]>([]);
  const checkId = useRef(0);
  const latest = useRef({ checks, onChecks, onConsole, onHeight, files });
  latest.current = { checks, onChecks, onConsole, onHeight, files };

  useEffect(() => {
    const build = () => {
      entries.current = [];
      latest.current.onConsole?.([]);
      setDoc(buildPreview(files, { token, entry, assetBase: sandboxBase() }));
    };
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(build, delay);
    return () => clearTimeout(timer);
  }, [files, entry, delay, token]);

  const runChecks = () => {
    const list = latest.current.checks;
    const target = frame.current?.contentWindow;
    if (!list || !list.length || !target) return;
    checkId.current += 1;
    target.postMessage({ tc: token, type: "run-checks", id: checkId.current, tests: list.map((c) => c.test) }, "*");
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const data = event.data as { tc?: string; type?: string; [k: string]: unknown } | null;
      if (!data || data.tc !== token) return;
      if (data.type === "console") {
        if (entries.current.length < 300) {
          entries.current = [...entries.current, { level: data.level as ConsoleEntry["level"], text: String(data.text) }];
          latest.current.onConsole?.(entries.current);
        }
      } else if (data.type === "size") {
        if (typeof data.height === "number") latest.current.onHeight?.(data.height);
      } else if (data.type === "ready") {
        runChecks();
      } else if (data.type === "checks") {
        if (data.id === checkId.current && Array.isArray(data.results)) latest.current.onChecks?.(data.results as boolean[]);
      } else if (data.type === "navigate") {
        const target = String(data.href).replace(/^\.\//, "").split(/[?#]/)[0];
        if (target in latest.current.files) setEntry(target);
        else {
          entries.current = [...entries.current, { level: "warn", text: `The link goes to "${String(data.href)}", but there is no file with that name here.` }];
          latest.current.onConsole?.(entries.current);
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // The list of checks changed while the page stayed the same.
  const checkKey = checks?.map((c) => c.test).join("\n") ?? "";
  useEffect(() => {
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkKey]);

  return <iframe ref={frame} title={title} sandbox={SANDBOX} srcDoc={doc} loading={lazy ? "lazy" : undefined} />;
}
