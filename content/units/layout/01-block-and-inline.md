---
title: "Block and inline"
minutes: 15
---

Layout means: deciding where things go. Before you move anything, you need to know where the browser puts things by itself. Every element is one of two kinds: a **block**, or **inline**.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Sam Rivera</h1>
    <p>Warehouse lead. Learning <span class="tag">HTML</span> <span class="tag">CSS</span> <span class="tag">Layout</span></p>
    <p>
      <a class="button" href="#work">My work</a>
      <a class="button" href="#contact">Contact</a>
    </p>
    <p class="note">This line is hidden.</p>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

h1 {
  background: #dbeafe;
}

.tag {
  background: #fde68a;
  width: 200px;
}

.button {
  display: inline-block;
  width: 140px;
  padding: 10px;
  background: #1d4ed8;
  color: white;
  text-align: center;
  text-decoration: none;
}

.note {
  display: none;
}
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Sam Rivera</h1>
    <p>Warehouse lead. Learning <span class="tag">HTML</span> <span class="tag">CSS</span> <span class="tag">Layout</span></p>
    <p>
      <a class="button" href="#work">My work</a>
      <a class="button" href="#contact">Contact</a>
    </p>
    <p class="note">This line is hidden.</p>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}
```

## Explanation

- `h1 { background: #dbeafe; }` The blue goes from the left edge of the page to the right edge, far past the name. An `h1` is a **block**: it starts on a new line and takes the whole width. `p`, `div`, `section`, `ul` and `li` are blocks too.
- `.tag { background: #fde68a; }` The yellow is only as wide as the word. A `span` is **inline**: it stays in the line of text, like a word. `a`, `strong`, `em` and `img` are inline too.
- `width: 200px;` on `.tag` This line does nothing. An inline element is as big as its content, and it ignores `width` and `height`. It is in the answer so that you see it fail.
- `display: inline-block;` The `display` property changes the kind of an element. `inline-block` is a mix: the element stays in the line, like a word, **and** it listens to `width`, `height` and padding on all sides. This is how a link becomes a button with a fixed size.
- `width: 140px;` Now it works: both buttons are 140 pixels wide.
- `display: none;` The element is gone from the page. It takes no space. It is still in the HTML, so you can bring it back later.

| `display` | Starts a new line | Listens to `width` and `height` | Normal for |
| --- | --- | --- | --- |
| `block` | Yes | Yes | `h1`, `p`, `div`, `section`, `li` |
| `inline` | No | No | `span`, `a`, `strong`, `img` |
| `inline-block` | No | Yes | Nothing. You choose it. |
| `none` | The element is not shown at all | | Nothing. You choose it. |

Every layout tool in this unit starts with one `display` line. The next lesson uses `display: flex`.

## Twist

1. Make the tags listen to `width`: give `.tag` the line `display: inline-block;`. Change its width to `90px` and center its text.
2. Put each button on its own line: change `.button` to `display: block;` and add `margin-bottom: 8px;`.
3. Bring the hidden line back: change `display: none;` to `display: block;`.

## Checks

- The tags are inline-block, 90px wide, with centered text :: (() => { const t = getComputedStyle(document.querySelector('.tag')); return t.display === 'inline-block' && t.width === '90px' && t.textAlign === 'center'; })()
- Each button is a block on its own line :: (() => { const b = [...document.querySelectorAll('.button')]; return b.length === 2 && b.every((x) => getComputedStyle(x).display === 'block') && b[1].getBoundingClientRect().top >= b[0].getBoundingClientRect().bottom; })()
- There are 8 pixels of space under each button :: getComputedStyle(document.querySelector('.button')).marginBottom === '8px'
- The hidden line shows again :: getComputedStyle(document.querySelector('.note')).display === 'block'

## Twist answer

```css file=style.css
body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

h1 {
  background: #dbeafe;
}

.tag {
  display: inline-block;
  background: #fde68a;
  width: 90px;
  text-align: center;
}

.button {
  display: block;
  width: 140px;
  margin-bottom: 8px;
  padding: 10px;
  background: #1d4ed8;
  color: white;
  text-align: center;
  text-decoration: none;
}

.note {
  display: block;
}
```

## What changed

- `.tag { display: inline-block; }` The three tags are still in the line of text, and now `width: 90px` counts. All three have the same size.
- `.button { display: block; }` Each button starts on a new line, like a paragraph. A block is normally as wide as the page, but these two keep `width: 140px`, because a block listens to `width`.
- `margin-bottom: 8px;` Two blocks touch each other without it.
- `display: block;` on `.note` The line is back. A `p` is a block by itself, so you get the same result when you delete the whole `.note` rule.
