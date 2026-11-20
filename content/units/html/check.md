---
title: "Quick check: HTML"
---

Unit 1 teaches how to write the structure of a page in HTML. If you already know HTML, this one task shows it. The answer is right below, like always.

## Task

Build a page for a small shop with these parts:

1. A `header` with the shop name as an `h1`, and a `nav` with two links that jump to the two sections below.
2. A `main` with two `section` elements. Their ids match the nav links.
3. In the first section: an `h2` and a list with three products.
4. In the second section: an `h2` and a table with opening hours. The table has a header row and at least two data rows, with two columns: day and hours.
5. A `form` with a text field that has a connected label, a `select` with two options, and a submit button.
6. A `footer` with one paragraph.

## Checks

- A header with an h1 and a nav with two jump links :: !!document.querySelector('header h1') && document.querySelectorAll('header nav a[href^="#"]').length >= 2
- main has two sections, and every nav link finds its section :: document.querySelectorAll('main > section[id]').length >= 2 && [...document.querySelectorAll('header nav a[href^="#"]')].every((a) => a.getAttribute('href').length > 1 && !!document.getElementById(a.getAttribute('href').slice(1)))
- A list with three items :: [...document.querySelectorAll('main ul, main ol')].some((l) => l.children.length >= 3)
- A table with a header row and two data rows, two columns each :: (() => { const t = document.querySelector('main table'); if (!t) return false; const rows = [...t.querySelectorAll('tr')]; return t.querySelectorAll('th').length >= 2 && rows.length >= 3 && rows.every((r) => r.children.length === 2); })()
- A text field with a connected label :: [...document.querySelectorAll('form input[type="text"], form input:not([type])')].some((i) => (i.id && !!document.querySelector('label[for="' + i.id + '"]')) || !!i.closest('label'))
- A select with two options and a submit button :: document.querySelectorAll('form select option').length >= 2 && !!document.querySelector('form button, form input[type="submit"]')
- A footer with a paragraph :: !!document.querySelector('footer p')

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Corner Bakery</title>
  </head>
  <body>
    <header>
      <h1>Corner Bakery</h1>
      <nav>
        <a href="#products">Products</a>
        <a href="#hours">Hours</a>
      </nav>
    </header>

    <main>
      <section id="products">
        <h2>Products</h2>
        <ul>
          <li>Sourdough bread</li>
          <li>Butter croissant</li>
          <li>Cinnamon roll</li>
        </ul>
      </section>

      <section id="hours">
        <h2>Hours</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday to Friday</td>
              <td>6 am to 4 pm</td>
            </tr>
            <tr>
              <td>Saturday</td>
              <td>7 am to 1 pm</td>
            </tr>
          </tbody>
        </table>
      </section>

      <form>
        <p>
          <label for="name">Your name</label><br>
          <input type="text" id="name" name="name">
        </p>
        <p>
          <label for="pickup">Pickup time</label><br>
          <select id="pickup" name="pickup">
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
        </p>
        <button type="submit">Order</button>
      </form>
    </main>

    <footer>
      <p>&copy; 2026 Corner Bakery</p>
    </footer>
  </body>
</html>
```

## Explanation

Everything in this page is taught in unit 1: the page skeleton (lesson 1), headings and text (2), jump links with `#` and `id` (3), lists (5), `header`, `nav`, `main`, `section` and `footer` (6), tables (7) and forms (8 and 9). Lessons 4 and 10 add images and the names `class` and `id`.
