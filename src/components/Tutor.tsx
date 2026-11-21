import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Files } from "../lib/lesson";
import { href } from "../lib/router";
import { renderSafeMarkdown } from "../lib/safeMarkdown";
import { MAX_QUESTION, MAX_QUOTE, TutorError, askTutor, codeAsText, tutorState, type ChatTurn, type TutorState } from "../lib/tutor";

interface Props {
  /** One chat per page: "lesson:html-03". */
  pageId: string;
  /** "Lesson 3: Links". The model is told which page you are on. */
  title: string;
  /** What the page is, for the first line of the panel: "lesson", "quick check", "project". */
  what: string;
  /** What the page teaches, as plain text. */
  context: string;
  files: Files;
  fileOrder: string[];
}

/** Chats stay while the site is open, so closing the panel or visiting another lesson does not lose them. */
const chats = new Map<string, ChatTurn[]>();

const quickQuestions = ["Explain it more simply", "Show one more example", "What is wrong with my code?"];

const SIDE_KEY = "tc.tutor-side";
type Side = "left" | "right";
const savedSide = (): Side => {
  try {
    // The right side is the normal place. Only a choice for the left is remembered as such.
    return localStorage.getItem(SIDE_KEY) === "left" ? "left" : "right";
  } catch {
    return "right";
  }
};

/** A small robot head: the sign for "an AI answers here". */
const RobotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="3.6" r="1.6" fill="currentColor" />
    <rect x="11.2" y="4.4" width="1.6" height="3.2" fill="currentColor" />
    <rect x="4" y="7" width="16" height="13" rx="3" fill="currentColor" />
    <rect x="1.4" y="11.4" width="2" height="4.6" rx="1" fill="currentColor" />
    <rect x="20.6" y="11.4" width="2" height="4.6" rx="1" fill="currentColor" />
    <circle className="tutor__face" cx="9" cy="12.4" r="1.7" />
    <circle className="tutor__face" cx="15" cy="12.4" r="1.7" />
    <rect className="tutor__face" x="8.6" y="15.9" width="6.8" height="1.6" rx="0.8" />
  </svg>
);

/** An answer from the model. Its Markdown is made safe before it is shown (see lib/safeMarkdown). */
function Answer({ source }: { source: string }) {
  const html = useMemo(() => renderSafeMarkdown(source), [source]);
  return <div className="prose tutor__answer" dangerouslySetInnerHTML={{ __html: html }} />;
}

interface Pick {
  text: string;
  x: number;
  y: number;
}

