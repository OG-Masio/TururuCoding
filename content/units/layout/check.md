---
title: "Quick check: Layout"
---

Unit 3 teaches how to put things where you want them: flexbox, grid, position and media queries. If you already know these, this one task shows it. The answer is right below, like always.

## Task

The HTML is in your editor, and `style.css` has the colors. Write the layout:

1. `.top` is a row: the name on the left, the links on the right, both in the middle of the bar's height. The bar stays at the top while you scroll.
2. `.links` is a row without bullets, with `16px` between the links.
3. `.hero` is at least `240px` high. Its two lines of text sit in the middle, in both directions.
4. `.stalls` is a grid with a gap of `16px`. On a phone it has one column. From `700px` and up it has three equal columns.
5. The badge "New" hangs over the top right corner of its card.

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Night Market</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header class="top">
      <strong>Night Market</strong>
      <ul class="links">
        <li><a href="#food">Food</a></li>
        <li><a href="#music">Music</a></li>
        <li><a href="#map">Map</a></li>
      </ul>
    </header>

    <section class="hero">
      <h1>Every Friday from six</h1>
      <p>Forty stalls, three stages, one long table.</p>
    </section>

    <main>
      <div class="stalls">
        <div class="stall">
          <span class="badge">New</span>
          <h2>Dumplings</h2>
          <p>Steamed while you wait.</p>
        </div>
        <div class="stall">
          <h2>Grilled corn</h2>
          <p>With lime and chili.</p>
        </div>
        <div class="stall">
          <h2>Fresh juice</h2>
          <p>Mango, orange or both.</p>
        </div>
      </div>
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
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

.top {
  padding: 12px 16px;
  background: #1f2933;
  color: white;
}

.links a {
  color: #cbd2d9;
  text-decoration: none;
}

.hero {
  background: #fde68a;
}

.stall {
  padding: 0 16px;
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

## Checks

- The bar is a row: the name at the left, the links at the right, at the same height :: (() => { const top = document.querySelector('.top'); const bar = top.getBoundingClientRect(); const name = top.querySelector('strong').getBoundingClientRect(); const links = top.querySelector('.links').getBoundingClientRect(); return getComputedStyle(top).display === 'flex' && name.left < bar.left + 40 && links.right > bar.right - 40 && links.left > name.right && Math.abs((name.top + name.bottom) / 2 - (links.top + links.bottom) / 2) < 3; })()
- The bar stays at the top while you scroll :: (() => { const t = getComputedStyle(document.querySelector('.top')); return t.position === 'sticky' && t.top === '0px'; })()
- The links are a row without bullets, 16 pixels apart :: (() => { const l = getComputedStyle(document.querySelector('.links')); return l.display === 'flex' && l.listStyleType === 'none' && l.columnGap === '16px' && l.paddingLeft === '0px'; })()
- The hero is at least 240 pixels high, with its text in the middle both ways :: (() => { const hero = document.querySelector('.hero'); const box = hero.getBoundingClientRect(); const h = hero.querySelector('h1'); const p = hero.querySelector('p'); const r = document.createRange(); r.selectNodeContents(h); const text = r.getBoundingClientRect(); return getComputedStyle(hero).minHeight === '240px' && Math.abs((text.left + text.right) / 2 - (box.left + box.right) / 2) < 3 && Math.abs((h.getBoundingClientRect().top - box.top) - (box.bottom - p.getBoundingClientRect().bottom)) < 14; })()
- The stalls are a grid with a 16 pixel gap, and one column on a phone :: (() => { const s = getComputedStyle(document.querySelector('.stalls')); const rules = [...document.styleSheets].flatMap((x) => [...x.cssRules]); return s.display === 'grid' && s.columnGap === '16px' && s.rowGap === '16px' && rules.filter((r) => r.selectorText === '.stalls').every((r) => r.style.gridTemplateColumns === '' || r.style.gridTemplateColumns === '1fr'); })()
- From 700 pixels and up, the stalls have three equal columns :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /min-width:\s*700px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === '.stalls' && /repeat\(3,\s*1fr\)|^1fr 1fr 1fr$/.test(r.style.gridTemplateColumns))); })()
- The badge hangs over the top right corner of its card :: (() => { const badge = document.querySelector('.badge'); const card = badge.parentElement; const b = badge.getBoundingClientRect(); const c = card.getBoundingClientRect(); return getComputedStyle(badge).position === 'absolute' && getComputedStyle(card).position === 'relative' && b.top < c.top && b.left > c.left + c.width / 2 && b.right > c.right - 40; })()

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Night Market</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header class="top">
      <strong>Night Market</strong>
      <ul class="links">
        <li><a href="#food">Food</a></li>
        <li><a href="#music">Music</a></li>
        <li><a href="#map">Map</a></li>
      </ul>
    </header>

    <section class="hero">
      <h1>Every Friday from six</h1>
      <p>Forty stalls, three stages, one long table.</p>
    </section>

    <main>
      <div class="stalls">
        <div class="stall">
          <span class="badge">New</span>
          <h2>Dumplings</h2>
          <p>Steamed while you wait.</p>
        </div>
        <div class="stall">
          <h2>Grilled corn</h2>
          <p>With lime and chili.</p>
        </div>
        <div class="stall">
          <h2>Fresh juice</h2>
          <p>Mango, orange or both.</p>
        </div>
      </div>
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
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

.top {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1f2933;
  color: white;
}

.links {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.links a {
  color: #cbd2d9;
  text-decoration: none;
}

.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 240px;
  background: #fde68a;
}

.stalls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.stall {
  position: relative;
  padding: 0 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: -12px;
  right: -8px;
  padding: 4px 10px;
  background: #e11d48;
  color: white;
  border-radius: 999px;
  font-size: 0.8rem;
}

@media (min-width: 700px) {
  .stalls {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Explanation

Each part of the task is one lesson of this unit.

- **The bar.** `display: flex` makes the row (lesson 2). `justify-content: space-between` sends the name left and the links right, and `align-items: center` puts them at the same height (lesson 3). `position: sticky` with `top: 0` keeps the bar on the screen, and `z-index` keeps it above the badge (lesson 7).
- **The links.** A list becomes a menu with `display: flex`, `list-style: none` and `padding: 0` (lesson 4).
- **The hero.** A column with `justify-content: center` and `align-items: center` puts the text in the middle both ways. `min-height` gives it room to do so (lesson 3).
- **The stalls.** `display: grid` with one column for phones (lessons 5 and 9), and `repeat(3, 1fr)` inside `@media (min-width: 700px)` for bigger screens (lessons 8 and 9). Press **Phone** and **Desktop** above the result to see both.
- **The badge.** The child is `absolute`, the parent is `relative`, and negative numbers push the badge past the corner (lesson 7).

Did you write most of this without looking? Then go on to unit 4. If some parts were new, the lesson named behind each part teaches it in about twenty minutes.
