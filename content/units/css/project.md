---
title: Profile page with two themes
minutes: 60
---

Sam's profile page from unit 1 has good bones and no looks. In this project you dress it: a header, cards, a clean table, a form that is nice to fill in, and a dark theme. First you copy Sam's style, step by step. Then you twist it into your own.

## Result

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header>
      <label class="switch"><input type="checkbox" id="dark"> Dark theme</label>
      <img class="avatar" src="images/avatar.svg" alt="Portrait of Sam Rivera">
      <h1>Sam Rivera</h1>
      <p>Warehouse lead who is learning to build websites.</p>
      <nav>
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#links">Links</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <main>
      <section class="card" id="about">
        <h2>About me</h2>
        <p>I have worked in logistics for <strong>eight years</strong>. This year I started learning to code, one small lesson at a time.</p>
        <p>When I am not working, I lift weights and make coffee that is <em>almost</em> good.</p>
      </section>

      <section class="card" id="skills">
        <h2>Skills</h2>
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Level</th>
              <th>Since</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Inventory control</td>
              <td>Strong</td>
              <td>2018</td>
            </tr>
            <tr>
              <td>Spreadsheets</td>
              <td>Good</td>
              <td>2020</td>
            </tr>
            <tr>
              <td>HTML and CSS</td>
              <td><span class="tag">Learning</span></td>
              <td>2026</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card" id="links">
        <h2>Links</h2>
        <ul>
          <li><a href="https://developer.mozilla.org" target="_blank">Where I look things up</a></li>
          <li><a href="https://github.com" target="_blank">Where my code will live</a></li>
        </ul>
      </section>

      <section class="card" id="contact">
        <h2>Contact</h2>
        <form>
          <p>
            <label for="name">Your name</label>
            <input type="text" id="name" name="name" required>
          </p>
          <p>
            <label for="reason">Why are you writing?</label>
            <select id="reason" name="reason">
              <option value="hello">To say hello</option>
              <option value="work">About work</option>
              <option value="code">About code</option>
            </select>
          </p>
          <p>
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="4" required></textarea>
          </p>
          <button class="button" type="submit">Send message</button>
        </form>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Sam Rivera. Built by hand in HTML and CSS.</p>
    </footer>
  </body>
