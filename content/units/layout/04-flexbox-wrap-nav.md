---
title: "Flexbox: wrapping and a nav bar"
minutes: 25
---

Almost every website has a bar at the top with a name on the left and links on the right. It is called a **nav bar**, and it is two flex containers, one inside the other. This lesson also shows what happens when a row has more things than fit.

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
    <nav class="nav">
      <a class="brand" href="#top">Sam Rivera</a>
      <ul class="links">
        <li><a href="#about">About</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>

    <main>
      <h1>Skills</h1>
      <div class="tags">
        <span class="tag">HTML</span>
        <span class="tag">CSS</span>
        <span class="tag">Flexbox</span>
        <span class="tag">Forklift license</span>
        <span class="tag">Inventory counts</span>
        <span class="tag">Team planning</span>
        <span class="tag">First aid</span>
        <span class="tag">Spanish</span>
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
  padding: 0 20px;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #1f2933;
}

.brand {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.links {
  display: flex;
  gap: 16px;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}

.links a {
  color: #cbd2d9;
  text-decoration: none;
}

.links a:hover {
  color: white;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: #fde68a;
  border-radius: 999px;
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
    <nav class="nav">
      <a class="brand" href="#top">Sam Rivera</a>
      <ul class="links">
        <li><a href="#about">About</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>

    <main>
      <h1>Skills</h1>
      <div class="tags">
        <span class="tag">HTML</span>
        <span class="tag">CSS</span>
        <span class="tag">Flexbox</span>
        <span class="tag">Forklift license</span>
        <span class="tag">Inventory counts</span>
        <span class="tag">Team planning</span>
        <span class="tag">First aid</span>
        <span class="tag">Spanish</span>
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
  padding: 0 20px;
}

.nav {
  padding: 12px 20px;
  background: #1f2933;
}

.brand {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.links a {
  color: #cbd2d9;
  text-decoration: none;
}

.links a:hover {
  color: white;
}

.tag {
  padding: 6px 12px;
  background: #fde68a;
  border-radius: 999px;
}
```

## Explanation

The nav bar first.

- `<ul class="links">` The links of a menu are a list, so the HTML says so. A screen reader then tells its user "list, 3 items". CSS decides that this list does not look like a list.
- `list-style: none;` No bullets.
- `padding: 0;` A `ul` has empty space on its left, where the bullets were. This takes it away.
- `.links { display: flex; gap: 16px; }` The three `li` elements stand in a row. This is a flex container **inside** a flex item: `.nav` is a row of two things (the name and the list), and the list is a row of three things.
- `margin: 0 0 0 auto;` Four values go clockwise: top, right, bottom, left. Only the left margin is `auto`. In unit 2 you centered a column with `auto` on both sides. On one side, `auto` takes **all** the free space, and that pushes the list to the right edge.

Now the tags.

- `flex-wrap: wrap;` A flex container tries to keep everything in one row, and squeezes its items to make them fit. With `wrap`, the items that do not fit go to the next row. Press **Phone** above the result: the tags make three or four rows. Press **Phone** again to go back.
- `gap: 8px;` With wrapping, the gap is also the space between the rows.
- `.nav` has `flex-wrap: wrap` too. On a very narrow screen the links move under the name, and the bar never sticks out of the screen.

**Phone**, **Tablet** and **Desktop** show the result at the width of such a screen. You will use them a lot from here on.

## Twist

1. Add a fourth link to the menu: the text `Blog`, going to `#blog`.
2. Put the tags in the middle of the page: `.tags` gets `justify-content: center;`.
3. Give the tags more space: change their gap to `12px`.

## Checks

- The menu has four links, and the last one is Blog :: (() => { const a = [...document.querySelectorAll('.links a')]; return a.length === 4 && a[3].textContent.trim() === 'Blog' && a[3].getAttribute('href') === '#blog' && document.querySelectorAll('.links > li').length === 4; })()
- The links stand in a row at the right side of the bar :: (() => { const l = document.querySelector('.links'); return getComputedStyle(l).display === 'flex' && getComputedStyle(l).listStyleType === 'none' && [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.links' && r.style.marginLeft === 'auto'); })()
- The tags wrap and are centered :: (() => { const t = getComputedStyle(document.querySelector('.tags')); return t.display === 'flex' && t.flexWrap === 'wrap' && t.justifyContent === 'center'; })()
- There are 12 pixels between the tags, in both directions :: (() => { const t = getComputedStyle(document.querySelector('.tags')); return t.columnGap === '12px' && t.rowGap === '12px'; })()

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <nav class="nav">
      <a class="brand" href="#top">Sam Rivera</a>
      <ul class="links">
        <li><a href="#about">About</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#blog">Blog</a></li>
      </ul>
    </nav>

    <main>
      <h1>Skills</h1>
      <div class="tags">
        <span class="tag">HTML</span>
        <span class="tag">CSS</span>
        <span class="tag">Flexbox</span>
        <span class="tag">Forklift license</span>
        <span class="tag">Inventory counts</span>
        <span class="tag">Team planning</span>
        <span class="tag">First aid</span>
        <span class="tag">Spanish</span>
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
  padding: 0 20px;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #1f2933;
}

.brand {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.links {
  display: flex;
  gap: 16px;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}

.links a {
  color: #cbd2d9;
  text-decoration: none;
}

.links a:hover {
  color: white;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.tag {
  padding: 6px 12px;
  background: #fde68a;
  border-radius: 999px;
}
```

## What changed

- `<li><a href="#blog">Blog</a></li>` One more line in the HTML, and no change in the CSS for it. The list is a flex container, so the new item takes its place in the row by itself, with the same gap. This is the reason to build a menu this way.
- `justify-content: center;` When the tags wrap, **every row** is centered by itself. The last row has fewer tags, and they sit in the middle.
- `gap: 12px;` One value for both directions: between the tags in a row, and between the rows.
