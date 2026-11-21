---
title: "Quick check: an AI chat helper"
---

Unit 20 teaches how to put an AI chat helper on a page the proper way: with your own small server between the page and the model. If you can already build that, this one task shows it. The answer is right below, like always.

## Task

Build a Cloudflare Worker with a small page, with these parts:

1. A page with a form. It sends the question, and the text of the page, to `POST /api/chat` on your own Worker. No model address and no key are in the page's code.
2. The Worker refuses a request without the right key in the `authorization` header. The key is a secret of the Worker.
3. The Worker cuts the question and the page text to a fixed length.
4. The Worker counts questions per day and stops after a limit, before it asks the model.
5. The Worker gives the model a system prompt with instructions and the page text, and asks a Workers AI model through the `AI` binding.
6. The answer is streamed, and the page shows it while it grows.
7. If the first model does not start, a second one is tried.

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

```js file=src/index.js
// The models to try, in order. The second one is the backup.
const MODELS = ["@cf/google/gemma-4-26b-a4b-it", "@cf/zai-org/glm-4.7-flash"];

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

  // 4. Ask the first model that answers.
  for (const model of MODELS) {
    try {
      const stream = await env.AI.run(model, { messages, max_tokens: 800, stream: true });
      return new Response(stream, { headers: { "content-type": "text/event-stream" } });
    } catch (error) {
      console.log("Model failed: " + model + " (" + error.message + ")");
    }
  }
  return Response.json({ error: "No model answered. Try again in a minute." }, { status: 502 });
}
```

```html file=public/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Corner Bakery</title>
  </head>
  <body>
    <h1>Corner Bakery</h1>
    <p id="info">We are open Monday to Friday from 6 am to 4 pm, and Saturday from 7 am to 1 pm. We bake sourdough bread, butter croissants and cinnamon rolls.</p>

    <h2>Ask the helper</h2>
    <form id="chat">
      <input id="question" type="text" placeholder="Type a question" required>
      <button type="submit">Ask</button>
    </form>
    <p id="answer"></p>

    <script src="chat.js"></script>
  </body>
</html>
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

Everything in these files is taught in unit 20: the list of messages (lesson 1), the Worker between the page and the model (2), the `AI` binding and `env.AI.run` (3), the system prompt (4), the page text as context and cutting it to size (5), streaming and reading the stream in the browser (6), the key and the daily count (7), and the list of models with a backup (8).

This unit uses JavaScript in every lesson. Units 4 to 6 teach JavaScript from the start. If the code above is hard to read, do those first and come back: the lessons here explain every line, but they do not teach the language.