</html>
```

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --muted: #52606d;
  --accent: #1d4ed8;
  --card: #ffffff;
  --line: #cbd2d9;
  --radius: 12px;
}

body:has(#dark:checked) {
  --paper: #111827;
  --ink: #e5e7eb;
  --muted: #9ca3af;
  --accent: #93c5fd;
  --card: #1f2937;
  --line: #374151;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  font-size: 17px;
  line-height: 1.6;
  color: var(--ink);
  background-color: var(--paper);
  transition: background-color 0.3s, color 0.3s;
}

header {
  padding: 1rem 1rem 2rem;
  text-align: center;
}

.switch {
  display: block;
  margin-bottom: 1.5rem;
  text-align: right;
  color: var(--muted);
  cursor: pointer;
}

.avatar {
  width: 7rem;
  border-radius: 50%;
  background-color: var(--card);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

h1 {
  margin: 0.5rem 0 0;
  font-size: 2.5rem;
}

header p {
  margin: 0 0 1rem;
  color: var(--muted);
}

nav a {
  margin: 0 0.5rem;
  font-weight: 700;
}

main {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  padding: 1rem 1.5rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

h2 {
  margin: 0 0 0.5rem;
  color: var(--accent);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.5rem 0;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.tag {
  padding: 2px 10px;
  color: #1f2933;
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

a:focus-visible,
.button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

label {
  font-weight: 700;
}

input,
select,
textarea {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.5rem;
  font: inherit;
  color: var(--ink);
  background-color: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.switch input {
  display: inline;
  width: auto;
  margin: 0;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--card);
  background-color: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.button:hover {
  transform: translateY(-2px);
}

footer {
  padding: 1rem;
  text-align: center;
  color: var(--muted);
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
    <header>
      <label class="switch"><input type="checkbox" id="dark"> Dark theme</label>
      <img class="avatar" src="images/avatar.svg" alt="Portrait of Sam Rivera">
      <h1>Sam Rivera</h1>
      <p>Warehouse lead who is learning to build websites.</p>
      <nav>
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#links">Links</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <main>
      <section class="card" id="about">
        <h2>About me</h2>
        <p>I have worked in logistics for <strong>eight years</strong>. This year I started learning to code, one small lesson at a time.</p>
        <p>When I am not working, I lift weights and make coffee that is <em>almost</em> good.</p>
      </section>

      <section class="card" id="skills">
        <h2>Skills</h2>
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Level</th>
              <th>Since</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Inventory control</td>
              <td>Strong</td>
              <td>2018</td>
            </tr>
            <tr>
              <td>Spreadsheets</td>
              <td>Good</td>
              <td>2020</td>
            </tr>
            <tr>
              <td>HTML and CSS</td>
              <td><span class="tag">Learning</span></td>
              <td>2026</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card" id="links">
        <h2>Links</h2>
        <ul>
          <li><a href="https://developer.mozilla.org" target="_blank">Where I look things up</a></li>
          <li><a href="https://github.com" target="_blank">Where my code will live</a></li>
        </ul>
      </section>

      <section class="card" id="contact">
        <h2>Contact</h2>
        <form>
          <p>
            <label for="name">Your name</label>
            <input type="text" id="name" name="name" required>
          </p>
          <p>
            <label for="reason">Why are you writing?</label>
            <select id="reason" name="reason">
              <option value="hello">To say hello</option>
              <option value="work">About work</option>
              <option value="code">About code</option>
            </select>
          </p>
          <p>
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="4" required></textarea>
          </p>
          <button class="button" type="submit">Send message</button>
        </form>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Sam Rivera. Built by hand in HTML and CSS.</p>
    </footer>
  </body>
</html>
```

## Steps

### Step 1: Read what changed in the HTML

`index.html` is already in your editor. It is Sam's page from unit 1, made ready for CSS. You type nothing in this step. Find these changes in the file:

```html
<link rel="stylesheet" href="style.css">
<label class="switch"><input type="checkbox" id="dark"> Dark theme</label>
<img class="avatar" src="images/avatar.svg" alt="Portrait of Sam Rivera">
<section class="card" id="about">
<button class="button" type="submit">Send message</button>
```

- `<link …>` Connects the page to `style.css`.
- `class="switch"` and `id="dark"` The checkbox for the dark theme, at the top of the header.
- `class="avatar"` The picture moved into the header and lost its `width`. CSS sets the size now.
- `class="card"` All four sections share one class. An element can have a class and an id together.
- `class="button"` and `class="tag"` Names for the send button and for the word "Learning" in the table.
- The `<br>` tags in the form are gone. CSS puts each field on its own line.

Everything from here on goes in `style.css`. Click its tab.

### Step 2: The control panel

```css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --muted: #52606d;
  --accent: #1d4ed8;
  --card: #ffffff;
  --line: #cbd2d9;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  font-size: 17px;
  line-height: 1.6;
  color: var(--ink);
  background-color: var(--paper);
}
```

- `:root { … }` Every choice about the looks of the page, in one list: six colors and the corner size. `--muted` is for less important text, `--line` for thin lines.
- `* { box-sizing: border-box; }` The rule from lesson 6 that belongs at the top of every CSS file.
- `body { … }` The page itself: no outer margin, at least as high as the window, one font, and the two main colors.

### Step 3: The header

```css
header {
  padding: 1rem 1rem 2rem;
  text-align: center;
}

.switch {
  display: block;
  margin-bottom: 1.5rem;
  text-align: right;
  color: var(--muted);
  cursor: pointer;
}

.avatar {
  width: 7rem;
  border-radius: 50%;
  background-color: var(--card);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

h1 {
  margin: 0.5rem 0 0;
  font-size: 2.5rem;
}

header p {
  margin: 0 0 1rem;
  color: var(--muted);
}

nav a {
  margin: 0 0.5rem;
  font-weight: 700;
}
```

