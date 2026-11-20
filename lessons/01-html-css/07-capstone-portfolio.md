---
title: Your portfolio page
summary: Put everything from this module together.
mode: web
capstone: true
---
This is your first capstone. It looks like a lot of code, but it's only things you've already seen in this module, put together. Read it top to bottom once, then make it yours.

## How it's built

**1. The navbar (flexbox).** `.nav` uses `display: flex` and `justify-content: space-between`, exactly like the flexbox lesson. `position: sticky; top: 0` keeps it on screen while you scroll.

**2. The hero (flexbox, centered).** A big intro section. `flex-direction: column` stacks the photo, name and tagline, and `align-items: center` centers them. `border-radius: 50%` turns the square photo into a circle.

**3. The projects (grid).** The same "magic line" from the grid lesson: `repeat(auto-fill, minmax(220px, 1fr))`. Each project is a `.card` from the CSS basics lesson.

**4. Contact (links).** A `mailto:` link opens the visitor's email app. Normal links go to your other profiles.

**5. Responsive.** One media query makes the name smaller on phones. The grid already adapts by itself.

## Variables (new, but simple)

At the top of `style.css` you'll see:

```css
:root {
  --accent: #6c4cf5;
}
```

That's a **CSS variable**. You write the color once, then use it anywhere with `var(--accent)`. Change it in one place, and the whole site changes color.

# Answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My portfolio</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <nav class="nav">
      <strong>My Name</strong>
      <div class="nav-links">
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>

    <header class="hero">
      <img src="https://picsum.photos/id/64/300/300" alt="My photo">
      <h1>Hi, I'm My Name</h1>
      <p>I'm learning to build websites and apps.</p>
    </header>

    <main>
      <section id="projects">
        <h2>Projects</h2>
        <div class="grid">
          <article class="card">
            <h3>Pumdoki</h3>
            <p>A React app I'm building.</p>
          </article>
          <article class="card">
            <h3>Memorelio</h3>
            <p>An app to help you remember things.</p>
          </article>
          <article class="card">
            <h3>Exodia141</h3>
            <p>A secret project. Coming soon.</p>
          </article>
        </div>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          <a href="mailto:me@example.com">Email me</a> ·
          <a href="https://github.com" target="_blank">GitHub</a>
        </p>
      </section>
    </main>

    <footer>
      <p>Made with HTML and CSS · 2026</p>
    </footer>
  </body>
</html>
```

```css style.css
:root {
  --accent: #6c4cf5;
  --soft: #eeeaff;
  --text: #1d1d2b;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  line-height: 1.5;
}

.nav {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #eee;
}
.nav-links {
  display: flex;
  gap: 16px;
}
a {
  color: var(--accent);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 16px;
  background: var(--soft);
}
.hero img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
}
.hero h1 {
  font-size: 40px;
  margin: 16px 0 4px;
}

main {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.card {
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-top: 4px solid var(--accent);
}
.card h3 {
  margin-top: 0;
}

footer {
  text-align: center;
  padding: 24px;
  color: #888;
}

@media (max-width: 600px) {
  .hero h1 {
    font-size: 28px;
  }
}
```

# Twist

Make it yours, in three small changes:

1. Put **your name** in the navbar and the hero.
2. Change `--accent` to your favourite color (try `#e91e63` for pink or `#009688` for teal) and watch the whole page change.
3. Add a **fourth project card** for PepsiCo.

Then download it for VS Code. In the Git module you'll put it online.

# Twist answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My portfolio</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <nav class="nav">
      <strong>Master of the Universe</strong>
      <div class="nav-links">
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>

    <header class="hero">
      <img src="https://picsum.photos/id/64/300/300" alt="My photo">
      <h1>Hi, I'm Master of the Universe</h1>
      <p>I'm learning to build websites and apps.</p>
    </header>

    <main>
      <section id="projects">
        <h2>Projects</h2>
        <div class="grid">
          <article class="card">
            <h3>Pumdoki</h3>
            <p>A React app I'm building.</p>
          </article>
          <article class="card">
            <h3>Memorelio</h3>
            <p>An app to help you remember things.</p>
          </article>
          <article class="card">
            <h3>Exodia141</h3>
            <p>A secret project. Coming soon.</p>
          </article>
          <article class="card">
            <h3>PepsiCo</h3>
            <p>A work project.</p>
          </article>
        </div>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          <a href="mailto:me@example.com">Email me</a> ·
          <a href="https://github.com" target="_blank">GitHub</a>
        </p>
      </section>
    </main>

    <footer>
      <p>Made with HTML and CSS · 2026</p>
    </footer>
  </body>
</html>
```

```css style.css
:root {
  --accent: #009688;
  --soft: #e0f2f1;
  --text: #1d1d2b;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  line-height: 1.5;
}

.nav {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #eee;
}
.nav-links {
  display: flex;
  gap: 16px;
}
a {
  color: var(--accent);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 16px;
  background: var(--soft);
}
.hero img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
}
.hero h1 {
  font-size: 40px;
  margin: 16px 0 4px;
}

main {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.card {
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-top: 4px solid var(--accent);
}
.card h3 {
  margin-top: 0;
}

footer {
  text-align: center;
  padding: 24px;
  color: #888;
}

@media (max-width: 600px) {
  .hero h1 {
    font-size: 28px;
  }
}
```
