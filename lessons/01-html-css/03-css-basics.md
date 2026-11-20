---
title: CSS basics
summary: Colors, sizes, spacing and classes.
mode: web
---
CSS is a list of rules. Each rule says **what** to style and **how**:

```css
h1 {
  color: purple;
}
```

- `h1` is the **selector**: which elements to style.
- `color: purple;` is a **declaration**: the property, a colon, the value, a semicolon.

## Three kinds of selector you'll use all the time

| Selector | Matches | Example |
|---|---|---|
| `p` | every `<p>` | `p { color: gray; }` |
| `.card` | everything with `class="card"` | `.card { padding: 16px; }` |
| `#title` | the one element with `id="title"` | `#title { font-size: 40px; }` |

Classes are the ones you'll use the most, because you can reuse them.

## The box model

Every element is a box with three layers around its content:

- `padding`: space **inside** the box, between the text and the border.
- `border`: the line around the box.
- `margin`: space **outside** the box, between it and its neighbours.

The answer makes a "card": a white box with padding, rounded corners (`border-radius`) and a soft shadow (`box-shadow`).

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1 id="title">CSS basics</h1>
    <div class="card">
      <h2>Card one</h2>
      <p>A card is just a box with padding, a border and a shadow.</p>
    </div>
    <div class="card highlight">
      <h2>Card two</h2>
      <p>This card has two classes, so it gets both styles.</p>
    </div>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  background: #f0f0f5;
  padding: 24px;
}

#title {
  color: #6c4cf5;
}

.card {
  background: white;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.highlight {
  border: 3px solid #6c4cf5;
}
```

# Twist

Make a third card with a new class called `dark` that has a dark background (`#222`) and white text (`color: white`).

# Twist answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1 id="title">CSS basics</h1>
    <div class="card">
      <h2>Card one</h2>
      <p>A card is just a box with padding, a border and a shadow.</p>
    </div>
    <div class="card highlight">
      <h2>Card two</h2>
      <p>This card has two classes, so it gets both styles.</p>
    </div>
    <div class="card dark">
      <h2>Card three</h2>
      <p>Dark mode card.</p>
    </div>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  background: #f0f0f5;
  padding: 24px;
}

#title {
  color: #6c4cf5;
}

.card {
  background: white;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.highlight {
  border: 3px solid #6c4cf5;
}

.dark {
  background: #222;
  color: white;
}
```