- `padding: 1rem 1rem 2rem;` Three values: top, then left and right, then bottom.
- `text-align: center;` Centers everything inside the header: the picture, the name, the line under it and the menu.
- `display: block;` A `label` normally sits in a line of text. `block` makes it a box as wide as the header, so `text-align: right` can push its content to the right. Unit 3 is all about `display`.
- `.avatar` A round picture with a soft shadow.
- `header p` and `nav a` Two selectors with a space between them. `header p` means "a `p` that is inside a `header`". The other paragraphs on the page are not touched.

### Step 4: The column and the cards

```css
main {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  padding: 1rem 1.5rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

h2 {
  margin: 0 0 0.5rem;
  color: var(--accent);
}
```

- `main` The centered column from lesson 6. The padding keeps the cards away from the screen edges on a phone.
- `.card` One rule, four cards. The page starts to look like a design.
- `h2` No margin on top, a small one below, in the accent color.

### Step 5: The table

```css
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.5rem 0;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.tag {
  padding: 2px 10px;
  color: #1f2933;
  background-color: #fde68a;
  border-radius: 999px;
}
```

- `width: 100%;` The table fills its card.
- `border-collapse: collapse;` A table normally keeps a small gap between its cells. This closes the gaps, so the lines under the rows are not broken.
- `th, td` A comma between two selectors means "both". The rule is for header cells and for data cells.
- `border-bottom` A line under every row and nothing else: the calm way to style a table.
- `.tag` The pill. Its text color is fixed, not a variable: yellow stays yellow in both themes, so the text on it must stay dark.

### Step 6: Links

```css
a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

a:focus-visible,
.button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}
```

- `a` and `a:hover` Like in lesson 8. This also styles the menu in the header.
- The long selector is five selectors with commas between them. Everything a person can reach with the Tab key gets the same focus outline. Click on the result and press Tab to walk through the page.

### Step 7: The form

```css
label {
  font-weight: 700;
}

input,
select,
textarea {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.5rem;
  font: inherit;
  color: var(--ink);
  background-color: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.switch input {
  display: inline;
  width: auto;
  margin: 0;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--card);
  background-color: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.button:hover {
  transform: translateY(-2px);
}

footer {
  padding: 1rem;
  text-align: center;
  color: var(--muted);
}
```

- `display: block; width: 100%;` Every field gets its own line and fills the card. That is why the `<br>` tags could go.
- `font: inherit;` Form fields do not take the font of the page by themselves. `inherit` means "use what the element around me uses".
- `.switch input` The checkbox at the top is an `input` too, so the rule above made it wide. This rule is more exact (a class and a tag), so it wins and puts the checkbox back to normal.
- `.button` The text color is `var(--card)` and the background `var(--accent)`. In the dark theme both change, and the button stays readable.
- `footer` Small, centered and quiet.

### Step 8: The dark theme

Add this right under the `:root` rule, at the top of the file:

```css
body:has(#dark:checked) {
  --paper: #111827;
  --ink: #e5e7eb;
  --muted: #9ca3af;
  --accent: #93c5fd;
  --card: #1f2937;
  --line: #374151;
}
```

And add one line to the `body` rule, as its last declaration:

```css
  transition: background-color 0.3s, color 0.3s;
```

- `body:has(#dark:checked)` While the box is ticked, the six color names get dark values. `--radius` is not in the list: corners are the same in both themes.
- Tick the box in the result. Every rule you wrote asks for a variable, so the whole page changes with eight lines of CSS.

## Checks

