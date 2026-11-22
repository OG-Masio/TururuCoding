/**
 * The tutor: the part of the server that answers a question about a lesson.
 *
 * How it works, in four steps:
 *  1. The browser sends the question, the lesson text and the learner's code to
 *     POST /api/tutor, with the device key. No key, no answer.
 *  2. The Worker sets the cost of the question aside from today's budget (see DAILY_NEURONS).
 *  3. The Worker asks an AI model through the "AI" binding (Workers AI). The
 *     model runs inside the same Cloudflare account as the site. There is no
 *     API key anywhere, and no other company in between.
 *  4. The model's answer streams back to the browser word by word.
 *  5. When the answer is complete, the Worker counts what it really cost.
 *
 * This file holds everything that does not need Cloudflare to run, so the
 * tests can check it: the models, the budget, the instructions for the model,
 * and the call to the model.
 */

/** One model the tutor can ask. */
export interface TutorModel {
  /** The short name the site uses for it. */
  key: string;
  /** The name Workers AI knows it by. */
  id: string;
  /** What the menu in the tutor shows. */
  name: string;
  /** One line under the menu. */
  note: string;
  /** The price in neurons for a million tokens, from Cloudflare's pricing page: what goes in... */
  inPerM: number;
  /** ...and what comes out. Thinking counts as "out". */
  outPerM: number;
  /** The longest answer it may write, thinking included. */
  maxTokens: number;
  /** Settings that only this model gets. */
  extra: Record<string, unknown>;
}

/**
 * The models in the tutor's menu. The first one answers when the learner did not choose.
 *
 * All of them run on Cloudflare's free plan. To add one:
 *   1. Find it on https://developers.cloudflare.com/workers-ai/platform/pricing/
 *   2. Check that it is not in the list of models that need the Workers Paid plan.
 *   3. Copy its two prices in neurons per million tokens.
 */
export const MODELS: TutorModel[] = [
  {
    key: "gpt-oss-120b",
    id: "@cf/openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    note: "A big open model, made by OpenAI. It thinks before it answers.",
    inPerM: 31818,
    outPerM: 68182,
    maxTokens: 2000,
    // Nothing extra: it thinks by itself, at its normal effort.
    extra: {},
  },
  {
    key: "gemma-4-26b",
    id: "@cf/google/gemma-4-26b-a4b-it",
    name: "Gemma 4 26B",
    note: "A smaller open model, made by Google. Faster, and about three times as many questions a day.",
    inPerM: 9091,
    outPerM: 27273,
    maxTokens: 1500,
    // Asked to answer at once. With thinking on, this model has used its whole answer for thinking.
    extra: { chat_template_kwargs: { enable_thinking: false } },
  },
];

/** Not in the menu. Asked only when every model of the menu fails to start (renamed, removed, busy). */
export const LAST_RESORT: TutorModel = {
  key: "glm-4.7-flash",
  id: "@cf/zai-org/glm-4.7-flash",
  name: "GLM 4.7 Flash",
  note: "",
  inPerM: 5500,
  outPerM: 36400,
  maxTokens: 1500,
  extra: {},
};

/** The model with this short name, or the first one. */
export const modelFor = (key: string): TutorModel => MODELS.find((model) => model.key === key) ?? MODELS[0];

/**
 * The tutor's budget for one day, in neurons. (The day changes at midnight UTC, when Cloudflare's own count starts again.)
 *
 * Cloudflare gives every account 10,000 "neurons" of AI use per day for free, for everything in
 * the account together. The tutor allows itself 9,000. The other 1,000 are spare: for the parts of
 * the sum that are estimates, and for other things in the account that use AI.
 *
 * How a question is counted:
 *   - Before the model runs, the most the question can cost is set aside (reserveFor).
 *     If that does not fit in what is left of the budget, the question is refused.
 *   - When the answer is complete, the real cost is counted (costOf) and the rest goes back.
 * So the budget can never be passed, and a short answer costs little.
 */
export const DAILY_NEURONS = 9000;

