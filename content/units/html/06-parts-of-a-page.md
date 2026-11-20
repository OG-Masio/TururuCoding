---
title: "Parts of a page: header, main, footer"
minutes: 20
---

Almost every site has the same big parts: a top with the name and the menu, a middle with the content, and a bottom with small print. HTML has an element for each part.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Tururu Coffee</title>
  </head>
  <body>
    <header>
      <h1>Tururu Coffee</h1>
      <nav>
        <a href="#menu">Menu</a>
        <a href="#hours">Hours</a>
        <a href="#find">Find us</a>
      </nav>
    </header>

    <main>
      <section id="menu">
        <h2>Menu</h2>
        <ul>
          <li>Espresso</li>
          <li>Latte</li>
          <li>Cold brew</li>
        </ul>
      </section>

      <section id="hours">
        <h2>Hours</h2>
        <p>Every day from 6 am to 6 pm.</p>
      </section>

      <section id="find">
        <h2>Find us</h2>
        <p>12 River Street, next to the park.</p>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Tururu Coffee</p>
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
    <title>Tururu Coffee</title>
  </head>
  <body>

  </body>
</html>
```

## Explanation

These elements do not change how the page looks. They say what each part **is**. Search engines, screen readers and other developers (and AI tools) read them to understand your page. And in unit 2, they give your CSS something clear to point at.

- `<header>` The top of the page: the name of the site and the navigation.
- `<nav>` A group of links for moving around the site. Here the links jump to sections on the same page, using `#` and an id, like in lesson 3.
- `<main>` The main content. A page has only one `main`.
- `<section id="menu">` One topic inside the content. Each section starts with its own heading. The `id` is the name the nav link jumps to.
- `<footer>` The bottom of the page: copyright, contact, small print.
- `&copy;` This shows the © sign. Codes that start with `&` and end with `;` are for characters that are hard to type or that HTML uses itself. Two more you will need: `&lt;` shows `<` and `&amp;` shows `&`.

Without CSS the three nav links stand next to each other with only a space between them. That is normal. Making it look like a real menu is a CSS job.

## Twist

Add an About section:

1. In `main`, add a fourth `section` with the id `about`. Give it an `h2` and one paragraph about the coffee shop.
2. In `nav`, add a fourth link that jumps to it.

## Checks

- main has four sections :: document.querySelectorAll('main > section').length >= 4
- A section has the id "about" :: !!document.querySelector('main > section#about')
- The about section has an h2 and a paragraph :: !!document.querySelector('section#about h2') && !!document.querySelector('section#about p')
- The nav has four links :: document.querySelectorAll('nav a').length >= 4
- A nav link jumps to #about :: !!document.querySelector('nav a[href="#about"]')

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Tururu Coffee</title>
  </head>
  <body>
    <header>
      <h1>Tururu Coffee</h1>
      <nav>
        <a href="#menu">Menu</a>
        <a href="#hours">Hours</a>
        <a href="#find">Find us</a>
        <a href="#about">About</a>
      </nav>
    </header>

    <main>
      <section id="menu">
        <h2>Menu</h2>
        <ul>
          <li>Espresso</li>
          <li>Latte</li>
          <li>Cold brew</li>
        </ul>
      </section>

      <section id="hours">
        <h2>Hours</h2>
        <p>Every day from 6 am to 6 pm.</p>
      </section>

      <section id="find">
        <h2>Find us</h2>
        <p>12 River Street, next to the park.</p>
      </section>

      <section id="about">
        <h2>About</h2>
        <p>We opened in 2020 with one machine and one table. The bird on our cup sings every morning.</p>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Tururu Coffee</p>
    </footer>
  </body>
</html>
```

## What changed

- `<a href="#about">About</a>` The new link goes inside `nav`, with the other three.
- `<section id="about">` The new section goes inside `main`, before `</main>`. The id `about` and the link `#about` match, so the jump works.
