---
title: Images
minutes: 15
---

An image is not written inside the HTML file. The HTML only says where the image file is, and the browser goes and gets it.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The yellow bird</title>
  </head>
  <body>
    <h1>The yellow bird</h1>
    <img src="images/bird.svg" alt="A small yellow bird singing on a branch" width="320">
    <p>It sings <em>tururu</em> every morning.</p>

    <h2>Its favorite view</h2>
    <img src="images/mountain.svg" alt="Mountains under a rising sun" width="320">
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The yellow bird</title>
  </head>
  <body>

  </body>
</html>
```

## Explanation

The `img` element has no closing tag and no text inside. Everything it needs is in its attributes.

- `src="images/bird.svg"` The **source**: where the image file is. `images/bird.svg` means: a folder called `images`, next to this page, and in it a file called `bird.svg`.
- `alt="A small yellow bird singing on a branch"` The **alternative text**. It is read aloud to people who cannot see the image, and it is shown if the image does not load. Describe what is in the picture. Always write it.
- `width="320"` How wide the image is shown, in pixels. You only write the number. The height follows by itself, so the picture keeps its shape.

This site comes with a few sample images you can use in any lesson:

| File | What it shows |
| --- | --- |
| `images/bird.svg` | A yellow bird |
| `images/mountain.svg` | Mountains and a sun |
| `images/coffee.svg` | A cup of coffee |
| `images/avatar.svg` | A simple portrait |
| `images/boxes.svg` | Boxes on a pallet |

If you type a file name wrong, the image does not show. You see the `alt` text instead, and the Console under the Result tells you which file could not be loaded.

## Twist

1. Add a third image at the end of the page: `images/coffee.svg`, 160 pixels wide, with a good `alt` text.
2. Make the bird image a link: put the whole `<img>` inside an `<a>` that goes to `https://en.wikipedia.org/wiki/Bird` and opens in a new tab.

## Checks

- There are three images :: document.querySelectorAll('img').length >= 3
- Every image has alt text :: (() => { const imgs = [...document.querySelectorAll('img')]; return imgs.length > 0 && imgs.every((i) => (i.getAttribute('alt') || '').trim().length > 0); })()
- The coffee image is on the page :: !!document.querySelector('img[src*="coffee.svg"]')
- The bird image is inside a link :: !!document.querySelector('a[href^="https://"] img[src*="bird.svg"]')

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The yellow bird</title>
  </head>
  <body>
    <h1>The yellow bird</h1>
    <a href="https://en.wikipedia.org/wiki/Bird" target="_blank">
      <img src="images/bird.svg" alt="A small yellow bird singing on a branch" width="320">
    </a>
    <p>It sings <em>tururu</em> every morning.</p>

    <h2>Its favorite view</h2>
    <img src="images/mountain.svg" alt="Mountains under a rising sun" width="320">

    <h2>Its favorite smell</h2>
    <img src="images/coffee.svg" alt="A cup of hot coffee" width="160">
  </body>
</html>
```

## What changed

- `<a href="https://en.wikipedia.org/wiki/Bird" target="_blank">` … `</a>` A link can hold an image instead of text. Whatever is between `<a>` and `</a>` becomes clickable.
- `<img src="images/coffee.svg" alt="A cup of hot coffee" width="160">` The same three attributes as before, with a different file and a smaller width.
