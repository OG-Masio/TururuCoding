---
title: "Flexbox: centering and spacing"
minutes: 20
---

A flex container can do more than make a row. It can push its items to one side, spread them out, or put them exactly in the middle. Two properties do all of it.

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
    <header class="bar">
      <strong>Sam Rivera</strong>
      <a href="#contact">Contact</a>
    </header>

    <section class="hero">
      <h1>Hi, I am Sam</h1>
      <p>I build small websites that load fast.</p>
      <a class="button" href="#work">See my work</a>
    </section>
  </body>
</html>
```

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #1f2933;
}

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #1f2933;
  color: white;
}

.bar a {
  color: white;
}

.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #dbeafe;
}

.button {
  padding: 10px 16px;
  background: #1d4ed8;
  color: white;
  border-radius: 8px;
  text-decoration: none;
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
    <header class="bar">
      <strong>Sam Rivera</strong>
      <a href="#contact">Contact</a>
    </header>

    <section class="hero">
      <h1>Hi, I am Sam</h1>
      <p>I build small websites that load fast.</p>
      <a class="button" href="#work">See my work</a>
    </section>
  </body>
</html>
```

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #1f2933;
}

.bar {
  padding: 12px 20px;
  background: #1f2933;
  color: white;
}

.bar a {
  color: white;
}

.hero {
  min-height: 300px;
  background: #dbeafe;
}

.button {
  padding: 10px 16px;
  background: #1d4ed8;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
```

## Explanation

Start with the dark bar. It is a row with two items: the name and the link.

- `justify-content: space-between;` This property places the items **along the row**. `space-between` puts the first item at the start, the last item at the end, and all free space between them. The name goes left, the link goes right.
- `align-items: center;` This property places the items **across the row**. In a row, "across" means up and down. `center` puts the name and the link at the same height, in the middle of the bar.

Now the blue part. A big first part of a page like this is called a **hero**.

- `flex-direction: column;` The items now go from top to bottom. The container is still a flex container, only its direction changed.
- `justify-content: center;` Along the direction. The direction is down now, so this centers the three things **up and down**.
- `align-items: center;` Across the direction. That is left and right now, so the three things sit in the **middle of the width**.
- `min-height: 300px;` You can only center up and down when there is free room. Without a height, the hero is exactly as high as its content.

The rule to remember: **`justify-content` works along the direction of the items. `align-items` works across it.** When you change `flex-direction`, the two swap jobs.

| `justify-content` | Where the items go |
| --- | --- |
| `flex-start` | All at the start. This is what you get if you write nothing. |
| `center` | All in the middle |
| `flex-end` | All at the end |
| `space-between` | First at the start, last at the end, equal space between |
| `space-evenly` | Equal space between the items and at both ends |

`align-items` knows `flex-start`, `center` and `flex-end` too. If you write nothing, it is `stretch`: the items become as high as the row. You saw that in lesson 2, where all cards were equally high.

## Twist

1. In the bar, move the name and the link together to the right side, with `20px` between them. Use `justify-content: flex-end;` and `gap`.
2. In the hero, put the three things in the bottom left corner: `justify-content: flex-end;` and `align-items: flex-start;`.
3. Now the text touches the edge of the hero. Give the hero `padding: 24px;`.

## Checks

- The bar pushes its items to the right, 20 pixels apart :: (() => { const b = getComputedStyle(document.querySelector('.bar')); return b.display === 'flex' && b.justifyContent === 'flex-end' && b.columnGap === '20px'; })()
- The hero is a column :: (() => { const h = getComputedStyle(document.querySelector('.hero')); return h.display === 'flex' && h.flexDirection === 'column'; })()
- The hero's content sits at the bottom :: (() => { const hero = document.querySelector('.hero'); const last = document.querySelector('.hero .button'); return getComputedStyle(hero).justifyContent === 'flex-end' && hero.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom < 60; })()
- …and at the left, 24 pixels from the edge :: (() => { const hero = document.querySelector('.hero'); const h = getComputedStyle(hero); return h.alignItems === 'flex-start' && h.paddingLeft === '24px' && Math.abs(document.querySelector('.hero h1').getBoundingClientRect().left - hero.getBoundingClientRect().left - 24) < 1; })()

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #1f2933;
}

.bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  padding: 12px 20px;
  background: #1f2933;
  color: white;
}

.bar a {
  color: white;
}

.hero {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  min-height: 300px;
  padding: 24px;
  background: #dbeafe;
}

.button {
  padding: 10px 16px;
  background: #1d4ed8;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
```

## What changed

- `justify-content: flex-end;` in the bar Both items go to the end of the row, the right side. They would touch each other, so `gap: 20px` keeps them apart.
- `justify-content: flex-end;` in the hero The same words, another result. The hero is a column, so "the end" is the bottom.
- `align-items: flex-start;` Across a column is left and right. "Start" is the left side.
- `padding: 24px;` Padding is inside the box, so the flex items stay 24 pixels away from every edge.