/** About how many tokens a text is. Three characters per token is on the safe side for English with code in it. */
export const tokensIn = (chars: number) => Math.ceil(chars / 3);

/** The price of a question in neurons. */
export const neuronsFor = (model: TutorModel, inTokens: number, outTokens: number) => Math.ceil((inTokens * model.inPerM + outTokens * model.outPerM) / 1_000_000);

/** A normal question, for "about N questions left": a lesson, some code, and a short answer with a little thinking. */
export const TYPICAL = { inTokens: 2500, outTokens: 600 };

/** About how many normal questions still fit in this many neurons. */
export function questionsLeft(model: TutorModel, neuronsLeft: number): number {
  // A question must be able to set aside its longest possible answer.
  if (neuronsLeft < neuronsFor(model, TYPICAL.inTokens, model.maxTokens)) return 0;
  return Math.max(1, Math.floor(neuronsLeft / neuronsFor(model, TYPICAL.inTokens, TYPICAL.outTokens)));
}

/** What the site is told about today: the budget, and for every model about how many questions are left. */
export const statusFor = (spent: number) => ({
  budget: DAILY_NEURONS,
  spent,
  default: MODELS[0].key,
  models: MODELS.map((model) => ({ key: model.key, name: model.name, note: model.note, left: questionsLeft(model, DAILY_NEURONS - spent) })),
});

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
  /** The short name of the model the learner chose, or "". */
  model: string;
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
      model: text(b.model).trim().slice(0, 60),
    },
  };
}

