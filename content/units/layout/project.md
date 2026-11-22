---
title: Responsive landing page
minutes: 75
---

A **landing page** is the first page of a product: a nav bar, a big first part with one button, a few boxes that say what the product does, and a footer. In this project you build one for Dock Planner, a made-up app for warehouses. You build it for a phone first, and then give it more room on a tablet and on a desktop. First you copy it, step by step. Then you twist it into your own.

## Result

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dock Planner</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header class="nav" id="top">
      <a class="brand" href="#top">Dock Planner</a>
      <ul class="links">
        <li><a href="#features">Features</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </header>

    <section class="hero">
      <div class="hero-text">
        <h1>Know every truck before it arrives</h1>
        <p>Dock Planner shows your whole day on one screen: which truck, which door, what time.</p>
        <a class="button" href="#contact">Try it free</a>
      </div>
      <img class="hero-picture" src="images/boxes.svg" alt="Boxes stacked on a pallet">
    </section>

    <main>
      <section class="features" id="features">
        <div class="feature">
          <span class="badge">New</span>
          <h2>See the day</h2>
          <p>All doors and all trucks in one timeline.</p>
        </div>
        <div class="feature">
          <h2>No double bookings</h2>
          <p>Two trucks never get the same door at the same time.</p>
        </div>
        <div class="feature">
          <h2>Works on your phone</h2>
          <p>Check the plan from the yard, not only from the office.</p>
        </div>
      </section>
    </main>

    <footer class="footer" id="contact">
      <span>Dock Planner, made by Sam Rivera</span>
      <a href="#top">Back to top</a>
    </footer>
  </body>
</html>
```

```css file=style.css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --paper: #f5f7fa;
  --card: #ffffff;
  --accent: #1d4ed8;
  --dark: #111827;
  --line: #cbd2d9;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--paper);
}

img {
  display: block;
  max-width: 100%;
}

/* The nav bar */

.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--dark);
}

.brand {
  color: white;
  font-weight: bold;
  text-decoration: none;
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

.links a:hover {
  color: white;
}

/* The hero */

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 16px;
  text-align: center;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 2rem;
  line-height: 1.2;
}

.hero p {
  margin: 0 0 20px;
  color: var(--muted);
}

.hero-picture {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
}

.button {
  display: inline-block;
  padding: 12px 20px;
  background: var(--accent);
  color: white;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
}

/* The features */

main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.feature {
  position: relative;
  padding: 4px 20px;
  background: var(--card);
  border: 2px solid var(--line);
  border-radius: 12px;
}

.badge {
  position: absolute;
  top: -12px;
  right: 12px;
  padding: 2px 10px;
  background: #e11d48;
  color: white;
  border-radius: 999px;
  font-size: 0.8rem;
}

/* The footer */

.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 16px;
  color: var(--muted);
}

/* Tablets and bigger */

@media (min-width: 700px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
  }

  .nav,
  .footer {
    padding-left: 32px;
    padding-right: 32px;
  }
}

/* Desktops */

