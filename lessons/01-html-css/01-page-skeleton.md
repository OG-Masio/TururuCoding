---
title: The page skeleton
summary: Every HTML page starts the same way.
mode: web
---
Every web page has the same basic skeleton. You don't need to memorize it: copy it from here (or type `!` and press Tab in VS Code, which writes it for you).

## Line by line

- `<!doctype html>` tells the browser "this is a modern HTML page".
- `<html lang="en">` wraps everything. `lang` says the page is in English.
- `<head>` holds information **about** the page. Nothing in it shows on screen.
  - `<meta charset="utf-8">` makes accents and emoji show correctly.
  - `<meta name="viewport" ...>` makes the page fit phone screens.
  - `<title>` is the text on the browser tab.
- `<body>` holds everything you **see**.

Inside the body:

- `<header>`, `<main>` and `<footer>` split the page into top, middle and bottom. They look like nothing on their own, but they keep the page organized.
- `<h1>` to `<h6>` are headings, from biggest to smallest. Use one `<h1>` per page.
- `<p>` is a paragraph.

Tags come in pairs: `<p>` opens and `</p>` closes. Whatever is between them is inside that element.

# Answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My first page</title>
  </head>
  <body>
    <header>
      <h1>My first page</h1>
    </header>
    <main>
      <h2>About this page</h2>
      <p>This is a paragraph. It sits inside the main part of the page.</p>
      <h2>Why I'm learning</h2>
      <p>I want to build my own apps.</p>
    </main>
    <footer>
      <p>Made by me, 2026.</p>
    </footer>
  </body>
</html>
```

# Twist

Add a third section inside `<main>` with an `<h2>` called **"My projects"** and a paragraph that names one of your projects.

# Twist answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My first page</title>
  </head>
  <body>
    <header>
      <h1>My first page</h1>
    </header>
    <main>
      <h2>About this page</h2>
      <p>This is a paragraph. It sits inside the main part of the page.</p>
      <h2>Why I'm learning</h2>
      <p>I want to build my own apps.</p>
      <h2>My projects</h2>
      <p>Pumdoki is the first one I'll build.</p>
    </main>
    <footer>
      <p>Made by me, 2026.</p>
    </footer>
  </body>
</html>
```