/** What the model is told before every chat: who it is talking to and how to answer. */
export const INSTRUCTIONS = `You are the tutor inside TururuCoding, a website for learning to code. The learner is an adult beginner. Write so that a person whose first language is not English understands every sentence.

How to answer:
- Answer every question the learner asks. Most questions are about the lesson or about code, but any topic is fine. Never refuse a question because it is not about the lesson, and never say that you only help with the course.
- Start with the answer, in one or two plain sentences. Explain after that.
- Use short sentences and common words. Explain every technical word the first time you use it.
- Show one small code example when it helps. Put code in a fenced code block with the language name, for example \`\`\`html.
- Keep it short: about 150 words, unless the learner asks for more.
- When the learner's code has a mistake: name the line, say what is wrong, and show the corrected line.
- The lesson text and the learner's code are given below. Use them when the question is about them. Leave them out when it is not.
- In code examples for a lesson, prefer what the lesson has taught so far. When you use something new, say that it is new.
- If you are not sure, say so. Never invent tags, attributes, properties or functions.
- You cannot look anything up. For news, prices and other things that change, say that your knowledge may be old.
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
  const o = output as { response?: unknown; choices?: { message?: { content?: unknown; reasoning_content?: unknown } }[] };
  if (typeof o.response === "string") return o.response;
  const message = o.choices?.[0]?.message;
  if (typeof message?.content === "string" && message.content) return message.content;
  // Some servers put the whole answer in the place meant for the model's thinking.
  return typeof message?.reasoning_content === "string" ? message.reasoning_content : "";
}

const charsOf = (messages: ChatMessage[]) => messages.reduce((sum, message) => sum + message.content.length, 0);

/** The most a question can cost: everything that goes in, and the longest answer the model may write. */
export const reserveFor = (model: TutorModel, messages: ChatMessage[]) => neuronsFor(model, tokensIn(charsOf(messages)), model.maxTokens);

/**
 * The order in which models are tried: the chosen one, then the others of the menu, then the last resort.
 * A model with settings of its own is also tried with nothing extra, in case it refuses a setting.
 */
export function chainFor(chosen: TutorModel): { model: TutorModel; extra: Record<string, unknown> }[] {
  const tries: { model: TutorModel; extra: Record<string, unknown> }[] = [];
  const add = (model: TutorModel) => {
    tries.push({ model, extra: model.extra });
    if (Object.keys(model.extra).length > 0) tries.push({ model, extra: {} });
  };
  add(chosen);
  for (const model of MODELS) if (model !== chosen) add(model);
  add(LAST_RESORT);
  return tries;
}

/**
 * Asks the model and returns its answer as a stream of server-sent events.
 * Also says which model answered: it is not always the chosen one.
 */
export async function askModel(ai: AiBinding, messages: ChatMessage[], chosen: TutorModel = MODELS[0]): Promise<{ stream: ReadableStream<Uint8Array>; model: TutorModel }> {
  let firstError: unknown = null;
  for (const { model, extra } of chainFor(chosen)) {
    try {
      const output = await ai.run(model.id, { messages, stream: true, max_tokens: model.maxTokens, temperature: 0.3, ...extra });
      if (output instanceof ReadableStream) return { stream: output as ReadableStream<Uint8Array>, model };
      const answer = answerFrom(output);
      if (answer) return { stream: asStream(answer), model };
      throw new Error("The model sent an empty answer.");
    } catch (error) {
      firstError ??= error;
      // The free amount for today is used up: every other try would fail the same way.
      if (isOutOfAllowance(error)) break;
    }
  }
  throw firstError;
}

/** What an answer was made of: the characters the model wrote, and its own token counts when it reports them. */
export interface Measured {
  chars: number;
  usage: { inTokens: number; outTokens: number } | null;
}

const lengthOf = (value: unknown) => (typeof value === "string" ? value.length : 0);
const count = (value: unknown) => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null);

/** Measures one piece of the model's stream. Models name their fields differently, so it looks in all known places. */
export function measurePiece(data: string): Measured {
  const nothing: Measured = { chars: 0, usage: null };
  let event: unknown;
  try {
    event = JSON.parse(data);
  } catch {
    return nothing;
  }
  if (!event || typeof event !== "object") return nothing;
  const e = event as {
    response?: unknown;
    type?: unknown;
    delta?: unknown;
    usage?: Record<string, unknown>;
    choices?: { delta?: { content?: unknown; reasoning_content?: unknown; reasoning?: unknown }; text?: unknown }[];
  };
  const choice = e.choices?.[0];
  const chars =
    lengthOf(e.response) +
    lengthOf(choice?.delta?.content) +
    lengthOf(choice?.delta?.reasoning_content) +
    lengthOf(choice?.delta?.reasoning) +
    lengthOf(choice?.text) +
    (typeof e.type === "string" && e.type.endsWith(".delta") ? lengthOf(e.delta) : 0);
  // The counts are in "usage", next to the text or inside a last "response" object.
  const inside = e.response && typeof e.response === "object" ? (e.response as { usage?: Record<string, unknown> }).usage : undefined;
  const u = e.usage ?? inside;
  const inTokens = count(u?.prompt_tokens) ?? count(u?.input_tokens);
  const outTokens = count(u?.completion_tokens) ?? count(u?.output_tokens);
  return { chars, usage: inTokens !== null && outTokens !== null ? { inTokens, outTokens } : null };
}

/** Reads a whole answer stream and measures it. The newest token counts win: models send them at the end. */
export async function measureStream(stream: ReadableStream<Uint8Array>): Promise<Measured> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const total: Measured = { chars: 0, usage: null };
  let buffer = "";
  const take = (final: boolean) => {
    const lines = buffer.split(/\r?\n/);
    buffer = final ? "" : (lines.pop() ?? "");
    for (const line of lines) {
      const data = line.startsWith("data:") ? line.slice(5).trim() : line.trim();
      if (!data.startsWith("{")) continue;
      const piece = measurePiece(data);
      total.chars += piece.chars;
      if (piece.usage) total.usage = piece.usage;
    }
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    take(false);
  }
  buffer += decoder.decode();
  take(true);
  return total;
}

/** What a question really cost. With the model's own counts when it gave them, with an estimate when not. */
export const costOf = (model: TutorModel, messages: ChatMessage[], measured: Measured) =>
  measured.usage ? neuronsFor(model, measured.usage.inTokens, measured.usage.outTokens) : neuronsFor(model, tokensIn(charsOf(messages)), tokensIn(measured.chars));

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