@media (min-width: 1000px) {
  .hero {
    flex-direction: row;
    justify-content: center;
    gap: 48px;
    padding: 64px 32px;
    text-align: left;
  }

  .hero-text {
    max-width: 480px;
  }

  .hero h1 {
    font-size: 3rem;
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
    <title>Dock Planner</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header class="nav" id="top">
      <a class="brand" href="#top">Dock Planner</a>
      <ul class="links">
        <li><a href="#features">Features</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </header>

    <section class="hero">
      <div class="hero-text">
        <h1>Know every truck before it arrives</h1>
        <p>Dock Planner shows your whole day on one screen: which truck, which door, what time.</p>
        <a class="button" href="#contact">Try it free</a>
      </div>
      <img class="hero-picture" src="images/boxes.svg" alt="Boxes stacked on a pallet">
    </section>

    <main>
      <section class="features" id="features">
        <div class="feature">
          <span class="badge">New</span>
          <h2>See the day</h2>
          <p>All doors and all trucks in one timeline.</p>
        </div>
        <div class="feature">
          <h2>No double bookings</h2>
          <p>Two trucks never get the same door at the same time.</p>
        </div>
        <div class="feature">
          <h2>Works on your phone</h2>
          <p>Check the plan from the yard, not only from the office.</p>
        </div>
      </section>
    </main>

    <footer class="footer" id="contact">
      <span>Dock Planner, made by Sam Rivera</span>
      <a href="#top">Back to top</a>
    </footer>
  </body>
</html>
```

```css file=style.css
```

## Steps

Press **Phone** above the result before you start, and keep it pressed for steps 2 to 6. You build the phone page first.

### Step 1: Read the HTML

`index.html` is already in your editor. You type nothing in this step. Find the four parts of the page, and the class of each:

```html
<header class="nav" id="top">
<section class="hero">
<section class="features" id="features">
<footer class="footer" id="contact">
```

- `.nav` holds two things: the name (`.brand`) and a list of links (`.links`).
- `.hero` holds two things: a `div` with the text and the button (`.hero-text`), and a picture (`.hero-picture`). Two children, so that they can stand next to each other on a big screen.
- `.features` holds three boxes with the class `feature`. The first one has a `span` with the class `badge`.
- `<meta name="viewport" …>` is in the `head`. Without it, a phone would show the desktop page, very small.

Everything from here on goes in `style.css`. Click its tab.

### Step 2: The base

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --paper: #f5f7fa;
  --card: #ffffff;
  --accent: #1d4ed8;
  --dark: #111827;
  --line: #cbd2d9;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--paper);
}

img {
  display: block;
  max-width: 100%;
}
```

- `:root` The colors in one place, like in unit 2.
- `body { margin: 0; }` The nav bar must touch the edges of the screen.
- `img { max-width: 100%; }` A picture is never wider than the box it is in. On a phone, a big picture gets smaller in place of sticking out of the screen. Put this rule in every responsive page.

### Step 3: The nav bar

```css
/* The nav bar */

.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--dark);
}

.brand {
  color: white;
  font-weight: bold;
  text-decoration: none;
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

.links a:hover {
  color: white;
}
```

- `display: flex; justify-content: space-between; align-items: center;` The name left, the links right, at the same height.
- `flex-wrap: wrap;` On a very narrow phone the links go under the name. Nothing sticks out.
- `position: sticky; top: 0; z-index: 10;` The bar stays on the screen, above everything else.
- `.links` A list as a row: flex, no bullets, no padding.

### Step 4: The hero, for a phone

```css
/* The hero */

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 16px;
  text-align: center;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 2rem;
  line-height: 1.2;
}

.hero p {
  margin: 0 0 20px;
  color: var(--muted);
}

.hero-picture {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
}

.button {
  display: inline-block;
  padding: 12px 20px;
  background: var(--accent);
  color: white;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
}
```

- `flex-direction: column;` The text block is above the picture. `align-items: center` puts both in the middle, and `gap` keeps them apart.
- `text-align: center;` Flexbox places the two **boxes**. This line centers the **text** inside the text box.
- `.hero-picture` As wide as the screen, but never wider than 420 pixels.
- `display: inline-block;` A link is inline. As an inline-block it takes its padding on all sides, like in lesson 1.

### Step 5: The features, for a phone

```css
/* The features */

main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.feature {
  position: relative;
  padding: 4px 20px;
  background: var(--card);
  border: 2px solid var(--line);
  border-radius: 12px;
}

.badge {
  position: absolute;
  top: -12px;
  right: 12px;
  padding: 2px 10px;
  background: #e11d48;
  color: white;
  border-radius: 999px;
  font-size: 0.8rem;
}
```

- `grid-template-columns: 1fr;` One column: the three boxes are under each other.
- `position: relative;` on the box and `position: absolute;` on the badge: the pair from lesson 7. `top: -12px` lifts the badge half over the top edge of its box.

### Step 6: The footer

```css
/* The footer */

.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 16px;
  color: var(--muted);
}
```

- The same idea as the nav bar: two things, one at each end, and they wrap when there is no room.

The phone page is done. Scroll through it in the result.

### Step 7: Tablets

Press **Tablet** above the result. The page works, but the three boxes are very wide. Add this at the end of the file:

```css
/* Tablets and bigger */

@media (min-width: 700px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
  }

  .nav,
  .footer {
    padding-left: 32px;
    padding-right: 32px;
  }
}
```

- `@media (min-width: 700px)` From 700 pixels and up.
- `repeat(3, 1fr)` The three boxes stand next to each other.
- `.nav, .footer` A comma between two selectors means "both". One rule for two elements: a bigger screen gets more space at the left and right edges.
- Press **Phone** again: nothing changed there. A phone never reads this block.

### Step 8: Desktops

Press **Desktop**. The hero is a long column with a lot of empty space left and right. Add this at the end of the file:

```css
/* Desktops */

@media (min-width: 1000px) {
  .hero {
    flex-direction: row;
    justify-content: center;
    gap: 48px;
    padding: 64px 32px;
    text-align: left;
  }

  .hero-text {
    max-width: 480px;
  }

  .hero h1 {
    font-size: 3rem;
  }
}
```

- `flex-direction: row;` The hero was a column. On a big screen it is a row: the text left, the picture right. `align-items: center` from step 4 still counts, and in a row it centers the two up and down.
- `text-align: left;` Centered text was right for a phone. Next to a picture, text reads better from the left.
- `.hero-text { max-width: 480px; }` Lines of text that are too long are hard to read.
- Press **Phone**, **Tablet** and **Desktop** one after the other. One HTML file, one CSS file, three layouts.

## Checks

- The base: border-box everywhere, no margin on the body, and pictures never wider than their box :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return getComputedStyle(document.querySelector('.feature')).boxSizing === 'border-box' && getComputedStyle(document.body).marginTop === '0px' && rules.some((r) => r.selectorText === 'img' && r.style.maxWidth === '100%'); })()
- The nav bar is a row with the name left and the links right, and it stays at the top :: (() => { const nav = document.querySelector('.nav'); const n = getComputedStyle(nav); const bar = nav.getBoundingClientRect(); const brand = nav.querySelector('.brand').getBoundingClientRect(); const links = nav.querySelector('.links').getBoundingClientRect(); return n.display === 'flex' && n.position === 'sticky' && n.top === '0px' && brand.left < bar.left + 60 && links.right > bar.right - 60; })()
- The links are a row without bullets :: (() => { const l = getComputedStyle(document.querySelector('.links')); return l.display === 'flex' && l.listStyleType === 'none' && l.paddingLeft === '0px'; })()
- On a phone the hero is a column, and the picture never gets wider than the screen :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); const pic = getComputedStyle(document.querySelector('.hero-picture')); return getComputedStyle(document.querySelector('.hero')).display === 'flex' && rules.some((r) => r.selectorText === '.hero' && r.style.flexDirection === 'column') && pic.maxWidth !== 'none'; })()
- On a phone the features are a grid with one column :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); const f = getComputedStyle(document.querySelector('.features')); return f.display === 'grid' && parseFloat(f.rowGap) > 0 && rules.filter((r) => r.selectorText === '.features').every((r) => r.style.gridTemplateColumns === '' || r.style.gridTemplateColumns === '1fr'); })()
- The badge hangs over the top edge of its box :: (() => { const badge = document.querySelector('.badge'); const box = badge.parentElement; return getComputedStyle(badge).position === 'absolute' && getComputedStyle(box).position === 'relative' && badge.getBoundingClientRect().top < box.getBoundingClientRect().top; })()
- The footer spreads its two parts, and they wrap on a narrow screen :: (() => { const f = getComputedStyle(document.querySelector('.footer')); return f.display === 'flex' && f.flexWrap === 'wrap' && f.justifyContent === 'space-between'; })()
- From 700 pixels, the features have three columns :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /min-width:\s*700px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === '.features' && /repeat\(3,\s*1fr\)|^1fr 1fr 1fr$/.test(r.style.gridTemplateColumns))); })()
- From 1000 pixels, the hero is a row with its text at the left :: (() => { const m = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.media && r.cssRules); return m.some((q) => /min-width:\s*1000px/.test(q.conditionText) && [...q.cssRules].some((r) => r.selectorText === '.hero' && r.style.flexDirection === 'row' && r.style.textAlign === 'left')); })()

