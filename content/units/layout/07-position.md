---
title: "Position: sticky headers and badges"
minutes: 25
---

Flexbox and grid arrange things next to each other. Sometimes one thing must break out: a bar that stays at the top while you scroll, or a small "New" label that hangs over the corner of a card. That is the job of `position`.

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
    <header class="top" id="top">Sam Rivera</header>

    <main>
      <div class="card">
        <span class="badge">New</span>
        <h2>Website for Corner Bakery</h2>
        <p>One page with the menu and the opening hours.</p>
      </div>

      <p>Scroll down in the result. The dark bar stays where it is.</p>
      <p>I started with a page for my own team: who works which shift.</p>
      <p>Then a neighbor asked for a page for her bakery.</p>
      <p>Then her sister asked for one, for a flower shop.</p>
      <p>Every page taught me one new thing.</p>
      <p>The bakery page taught me tables, for the opening hours.</p>
      <p>The flower shop taught me how to make a gallery.</p>
      <p>This page is teaching me how to make a bar that stays.</p>
      <p>That is the end of the page.</p>

      <a class="totop" href="#top">Back to top</a>
    </main>
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

main {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px;
}

.top {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 20px;
  background: #1f2933;
  color: white;
  font-weight: bold;
}

.card {
  position: relative;
  padding: 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: -12px;
  right: -12px;
  padding: 4px 10px;
  background: #e11d48;
  color: white;
  border-radius: 999px;
  font-size: 0.8rem;
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
    <header class="top" id="top">Sam Rivera</header>

    <main>
      <div class="card">
        <span class="badge">New</span>
        <h2>Website for Corner Bakery</h2>
        <p>One page with the menu and the opening hours.</p>
      </div>

      <p>Scroll down in the result. The dark bar stays where it is.</p>
      <p>I started with a page for my own team: who works which shift.</p>
      <p>Then a neighbor asked for a page for her bakery.</p>
      <p>Then her sister asked for one, for a flower shop.</p>
      <p>Every page taught me one new thing.</p>
      <p>The bakery page taught me tables, for the opening hours.</p>
      <p>The flower shop taught me how to make a gallery.</p>
      <p>This page is teaching me how to make a bar that stays.</p>
      <p>That is the end of the page.</p>

      <a class="totop" href="#top">Back to top</a>
    </main>
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

main {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px;
}

.top {
  padding: 12px 20px;
  background: #1f2933;
  color: white;
  font-weight: bold;
}

.card {
  padding: 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}

.badge {
  padding: 4px 10px;
  background: #e11d48;
  color: white;
  border-radius: 999px;
  font-size: 0.8rem;
}
```

## Explanation

The bar that stays.

- `position: sticky;` The bar scrolls with the page like everything else, until it reaches a line you choose. Then it sticks there.
- `top: 0;` That line: zero pixels from the top of the screen. Scroll in the result and watch the bar.
- `z-index: 10;` Things with a `position` can lie on top of each other. The one that comes later in the HTML is drawn on top, so the red badge would slide **over** the bar. `z-index` is a number for the order: the higher number is on top. Delete the line, scroll, and you see the problem.

The badge.

- `position: absolute;` The badge is lifted out of the page. The other things close up as if it is not there. Now you place it yourself.
- `top: -12px; right: -12px;` The distance from the top edge and from the right edge. A negative number goes **past** the edge, so the badge hangs over the corner.
- `position: relative;` on `.card` The edges of which box? An absolute element measures from the nearest parent that has a `position`. `relative` gives the card a position and leaves it exactly where it is. Delete this line and the badge jumps to the corner of the whole page.

Remember them as a pair: **the child is `absolute`, the parent is `relative`**.

| `position` | What it does |
| --- | --- |
| `static` | The normal place. Every element has this until you change it. |
| `relative` | The normal place, and a starting point for absolute children |
| `absolute` | Out of the page flow. Placed from the nearest positioned parent. |
| `sticky` | Scrolls along until it reaches `top`, then stays |
| `fixed` | Always at the same place on the screen. It does not scroll at all. |

`top`, `right`, `bottom` and `left` only work on elements with a `position` other than `static`.

The robot button of the tutor, in the corner of this page, is `fixed`.

## Twist

1. Move the badge to the top **left** corner of the card. Use `left` in the place of `right`.
2. Pin the link "Back to top" to the bottom right corner of the screen, so it is always there: `position: fixed;` with `right: 16px;` and `bottom: 16px;`.
3. Make that link look like a small button: padding `8px 12px`, a background of `#1d4ed8`, white text, `border-radius: 8px` and no underline.

## Checks

- The bar stays at the top while you scroll :: (() => { const t = getComputedStyle(document.querySelector('.top')); return t.position === 'sticky' && t.top === '0px'; })()
- The badge is absolute, and its card is relative :: getComputedStyle(document.querySelector('.card')).position === 'relative' && getComputedStyle(document.querySelector('.badge')).position === 'absolute'
- The badge hangs over the top left corner of the card :: (() => { const b = document.querySelector('.badge').getBoundingClientRect(); const c = document.querySelector('.card').getBoundingClientRect(); return b.left < c.left && b.top < c.top && b.right < c.left + c.width / 2; })()
- "Back to top" is pinned to the bottom right corner of the screen :: (() => { const t = getComputedStyle(document.querySelector('.totop')); return t.position === 'fixed' && t.right === '16px' && t.bottom === '16px'; })()
- …and it looks like a button :: (() => { const t = getComputedStyle(document.querySelector('.totop')); return t.backgroundColor === 'rgb(29, 78, 216)' && t.color === 'rgb(255, 255, 255)' && t.paddingLeft === '12px' && t.textDecorationLine === 'none'; })()

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

main {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px;
}

.top {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 20px;
  background: #1f2933;
  color: white;
  font-weight: bold;
}

.card {
  position: relative;
  padding: 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: -12px;
  left: -12px;
  padding: 4px 10px;
  background: #e11d48;
  color: white;
  border-radius: 999px;
  font-size: 0.8rem;
}

.totop {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 8px 12px;
  background: #1d4ed8;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
```

## What changed

- `left: -12px;` The badge measures from the left edge of the card now. Take `right` away when you add `left`: with both, the badge stretches from one edge to the other.
- `position: fixed;` The link left its place at the end of the page. It measures from the edges of the **screen**, not from a parent, and it does not move when you scroll.
- `right: 16px; bottom: 16px;` Sixteen pixels from the right edge and from the bottom edge of the screen.
- Use `fixed` for very few things. Whatever is fixed covers a part of the page all the time.
