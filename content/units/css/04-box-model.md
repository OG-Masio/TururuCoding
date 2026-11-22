---
title: "The box model: padding, border, margin"
minutes: 20
---

Every element on a page is a box. Three properties control the space of a box: `padding` inside, `border` around, and `margin` outside. This is the most useful picture in all of CSS.

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

    <section>
      <h2>About me</h2>
      <p>Warehouse lead who is learning to build websites.</p>
    </section>

    <section>
      <h2>This week</h2>
      <p>Finished the lessons about colors and text.</p>
    </section>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Arial, sans-serif;
}

section {
  border: 2px solid #1f2933;
  padding: 16px;
  margin-bottom: 24px;
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

    <section>
      <h2>About me</h2>
      <p>Warehouse lead who is learning to build websites.</p>
    </section>

    <section>
      <h2>This week</h2>
      <p>Finished the lessons about colors and text.</p>
    </section>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Arial, sans-serif;
}
```

## Explanation

Think of a framed picture on a wall. The picture is the **content**. The white card around the picture is the **padding**. The frame is the **border**. The empty wall between this frame and the next one is the **margin**.

```
┌─────────────── margin ───────────────┐
│  ┌──────────── border ────────────┐  │
│  │  ┌───────── padding ────────┐  │  │
│  │  │         content          │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

- `border: 2px solid #1f2933;` The line around the box. Three values in one declaration: how thick (`2px`), what kind (`solid`; also `dashed` and `dotted`), and the color.
- `padding: 16px;` Space **inside** the border, between the line and the content. Without it, the text touches the line.
- `margin-bottom: 24px;` Space **outside** the border, under the box. It pushes the next box away.
- One value, like `padding: 16px`, means all four sides.
- `-top`, `-right`, `-bottom`, `-left` set one side: `margin-bottom`, `padding-left`, `border-top`.

The short ways to write several sides at once:

| You write | It means |
| --- | --- |
| `padding: 16px;` | 16px on all four sides |
| `padding: 12px 24px;` | 12px top and bottom, 24px left and right |
| `padding: 4px 8px 12px 16px;` | top, right, bottom, left: clockwise, starting at the top |
| `margin: 0;` | No margin. Zero needs no unit |

Headings and paragraphs come with a margin from the browser. That is why there is space above "About me" inside the box, even though you did not ask for it.

## Twist

1. Change the padding of the sections to `12px` at the top and bottom and `24px` at the left and right.
2. The `h2` has too much space above it. Give `h2` this margin: `0` on top, `0` right, `8px` bottom, `0` left.

## Checks

- The sections keep their border :: [...document.querySelectorAll('section')].length >= 2 && [...document.querySelectorAll('section')].every((s) => getComputedStyle(s).borderTopWidth === '2px' && getComputedStyle(s).borderTopStyle === 'solid')
- Section padding is 12px top and bottom, 24px left and right :: [...document.querySelectorAll('section')].every((s) => { const c = getComputedStyle(s); return c.paddingTop === '12px' && c.paddingBottom === '12px' && c.paddingLeft === '24px' && c.paddingRight === '24px'; })
- The h2 has no margin on top and 8px below :: [...document.querySelectorAll('h2')].every((h) => getComputedStyle(h).marginTop === '0px' && getComputedStyle(h).marginBottom === '8px')

## Twist answer

```css file=style.css
body {
  font-family: Arial, sans-serif;
}

section {
  border: 2px solid #1f2933;
  padding: 12px 24px;
  margin-bottom: 24px;
}

h2 {
  margin: 0 0 8px 0;
}
```

## What changed

- `padding: 12px 24px;` Two values: the first is for top and bottom, the second for left and right. Text usually needs more room at the sides than above and below.
- `margin: 0 0 8px 0;` Four values go clockwise: top, right, bottom, left. This removes the browser's own margin above the heading and keeps a small one under it. Now the heading sits where the padding says it should.