## Make it yours

Dock Planner is made up. Change the page into the landing page of something you care about: an app you want to build, your own work, a shop, a team.

1. Change the name, the title, the hero text and the three features. Change the picture to another one from this site: `images/mountain.svg`, `images/bird.svg` or `images/coffee.svg`.
2. Change `--accent` and `--dark` to your own colors.
3. Add a fourth feature box. Three columns do not fit four boxes well. Change the tablet layout to two columns, and add four columns in the desktop query.
4. Put the picture on the left side on desktops: in the desktop query, give `.hero` the line `flex-direction: row-reverse;`.
5. Add a third link to the nav bar. You do not need to change the CSS for it.
6. Move the first breakpoint from `700px` to a number that fits your text better. Press **Tablet** to test it.

The checks keep working while you change things. If one goes empty, read its text: it tells you which part is missing.

## On your computer

The buttons Phone, Tablet and Desktop only exist on this site. Every browser has the same tool built in, and it works on any page:

1. Press **Download my page as index.html** below, and open the file from your Downloads folder. The picture is missing, because the `images` folder lives on this site.
2. Make the browser window narrow, then wide. The layout changes at 700 and at 1000 pixels.
3. Press `F12`. A panel opens: the **developer tools**. Then press `Ctrl` `Shift` `M` (on a Mac: `Cmd` `Shift` `M`). The page is now shown as on a phone, and a list at the top lets you pick the phone.
4. Press `F12` again to close the panel.

You will use this panel a lot from now on. Unit 7 teaches the rest of it.
