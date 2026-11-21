---
title: "The system prompt: tell the model who it is helping"
minutes: 20
---

Ask your helper "When are you open?" and it does not know that it works for a bakery. It answers like a general chat bot, often with half a page of text. One extra message at the start of the list fixes that. It is called the **system prompt**, and it is the most powerful part of any chat helper.

## Answer

```js file=src/index.js
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

const SYSTEM = `You are the helper on the website of Corner Bakery.
Answer in one or two short sentences.
If you do not know the answer, say so. Do not make things up.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      const messages = [
        { role: "system", content: SYSTEM },
        { role: "user", content: body.question },
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

## Explanation

- ``const SYSTEM = `…`;`` The instructions, as a text over several lines. Text between backticks (`` ` ``) may have line breaks in it. Normal quotes may not.
- `{ role: "system", content: SYSTEM }` The first message of the list, with the role `system` from lesson 1. The model reads it before the question and follows it for the whole chat.
- `You are the helper on the website of Corner Bakery.` **Who** the model is. This gives it a job and a place.
- `Answer in one or two short sentences.` **How** to answer. Without a line like this, models write a lot.
- `If you do not know the answer, say so. Do not make things up.` **What to do at the edge.** A model that has no answer will invent one unless you tell it not to. This line does not make inventing impossible, but it makes it much rarer.

The system prompt is on the server, in `src/index.js`. The visitor cannot read it and cannot change it. If it were in `chat.js`, anyone could rewrite it and use your helper for something else. This is the second reason for the Worker in the middle.

A good system prompt answers four questions:

| Question | Example line |
| --- | --- |
| Who are you? | `You are the helper on the website of Corner Bakery.` |
| Who are you talking to? | `Visitors are customers who want to buy bread.` |
| How do you answer? | `Answer in one or two short sentences.` |
| What do you do when you cannot help? | `If you do not know the answer, say so.` |

Write it like you would explain the job to a new colleague: plain sentences, one rule per line.

## Run it

If you added `raw` in the last lesson, take it out again in all three files: the answer above has it removed from `src/index.js`, and in the page it is the `pre` line in `index.html` and the two lines with `raw` in `chat.js`. Save. Wrangler loads the change by itself. If it is not running, start it:

```bash
npx wrangler dev
```

Ask these two questions on `http://localhost:8787`:

1. `What is sourdough bread?` The answer is now one or two sentences.
2. `When are you open on Saturday?` The helper should say that it does not know. The opening hours are on the page, but nobody gave them to the model. That is the next lesson.

## Twist

Change the instructions and watch the helper change. Add two lines to `SYSTEM`:

1. `Answer in Spanish.` (or in another language you can read)
2. `End every answer with: Enjoy your bread!` (written in that language)

Ask `What is a croissant?` again.

## Check yourself

- With the first system prompt, answers are short
- The helper says that it does not know the Saturday hours, and does not invent a time
- After the twist, the answer is in the other language and ends with the bread sentence
- I did not change `chat.js` or `index.html` in this lesson

## Twist answer

```js file=src/index.js
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

const SYSTEM = `You are the helper on the website of Corner Bakery.
Answer in one or two short sentences.
If you do not know the answer, say so. Do not make things up.
Answer in Spanish.
End every answer with: ¡Disfruta tu pan!`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      const messages = [
        { role: "system", content: SYSTEM },
        { role: "user", content: body.question },
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

## What changed

- Two lines of plain text changed the language and the ending of every answer. No code changed. This is why people say that with AI, **writing instructions is programming**.
- The question was in English and the answer came in Spanish, because the system prompt is stronger than the user's message. That order is the point: your rules first, the visitor's wishes inside them.
- The tutor of this site works the same way. Its instructions are in the file `cloudflare/tutor.ts`, under the name `INSTRUCTIONS`. Read them: you will recognise the four questions from the table.
- Take the two twist lines out again before the next lesson.
