/**
 * The tutor: the part of the server that answers a question about a lesson.
 *
 * How it works, in four steps:
 *  1. The browser sends the question, the lesson text and the learner's code to
 *     POST /api/tutor, with the device key. No key, no answer.
 *  2. The Worker counts the question against today's limit (see DAILY_LIMIT).
 *  3. The Worker asks an AI model through the "AI" binding (Workers AI). The
 *     model runs inside the same Cloudflare account as the site. There is no
 *     API key anywhere, and no other company in between.
 *  4. The model's answer streams back to the browser word by word.
 *
 * This file holds everything that does not need Cloudflare to run, so the
 * tests can check it: the limits, the instructions for the model, and the
 * call to the model.
 */

/** The model that answers. An open model from Google that Workers AI offers on the free plan. */
export const MODEL = "@cf/google/gemma-4-26b-a4b-it";

/** Used when the first model fails to start (renamed, removed, busy). */
export const BACKUP_MODEL = "@cf/zai-org/glm-4.7-flash";

/**
 * Questions per day (the day changes at midnight UTC, when Cloudflare's own count starts again).
 *
 * Why 80: Cloudflare gives every account 10,000 "neurons" of AI use per day for free.
 * One question costs at most about 100 neurons with this model:
 *   input   at most 16,000 characters (see LIMITS), at most about 8,000 tokens  ->  73 neurons
 *   output  at most 1,000 tokens (MAX_ANSWER_TOKENS)                            ->  27 neurons
 * So 80 of the longest possible questions use about 8,000 neurons, under the free 10,000.
 * A normal question is much smaller. If you change the model, do this sum again
 * with the new model's prices before you raise the limit.
 */
export const DAILY_LIMIT = 80;

/** The longest answer the model may write, thinking included. */
export const MAX_ANSWER_TOKENS = 1000;

/** The most characters of each part that go to the model. Together they stay under 16,000. */
export const LIMITS = {
  question: 1200,
  quote: 600,
  title: 160,
  context: 5000,
  code: 4000,
  /** All earlier questions and answers of this chat together. */
  history: 3500,
  turns: 12,
  /** The whole request body, in bytes. */
  body: 64 * 1024,
} as const;

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  /** The name of the page: "Lesson 3: Links". */
  title: string;
  /** What the page teaches, as plain text. */
  context: string;
  /** The learner's code right now. */
  code: string;
  /** A piece of the lesson the learner selected, or "". */
  quote: string;
  /** The chat so far. The last message is the new question. */
  messages: TutorMessage[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const clip = (text: string, max: number) => (text.length > max ? text.slice(0, max) + "\n[cut here: too long]" : text);

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** Checks what the browser sent. Long lesson text and code are cut; a broken request is refused. */
export function readTutorRequest(body: unknown): { ok: true; value: TutorRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "The request is empty." };
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.messages) || b.messages.length === 0) return { ok: false, error: "There is no question." };

  const messages: TutorMessage[] = [];
  for (const item of b.messages) {
    const m = (item ?? {}) as Record<string, unknown>;
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return { ok: false, error: "The chat has a message this server does not understand." };
    const content = m.content.trim();
    if (!content) continue;
    // Some models insist on question, answer, question, answer. Two in a row from the same side become one.
    const before = messages[messages.length - 1];
    if (before && before.role === m.role) before.content += `\n\n${content}`;
    else messages.push({ role: m.role, content });
  }
  const question = messages[messages.length - 1];
  if (!question || question.role !== "user") return { ok: false, error: "There is no question." };
  if (question.content.length > LIMITS.question) return { ok: false, error: `That question is too long. Keep it under ${LIMITS.question} characters.` };

  // Keep the newest earlier messages that fit.
  const earlier: TutorMessage[] = [];
  let room = LIMITS.history;
  for (let i = messages.length - 2; i >= 0 && earlier.length < LIMITS.turns; i--) {
    const m = messages[i];
    if (m.content.length > room) break;
    room -= m.content.length;
    earlier.unshift(m);
  }
  // A chat for the model starts with the learner, never with an answer.
  while (earlier.length && earlier[0].role !== "user") earlier.shift();

  return {
    ok: true,
    value: {
      title: clip(text(b.title).trim(), LIMITS.title),
      context: clip(text(b.context).trim(), LIMITS.context),
      code: clip(text(b.code).trim(), LIMITS.code),
      quote: clip(text(b.quote).trim(), LIMITS.quote),
      messages: [...earlier, question],
    },
  };
}

