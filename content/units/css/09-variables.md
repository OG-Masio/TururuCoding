---
title: "Variables: one place for your colors"
minutes: 20
---

The same blue is in five rules. One day you want another blue, and you have to find all five. A **variable** fixes that: you give a value a name, once, and use the name everywhere.

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
      <h1>Sam Rivera</h1>

      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead who is <a href="#">learning to code</a>.</p>
      </div>

      <button class="button" type="button">Say hello</button>
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
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

h1 {
  color: var(--accent);
}

a {
  color: var(--accent);
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: 8px;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
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

      <button class="button" type="button">Say hello</button>
    </main>
  </body>
</html>
```

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
  background-color: #f5f7fa;
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

h1 {
  color: #1d4ed8;
}

a {
  color: #1d4ed8;
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: 8px;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: #1d4ed8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
```

## Explanation

Your editor has the page with the colors written out in every rule. You add the `:root` rule at the top, and then replace each color with its name.

- `:root` A selector for the top of the page, the `html` element. Variables that you make here can be used everywhere on the page.
- `--accent: #1d4ed8;` Makes a variable. The name starts with two hyphens. The rest of the name is yours to choose. The value is anything that can stand after a colon in CSS.
- `var(--accent)` Uses a variable. Where you would write the color, you write `var(` , the name, and `)`.
- `color: var(--ink);` reads as: "the text color is whatever `--ink` is".
- The blue is now written in **one** place. `h1`, `a` and `.button` all ask for `--accent`.

Name a variable after its **job**, not after its color: `--accent`, not `--blue`. When the accent becomes orange, the name `--blue` would be a lie in every rule.

Variables are not only for colors. Sizes, fonts and spacing work the same way:

```css
:root {
  --radius: 8px;
  --gap: 1.5rem;
}
```

The real name of this is *custom properties*. Everyone says "CSS variables".

## Twist

1. Change the accent color in one place: set `--accent` to `#b45309`. The heading, the link and the button change together.
2. The corner size `8px` is written twice. Make a variable `--radius` with the value `12px`, and use it for the `border-radius` of `.card` and of `.button`.

## Checks

- The variables are made on :root :: (() => { const r = getComputedStyle(document.documentElement); return r.getPropertyValue('--paper').trim() !== '' && r.getPropertyValue('--ink').trim() !== ''; })()
- The accent is #b45309 :: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase() === '#b45309'
- Heading, link and button all follow the accent :: getComputedStyle(document.querySelector('h1')).color === 'rgb(180, 83, 9)' && getComputedStyle(document.querySelector('a')).color === 'rgb(180, 83, 9)' && getComputedStyle(document.querySelector('.button')).backgroundColor === 'rgb(180, 83, 9)'
- There is a variable --radius of 12px :: getComputedStyle(document.documentElement).getPropertyValue('--radius').trim() === '12px'
- The card and the button use var(--radius) :: ['.card', '.button'].every((sel) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === sel && r.style.getPropertyValue('border-radius').includes('var(--radius)'))) && getComputedStyle(document.querySelector('.card')).borderTopLeftRadius === '12px'

## Twist answer

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --accent: #b45309;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

h1 {
  color: var(--accent);
}

a {
  color: var(--accent);
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: var(--radius);
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
}
```

## What changed

- `--accent: #b45309;` One line changed, and three things on the page changed color. This is the whole reason variables exist.
- `--radius: 12px;` A variable can hold a size as well as a color. The card and the button now always have the same corners. Change the number once, and both follow.
- The list under `:root` is becoming the control panel of the page: every choice about its looks, in one place. The last lesson of this unit uses that to switch the whole page to a dark theme.
