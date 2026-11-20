---
title: Links
minutes: 15
---

Links are what make the web a web: pages that point to other pages. One element does it all.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Places I learn from</title>
  </head>
  <body>
    <h1>Places I learn from</h1>
    <p>I read the <a href="https://developer.mozilla.org">MDN Web Docs</a> when I forget a tag.</p>
    <p>This one opens in a new tab: <a href="https://www.wikipedia.org" target="_blank">Wikipedia</a>.</p>
    <p><a href="#contact">Jump to the contact section</a></p>

    <h2>About this page</h2>
    <p>I keep my favorite learning sites here, so I can find them fast.</p>

    <h2 id="contact">Contact</h2>
    <p>Write to me: <a href="mailto:hello@example.com">hello@example.com</a></p>
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Places I learn from</title>
  </head>
  <body>

  </body>
</html>
```

## Explanation

A link is an `a` element (the "a" is for *anchor*). The text between `<a>` and `</a>` is what you click. Where the link goes is written in an **attribute**.

An attribute is extra information inside the opening tag. It has a name, an equals sign, and a value in quotes: `href="https://www.wikipedia.org"`.

- `<a href="https://developer.mozilla.org">MDN Web Docs</a>` `href` is the address the link goes to. An address to another site must start with `https://`.
- `target="_blank"` A second attribute. It makes the link open in a new tab. Without it, the link opens in the same tab.
- `<a href="#contact">` An address that starts with `#` does not leave the page. It jumps to the element on this page that has `id="contact"`.
- `<h2 id="contact">Contact</h2>` The `id` attribute gives this heading a name. The link above uses that name. The `#` is only written in the link, not in the `id`.
- `<a href="mailto:hello@example.com">` An address that starts with `mailto:` opens the visitor's email program with that address filled in.

In the Result box of this site, links to other sites always open in a new tab, so you do not lose your lesson. On a real page, they follow the rules above.

## Twist

1. Add one more paragraph with a link to a site you like. The address must start with `https://`, and the link must open in a new tab.
2. Give the heading `About this page` the id `about`.
3. Under the link `Jump to the contact section`, add a second jump link that goes to `#about`.

## Checks

- There are three links to other sites :: document.querySelectorAll('a[href^="https://"]').length >= 3
- Two links open in a new tab :: document.querySelectorAll('a[target="_blank"]').length >= 2
- One h2 has the id "about" :: !!document.querySelector('h2#about')
- A link jumps to #about :: !!document.querySelector('a[href="#about"]')

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Places I learn from</title>
  </head>
  <body>
    <h1>Places I learn from</h1>
    <p>I read the <a href="https://developer.mozilla.org">MDN Web Docs</a> when I forget a tag.</p>
    <p>This one opens in a new tab: <a href="https://www.wikipedia.org" target="_blank">Wikipedia</a>.</p>
    <p>I watch coding videos on <a href="https://www.youtube.com" target="_blank">YouTube</a>.</p>
    <p><a href="#contact">Jump to the contact section</a></p>
    <p><a href="#about">Jump to the about section</a></p>

    <h2 id="about">About this page</h2>
    <p>I keep my favorite learning sites here, so I can find them fast.</p>

    <h2 id="contact">Contact</h2>
    <p>Write to me: <a href="mailto:hello@example.com">hello@example.com</a></p>
  </body>
</html>
```

## What changed

- `<a href="https://www.youtube.com" target="_blank">YouTube</a>` A link with two attributes. The order of attributes does not matter. A space separates them.
- `<h2 id="about">` The heading now has a name. An `id` must be unique: only one element on the page may have the id `about`.
- `<a href="#about">Jump to the about section</a>` `#` plus the id. The spelling must match exactly: `#About` would not find `id="about"`.
