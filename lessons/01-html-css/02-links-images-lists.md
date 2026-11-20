---
title: Links, images and lists
summary: The tags you'll use on almost every page.
mode: web
---
## Links

```html
<a href="https://example.com">Visit Example</a>
```

- `<a>` is a link (the "a" is for "anchor").
- `href` is **where** it goes.
- `target="_blank"` opens it in a new tab.

## Images

```html
<img src="photo.jpg" alt="A cat sleeping">
```

- `src` is the image address. It can be a file next to your page or a full web address.
- `alt` describes the image for screen readers and shows if the image fails. Always write one.
- `<img>` has no closing tag.

## Lists

- `<ul>` is a list with bullets (unordered).
- `<ol>` is a numbered list (ordered).
- Each item is an `<li>`.

The answer uses an image from `picsum.photos`, a free site that hands out random photos.

# Answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Links, images and lists</title>
  </head>
  <body>
    <h1>My favourite places to learn</h1>

    <img src="https://picsum.photos/400/200" alt="A random landscape photo">

    <h2>Websites</h2>
    <ul>
      <li><a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a></li>
      <li><a href="https://www.freecodecamp.org" target="_blank">freeCodeCamp</a></li>
    </ul>

    <h2>My plan</h2>
    <ol>
      <li>HTML and CSS</li>
      <li>JavaScript</li>
      <li>React</li>
    </ol>
  </body>
</html>
```

# Twist

Add a third link to the website list (any site you like), and add **"Mobile apps"** as step 4 of the plan.

# Twist answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Links, images and lists</title>
  </head>
  <body>
    <h1>My favourite places to learn</h1>

    <img src="https://picsum.photos/400/200" alt="A random landscape photo">

    <h2>Websites</h2>
    <ul>
      <li><a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a></li>
      <li><a href="https://www.freecodecamp.org" target="_blank">freeCodeCamp</a></li>
      <li><a href="https://scrimba.com" target="_blank">Scrimba</a></li>
    </ul>

    <h2>My plan</h2>
    <ol>
      <li>HTML and CSS</li>
      <li>JavaScript</li>
      <li>React</li>
      <li>Mobile apps</li>
    </ol>
  </body>
</html>
```
