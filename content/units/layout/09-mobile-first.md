---
title: "Mobile first: one page, every screen"
minutes: 30
---

In lesson 8 you wrote the big screen first and repaired the small one. Most people do it the other way around: write the page for a **phone** first, then add room for bigger screens. This is called **mobile first**. This lesson builds one small page that way.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>City Library</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header class="top">
      <strong>City Library</strong>
      <nav class="links">
        <a href="#books">Books</a>
        <a href="#music">Music</a>
        <a href="#visit">Visit</a>
      </nav>
    </header>

    <main>
      <h1>New this week</h1>

      <div class="shelf">
        <div class="item">
          <h2>Cookbooks</h2>
          <p>Forty new ones, from soup to bread.</p>
        </div>
        <div class="item">
          <h2>Travel guides</h2>
          <p>For the whole coast, with maps.</p>
        </div>
        <div class="item">
          <h2>Audio books</h2>
          <p>Listen on your way to work.</p>
        </div>
        <div class="item">
          <h2>Comics</h2>
          <p>Two full shelves, for all ages.</p>
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

/* Phones: everything in one column. */

.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #1f2933;
  color: white;
}

.links {
  display: flex;
  gap: 16px;
}

.links a {
  color: #cbd2d9;
}

main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
}

.shelf {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.item {
  padding: 0 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}

/* Tablets and bigger. */

@media (min-width: 600px) {
  .top {
    flex-direction: row;
    justify-content: space-between;
  }

  .shelf {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktops. */

@media (min-width: 900px) {
  .shelf {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>City Library</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header class="top">
      <strong>City Library</strong>
      <nav class="links">
        <a href="#books">Books</a>
        <a href="#music">Music</a>
        <a href="#visit">Visit</a>
      </nav>
    </header>

    <main>
      <h1>New this week</h1>

      <div class="shelf">
        <div class="item">
          <h2>Cookbooks</h2>
          <p>Forty new ones, from soup to bread.</p>
        </div>
        <div class="item">
          <h2>Travel guides</h2>
          <p>For the whole coast, with maps.</p>
        </div>
        <div class="item">
          <h2>Audio books</h2>
          <p>Listen on your way to work.</p>
        </div>
        <div class="item">
          <h2>Comics</h2>
          <p>Two full shelves, for all ages.</p>
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

.top {
  padding: 12px 16px;
  background: #1f2933;
  color: white;
}

.links a {
  color: #cbd2d9;
}

main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
}

.item {
  padding: 0 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}
```

## Explanation

Read the CSS in three parts. Press **Phone**, **Tablet** and **Desktop** above the result while you read.

**Part 1: no query. This is the phone.**

- `/* Phones: everything in one column. */` Text between `/*` and `*/` is a **comment**. The browser skips it. It is a note for the person who reads the file, and that person is often you, three months later.
- `.top { flex-direction: column; align-items: center; }` The name is above the links, and both are in the middle. A phone is narrow, so things stack.
- `.shelf { grid-template-columns: 1fr; }` One column of cards.
- These rules have no query around them. They count on **every** screen, unless a later rule changes them.

**Part 2: from 600 pixels.**

- `@media (min-width: 600px)` "600 pixels or wider". The rules inside add to part 1.
- `.top { flex-direction: row; justify-content: space-between; }` There is room now: the name goes left and the links go right. `align-items: center` from part 1 still counts. It now centers them up and down.
- `.shelf { grid-template-columns: 1fr 1fr; }` Two columns.

**Part 3: from 900 pixels.**

- `@media (min-width: 900px)` On a wide screen **both** queries are true. For `.shelf` the later rule wins: four columns. The `.top` rule from part 2 still counts, because part 3 says nothing about `.top`.
- `main { max-width: 1000px; margin: 0 auto; }` On a very wide screen the content stops growing and stays in the middle. You know this one from unit 2.

**Why phone first?**

- The phone layout is the simplest: one column. You add to it. You never have to undo anything.
- A query only holds the few lines that **change**. Look how short parts 2 and 3 are.
- Write the queries from small to big. A later rule wins, so the biggest screen must come last.

## Twist

1. Four columns come too early: at 900 pixels the cards are narrow. Move the last breakpoint to `1100px`.
2. The title is too big for a phone. In part 1, give `h1` a `font-size` of `1.5rem`. From 600 pixels and up it is `2.5rem`.
3. From 600 pixels and up the links have more room: inside that query, `.links` gets a gap of `24px`.

## Checks

- Phones get a small title, with no query around the rule :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === 'h1' && r.style.fontSize === '1.5rem')
- From 600 pixels: a big title, and 24 pixels between the links :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /min-width:\s*600px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === 'h1' && r.style.fontSize === '2.5rem') && [...q.cssRules].some((r) => r.selectorText === '.links' && r.style.columnGap === '24px')); })()
- From 600 pixels there are still two columns, and the bar is a row :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /min-width:\s*600px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === '.shelf' && r.style.gridTemplateColumns === '1fr 1fr') && [...q.cssRules].some((r) => r.selectorText === '.top' && r.style.flexDirection === 'row')); })()
- Four columns start at 1100 pixels, and no longer at 900 :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); const four = (q) => [...q.cssRules].some((r) => r.selectorText === '.shelf' && /repeat\(4,\s*1fr\)|^1fr 1fr 1fr 1fr$/.test(r.style.gridTemplateColumns)); return m.some((q) => /min-width:\s*1100px/.test(q.conditionText) && four(q)) && !m.some((q) => /min-width:\s*900px/.test(q.conditionText)); })()

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

/* Phones: everything in one column. */

.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #1f2933;
  color: white;
}

.links {
  display: flex;
  gap: 16px;
}

.links a {
  color: #cbd2d9;
}

main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
}

h1 {
  font-size: 1.5rem;
}

.shelf {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.item {
  padding: 0 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}

/* Tablets and bigger. */

@media (min-width: 600px) {
  .top {
    flex-direction: row;
    justify-content: space-between;
  }

  .links {
    gap: 24px;
  }

  h1 {
    font-size: 2.5rem;
  }

  .shelf {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktops. */

@media (min-width: 1100px) {
  .shelf {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## What changed

- `@media (min-width: 1100px)` Press **Tablet** (768 pixels): two columns. Press **Desktop** (1200 pixels): four. A screen of 1000 pixels now keeps two wide columns in place of four narrow ones.
- `h1 { font-size: 1.5rem; }` in part 1, and `2.5rem` inside the query. This is the pattern of the whole lesson: the small value first, with no query, and the bigger value in a `min-width` query after it.
- `.links { gap: 24px; }` Only the gap is in the query. `display: flex` is in part 1 and still counts. A query repeats nothing: it only holds what is different.
