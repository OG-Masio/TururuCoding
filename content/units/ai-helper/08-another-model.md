---
title: The same code with another model or another provider
minutes: 25
---

Models come and go. A better one arrives, an old one is switched off, a provider is down for an hour. If your code depends on one model in ten places, each of these is a bad day. In your helper the model is one line. This lesson changes it, adds a backup, and shows what stays the same when the model lives at another company.

## Answer

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

## Explanation

- `const MODELS = [ … ];` A list in the place of one name. The order is the order in which they are tried.
- `"@cf/zai-org/glm-4.7-flash"` A second open model on Workers AI, from another maker.
- `for (const model of MODELS) { … }` Try each model in turn.
- `try { … return … }` If the model starts to answer, the function returns its stream, and the loop is over.
- `catch (error) { console.log(…) }` If the model fails to start (wrong name, switched off, too busy), write a line in the terminal and go on to the next one. `console.log` in a Worker is your notebook: on your computer it shows in the terminal, online in the Cloudflare dashboard under the Worker's logs.
- `return Response.json({ error: … }, { status: 502 })` Only when every model failed. `502` is the number for "the server behind me did not answer".

Nothing else changed, and that is the lesson: `chat.js` reads both answer shapes, the system prompt is plain text, the limits count questions and not models. **Your helper is your code. The model is a part you can swap.**

Before you swap, check three things on the model's page at Cloudflare: is it in the free plan, what does it cost in Neurons (then do the sum of lesson 7 again), and how much text does it accept.

### Another provider

Some models do not live at Cloudflare but at the company that made them. Then your Worker calls that company over the internet, and this time there **is** a key. Most providers accept the same shape of request, so the code is close to what you have:

```js
const response = await fetch("https://api.example.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: "Bearer " + env.PROVIDER_KEY,
  },
  body: JSON.stringify({ model: "name-of-the-model", messages, max_tokens: 800, stream: true }),
});
return new Response(response.body, { headers: { "content-type": "text/event-stream" } });
```

This is a pattern and not a file to run: the address, the model name and the price come from the provider you choose. What matters is where the key is. `env.PROVIDER_KEY` is a secret of the Worker, set like `CHAT_KEY`. It never appears in `public`. The browser still only talks to `/api/chat`, with your own key, and cannot tell which company answered.

So the rule from lesson 2 has a second half. The browser never talks to the model, **and the provider's key never leaves the server.** A paid key in a page is how people get bills for other people's chats.

## Run it

If Wrangler is not running, start it in the terminal:

```bash
npx wrangler dev
```

Change `src/index.js` to the answer and save. Ask a question on `http://localhost:8787`. Everything works like before: the first model answers, and the backup is never needed.

## Twist

Make the first model fail, and watch the backup take over. Put a model that does not exist at the **front** of the list:

`"@cf/nobody/no-such-model"`

Ask a question, and look at the terminal where Wrangler runs.

## Check yourself

- With the normal list, I get an answer and the terminal shows no "Model failed" line
- With the wrong name in front, I still get an answer
- The terminal shows one line that starts with `Model failed: @cf/nobody/no-such-model`
- I took the wrong name out again

## Twist answer

```js file=src/index.js
// The models to try, in order. The second one is the backup.
const MODELS = ["@cf/nobody/no-such-model", "@cf/google/gemma-4-26b-a4b-it", "@cf/zai-org/glm-4.7-flash"];

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

## What changed

- The visitor noticed nothing. The first model failed, the terminal got a line, the second one answered. A helper with a backup has fewer bad days.
- The failed try still counted as one question in the budget, because the count happens before the model is asked. That is the safe order: it is better to count one too many than to let a broken loop ask the model for free, again and again.
- The tutor of this site does the same in `askModel`, in `cloudflare/tutor.ts`, with one extra rule: when Cloudflare says that the free amount of the day is used up, it does not try the backup, because the backup would fail in the same way.
