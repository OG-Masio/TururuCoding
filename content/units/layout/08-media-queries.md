---
title: "Responsive: media queries"
minutes: 25
---

A page that looks right on every screen is called **responsive**. Two columns are fine on a laptop and too narrow on a phone. A **media query** lets you write rules that only count on some screen sizes.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Corner Bakery</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Corner Bakery</h1>

    <div class="page">
      <main>
        <h2>Today</h2>
        <p>Fresh sourdough, cinnamon rolls and apple pie. We start baking at five every morning.</p>
        <p>Come early: the rolls are gone by ten.</p>
      </main>

      <div class="side">
        <h2>Opening hours</h2>
        <p>Monday to Saturday, 7 to 15.</p>
        <p class="extra">Closed on public holidays.</p>
      </div>
    </div>
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
}

h1 {
  font-size: 2.5rem;
}

.page {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.side {
  padding: 0 16px;
  background: #fef3c7;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .page {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.75rem;
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
    <title>Corner Bakery</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Corner Bakery</h1>

    <div class="page">
      <main>
        <h2>Today</h2>
        <p>Fresh sourdough, cinnamon rolls and apple pie. We start baking at five every morning.</p>
        <p>Come early: the rolls are gone by ten.</p>
      </main>

      <div class="side">
        <h2>Opening hours</h2>
        <p>Monday to Saturday, 7 to 15.</p>
        <p class="extra">Closed on public holidays.</p>
      </div>
    </div>
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
}

h1 {
  font-size: 2.5rem;
}

.side {
  padding: 0 16px;
  background: #fef3c7;
  border-radius: 8px;
}
```

## Explanation

- `.page { grid-template-columns: 2fr 1fr; }` Two columns: the text gets two shares, the opening hours get one. This rule counts on every screen.
- `@media (max-width: 600px) { … }` This is the media query. The rules between its braces only count **while the screen is 600 pixels wide or less**. On a wider screen the browser skips them.
- Look at the braces. The query has its own `{` and `}`, and the normal rules sit inside them, each with their own braces. The rules inside are indented, so you can see where the query ends.
- `.page { grid-template-columns: 1fr; }` inside the query: one column, so the opening hours go under the text. There are now two rules for `.page`. On a small screen both count, and the later one wins. That is why the query is at the **end** of the file.
- `h1 { font-size: 1.75rem; }` A smaller title for a smaller screen.
- `max-width: 600px` means "600 or less": small screens. `min-width: 600px` means "600 or more": big screens. The number where the layout changes is called a **breakpoint**.

**Test it.** Press **Phone** above the result: the result is now 375 pixels wide, and you see one column. Press **Desktop**: 1200 pixels, two columns. Press the same button again to go back to the normal width.

One line in the HTML is new too:

- `<meta name="viewport" content="width=device-width, initial-scale=1">` Without this line, a phone acts as if its screen is about 980 pixels wide and shows the whole page very small. With it, the phone uses its real width, and your media queries work. Every page needs this line in its `head`. When you type `!` and press Tab, it is already there.

## Twist

1. The two columns get too narrow before 600 pixels. Move the breakpoint to `800px`.
2. On small screens, hide the line about public holidays. Inside the query, write a rule for `.extra` with `display: none;`.
3. Add a second query at the end of the file, for big screens: from `1000px` and up, the `body` has `font-size: 1.125rem;`.

## Checks

- Outside the queries, the page still has two columns :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.page' && r.style.gridTemplateColumns === '2fr 1fr')
- At 800 pixels or less, the page has one column :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /max-width:\s*800px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === '.page' && r.style.gridTemplateColumns === '1fr')); })()
- Small screens do not show the line about holidays :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /max-width:\s*800px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === '.extra' && r.style.display === 'none')); })()
- From 1000 pixels and up, the text is bigger :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /min-width:\s*1000px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === 'body' && r.style.fontSize === '1.125rem')); })()

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

h1 {
  font-size: 2.5rem;
}

.page {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.side {
  padding: 0 16px;
  background: #fef3c7;
  border-radius: 8px;
}

@media (max-width: 800px) {
  .page {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.75rem;
  }

  .extra {
    display: none;
  }
}

@media (min-width: 1000px) {
  body {
    font-size: 1.125rem;
  }
}
```

## What changed

- `@media (max-width: 800px)` Press **Tablet** above the result. A tablet is 768 pixels wide. Before, it had two columns. Now it is under the breakpoint and has one.
- `.extra { display: none; }` A query can hold any rule, also one that hides something. The line is still in the HTML. Big screens show it.
- `@media (min-width: 1000px)` A second query, with `min-width`. A file can have as many queries as you need.
- The page now has three states: up to 800 pixels, from 801 to 999, and from 1000. Two breakpoints make three states.
