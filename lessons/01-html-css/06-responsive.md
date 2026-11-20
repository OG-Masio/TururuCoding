---
title: Responsive design
summary: One page that looks good on phones and computers.
mode: web
---
"Responsive" means the page adapts to the screen. Two tools do almost all the work:

## 1. The viewport tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Without it, phones pretend to be a wide computer screen and shrink your page. Always include it.

## 2. Media queries

A media query is CSS that only applies when the screen matches a condition:

```css
@media (max-width: 600px) {
  .columns {
    flex-direction: column;
  }
}
```

Read it as: "when the screen is **600px wide or less**, stack the columns".

## The answer

- On a wide screen, the page shows a sidebar and content side by side.
- At 600px or less, they stack, and the heading gets smaller.
- `max-width: 900px` plus `margin: 0 auto` keeps the page from getting too wide, and centers it.

Drag the edge of your browser window to make it narrow, or open the lesson on your phone, and watch the layout change.

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div class="page">
      <h1>Responsive page</h1>
      <div class="columns">
        <aside class="sidebar">
          <h3>Menu</h3>
          <p>Home</p>
          <p>About</p>
        </aside>
        <main class="content">
          <h2>Welcome</h2>
          <p>Make the window narrow and the menu will move on top of this text.</p>
        </main>
      </div>
    </div>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  margin: 0;
}

.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}

h1 {
  font-size: 40px;
}

.columns {
  display: flex;
  gap: 16px;
}

.sidebar {
  width: 200px;
  background: #eeeaff;
  padding: 16px;
  border-radius: 10px;
}

.content {
  flex: 1;
  background: #f4f4f4;
  padding: 16px;
  border-radius: 10px;
}

@media (max-width: 600px) {
  h1 {
    font-size: 28px;
  }
  .columns {
    flex-direction: column;
  }
  .sidebar {
    width: auto;
  }
}
```

# Twist

Inside the media query, also change the page background to a light yellow (`#fff8e1`) on small screens, so you can see exactly when it switches.

# Twist answer

```css style.css
body {
  font-family: sans-serif;
  margin: 0;
}

.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}

h1 {
  font-size: 40px;
}

.columns {
  display: flex;
  gap: 16px;
}

.sidebar {
  width: 200px;
  background: #eeeaff;
  padding: 16px;
  border-radius: 10px;
}

.content {
  flex: 1;
  background: #f4f4f4;
  padding: 16px;
  border-radius: 10px;
}

@media (max-width: 600px) {
  body {
    background: #fff8e1;
  }
  h1 {
    font-size: 28px;
  }
  .columns {
    flex-direction: column;
  }
  .sidebar {
    width: auto;
  }
}
```
