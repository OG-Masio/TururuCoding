---
title: Profile page
minutes: 45
---

Put the whole unit together in one page: a profile for a person. First you copy Sam's page, step by step. Then you twist it into your own.

## Result

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
  </head>
  <body>
    <header>
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
      <section id="about">
        <h2>About me</h2>
        <img src="images/avatar.svg" alt="Portrait of Sam Rivera" width="160">
        <p>I have worked in logistics for <strong>eight years</strong>. This year I started learning to code, one small lesson at a time.</p>
        <p>When I am not working, I lift weights and make coffee that is <em>almost</em> good.</p>
      </section>

      <section id="skills">
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
              <td>HTML</td>
              <td>Learning</td>
              <td>2026</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="links">
        <h2>Links</h2>
        <ul>
          <li><a href="https://developer.mozilla.org" target="_blank">Where I look things up</a></li>
          <li><a href="https://github.com" target="_blank">Where my code will live</a></li>
        </ul>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <form>
          <p>
            <label for="name">Your name</label><br>
            <input type="text" id="name" name="name" required>
          </p>
          <p>
            <label for="reason">Why are you writing?</label><br>
            <select id="reason" name="reason">
              <option value="hello">To say hello</option>
              <option value="work">About work</option>
              <option value="code">About code</option>
            </select>
          </p>
          <p>
            <label for="message">Message</label><br>
            <textarea id="message" name="message" rows="4" required></textarea>
          </p>
          <button type="submit">Send message</button>
        </form>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Sam Rivera. Built by hand in HTML.</p>
    </footer>
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
  </head>
  <body>

  </body>
</html>
```

## Steps

### Step 1: The skeleton

Your editor already has it. Read it once more, because every page you ever make starts with these lines:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
  </head>
  <body>

  </body>
</html>
```

- `<title>Sam Rivera</title>` The text for the browser tab. For a profile page, use the person's name.
- `<body>` Everything in the next steps goes between `<body>` and `</body>`.

### Step 2: The header and the menu

Type this inside `body`:

```html
<header>
  <h1>Sam Rivera</h1>
  <p>Warehouse lead who is learning to build websites.</p>
  <nav>
    <a href="#about">About</a>
    <a href="#skills">Skills</a>
    <a href="#links">Links</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
```

- `<header>` The top of the page. It holds the name, one line that says who this is, and the menu.
- `<h1>Sam Rivera</h1>` The one `h1` of the page.
- `<nav>` Four jump links. Each `href` starts with `#` and names a section you write in the next steps. The links do nothing until those sections exist.

### Step 3: The main box and the About section

Under `</header>`, type:

```html
<main>
  <section id="about">
    <h2>About me</h2>
    <img src="images/avatar.svg" alt="Portrait of Sam Rivera" width="160">
    <p>I have worked in logistics for <strong>eight years</strong>. This year I started learning to code, one small lesson at a time.</p>
    <p>When I am not working, I lift weights and make coffee that is <em>almost</em> good.</p>
  </section>
</main>
```

- `<main>` Opens here and closes after the last section. The next three steps go **inside** it, before `</main>`.
- `<section id="about">` The id matches the first menu link, `#about`. Click `About` in the Result: it now jumps here.
- `<img …>` `src` says where the picture is, `alt` describes it, `width` sets the size.
- `<strong>` and `<em>` Mark the important words and the stressed word.

### Step 4: The Skills table

Inside `main`, after the About section:

```html
<section id="skills">
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
        <td>HTML</td>
        <td>Learning</td>
        <td>2026</td>
      </tr>
    </tbody>
  </table>
</section>
```

- `<thead>` One row with three `th` cells: the column titles.
- `<tbody>` Three rows with three `td` cells each. Three columns, so three cells in every row.

### Step 5: The Links list

Inside `main`, after the Skills section:

```html
<section id="links">
  <h2>Links</h2>
  <ul>
    <li><a href="https://developer.mozilla.org" target="_blank">Where I look things up</a></li>
    <li><a href="https://github.com" target="_blank">Where my code will live</a></li>
  </ul>
</section>
```

