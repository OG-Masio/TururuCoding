---
title: "Streaming: show the answer while it is written"
minutes: 30
---

Your helper waits until the whole answer is ready, and then shows it at once. For a long answer that is many seconds of "Thinking…". A model writes word by word, and it can send every piece the moment it is written. That is called **streaming**. It does not make the model faster, but the first words appear almost at once, and that is what feels fast.

## Answer

```js file=src/index.js
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

const SYSTEM = `You are the helper on the website of Corner Bakery.
Answer in one or two short sentences.
Use only what the page says. If the page does not say it, tell the visitor to call the bakery.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      const question = String(body.question ?? "").slice(0, 500);
      const page = String(body.page ?? "").slice(0, 4000);
      const messages = [
        { role: "system", content: SYSTEM + '\n\nThe page says:\n"""\n' + page + '\n"""' },
        { role: "user", content: question },
      ];
      const stream = await env.AI.run(MODEL, { messages, max_tokens: 800, stream: true });
      return new Response(stream, { headers: { "content-type": "text/event-stream" } });
    }

    return new Response("Not found", { status: 404 });
  },
};
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
    body: JSON.stringify({ question: question.value, page: document.querySelector("#info").textContent }),
  });
  await showStream(response);
});

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

The Worker got **shorter**:

- `stream: true` Asks the model to send the answer in pieces. `env.AI.run` now gives back a **stream**: a pipe that the pieces come out of, one after the other.
- `new Response(stream, { headers: { "content-type": "text/event-stream" } })` The Worker does not read the stream. It connects the pipe from the model straight to the browser. `text/event-stream` tells the browser what kind of data this is.
- `textOf` is gone: the Worker no longer looks inside the answer.

What travels through the pipe looks like this. Every piece is one line that starts with `data:`, with an empty line after it:

```
data: {"choices":[{"delta":{"content":"We are"}}]}

data: {"choices":[{"delta":{"content":" open on Saturday"}}]}

data: [DONE]
```

The browser got **longer**, because it now has to put the pieces together:

- `response.body.getReader()` Gives you a reader for the pipe.
- `await reader.read()` Waits for the next chunk of data. `done` is true when the pipe is empty and closed.
- `while (true) { … if (done) break; … }` Keep reading until the end.
- `new TextDecoder()` and `decoder.decode(value, { stream: true })` Data arrives as raw numbers (bytes). The decoder turns them into text.
- `waiting += …` A chunk can stop in the middle of a line. So new text is added to what is still waiting.
- `const lines = waiting.split("\n"); waiting = lines.pop();` Cut the text into lines. The last line may be unfinished, so it goes back into `waiting` for the next round.
- `if (!line.startsWith("data:")) continue;` Skip empty lines.
- `text += textFrom(line.slice(5).trim());` Take the part after `data:`, get the words out of it, and add them to the answer so far.
- `answer.textContent = text;` Show the answer so far. This line runs many times, and that is what you see as writing.
- `textFrom(data)` Like `textOf` in the Worker before, for one piece: older models put the words in `response`, newer ones in `choices[0].delta.content`. `[DONE]` is the model saying "that was all".
- `try { … } catch { return ""; }` If a line is not valid data, ignore it and go on. One strange line must not break the whole answer.

## Run it

If Wrangler is not running, start it in the terminal:

```bash
npx wrangler dev
```

Save both files. Ask on `http://localhost:8787`:

`Tell me about everything you bake and when you are open.`

The words now appear one after the other. With a short answer you may only see two or three steps. Add the line `Answer in ten sentences.` to `SYSTEM` for a moment to see it clearly, and take it out again.

## Twist

While the answer is being written, a second click on **Ask** starts a second answer that writes into the same place. Stop that:

1. In `chat.js`, get the button: `const button = form.querySelector("button");`
2. Turn it off when the form is sent: `button.disabled = true;`
3. Turn it on again when the answer is complete, also when something goes wrong. Put the `fetch` and `showStream` lines inside `try { … } finally { button.disabled = false; }`

## Check yourself

- The answer appears piece by piece and not all at once
- While an answer is being written, the Ask button is gray and cannot be clicked
- After the answer, the button works again
- I can say why the Worker got shorter and the browser code got longer

## Twist answer

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
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: question.value, page: document.querySelector("#info").textContent }),
    });
    await showStream(response);
  } finally {
    button.disabled = false;
  }
});

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

## What changed

- `button.disabled = true;` A disabled button cannot be clicked, and the browser shows it gray.
- `try { … } finally { … }` The code in `finally` always runs, whether the `try` part worked or broke. Without it, one network error would leave the button gray forever.
- The tutor of this site has the same three parts. The pipe from the model to the browser: `askModel` in `cloudflare/tutor.ts`. The reader: `readEvents` in `src/lib/tutor.ts`. The function for one piece: `readEvent`, in the same file.
