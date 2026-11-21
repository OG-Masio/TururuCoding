---
title: "How a chat model works: messages in, text out"
minutes: 15
---

A chat model does one thing: it gets a list of messages and writes the next one. Everything in this unit is a way of building that list and showing what comes back. In this lesson you build the list by hand, without any AI, so you see exactly what a model gets.

## Answer

```js file=messages.js
// A chat with a model is a list of messages.
const messages = [
  { role: "system", content: "You are the helper on a bakery website. Answer in one short sentence." },
  { role: "user", content: "When are you open?" },
];

for (const message of messages) {
  console.log(message.role + ": " + message.content);
}
console.log("Messages in this chat: " + messages.length);
```

## Explanation

- `const messages = [ … ];` A list. This list **is** the chat. It is the only thing the model ever sees.
- `{ role: "…", content: "…" }` One message. It has two parts: who is speaking (`role`) and what is said (`content`).
- `role: "system"` Instructions from you, the builder. The visitor of your site never sees this message. It tells the model who it is and how to answer. Lesson 4 is about this message.
- `role: "user"` What the person typed.
- `role: "assistant"` An answer from the model. There is none in the list yet: the model's job is to write it.
- `for (const message of messages) { … }` Goes through the list and prints every message, so you can read the chat the way the model does.
- `messages.length` How many messages the list has.

Three facts about chat models that explain everything you build later:

| Fact | What it means for you |
| --- | --- |
| A model has **no memory** | It only knows what is in the list you send. For a second question, you send the whole chat again, with the first question and the first answer in it |
| A model reads and writes **tokens** | A token is a piece of a word, about 4 letters. You pay (or use up your free amount) per token: for everything you send, and for everything it writes |
| A model **continues the list** | It does not "look up" an answer. It writes the message that most likely comes next. That is why it can be wrong, and why good instructions matter |

## Run it

You need three things on your computer. You have the first one already, because `start.bat` of this site uses it.

1. **Node.js**. It runs JavaScript outside a browser.
2. **An editor** for code. VS Code is free and the most used.
3. **A terminal**: the window where you type commands. In VS Code: menu **Terminal**, then **New Terminal**.

Now the steps:

1. Make a new folder with the name `chat-helper`, for example in your Documents folder. The whole unit lives in this folder.
2. In VS Code: **File**, **Open Folder**, and choose `chat-helper`.
3. Make a new file in it with the name `messages.js` and type the answer into it. Save it.
4. Open the terminal in VS Code and type:

```bash
node messages.js
```

You should see:

```
system: You are the helper on a bakery website. Answer in one short sentence.
user: When are you open?
Messages in this chat: 2
```

If the terminal says that `node` is not known, install Node.js from nodejs.org (the version with "LTS" in its name), close VS Code, open it again, and try once more.

## Twist

The visitor got an answer and asks a second question. Add two messages to the end of the list:

1. The model's answer, with the role `assistant`: `We are open Monday to Friday from 6 am to 4 pm.`
2. A new question from the user: `And on Saturday?`

Run the file again.

## Check yourself

- The terminal shows four lines that start with `system:`, `user:`, `assistant:` and `user:`
- The last line says `Messages in this chat: 4`
- I can say why the question "And on Saturday?" only makes sense when the earlier messages are sent with it

## Twist answer

```js file=messages.js
// A chat with a model is a list of messages.
const messages = [
  { role: "system", content: "You are the helper on a bakery website. Answer in one short sentence." },
  { role: "user", content: "When are you open?" },
  { role: "assistant", content: "We are open Monday to Friday from 6 am to 4 pm." },
  { role: "user", content: "And on Saturday?" },
];

for (const message of messages) {
  console.log(message.role + ": " + message.content);
}
console.log("Messages in this chat: " + messages.length);
```

## What changed

- `{ role: "assistant", … }` The first answer became part of the list. The model does not remember that it said this. You tell it.
- `{ role: "user", content: "And on Saturday?" }` Alone, this question means nothing: Saturday what? With the three messages before it, it is clear. This is what "no memory" means in practice. Every chat app you have used sends the whole chat again with every question.
- A longer chat means more tokens for every question. That is why this site's tutor only sends the newest part of a long chat.