/** What the model is told before every chat: who it is talking to and how to answer. */
export const INSTRUCTIONS = `You are the tutor inside TururuCoding, a website for learning to code. The learner is an adult beginner. Write so that a person whose first language is not English understands every sentence.

How to answer:
- Start with the answer, in one or two plain sentences. Explain after that.
- Use short sentences and common words. Explain every technical word the first time you use it.
- Show one small code example when it helps. Put code in a fenced code block with the language name, for example \`\`\`html.
- Keep it short: about 150 words, unless the learner asks for more.
- When the learner's code has a mistake: name the line, say what is wrong, and show the corrected line.
- Use only what the lesson has taught so far, unless the learner asks about something else.
- Stay on the lesson and on coding. For other topics, say kindly that you only help with the course.
- If you are not sure, say so. Never invent tags, attributes, properties or functions.
- Answer in the language the learner writes in.`;

/** The full list of messages for the model: instructions, the lesson, the code, then the chat. */
export function buildMessages(request: TutorRequest): ChatMessage[] {
  const system = [
    INSTRUCTIONS,
    `The learner is on this page: ${request.title || "a lesson"}`,
    request.context ? `What the page teaches:\n"""\n${request.context}\n"""` : "",
    `The learner's code right now:\n"""\n${request.code || "(nothing yet)"}\n"""`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const chat: ChatMessage[] = request.messages.map((m) => ({ role: m.role, content: m.content }));
  if (request.quote) {
    const last = chat[chat.length - 1];
    last.content = `I selected this part of the lesson:\n"""\n${request.quote}\n"""\n\n${last.content}`;
  }
  return [{ role: "system", content: system }, ...chat];
}

/** The day that counts for the limit: "2026-11-21", in UTC. */
export const utcDay = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

/** The small part of the Workers AI binding that the tutor uses. */
export interface AiBinding {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}

const encoder = new TextEncoder();

/** One finished answer as a stream with the same shape as a streamed one. */
const asStream = (answer: string) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: answer })}\n\ndata: [DONE]\n\n`));
      controller.close();
    },
  });

/** Finds the answer text in a reply that did not come as a stream. */
export function answerFrom(output: unknown): string {
  if (typeof output === "string") return output;
  if (!output || typeof output !== "object") return "";
  const o = output as { response?: unknown; choices?: { message?: { content?: unknown } }[] };
  if (typeof o.response === "string") return o.response;
  const content = o.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

/**
 * Asks the model and returns its answer as a stream of server-sent events.
 * Tries the backup model when the first one does not start.
 */
export async function askModel(ai: AiBinding, messages: ChatMessage[], models: string[] = [MODEL, BACKUP_MODEL]): Promise<{ stream: ReadableStream<Uint8Array>; model: string }> {
  let firstError: unknown = null;
  for (const model of models) {
    try {
      const output = await ai.run(model, { messages, stream: true, max_tokens: MAX_ANSWER_TOKENS, temperature: 0.3 });
      if (output instanceof ReadableStream) return { stream: output as ReadableStream<Uint8Array>, model };
      const answer = answerFrom(output);
      if (answer) return { stream: asStream(answer), model };
      throw new Error("The model sent an empty answer.");
    } catch (error) {
      firstError ??= error;
      // The free amount for today is used up: the other model would fail the same way.
      if (isOutOfAllowance(error)) break;
    }
  }
  throw firstError;
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : typeof error === "string" ? error : "");

/** Cloudflare's own daily free amount is used up (it is shared by everything in the account). */
export const isOutOfAllowance = (error: unknown) => /neurons|daily free allocation|\b4006\b/i.test(messageOf(error));

/** Turns a failure of the model into a status and a sentence a person can act on. */
export function describeAiError(error: unknown): { status: number; message: string } {
  if (isOutOfAllowance(error)) {
    return { status: 429, message: "This Cloudflare account has used its free AI amount for today. The tutor is back after midnight UTC." };
  }
  const detail = messageOf(error).slice(0, 300);
  return { status: 502, message: `The AI model did not answer. Try again in a moment.${detail ? ` (Cloudflare said: ${detail})` : ""}` };
}
