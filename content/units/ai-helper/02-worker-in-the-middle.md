---
title: Why the browser must never talk to the model itself
minutes: 25
---

Most videos about chat bots put the call to the AI in the page's own JavaScript. That is the wrong place. Everything a browser gets can be read by the person using it, and a key that sits in the page is a key for the whole world. The proper way has a small server of your own in the middle. In this lesson you build that middle, still without AI.

## Answer

```jsonc file=wrangler.jsonc
{
  "name": "chat-helper",
  "main": "src/index.js",
  "compatibility_date": "2026-06-01",
  "assets": { "directory": "public" }
}
```

```js file=src/index.js
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      return Response.json({ answer: "You asked: " + body.question });
    }

    return new Response("Not found", { status: 404 });
  },
};
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
});
```

## Explanation

The picture of the whole unit:

<div class="flow" role="img" aria-label="Three boxes in a row. Left: the browser, which is public, with index.html and chat.js. Middle: your Worker, which is yours and private, with src/index.js. Right: the AI model. The question goes from the browser to the Worker, and the Worker sends messages to the model. The model sends text back to the Worker, and the Worker sends the answer back to the browser.">
<div class="flow__part"><p class="flow__name">the browser <small>public</small></p><div class="flow__box"><code>index.html</code><code>chat.js</code></div></div>
<div class="flow__link"><span class="flow__go">question</span><span class="flow__back">answer</span></div>
<div class="flow__part"><p class="flow__name">your Worker <small>yours, private</small></p><div class="flow__box"><code>src/index.js</code></div></div>
<div class="flow__link"><span class="flow__go">messages</span><span class="flow__back">text</span></div>
<div class="flow__part"><p class="flow__name">the model <small>&nbsp;</small></p><div class="flow__box">AI</div></div>
</div>

Everything in the left box is sent to the visitor's computer. Anyone can open it and read it: right-click on a page, **View page source**. A key, a password or a rule ("only 50 questions a day") that lives there can be read, copied and removed. The middle box runs on a server. Nobody outside can read its code or its secrets. So the rule is: **the browser asks your server, and only your server asks the model.**

A **Worker** is a small server program that Cloudflare runs for you. This site runs on one.

- `wrangler.jsonc` The settings of the project. Wrangler is Cloudflare's tool for Workers.
- `"main": "src/index.js"` The file with the server code.
- `"assets": { "directory": "public" }` Files in the folder `public` are sent to the browser as they are. Every other address goes to your code.
- `export default { async fetch(request) { … } }` The shape of every Worker. Cloudflare calls `fetch` once for every request and sends back what it returns.
- `new URL(request.url)` Takes the address apart, so you can look at its path.
- `url.pathname === "/api/chat" && request.method === "POST"` "Is this a message for the chat?" `POST` is the kind of request that carries data.
- `await request.json()` Reads the data the browser sent. `await` means: wait until it has arrived.
- `Response.json({ answer: … })` Sends data back. For now the Worker only repeats the question.
- `new Response("Not found", { status: 404 })` The answer for every other address.

And in the browser:

- `<script src="chat.js"></script>` Loads the browser code, at the end of the `body`, when the form already exists.
- `form.addEventListener("submit", async (event) => { … })` Run this code when the form is sent.
- `event.preventDefault();` Stops the browser from loading a new page, which is what a form normally does.
- `fetch("/api/chat", { method: "POST", … })` Sends a request to **your own server**. No other address is in this file, and no key.
- `JSON.stringify({ question: question.value })` Packs the typed question as text that can travel.
- `answer.textContent = data.answer;` Shows what came back.

## Run it

In the terminal, inside the folder `chat-helper`:

```bash
npm init -y
npm install --save-dev wrangler
```

- `npm init -y` makes the file `package.json`. It marks the folder as a project.
- `npm install --save-dev wrangler` downloads Wrangler into the folder `node_modules`. This takes a minute.

Make the folders `src` and `public`, and the four files from the answer. Your folder now looks like this:

```
chat-helper/
  node_modules/      (made by npm, leave it alone)
  package.json
  wrangler.jsonc
  messages.js        (from lesson 1)
  src/
    index.js
  public/
    index.html
    chat.js
```

Start the Worker on your own computer:

```bash
npx wrangler dev
```

The first time, Wrangler may ask a question about sending usage data. Answer what you like. Then it prints `Ready on http://localhost:8787`. Open that address in your browser, type a question, and press **Ask**. Under the form you see `You asked:` and your question.

Leave the terminal open while you work: Wrangler loads your changes by itself when you save a file. To stop it, click in the terminal and press `Ctrl` `C`.

## Twist

Prove that the Worker does the work, and not the page. Change `src/index.js` so that the answer is the question in capital letters, with the number of letters behind it. For `hello` the answer is:

```
HELLO (5 letters)
```

`body.question.toUpperCase()` gives the capital letters, and `body.question.length` the number of letters. Do not change `chat.js`.

## Check yourself

- `http://localhost:8787` shows the bakery page with the form
- I type `hello`, press Ask, and see `HELLO (5 letters)`
- In the browser I opened **View page source** and found no line that makes capital letters: that code is only on the server
- I can say in one sentence why a key must not be in `chat.js`

## Twist answer

```js file=src/index.js
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      const loud = body.question.toUpperCase();
      return Response.json({ answer: loud + " (" + body.question.length + " letters)" });
    }

    return new Response("Not found", { status: 404 });
  },
};
```

## What changed

- `const loud = body.question.toUpperCase();` The work happens on the server. The browser sends a question and gets back an answer. It does not know how the answer was made.
- That is exactly the place where the model goes in the next lesson. The page will not change at all: it already asks `/api/chat` and shows what comes back.
- The page source in the browser shows `index.html` and `chat.js`, and nothing of `src/index.js`. What is in `src` stays on the server.
