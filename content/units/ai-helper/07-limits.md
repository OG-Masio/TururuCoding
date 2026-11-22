---
title: "Limits: a daily budget, and who is allowed to ask"
minutes: 35
---

Your helper works, and it has two holes. Anyone who finds the address can ask it anything, as often as they want. And nothing stops a thousand questions a day. Both holes cost **you**: the free daily amount is shared by everything in your account, and on a paid plan the rest is billed. This lesson closes both, on the server, where a visitor cannot open them again.

## Answer

```jsonc file=wrangler.jsonc
{
  "name": "chat-helper",
  "main": "src/index.js",
  "compatibility_date": "2026-06-01",
  "assets": { "directory": "public" },
  "ai": { "binding": "AI" },
  "kv_namespaces": [{ "binding": "COUNTER", "id": "paste-the-id-here-before-you-deploy" }]
}
```

```text file=.dev.vars
CHAT_KEY=choose-your-own-long-key
```

```js file=src/index.js
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

// Questions the helper answers per day. This keeps it inside the free amount.
const DAILY_LIMIT = 50;

const SYSTEM = `You are the helper on the website of Corner Bakery.
Answer in one or two short sentences.
Use only what the page says. If the page does not say it, tell the visitor to call the bakery.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat" && request.method === "POST") return chat(request, env);
    return new Response("Not found", { status: 404 });
  },
};

async function chat(request, env) {
  // 1. Who is asking?
  if (!env.CHAT_KEY || request.headers.get("authorization") !== "Bearer " + env.CHAT_KEY) {
    return Response.json({ error: "Wrong key." }, { status: 401 });
  }

  // 2. What is the question? Long text is cut, so one question can never be expensive.
  const body = await request.json();
  const question = String(body.question ?? "").slice(0, 500);
  const page = String(body.page ?? "").slice(0, 4000);
  if (!question) return Response.json({ error: "Type a question first." }, { status: 400 });

  // 3. Is there budget left today?
  const day = new Date().toISOString().slice(0, 10);
  const used = Number(await env.COUNTER.get(day)) || 0;
  if (used >= DAILY_LIMIT) {
    return Response.json({ error: "The helper has answered enough for today. Come back tomorrow." }, { status: 429 });
  }
  await env.COUNTER.put(day, String(used + 1), { expirationTtl: 172800 });

  const messages = [
    { role: "system", content: SYSTEM + '\n\nThe page says:\n"""\n' + page + '\n"""' },
    { role: "user", content: question },
  ];
  const stream = await env.AI.run(MODEL, { messages, max_tokens: 800, stream: true });
  return new Response(stream, { headers: { "content-type": "text/event-stream" } });
}
```

```js file=public/chat.js
const form = document.querySelector("#chat");
const question = document.querySelector("#question");
const answer = document.querySelector("#answer");
const button = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  answer.textContent = "Thinking…";
  button.disabled = true;
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + getKey() },
      body: JSON.stringify({ question: question.value, page: document.querySelector("#info").textContent }),
    });
    if (!response.ok) {
      const data = await response.json();
      answer.textContent = data.error;
      if (response.status === 401) localStorage.removeItem("chat-key");
      return;
    }
    await showStream(response);
  } finally {
    button.disabled = false;
  }
});

/** The key is typed in once and kept in this browser. It is never written in this file. */
function getKey() {
  let key = localStorage.getItem("chat-key");
  if (!key) {
    key = prompt("Key for the helper:") ?? "";
    localStorage.setItem("chat-key", key);
  }
  return key;
}

/** Reads the answer piece by piece and shows it while it grows. */
async function showStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let waiting = "";
  let text = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    waiting += decoder.decode(value, { stream: true });
    const lines = waiting.split("\n");
    waiting = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      text += textFrom(line.slice(5).trim());
      answer.textContent = text;
    }
  }
  if (!text) answer.textContent = "The helper had no answer. Try again.";
}

