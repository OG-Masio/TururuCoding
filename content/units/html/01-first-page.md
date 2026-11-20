---
title: Your first page
minutes: 15
---

Every web page is a text file written in HTML. In this lesson you write a complete page, from the first line to the last.

## Answer

This is a whole web page. Nothing is missing.

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, I am learning to code</h1>
    <p>This is my first web page.</p>
  </body>
</html>
```

## Explanation

HTML is made of **tags**. A tag is a word between `<` and `>`. Most tags come in pairs: an opening tag like `<p>` and a closing tag like `</p>`. The closing tag has a slash. The pair, with everything between, is called an **element**.

Elements go inside other elements, like boxes inside boxes. This page has one big box, `html`, with two boxes in it: `head` and `body`.

- `<!DOCTYPE html>` This tells the browser: "this is a modern HTML page". It is always the first line. It has no closing tag.
- `<html lang="en">` The box that holds the whole page. `lang="en"` says the page is written in English. It closes on the last line with `</html>`.
- `<head>` Information *about* the page. Nothing inside `head` is shown on the page itself.
- `<meta charset="UTF-8">` This lets the page show every letter and symbol correctly, for example ñ, é or emoji. It has no closing tag.
- `<title>My first page</title>` The text on the browser tab. You do not see it in the Result box here, because the Result box has no tab.
- `<body>` Everything you see on the page goes inside `body`.
- `<h1>Hello, I am learning to code</h1>` A heading. `h1` is the biggest and most important heading of the page.
- `<p>This is my first web page.</p>` A paragraph of normal text.

The spaces at the start of each line are called **indentation**. The browser ignores them. They are for you: they show what is inside what. Use two spaces for each level.

## Twist

Make the page yours:

1. Change the heading so it says your name, for example `Hello, I am Sam`.
2. Add a second paragraph under the first one. Say what you want to build.

## Checks

- The page still has exactly one h1 heading :: document.querySelectorAll('h1').length === 1
- The heading says something new :: (() => { const h = document.querySelector('h1'); return !!h && h.textContent.trim() !== '' && h.textContent.trim() !== 'Hello, I am learning to code'; })()
- There are two paragraphs :: document.querySelectorAll('p').length >= 2

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, I am Sam</h1>
    <p>This is my first web page.</p>
    <p>I want to build my own website.</p>
  </body>
</html>
```

## What changed

- `<h1>Hello, I am Sam</h1>` Only the text between the tags changed. The tags stay the same.
- `<p>I want to build my own website.</p>` A new paragraph is a new `<p>` element. It goes inside `body`, after the first paragraph, because the browser shows elements in the order you write them.
