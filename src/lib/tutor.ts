/**
 * The browser side of the tutor: sends a question to this site's own server
 * (POST /api/tutor) and reads the answer while it is being written.
 *
 * The server part is in cloudflare/tutor.ts and cloudflare/worker.ts.
 */
import type { Files } from "./lesson";
import { linkedFetch } from "./sync";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  /** A piece of the lesson that was selected for this question. */
  quote?: string;
  /** The answer stopped with a problem. */
  failed?: boolean;
}

export interface TutorUsage {
  used: number;
  limit: number;
}

export type TutorState = { kind: "not-linked" } | { kind: "off" } | { kind: "unreachable" } | ({ kind: "ready" } & TutorUsage);

/** These match the limits of the server (cloudflare/tutor.ts). */
export const MAX_QUESTION = 1200;
export const MAX_QUOTE = 600;
const MAX_CONTEXT = 5000;
const MAX_CODE = 4000;

/** Is the tutor there, and how many questions are left today? */
export async function tutorState(): Promise<TutorState> {
  const pending = linkedFetch("/tutor");
  if (!pending) return { kind: "not-linked" };
  try {
    const res = await pending;
    // A server from before the tutor existed does not know this address.
    if (res.status === 404) return { kind: "off" };
    if (!res.ok) return { kind: "unreachable" };
    const body = (await res.json()) as { on?: boolean; used?: number; limit?: number };
    if (!body.on) return { kind: "off" };
    return { kind: "ready", used: body.used ?? 0, limit: body.limit ?? 0 };
  } catch {
    return { kind: "unreachable" };
  }
}

/** The learner's files as one text, with the file names. */
export function codeAsText(files: Files, fileOrder: string[]): string {
  const parts = fileOrder.filter((name) => (files[name] ?? "").trim() !== "").map((name) => (fileOrder.length > 1 ? `--- ${name}\n${files[name].trim()}` : files[name].trim()));
  return parts.join("\n\n").slice(0, MAX_CODE);
}

/** Lesson text for the model: plain, and not longer than the server accepts. */
export const asContext = (parts: (string | null | undefined | false)[]) =>
  parts
    .filter((part): part is string => !!part && part.trim() !== "")
    .map((part) => part.trim())
    .join("\n\n")
    .slice(0, MAX_CONTEXT);

/** What one event of the stream holds. Different models name the text differently. */
export function readEvent(data: string): { text: string; thinking: boolean; done: boolean; error: string | null } {
  const nothing = { text: "", thinking: false, done: false, error: null };
  const trimmed = data.trim();
  if (!trimmed) return nothing;
  if (trimmed === "[DONE]") return { ...nothing, done: true };
  let event: unknown;
  try {
    event = JSON.parse(trimmed);
  } catch {
    return nothing;
  }
  if (!event || typeof event !== "object") return nothing;
  const e = event as {
    response?: unknown;
    error?: unknown;
    type?: unknown;
    delta?: unknown;
    choices?: { delta?: { content?: unknown; reasoning_content?: unknown; reasoning?: unknown }; text?: unknown }[];
  };
  if (e.error) {
    const message = typeof e.error === "string" ? e.error : ((e.error as { message?: unknown }).message ?? "The model stopped with an error.");
    return { ...nothing, error: String(message) };
  }
  const choice = e.choices?.[0];
  const text =
    typeof e.response === "string"
      ? e.response
      : typeof choice?.delta?.content === "string"
        ? choice.delta.content
        : typeof choice?.text === "string"
          ? choice.text
          : typeof e.delta === "string" && typeof e.type === "string" && e.type.endsWith("output_text.delta")
            ? e.delta
            : "";
  const thinking = !text && (typeof choice?.delta?.reasoning_content === "string" || typeof choice?.delta?.reasoning === "string");
  return { text, thinking, done: false, error: null };
}

/** Reads a stream of server-sent events and hands over each "data:" line. */
export async function readEvents(body: ReadableStream<Uint8Array>, onData: (data: string) => void): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const flush = (final: boolean) => {
    const lines = buffer.split(/\r?\n/);
    buffer = final ? "" : (lines.pop() ?? "");
    for (const line of lines) if (line.startsWith("data:")) onData(line.slice(5));
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    flush(false);
  }
  buffer += decoder.decode();
  flush(true);
}

/** Some models put their thinking in the answer, between <think> tags. The learner only needs the answer. */
export const withoutThinking = (answer: string) => answer.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").replace(/^\s+/, "");

export interface AskInput {
  title: string;
  context: string;
  code: string;
  quote: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

export class TutorError extends Error {
  constructor(
    message: string,
    public usage: TutorUsage | null = null,
  ) {
    super(message);
  }
}

/**
 * Asks one question. `onAnswer` gets the answer so far, again and again, while it grows.
 * Returns the full answer and how many questions were used today.
 */
export async function askTutor(
  input: AskInput,
  handlers: { onAnswer: (answer: string) => void; onThinking?: () => void; signal?: AbortSignal },
): Promise<{ answer: string; usage: TutorUsage | null }> {
  const pending = linkedFetch("/tutor", { method: "POST", body: JSON.stringify(input), signal: handlers.signal });
  if (!pending) throw new TutorError("This device is not linked, so it cannot reach the tutor.");
  let res: Response;
  try {
    res = await pending;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new TutorError("Could not reach the tutor. Check your internet connection and try again.");
  }
  if (!res.ok) {
    let message = res.status === 401 ? "The server did not accept this device's key. Open your device link again." : `The tutor answered with an error (${res.status}).`;
    let usage: TutorUsage | null = null;
    try {
      const body = (await res.json()) as { error?: string; used?: number; limit?: number };
      if (body.error && res.status !== 401) message = body.error;
      if (typeof body.used === "number" && typeof body.limit === "number") usage = { used: body.used, limit: body.limit };
    } catch {
      /* not JSON */
    }
    if (res.status === 404) message = "This server has no tutor yet. Publish the site again to add it.";
    throw new TutorError(message, usage);
  }

  const used = Number(res.headers.get("x-tutor-used"));
  const limit = Number(res.headers.get("x-tutor-limit"));
  const usage = Number.isFinite(used) && Number.isFinite(limit) && limit > 0 ? { used, limit } : null;
  if (!res.body) throw new TutorError("The tutor sent an empty answer. Try again.", usage);

  let raw = "";
  let failure: string | null = null;
  await readEvents(res.body, (data) => {
    const event = readEvent(data);
    if (event.error) failure = event.error;
    if (event.thinking) handlers.onThinking?.();
    if (event.text) {
      raw += event.text;
      handlers.onAnswer(withoutThinking(raw));
    }
  });
  const answer = withoutThinking(raw).trim();
  if (failure && !answer) throw new TutorError(`The AI model stopped with an error. Try again. (${failure})`, usage);
  if (!answer) throw new TutorError("The tutor did not write an answer this time. Ask again, or ask in other words.", usage);
  return { answer, usage };
}