/** One piece of the stream. Models use one of two shapes. This reads both. */
function textFrom(data) {
  if (data === "[DONE]" || data === "") return "";
  try {
    const piece = JSON.parse(data);
    if (typeof piece.response === "string") return piece.response;
    return piece.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}
```

## Explanation

The chat code moved into its own function, `chat(request, env)`, because it grew. It now does four things in order, and stops at the first one that fails.

**1. Who is asking: the key**

- `.dev.vars` A file for secrets on your own computer. Wrangler reads it and puts each line into `env`. Choose your own long key. This file must never be shared or uploaded. On the real server the key is set with a command, in the project of this unit.
- `request.headers.get("authorization")` A header is a small label on a request. `authorization` is the usual label for "here is my key".
- `!== "Bearer " + env.CHAT_KEY` The label must be exactly the word `Bearer`, a space, and the key.
- `!env.CHAT_KEY ||` If the server has no key at all, nobody gets in. Without this check, a missing key would let in everyone who sends `Bearer undefined`.
- `{ status: 401 }` The number for "I do not know you".
- In `chat.js`: `getKey()` asks for the key once, with a small window, and keeps it in `localStorage`, a storage place in the browser. The key is typed by a person. It is **not** in the code, so reading the page source does not show it.
- `localStorage.removeItem("chat-key")` After a wrong key, forget it, so the next try asks again.

**2. The question, cut to size.** You know this from lesson 5. An empty question stops here, before it counts.

**3. The daily budget**

- `"kv_namespaces": [{ "binding": "COUNTER", … }]` A second binding. **KV** is a small storage of Cloudflare: names with values. The Worker gets it as `env.COUNTER`. On your own computer Wrangler makes a practice copy, so the `id` can wait until you put the project online.
- `new Date().toISOString().slice(0, 10)` Today's date as text, like `2026-11-21`. It is the name under which today's count is kept.
- `Number(await env.COUNTER.get(day)) || 0` Read today's count. No count yet means 0.
- `if (used >= DAILY_LIMIT)` Budget used up: answer with a friendly sentence and the status `429`, the number for "too many requests". The model is **not** asked.
- `env.COUNTER.put(day, String(used + 1), { expirationTtl: 172800 })` Count this question. `expirationTtl` makes the count delete itself after two days (172,800 seconds), so old days do not pile up.

**4. Ask the model.** Unchanged.

How do you choose `DAILY_LIMIT`? With a sum. Cloudflare counts AI use in a unit called **Neurons**. When this lesson was written (November 2026), an account got 10,000 Neurons a day for free. With this model, one question of this helper uses at most about 45: the text you send is cut at 4,500 letters and the answer at 800 tokens. Fifty questions are then at most 2,250 Neurons. Even 200 questions a day would stay inside the free amount. The prices of each model are on Cloudflare's pricing page for Workers AI. Check them there when you change the model: they are different for every model, and they change.

## Run it

1. Make the file `.dev.vars` next to `wrangler.jsonc`, with your own key in it.
2. Change the other three files to the answer.
3. Stop Wrangler (`Ctrl` `C`) and start it again, so that it reads the new settings and the key:

```bash
npx wrangler dev
```

4. Open `http://localhost:8787` and ask a question. A small window asks for the key. Type a **wrong** key first: the page says `Wrong key.`
5. Ask again, and type the key from `.dev.vars`. The answer comes, and the browser does not ask for the key again.

## Twist

See the budget work. Set `DAILY_LIMIT` to `3`, save, and ask four questions. Then set it back to `50`.

The count of today stays where it is when you change the limit back, so the helper works again right away.

## Check yourself

- A wrong key gives `Wrong key.`, and the next try asks for the key again
- With the right key I get answers, and I am asked only once
- With the limit at 3, the fourth question gets the "enough for today" sentence
- In the terminal, the fourth question shows the status `429`, and no model was asked
- `.dev.vars` is not in `public`, and my key is not written in any file in `public`

## Twist answer

```js file=src/index.js
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

// Questions the helper answers per day. This keeps it inside the free amount.
const DAILY_LIMIT = 3;

const SYSTEM = `You are the helper on the website of Corner Bakery.
Answer in one or two short sentences.
Use only what the page says. If the page does not say it, tell the visitor to call the bakery.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat" && request.method === "POST") return chat(request, env);
    return new Response("Not found", { status: 404 });
  },
};

async function chat(request, env) {
  // 1. Who is asking?
  if (!env.CHAT_KEY || request.headers.get("authorization") !== "Bearer " + env.CHAT_KEY) {
    return Response.json({ error: "Wrong key." }, { status: 401 });
  }

  // 2. What is the question? Long text is cut, so one question can never be expensive.
  const body = await request.json();
  const question = String(body.question ?? "").slice(0, 500);
  const page = String(body.page ?? "").slice(0, 4000);
  if (!question) return Response.json({ error: "Type a question first." }, { status: 400 });

  // 3. Is there budget left today?
  const day = new Date().toISOString().slice(0, 10);
  const used = Number(await env.COUNTER.get(day)) || 0;
  if (used >= DAILY_LIMIT) {
    return Response.json({ error: "The helper has answered enough for today. Come back tomorrow." }, { status: 429 });
  }
  await env.COUNTER.put(day, String(used + 1), { expirationTtl: 172800 });

  const messages = [
    { role: "system", content: SYSTEM + '\n\nThe page says:\n"""\n' + page + '\n"""' },
    { role: "user", content: question },
  ];
  const stream = await env.AI.run(MODEL, { messages, max_tokens: 800, stream: true });
  return new Response(stream, { headers: { "content-type": "text/event-stream" } });
}
```

## What changed

- `const DAILY_LIMIT = 3;` One number, and the fourth question of the day is refused before the model is asked. A refused question costs nothing.
- The limit is in `src/index.js`, on the server. A visitor cannot read it, change it or go around it. If the count were kept in the browser, clearing the browser's storage would reset it.
- This counter is simple, and it has a weak spot: two questions that arrive in the very same moment can both read the same count. For a small helper that does not matter. The tutor of this site needs an exact count, so it uses a **Durable Object**, which handles requests one at a time. Look for `takeTutorTurn` in `cloudflare/worker.ts`.
- The key in this lesson is compared as plain text. The real site keeps only a scrambled form (a hash) of the key on the server. Look for `isAuthorized` in the same file.