- `<ul>` An unordered list, because the order of the links does not matter.
- `<li><a …>…</a></li>` Each list item holds one link. Elements inside elements: the `a` is inside the `li`, which is inside the `ul`.
- `target="_blank"` Opens the link in a new tab, so the visitor does not lose your page.

### Step 6: The Contact form

Inside `main`, after the Links section:

```html
<section id="contact">
  <h2>Contact</h2>
  <form>
    <p>
      <label for="name">Your name</label><br>
      <input type="text" id="name" name="name" required>
    </p>
    <p>
      <label for="reason">Why are you writing?</label><br>
      <select id="reason" name="reason">
        <option value="hello">To say hello</option>
        <option value="work">About work</option>
        <option value="code">About code</option>
      </select>
    </p>
    <p>
      <label for="message">Message</label><br>
      <textarea id="message" name="message" rows="4" required></textarea>
    </p>
    <button type="submit">Send message</button>
  </form>
</section>
```

- `<label for="name">` and `id="name"` Every field has a label connected to it.
- `required` The form cannot be sent with an empty name or an empty message.
- `<select>` A menu with three reasons. The `value` of the chosen option is what gets sent.

Fill it in and press the button. The yellow note shows the three values the form would send.

### Step 7: The footer

Under `</main>`, before `</body>`:

```html
<footer>
  <p>&copy; 2026 Sam Rivera. Built by hand in HTML.</p>
</footer>
```

- `<footer>` The bottom of the page.
- `&copy;` Shows the © sign.

Now click through the four menu links at the top. Every one should jump to its section.

## Checks

- A header with one h1 and a nav with four jump links :: document.querySelectorAll('h1').length === 1 && !!document.querySelector('header h1') && document.querySelectorAll('header nav a[href^="#"]').length >= 4
- Every menu link finds its section :: (() => { const links = [...document.querySelectorAll('header nav a[href^="#"]')]; return links.length > 0 && links.every((a) => a.getAttribute('href').length > 1 && !!document.getElementById(a.getAttribute('href').slice(1))); })()
- An image with alt text :: [...document.querySelectorAll('main img')].some((i) => (i.getAttribute('alt') || '').trim().length > 0)
- A table with three columns and three data rows :: (() => { const t = document.querySelector('main table'); if (!t) return false; const rows = [...t.querySelectorAll('tr')]; return t.querySelectorAll('tbody tr').length >= 3 && rows.every((r) => r.children.length === rows[0].children.length) && rows[0].children.length >= 3; })()
- A list with two links that open in a new tab :: document.querySelectorAll('main li a[target="_blank"]').length >= 2
- A form where every field has a connected label, and a submit button :: (() => { const fields = [...document.querySelectorAll('form input, form select, form textarea')]; return fields.length >= 3 && fields.every((f) => (f.id && !!document.querySelector('label[for="' + f.id + '"]')) || !!f.closest('label')) && !!document.querySelector('form button'); })()
- A footer :: !!document.querySelector('footer p')

## Make it yours

Sam is not real. You are. Change the page until it is about you:

1. Put your own name in the `title`, the `h1`, the `alt` text and the footer.
2. Rewrite the line under your name and both About paragraphs.
3. Change the Skills table to your skills. Add a fourth row.
4. Replace the two links with sites you use. Add a third one.
5. Add a new section, for example `Goals` or `Projects`, with its own id, and add it to the menu.

The checks keep working while you change things. If one goes empty, read its text: it tells you which part is missing.

## On your computer

This page works without this site. To keep it as a real file:

1. Press **Download my page as index.html** below.
2. Find the file in your Downloads folder and double-click it. It opens in your browser, from your own computer. Look at the tab: there is your `title`.
3. To change it, right-click the file and open it with Notepad (or VS Code, if you have it). Change a word, save, and refresh the browser tab.

The picture will be missing in the downloaded page, because the `images` folder lives on this site. You see the `alt` text instead. That is what `alt` is for. In unit 7 you set up a real project folder, with your own images in it, and put the page online.