- The control panel: seven variables, used by the page :: (() => { const r = getComputedStyle(document.documentElement); const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return ['--paper', '--ink', '--muted', '--accent', '--card', '--line', '--radius'].every((n) => r.getPropertyValue(n).trim() !== '') && rules.some((x) => x.selectorText === 'body' && x.style.getPropertyValue('background-color').includes('var(--paper)')); })()
- The header is centered and the avatar is round :: getComputedStyle(document.querySelector('header')).textAlign === 'center' && getComputedStyle(document.querySelector('.avatar')).borderTopLeftRadius === '50%'
- A centered column with four cards :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); const cards = [...document.querySelectorAll('main .card')]; return getComputedStyle(document.querySelector('main')).maxWidth !== 'none' && rules.some((r) => r.selectorText === 'main' && r.style.marginLeft === 'auto') && cards.length >= 4 && cards.every((c) => parseFloat(getComputedStyle(c).paddingTop) > 0 && getComputedStyle(c).boxShadow !== 'none'); })()
- The table fills its card and has a line under every row :: (() => { const t = document.querySelector('table'); const td = document.querySelector('td'); return !!t && !!td && getComputedStyle(t).borderCollapse === 'collapse' && getComputedStyle(td).borderBottomStyle === 'solid' && t.offsetWidth >= t.parentElement.clientWidth - parseFloat(getComputedStyle(t.parentElement).paddingLeft) - parseFloat(getComputedStyle(t.parentElement).paddingRight) - 1; })()
- Links: no underline, underline on hover, an outline on focus :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return getComputedStyle(document.querySelector('main a')).textDecorationLine === 'none' && rules.some((r) => r.selectorText === 'a:hover') && rules.some((r) => r.selectorText && r.selectorText.split(',').map((s) => s.trim()).includes('a:focus-visible') && r.style.outlineStyle !== ''); })()
- Form fields fill the card and use the page font :: (() => { const i = document.querySelector('#name'); const c = getComputedStyle(i); return c.display === 'block' && i.offsetWidth >= i.parentElement.clientWidth - 1 && c.fontFamily === getComputedStyle(document.body).fontFamily; })()
- The button uses the accent and moves on hover :: (() => { const rules = [...document.styleSheets].flatMap((s) => [...s.cssRules]); return rules.some((r) => r.selectorText === '.button' && r.style.getPropertyValue('background-color').includes('var(--accent)')) && rules.some((r) => r.selectorText === '.button:hover'); })()
- Ticking the box switches all six colors :: (() => { const box = document.querySelector('#dark'); if (!box) return false; const names = ['--paper', '--ink', '--muted', '--accent', '--card', '--line']; const read = () => names.map((n) => getComputedStyle(document.body).getPropertyValue(n).trim()); const was = box.checked; box.checked = false; const light = read(); box.checked = true; const dark = read(); box.checked = was; return light.every((v, i) => v !== '' && v !== dark[i]); })()

## Make it yours

Sam is not real. You are. Make the looks yours:

1. Change `--accent` in both themes to a color you like. Search the web for "color picker" to find hex codes. Remember: a dark accent for the light theme, a light accent for the dark theme.
2. Change `--radius` to `0` and look at the page. Then try `24px`. Pick the one that feels like you.
3. Change the font of the page. Try `Georgia, serif` for the text and keep `Arial` for `h1` and `h2`.
4. Make the cards answer to the mouse, like in lesson 10: a transition, and a `:hover` rule that lifts the card.
5. Put your own name and text back in, from your unit 1 project. Paste your HTML over Sam's, and add the classes: `card` on the sections, `avatar` on the picture, `button` on the button.

The checks keep working while you change things. If one goes empty, read its text: it tells you which part is missing.

## On your computer

A real site keeps the HTML and the CSS in two files, like your editor does. The download button below puts both in one file, so that the page works with a double-click:

1. Press **Download my page as index.html** below.
2. Open the file from your Downloads folder. It looks like the result here. The picture is missing, because the `images` folder lives on this site.
3. Open the file in Notepad or VS Code and look at the `head`: your CSS is there, between `<style>` and `</style>`. That is the third place CSS can live. One file is easy to send to someone. Two files are easier to work with.

In unit 7 you set up a real project folder, with `index.html`, `style.css` and your own images in it, and put it online.
