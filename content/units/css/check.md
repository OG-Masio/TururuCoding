---
title: "Quick check: CSS"
---

Unit 2 teaches how to make a page look good with CSS. If you already know CSS, this one task shows it. The answer is right below, like always.

## Task

The HTML is in your editor, and `style.css` is empty. Write the CSS:

1. On `:root`, make the variables `--paper`, `--ink`, `--accent` and `--card`. Use them for the page background, the text color, the links and the cards.
2. `main` is at most `560px` wide and sits in the middle of the page.
3. A `.card` has padding, the `--card` background, round corners and a soft shadow.
4. The `.tag` is a pill with its own background color.
5. Links have no underline. They get one while the mouse is over them, and an outline while they have the keyboard focus.
6. The `.button` has the accent color as its background, changes color on hover, and makes that change smoothly.
7. A dark theme: while the checkbox `#dark` is ticked, `--paper`, `--ink` and `--card` have dark values.

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Corner Bakery</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
      <label><input type="checkbox" id="dark"> Dark theme</label>

      <h1>Corner Bakery</h1>

      <div class="card">
        <h2>Today</h2>
        <p>Sourdough bread <span class="tag">Fresh</span></p>
        <p><a href="#hours">See the opening hours</a></p>
      </div>

      <div class="card" id="hours">
        <h2>Hours</h2>
        <p>Monday to Friday, 6 am to 4 pm.</p>
        <button class="button" type="button">Order bread</button>
      </div>
    </main>
  </body>
</html>
```

## Checks

- Four variables on :root, used for the page and the text :: (() => { const r = getComputedStyle(document.documentElement); const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return ['--paper', '--ink', '--accent', '--card'].every((n) => r.getPropertyValue(n).trim() !== '') && rules.some((x) => x.selectorText === 'body' && x.style.getPropertyValue('background-color').includes('var(--paper)') && x.style.getPropertyValue('color').includes('var(--ink)')); })()
- main is at most 560px wide and centered :: getComputedStyle(document.querySelector('main')).maxWidth === '560px' && [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === 'main' && r.style.marginLeft === 'auto' && r.style.marginRight === 'auto')
- Cards have padding, the --card background, round corners and a shadow :: (() => { const c = getComputedStyle(document.querySelector('.card')); const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return parseFloat(c.paddingTop) > 0 && parseFloat(c.borderTopLeftRadius) > 0 && c.boxShadow !== 'none' && rules.some((x) => x.selectorText === '.card' && x.style.getPropertyValue('background-color').includes('var(--card)')); })()
- The tag is a pill with a background :: (() => { const t = getComputedStyle(document.querySelector('.tag')); return parseFloat(t.borderTopLeftRadius) >= 8 && t.backgroundColor !== 'rgba(0, 0, 0, 0)'; })()
- Links: no underline, an underline on hover, an outline on focus :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return getComputedStyle(document.querySelector('a')).textDecorationLine === 'none' && rules.some((r) => r.selectorText === 'a:hover' && r.style.textDecoration.includes('underline')) && rules.some((r) => r.selectorText === 'a:focus-visible' && r.style.outlineStyle !== ''); })()
- The button uses the accent, changes on hover, and does it smoothly :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); const b = getComputedStyle(document.querySelector('.button')); return rules.some((r) => r.selectorText === '.button' && r.style.getPropertyValue('background-color').includes('var(--accent)')) && rules.some((r) => r.selectorText === '.button:hover' && r.style.backgroundColor !== '') && b.transitionProperty.includes('background-color') && parseFloat(b.transitionDuration) > 0; })()
- Ticking the box changes --paper, --ink and --card :: (() => { const box = document.querySelector('#dark'); if (!box) return false; const read = () => ['--paper', '--ink', '--card'].map((n) => getComputedStyle(document.body).getPropertyValue(n).trim()); const was = box.checked; box.checked = false; const light = read(); box.checked = true; const dark = read(); box.checked = was; return light.every((v, i) => v !== '' && v !== dark[i]); })()

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Corner Bakery</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
      <label><input type="checkbox" id="dark"> Dark theme</label>

      <h1>Corner Bakery</h1>

      <div class="card">
        <h2>Today</h2>
        <p>Sourdough bread <span class="tag">Fresh</span></p>
        <p><a href="#hours">See the opening hours</a></p>
      </div>

      <div class="card" id="hours">
        <h2>Hours</h2>
        <p>Monday to Friday, 6 am to 4 pm.</p>
        <button class="button" type="button">Order bread</button>
      </div>
    </main>
  </body>
</html>
```

```css file=style.css
:root {
  --paper: #fdf6ec;
  --ink: #3b2f2f;
  --accent: #b45309;
  --card: #ffffff;
}

body:has(#dark:checked) {
  --paper: #1c1917;
  --ink: #f5f5f4;
  --card: #292524;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background-color: var(--paper);
}

main {
  max-width: 560px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: var(--card);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tag {
  padding: 2px 10px;
  color: #3b2f2f;
  background-color: #fde68a;
  border-radius: 999px;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

a:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #92400e;
}
```

## Explanation

Everything in this file is taught in unit 2: rules and selectors (lesson 1), colors (2), fonts and line height (3), padding, border and margin (4), classes (5), `max-width`, centering and `rem` (6), backgrounds and round corners (7), `:hover` and `:focus-visible` (8), variables (9), shadows and transitions (10), and the dark theme with `:has` (11).
