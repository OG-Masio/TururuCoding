---
title: Colors
minutes: 15
---

Two properties do most of the color work: `color` for the text and `background-color` for what is behind it. There are three common ways to write a color.

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
    <p>Warehouse lead who is learning to build websites.</p>
    <p>Eight years in logistics. One year of code.</p>
  </body>
</html>
```

```css file=style.css
body {
  background-color: #f5f7fa;
  color: #1f2933;
}

h1 {
  color: rgb(29, 78, 216);
}

p {
  color: dimgray;
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
    <p>Warehouse lead who is learning to build websites.</p>
    <p>Eight years in logistics. One year of code.</p>
  </body>
</html>
```

## Explanation

- `background-color: #f5f7fa;` The color behind the content. On `body` it colors the whole page.
- `color: #1f2933;` The color of the text. Set on `body`, it is the text color for the whole page, because elements take the text color of the element they are inside. This is called **inheritance**.
- `h1 { color: … }` A rule for `h1` is more exact than the color it gets from `body`, so the heading uses its own color.
- `dimgray` A **named color**. CSS knows about 140 names: `red`, `gold`, `teal`, `darkblue`… Easy to type, but you cannot get every color.
- `#f5f7fa` A **hex color**. After the `#` come three pairs: red, green, blue. Each pair goes from `00` (nothing) to `ff` (full). `#000000` is black, `#ffffff` is white, `#ff0000` is pure red. This is the form you will see most.
- `rgb(29, 78, 216)` The same idea in normal numbers: red, green and blue, each from 0 to 255.

| Written as | Example | Good for |
| --- | --- | --- |
| Name | `darkblue` | Quick tests |
| Hex | `#1d4ed8` | Almost everything. Design tools give you hex codes |
| `rgb()` | `rgb(29, 78, 216)` | When you want to read the numbers |

All three can describe the same color. `#1d4ed8` and `rgb(29, 78, 216)` are exactly the same blue.

You do not have to invent hex codes. Search the web for "color picker", choose a color, and copy its code.

## Twist

1. Give the `h1` a light blue background: `#dbeafe`.
2. Change the color of the paragraphs from the name `dimgray` to the hex color `#52606d`.

## Checks

- The page has its light background :: getComputedStyle(document.body).backgroundColor === 'rgb(245, 247, 250)'
- The heading has a light blue background :: getComputedStyle(document.querySelector('h1')).backgroundColor === 'rgb(219, 234, 254)'
- The heading text is still blue :: getComputedStyle(document.querySelector('h1')).color === 'rgb(29, 78, 216)'
- The paragraphs use #52606d :: document.querySelectorAll('p').length >= 2 && [...document.querySelectorAll('p')].every((p) => getComputedStyle(p).color === 'rgb(82, 96, 109)')

## Twist answer

```css file=style.css
body {
  background-color: #f5f7fa;
  color: #1f2933;
}

h1 {
  color: rgb(29, 78, 216);
  background-color: #dbeafe;
}

p {
  color: #52606d;
}
```

## What changed

- `background-color: #dbeafe;` A rule can have as many declarations as you want, one per line. The background goes from the left edge to the right edge, because a heading is as wide as the page. Lesson 4 explains why.
- `color: #52606d;` A hex code in the place of the name. The gray is now a little blue, which fits the page better than plain `dimgray`. With hex you can pick the exact color.
