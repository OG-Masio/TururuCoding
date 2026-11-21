---
title: "Give the model context: the page and the user's code"
minutes: 25
---

The helper does not know the opening hours, and the model was not trained on your bakery. You do not need to train anything. You **give the model the text it needs, together with the question**. That text is called context. It is how the tutor of this site knows which lesson you are on and what is in your editor.

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
  const data = await response.json();
  answer.textContent = data.answer;
});
```

## Explanation

In the browser:

- `page: document.querySelector("#info").textContent` The text of the paragraph with the id `info`, sent along with the question. `textContent` is the text of an element without its tags.

In the Worker:

- `String(body.question ?? "")` Whatever the browser sent, make it text. A server never trusts what a browser sends: someone can send anything to your address, without using your page.
- `.slice(0, 500)` Keep at most the first 500 letters. A question is short. A "question" of a million letters is someone trying to use up your free amount.
- `.slice(0, 4000)` The same for the page text, with a bigger limit. These two numbers decide how much one question can cost at most. Lesson 7 comes back to them.
- `SYSTEM + '\n\nThe page says:\n"""\n' + page + '\n"""'` The context goes into the system message, after the instructions. `\n` is a line break. The three quote marks before and after the page text are a fence: they show the model where the page text starts and stops, so that it does not mix it up with your instructions.
- `Use only what the page says.` The new line in `SYSTEM`. Now the model has a source, and you tell it to stay with that source.
- `tell the visitor to call the bakery` A better edge than "say you do not know": the visitor gets a next step.

The model still has no memory and learned nothing. With every question it gets the page text again, reads it, and answers from it. Change the page, and the next answer changes too.

This is the pattern behind almost every "chat with your documents" product: find the right text, put it in front of the question, tell the model to use it.

## Run it

If Wrangler is not running, start it in the terminal:

```bash
npx wrangler dev
```

Save both files and ask on `http://localhost:8787`:

1. `When are you open on Saturday?` The helper now answers with the hours from the page.
2. `Do you sell coffee?` The page does not say. The helper should tell you to call the bakery.

## Twist

The bakery starts selling gluten-free bread on Fridays. Teach the helper, without touching the Worker:

1. In `index.html`, add this sentence to the end of the `info` paragraph: `On Fridays we also bake gluten-free bread.`
2. Reload the page and ask: `Do you have gluten-free bread?`

## Check yourself

- The helper gives the Saturday hours from the page
- For a question the page cannot answer, it sends me to the bakery and does not invent an answer
- After the twist it knows about the gluten-free bread, and I did not change `src/index.js`
- I can say what `.slice(0, 4000)` protects me from

## Twist answer

```html file=public/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Corner Bakery</title>
  </head>
  <body>
    <h1>Corner Bakery</h1>
    <p id="info">We are open Monday to Friday from 6 am to 4 pm, and Saturday from 7 am to 1 pm. We bake sourdough bread, butter croissants and cinnamon rolls. On Fridays we also bake gluten-free bread.</p>

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

## What changed

- One sentence in the HTML, and the helper knows something new. Nobody trained a model. The page is the knowledge, and the page is easy to change.
- The Worker did not change, because it never contained the facts. It only passes on whatever the page says. That keeps the facts in one place.
- The tutor of this site does the same with more text: the lesson you are on, its answer code, and the code in your editor. In `src/pages/LessonPage.tsx`, look for `tutorContext`. In `cloudflare/tutor.ts`, look at `buildMessages`: instructions first, then the page, then the code, then the chat.
