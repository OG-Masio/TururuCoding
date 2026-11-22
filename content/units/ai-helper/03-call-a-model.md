---
title: Call a model from a Worker with Workers AI
minutes: 25
---

Your Worker repeats the question. Now it asks a real model. Cloudflare runs open AI models next to your Worker, and gives the Worker a direct line to them. There is no key to copy, and nothing to pay for a small helper like this one.

## Answer

```jsonc file=wrangler.jsonc
{
  "name": "chat-helper",
  "main": "src/index.js",
  "compatibility_date": "2026-06-01",
  "assets": { "directory": "public" },
  "ai": { "binding": "AI" }
}
```

```js file=src/index.js
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      const messages = [{ role: "user", content: body.question }];
      const result = await env.AI.run(MODEL, { messages, max_tokens: 800 });
      return Response.json({ answer: textOf(result) });
    }

    return new Response("Not found", { status: 404 });
  },
};

/** Models answer in one of two shapes. This reads the text from both. */
function textOf(result) {
  if (typeof result.response === "string") return result.response;
  return result.choices?.[0]?.message?.content ?? "";
}
```

## Explanation

- `"ai": { "binding": "AI" }` A **binding** is a line from your Worker to another Cloudflare service. This one connects to Workers AI and gives it the name `AI` in your code. The binding replaces a key: Cloudflare knows the Worker is yours, so the Worker may use the AI of your account.
- `async fetch(request, env)` The second thing a Worker gets is `env`: everything its settings connected it to. The binding is there as `env.AI`.
- `const MODEL = "@cf/google/gemma-4-26b-a4b-it";` The name of the model, in one place at the top. This one is Gemma, an open model made by Google. Cloudflare's website has a list of all models with their names.
- `const messages = [{ role: "user", content: body.question }];` The list from lesson 1, with one message: the question from the browser.
- `await env.AI.run(MODEL, { messages, max_tokens: 800 })` Sends the list to the model and waits for the answer. This one line is the whole "AI part" of a chat helper.
- `max_tokens: 800` The model must stop after 800 tokens (about 600 words). An answer can never get longer, or cost more, than this.
- `textOf(result)` The model sends back a package with the answer text somewhere inside it. Older models put it in `response`. Newer ones use a longer path, `choices[0].message.content`, the form most AI companies use. This small function reads both, so your code keeps working when you change the model.
- `?.` Safety: `a?.b` means "b of a, or nothing when a does not exist".
- `??` More safety: `x ?? ""` means "x, or an empty text when there is no x".

The page (`index.html`, `chat.js`) does not change. It asks `/api/chat` and shows the answer, like before.

## Run it

The model runs at Cloudflare, also while your Worker runs on your own computer. So Wrangler must know your account. Stop the Worker if it is still running (`Ctrl` `C`), then:

```bash
npx wrangler login
```

Your browser opens. Sign in to the Cloudflare account you use for this site and press **Allow**. You do this once.

Change `wrangler.jsonc` and `src/index.js` to the answer, then start the Worker again:

```bash
npx wrangler dev
```

Open `http://localhost:8787` and ask: `What is sourdough bread?` After a few seconds an answer from the model appears.

Two things to know:

- **Every question uses your real daily free amount**, also on your own computer. A question like this one uses very little of it. Lesson 7 puts a hard limit on it.
- **If the answer stays empty**, the model used all its tokens for thinking before it wrote. Raise `max_tokens` to `1500` and ask again.

## Twist

Look at the package the model really sends. Send the whole `result` to the browser next to the answer, and show it on the page:

1. In `src/index.js`, return `{ answer: textOf(result), raw: result }`.
2. In `index.html`, add `<pre id="raw"></pre>` under the answer paragraph.
3. In `chat.js`, put the raw package into it: `JSON.stringify(data.raw, null, 2)` turns it into readable text.

## Check yourself

- I asked a question and got an answer from the model
- Under the answer I see the raw package, with my answer text somewhere inside it
- I found the place in the raw package where the number of used tokens is written (look for `usage`)
- I know which of the two shapes this model uses: `response`, or `choices`

## Twist answer

```js file=src/index.js
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      const messages = [{ role: "user", content: body.question }];
      const result = await env.AI.run(MODEL, { messages, max_tokens: 800 });
      return Response.json({ answer: textOf(result), raw: result });
    }

    return new Response("Not found", { status: 404 });
  },
};

/** Models answer in one of two shapes. This reads the text from both. */
function textOf(result) {
  if (typeof result.response === "string") return result.response;
  return result.choices?.[0]?.message?.content ?? "";
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
    <pre id="raw"></pre>

    <script src="chat.js"></script>
  </body>
</html>
```

```js file=public/chat.js
const form = document.querySelector("#chat");
const question = document.querySelector("#question");
const answer = document.querySelector("#answer");
const raw = document.querySelector("#raw");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  answer.textContent = "Thinking…";

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: question.value }),
  });
  const data = await response.json();
  answer.textContent = data.answer;
  raw.textContent = JSON.stringify(data.raw, null, 2);
});
```

## What changed

- `raw: result` The Worker passes on everything the model sent, so you can see it. This is how you learn a new model: look at what it really returns before you write code around it.
- `<pre id="raw">` A `pre` element keeps line breaks and spaces, which makes the package readable.
- `usage` in the package counts tokens: how many you sent, and how many the model wrote. Those numbers are what the free daily amount is counted from.
- Showing the raw package is for learning. Take `raw` out again before the next lesson: a visitor does not need it.
