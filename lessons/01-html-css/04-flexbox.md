---
title: Flexbox
summary: Put things side by side and center them.
mode: web
---
Flexbox is how you line things up in a row (or a column). You turn it on in the **parent** box:

```css
.row {
  display: flex;
}
```

Now every child of `.row` sits side by side.

## The four properties you'll use 90% of the time

| Property | What it does | Common values |
|---|---|---|
| `justify-content` | spreads children along the row | `center`, `space-between`, `space-around` |
| `align-items` | lines children up top-to-bottom | `center`, `flex-start`, `stretch` |
| `gap` | space between children | `16px` |
| `flex-direction` | row or column | `row`, `column` |

## The answer

- The **navbar** uses `justify-content: space-between` to push the logo left and the links right.
- The **cards row** uses `gap` for even spacing, and `flex: 1` on each card so they share the width equally.
- The **hero** uses `justify-content: center` plus `align-items: center` to put the text dead center. This is the classic "how do I center a div" answer.

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <nav class="navbar">
      <strong>MySite</strong>
      <div class="links">
        <a href="#">Home</a>
        <a href="#">Projects</a>
        <a href="#">Contact</a>
      </div>
    </nav>

    <section class="hero">
      <h1>Centered with flexbox</h1>
    </section>

    <section class="cards">
      <div class="card">One</div>
      <div class="card">Two</div>
      <div class="card">Three</div>
    </section>
  </body>
</html>
```

```css style.css
body {
  margin: 0;
  font-family: sans-serif;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #222;
  color: white;
}
.links {
  display: flex;
  gap: 16px;
}
.links a {
  color: white;
}

.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: #eeeaff;
}

.cards {
  display: flex;
  gap: 16px;
  padding: 24px;
}
.card {
  flex: 1;
  padding: 24px;
  background: #6c4cf5;
  color: white;
  border-radius: 12px;
  text-align: center;
}
```

# Twist

Change the cards row so the cards stack **on top of each other** instead of side by side. (Hint: one property on `.cards`.)

# Twist answer

```css style.css
body {
  margin: 0;
  font-family: sans-serif;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #222;
  color: white;
}
.links {
  display: flex;
  gap: 16px;
}
.links a {
  color: white;
}

.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: #eeeaff;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}
.card {
  flex: 1;
  padding: 24px;
  background: #6c4cf5;
  color: white;
  border-radius: 12px;
  text-align: center;
}
```
