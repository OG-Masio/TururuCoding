---
title: Light and dark themes
minutes: 25
---

A theme is a set of colors for the whole page. If every color of your page is a variable, a second theme is only a second list of values. This lesson adds a dark theme and a switch for it, without any JavaScript.

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
    <main>
      <label class="switch">
        <input type="checkbox" id="dark">
        Dark theme
      </label>

      <h1>Sam Rivera</h1>

      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead who is <a href="#">learning to code</a>.</p>
      </div>
    </main>
  </body>
</html>
```

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --accent: #1d4ed8;
}

body:has(#dark:checked) {
  --paper: #111827;
  --ink: #e5e7eb;
  --accent: #93c5fd;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
  transition: background-color 0.3s, color 0.3s;
}

main {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h1 {
  color: var(--accent);
}

a {
  color: var(--accent);
}

.switch {
  cursor: pointer;
}

.card {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
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
    <main>
      <h1>Sam Rivera</h1>

      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead who is <a href="#">learning to code</a>.</p>
      </div>
    </main>
  </body>
</html>
```

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --accent: #1d4ed8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
}

main {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h1 {
  color: var(--accent);
}

a {
  color: var(--accent);
}

.card {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
}
```

## Explanation

Your editor has the page from the variables lesson. You add three things: the checkbox in the HTML, the rule with `:has` in the CSS, and the transition on `body`. Then click the checkbox in the result.

- `<input type="checkbox" id="dark">` A normal checkbox, with an id so that CSS can find it. It sits inside a `label`, so a click on the words "Dark theme" ticks the box too.
- `#dark:checked` `:checked` is a state, like `:hover`. It is on while the box is ticked.
- `body:has(#dark:checked)` Read it from the outside in: "the `body`, **if it has** inside it an element `#dark` that is checked". `:has` lets a rule look at what is inside an element. So this rule is for the whole `body`, but only while the box is ticked.
- `--paper: #111827;` Inside that rule, the same three variable names get new values. Nothing else changes. Every rule that says `var(--paper)` now gets the dark value.
- That is the whole trick: **the rules do not know about themes. They only know the variable names.** A theme is a new list of values for the same names.
- `min-height: 100vh;` `vh` is a unit: `100vh` is the full height of the browser window. Without it, a short page would be dark only as far as its content goes.
- `transition: background-color 0.3s, color 0.3s;` The theme changes smoothly.

In a dark theme, the accent gets **lighter** (`#93c5fd`). Dark blue text on a dark page cannot be read. Light text on dark, dark text on light.

Many devices have their own light or dark setting. CSS can ask for it, and then you need no switch at all:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #111827;
    --ink: #e5e7eb;
    --accent: #93c5fd;
  }
}
```

The rules inside `@media (…)` only count while the thing in the brackets is true. Here: while the device is set to dark. Unit 3 uses `@media` a lot, to make pages fit a phone.

## Twist

Tick the box and look at the card: it stays bright white, and the light text on it cannot be read. The card color was never a variable.

1. Make a variable `--card` in `:root` with the value `#ffffff`, and use it for the background of `.card`.
2. In the dark rule, set `--card` to `#1f2937`.

## Checks

- The page has a checkbox with the id "dark" :: !!document.querySelector('input[type="checkbox"]#dark')
- Ticking the box makes the page dark :: (() => { const box = document.querySelector('#dark'); if (!box) return false; const read = () => getComputedStyle(document.body).getPropertyValue('--paper').trim().toLowerCase(); const was = box.checked; box.checked = false; const light = read(); box.checked = true; const dark = read(); box.checked = was; return light === '#f5f7fa' && dark === '#111827'; })()
- The card uses the variable --card :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.card' && r.style.getPropertyValue('background-color').includes('var(--card)'))
- --card is white in the light theme and #1f2937 in the dark theme :: (() => { const box = document.querySelector('#dark'); const card = document.querySelector('.card'); if (!box || !card) return false; const read = () => getComputedStyle(card).getPropertyValue('--card').trim().toLowerCase(); const was = box.checked; box.checked = false; const light = read(); box.checked = true; const dark = read(); box.checked = was; return (light === '#ffffff' || light === '#fff') && dark === '#1f2937'; })()

## Twist answer

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --accent: #1d4ed8;
  --card: #ffffff;
}

body:has(#dark:checked) {
  --paper: #111827;
  --ink: #e5e7eb;
  --accent: #93c5fd;
  --card: #1f2937;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
  transition: background-color 0.3s, color 0.3s;
}

main {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h1 {
  color: var(--accent);
}

a {
  color: var(--accent);
}

.switch {
  cursor: pointer;
}

.card {
  padding: 1rem 1.5rem;
  background-color: var(--card);
  border-radius: 12px;
}
```

## What changed

- `--card: #ffffff;` and `--card: #1f2937;` One new name, with a value in each theme.
- `background-color: var(--card);` The card stopped having a fixed color and started asking for one.
- This is the rule for themes: **every color that should change with the theme must be a variable.** A color written straight into a rule stays the same in every theme. Sometimes that is what you want. For a white card on a dark page, it is not.
