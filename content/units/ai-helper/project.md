---
title: A tutor for your own site
minutes: 90
---

You built a chat helper for a bakery that does not exist. Now you do three things with it. You read the real tutor of this site and find every lesson of this unit in it. You turn the helper into one for a page of your own. And you put it online, with its key and its daily limit, so that it works from any device.

## Result

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

## Steps

### Step 1: Read the real tutor

The tutor of TururuCoding is the same machine as your helper, with more care in each part. Open the folder of this site on your computer (the one with `cloud-deploy.bat`) in VS Code, and find each of these. You do not have to understand every line. Find the part, and read the comment above it.

| In this unit | In the real tutor | File |
| --- | --- | --- |
| The model name and its backup (lesson 8) | `MODEL` and `BACKUP_MODEL` | `cloudflare/tutor.ts` |
| The daily limit and the sum behind it (7) | `DAILY_LIMIT`, with the sum in the comment above it | `cloudflare/tutor.ts` |
| Cutting text to size (5) | `LIMITS` and `readTutorRequest` | `cloudflare/tutor.ts` |
| The system prompt (4) | `INSTRUCTIONS` | `cloudflare/tutor.ts` |
| Building the list of messages (1 and 5) | `buildMessages` | `cloudflare/tutor.ts` |
| Asking the first model that answers (8) | `askModel` | `cloudflare/tutor.ts` |
| The key (7) | `isAuthorized` | `cloudflare/worker.ts` |
| Counting questions per day (7) | `takeTutorTurn` | `cloudflare/worker.ts` |
| The four steps in order (7) | `handleTutor` | `cloudflare/worker.ts` |
| Sending the question from the browser (2) | `askTutor` | `src/lib/tutor.ts` |
| Reading the stream (6) | `readEvents` and `readEvent` | `src/lib/tutor.ts` |

Two things the real tutor has that your helper does not have yet:

- **It sends the chat so far**, so you can ask a second question. Your helper sends one question at a time. The list of messages from lesson 1 is how it is done.
- **It shows the answer safely.** A model can write HTML in its answer. The tutor shows such HTML as text and never runs it. Your helper is safe for another reason: it uses `textContent`, which always shows text as text. Never put a model's answer into a page with `innerHTML`.

### Step 2: Make the page yours

Replace the bakery with something real: a page about you, about a hobby, or about a project. Keep these four things, because `chat.js` looks for them by their id: the element with `id="info"`, the form with `id="chat"`, the field with `id="question"`, and the paragraph with `id="answer"`.

```html
<p id="info">Everything the helper should know goes in here.</p>
```

- The text inside `info` is all the helper knows. Write full sentences with real facts: names, times, prices, places.
- You can make `info` a `div` or a `main` with many paragraphs in it. `textContent` reads all the text inside it.
- If you did unit 2, bring your `style.css` along: put it in the folder `public` and connect it with a `link` in the `head`.

### Step 3: Write the system prompt for your page

In `src/index.js`, rewrite `SYSTEM` with the four questions from lesson 4:

```js
const SYSTEM = `You are the helper on the website of ...
Visitors are ...
Answer in one or two short sentences.
Use only what the page says. If the page does not say it, ...`;
```

- Keep the line `Use only what the page says.` It is what stops the model from inventing facts about you.
- Decide what the helper says when it cannot answer. "Write to me at the address on the page" is better than "I do not know".
- Start `npx wrangler dev`, ask five different questions, and change the prompt until you like every answer. This is normal work with a model: write, try, change.

### Step 4: Make the storage for the daily count

On your own computer, Wrangler used a practice copy of the storage. Online, it needs a real one. In the terminal:

```bash
npx wrangler kv namespace create COUNTER
```

- Wrangler makes the storage in your Cloudflare account and prints its **id**: a long line of letters and numbers.
- It may ask whether it should add the id to `wrangler.jsonc` for you. Say yes. If it does not ask, copy the id and paste it in the place of `paste-the-id-here-before-you-deploy`.
- The id is not a secret. It is only a name.

### Step 5: Put it online

```bash
npx wrangler deploy
```

- Wrangler uploads the Worker and the folder `public`, and prints the address of your helper. It ends with `workers.dev`.
- Open the address. The page is there. Ask a question, type any key: the answer is `Wrong key.` That is correct. The server has no key yet, so nobody gets in. Your helper is closed until you open it.

### Step 6: Give the server its key

The file `.dev.vars` is only for your own computer. It is never uploaded. The server gets its key with a command:

```bash
npx wrangler secret put CHAT_KEY
```

- Wrangler asks for the value. Type a long key that you did not use anywhere else, and press Enter. What you type may not show on the screen. That is on purpose.
- A **secret** is kept in a locked place at Cloudflare. After this command, nobody can read it again, not even you. The Worker gets it as `env.CHAT_KEY`.
- Reload your page online, ask a question, and type the key. The helper answers.

### Step 7: Check it like a stranger would

Open the address in a private window of your browser, or on your phone:

- Without the key, there is no answer.
- Open **View page source**. Your key is not in it. The model name is not in it. The system prompt is not in it.
- Type the address of the Worker with `/api/chat` at the end into the address bar. The answer is `Not found`: the helper only listens to `POST`, with a key.

Then paste the address of your helper into the field **Where is it online?** at the bottom of this page.

## Make it yours

1. **Let the helper remember the chat.** In `chat.js`, keep a list `const chat = [];`. After every answer, add the question and the answer to it, and send the list along. In the Worker, put those messages between the system message and the new question. Cut the list to the last six messages, or every question gets more expensive.
2. **Show how many questions are left.** In the Worker, add a header to the answer: `"x-left": String(DAILY_LIMIT - used - 1)`. In `chat.js`, read it with `response.headers.get("x-left")` and show it under the form.
3. **Change the model.** Put another model from Cloudflare's list first in `MODELS`. Ask the same five questions as in step 3 and compare. Do the sum from lesson 7 again with the new model's prices.
4. **Give it a face.** Style the form and the answer with what you learned in unit 2.

After every change: try it with `npx wrangler dev`, then put it online again with `npx wrangler deploy`.

## On your computer

Your helper now lives in two places. The folder `chat-helper` on your computer is where you change it. Cloudflare is where it runs.

| You want to | Do this |
| --- | --- |
| Change something | Change the file, test with `npx wrangler dev`, then `npx wrangler deploy` |
| See what the Worker writes with `console.log` | `npx wrangler tail`, then ask a question online |
| Change the key | `npx wrangler secret put CHAT_KEY` again |
| Switch the helper off | In the Cloudflare dashboard, open the Worker `chat-helper` and delete it |

If you ever put this folder on GitHub, two things must stay out of it: the file `.dev.vars`, because it holds your key, and the folder `node_modules`, because it is big and anyone can download it again. Make a file with the name `.gitignore` in the folder, with these two lines in it:

```
.dev.vars
node_modules
```