/** The "Ask the tutor" button and its chat panel, for pages with a lesson and an editor. */
export function Tutor({ pageId, title, what, context, files, fileOrder }: Props) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>(() => chats.get(pageId) ?? []);
  const [draft, setDraft] = useState("");
  const [quote, setQuote] = useState("");
  const [busy, setBusy] = useState<null | "waiting" | "thinking" | "writing">(null);
  const [writing, setWriting] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [state, setState] = useState<TutorState | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [side, setSide] = useState<Side>(savedSide);

  const input = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const latest = useRef({ files, fileOrder, context, title });
  latest.current = { files, fileOrder, context, title };

  useEffect(() => {
    chats.set(pageId, turns);
  }, [pageId, turns]);

  // Leaving the page stops an answer that is still being written.
  useEffect(() => () => request.current?.abort(), []);

  const refresh = useCallback(() => {
    void tutorState().then(setState);
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  // The keyboard goes to the question box, or to the panel while there is no box yet. Esc then closes it.
  const hasBox = state?.kind === "ready";
  useEffect(() => {
    if (!open) return;
    if (hasBox) input.current?.focus();
    else if (!panel.current?.contains(document.activeElement)) panel.current?.focus();
  }, [open, hasBox]);

  useEffect(() => {
    const box = log.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [turns, writing, busy, problem, open]);

  // Selecting a piece of the lesson offers to ask about exactly that piece.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const look = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return setPick(null);
      const text = selection.toString().replace(/\s+/g, " ").trim();
      const range = selection.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const element = node instanceof Element ? node : node.parentElement;
      if (text.length < 2 || !element || !element.closest(".lesson__pad") || element.closest(".tutor")) return setPick(null);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return setPick(null);
      // A phone shows its own menu above the selection, so the button goes below it there.
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const above = rect.top - 46;
      setPick({
        text: text.slice(0, MAX_QUOTE),
        x: Math.min(Math.max(rect.left + rect.width / 2, 120), window.innerWidth - 120),
        y: !touch && above > 60 ? above : Math.min(rect.bottom + 10, window.innerHeight - 50),
      });
    };
    // Wait until the selection stands still: while the mouse drags, it changes all the time.
    const onSelection = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(look, 250);
    };
    const hide = () => setPick(null);
    document.addEventListener("selectionchange", onSelection);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("selectionchange", onSelection);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, []);

  const send = async (question: string, base: ChatTurn[], about: string) => {
    const text = question.trim().slice(0, MAX_QUESTION);
    if (!text || busy) return;
    const mine: ChatTurn = { role: "user", content: text, ...(about ? { quote: about } : {}) };
    const next = [...base, mine];
    setTurns(next);
    setDraft("");
    setQuote("");
    setProblem(null);
    setWriting("");
    setBusy("waiting");
    const controller = new AbortController();
    request.current = controller;
    const now = latest.current;
    try {
      const result = await askTutor(
        {
          title: now.title,
          context: now.context,
          code: codeAsText(now.files, now.fileOrder),
          quote: about,
          // Earlier questions keep the piece of the lesson they were about.
          messages: next.map((turn, i) => ({
            role: turn.role,
            content: turn.quote && i < next.length - 1 ? `(About this part of the lesson: "${turn.quote}")\n${turn.content}` : turn.content,
          })),
        },
        {
          signal: controller.signal,
          onThinking: () => setBusy((current) => (current === "waiting" ? "thinking" : current)),
          onAnswer: (answer) => {
            setBusy("writing");
            setWriting(answer);
          },
        },
      );
      setTurns([...next, { role: "assistant", content: result.answer }]);
      if (result.usage) setState({ kind: "ready", ...result.usage });
    } catch (error) {
      if (controller.signal.aborted) return;
      setProblem(error instanceof TutorError ? error.message : "Something went wrong while asking the tutor. Try again.");
      if (error instanceof TutorError && error.usage) setState({ kind: "ready", ...error.usage });
    } finally {
      if (request.current === controller) request.current = null;
      setWriting("");
      setBusy(null);
    }
  };

  /** A question that got no answer is replaced by the next one, so the chat stays question, answer, question, answer. */
  const answered = turns.length && turns[turns.length - 1].role === "user" ? turns.slice(0, -1) : turns;
  const waitingTurn = turns.length && turns[turns.length - 1].role === "user" ? turns[turns.length - 1] : null;

  const ask = (question: string) => void send(question, answered, quote);
  const retry = () => waitingTurn && void send(waitingTurn.content, answered, waitingTurn.quote ?? "");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      ask(draft);
    }
  };

  const askAboutPick = () => {
    if (!pick) return;
    setQuote(pick.text);
    setPick(null);
    window.getSelection()?.removeAllRanges();
    setOpen(true);
    // The panel may already be open: put the cursor in the question box either way.
    setTimeout(() => input.current?.focus(), 0);
  };

  /** The panel lies over a part of the page. This moves it to the other side, and this device remembers the side. */
  const moveOver = () => {
    const next: Side = side === "left" ? "right" : "left";
    setSide(next);
    try {
      localStorage.setItem(SIDE_KEY, next);
    } catch {
      /* private mode: the side lasts until the page closes */
    }
  };

  const clear = () => {
    request.current?.abort();
    setTurns([]);
    setProblem(null);
    setQuote("");
  };

  const ready = state?.kind === "ready";
  const left = ready ? Math.max(state.limit - state.used, 0) : null;
  const empty = turns.length === 0 && !busy;

  return (
    <div className="tutor">
      {pick ? (
        <button type="button" className="tutor__pick" style={{ left: pick.x, top: pick.y }} onMouseDown={(event) => event.preventDefault()} onClick={askAboutPick}>
          Ask the tutor about this
        </button>
      ) : null}

      {!open ? (
        <button type="button" className="tutor__open" data-side={side} onClick={() => setOpen(true)} aria-label="Ask the tutor">
          <RobotIcon />
          <span className="tutor__open-label">Ask the tutor</span>
        </button>
      ) : (
        <section
          ref={panel}
          tabIndex={-1}
          className="tutor__panel"
          data-side={side}
          role="dialog"
          aria-label="Tutor"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          <header className="tutor__head">
            <h2>Tutor</h2>
            {turns.length ? (
              <button type="button" className="tutor__headbtn" onClick={clear}>
                New chat
              </button>
            ) : null}
            <button type="button" className="tutor__headbtn tutor__headbtn--side" onClick={moveOver} title="The panel lies over a part of the page. This moves it to the other side.">
              {side === "left" ? "Move right" : "Move left"}
            </button>
            <button type="button" className="tutor__headbtn" onClick={() => setOpen(false)} aria-label="Close the tutor">
              Close
            </button>
          </header>
          {ready ? (
            <p className="tutor__count" title="The limit keeps the tutor inside the free daily amount of Cloudflare. It starts again at midnight UTC.">
              {left} of {state.limit} questions left today
            </p>
          ) : (
            <span />
          )}

          <div className="tutor__log" ref={log} role="log" aria-busy={busy !== null}>
            {state === null && empty ? <p className="muted">Looking for the tutor…</p> : null}

            {state?.kind === "not-linked" ? (
              <div className="tutor__note">
                <p>
                  <strong>The tutor answers on a linked device.</strong>
                </p>
                <p>It runs on the published site and needs your device key, so that nobody else can use it. Link this device once, then ask here.</p>
                <p>
                  <a href={href.settings()}>Open Settings, Your devices</a>
                </p>
              </div>
            ) : null}

            {state?.kind === "off" ? (
              <div className="tutor__note">
                <p>
                  <strong>The published site does not have the tutor yet.</strong>
                </p>
                <p>
                  On your computer, double-click <code>cloud-deploy.bat</code> to publish the newest version. The tutor comes with it.
                </p>
              </div>
            ) : null}

            {state?.kind === "unreachable" ? (
              <div className="tutor__note">
                <p>
                  <strong>Could not reach the server.</strong>
                </p>
                <p>Check your internet connection.</p>
                <p>
                  <button type="button" className="btn btn--small" onClick={refresh}>
                    Try again
                  </button>
                </p>
              </div>
            ) : null}

            {ready && empty ? (
              <div className="tutor__hello">
                <p>
                  Ask anything about this {what}, in your own words.{" "}
                  {fileOrder.length ? `The tutor sees the ${what} and the code in your editor.` : `The tutor sees the ${what}. It cannot see the files on your computer, so paste the lines you ask about.`}
                </p>
                <p className="small muted">Tip: select a piece of the text or the code on the page to ask about exactly that piece.</p>
              </div>
            ) : null}

            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <div key={i} className="tutor__turn tutor__turn--you">
                  <p className="tutor__who">You</p>
                  {turn.quote ? <blockquote className="tutor__quoted">{turn.quote}</blockquote> : null}
                  <p className="tutor__question">{turn.content}</p>
                </div>
              ) : (
                <div key={i} className="tutor__turn">
                  <p className="tutor__who">Tutor</p>
                  <Answer source={turn.content} />
                </div>
              ),
            )}

            {busy ? (
              <div className="tutor__turn">
                <p className="tutor__who">Tutor</p>
                {writing ? <Answer source={writing} /> : <p className="tutor__wait">{busy === "thinking" ? "Thinking about it…" : "Reading your question…"}</p>}
              </div>
            ) : null}

            {problem ? (
              <div className="tutor__problem" role="alert">
                <p>{problem}</p>
                {waitingTurn && left !== 0 ? (
                  <button type="button" className="btn btn--small" onClick={retry}>
                    Ask again
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {ready ? (
            <form className="tutor__form" onSubmit={onSubmit}>
              {quote ? (
                <div className="tutor__about">
                  <span>
                    About: <q>{quote}</q>
                  </span>
                  <button type="button" onClick={() => setQuote("")} aria-label="Ask without this piece of the lesson">
                    Remove
                  </button>
                </div>
              ) : null}
              <div className="tutor__quick">
                {(quote ? ["Explain this part", "Show me an example of this"] : fileOrder.length ? quickQuestions : quickQuestions.slice(0, 2)).map((question) => (
                  <button key={question} type="button" disabled={busy !== null || left === 0} onClick={() => ask(question)}>
                    {question}
                  </button>
                ))}
              </div>
              <label className="visually-hidden" htmlFor="tutor-question">
                Your question
              </label>
              <textarea
                id="tutor-question"
                ref={input}
                rows={2}
                maxLength={MAX_QUESTION}
                placeholder={left === 0 ? "No questions left today. The count starts again at midnight UTC." : "Type your question…"}
                value={draft}
                disabled={left === 0}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
              />
              <div className="tutor__send">
                <span className="small muted">An AI model answers. It can be wrong: when in doubt, trust the lesson.</span>
                <button type="submit" className="btn btn--primary btn--small" disabled={busy !== null || draft.trim() === "" || left === 0}>
                  {busy ? "Answering…" : "Ask"}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      )}
    </div>
  );
}
