---
title: Changing the page (the DOM)
summary: Make buttons do things.
mode: web
---
The **DOM** is JavaScript's view of your HTML page. With it you can find elements, change them and react to clicks.

## The three steps you'll repeat forever

**1. Find an element**

```js
const button = document.querySelector('#add');
```

`querySelector` takes a CSS selector: `#id`, `.class` or a tag name.

**2. Listen for an event**

```js
button.addEventListener('click', () => {
  // runs every time the button is clicked
});
```

Other useful events: `'input'` (typing in a box), `'submit'` (sending a form), `'keydown'` (pressing a key).

**3. Change something**

- `element.textContent = 'New text'` changes the text.
- `element.classList.toggle('dark')` adds the class if it's missing, removes it if it's there.
- `element.style.color = 'red'` changes one style.

## The answer

A counter with **+**, **−** and **Reset** buttons, plus a button that switches dark mode on and off. `count` is a variable, and `show()` writes it to the page each time it changes.

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1 id="count">0</h1>
    <div class="buttons">
      <button id="minus">−</button>
      <button id="plus">+</button>
      <button id="reset">Reset</button>
    </div>
    <button id="theme">Toggle dark mode</button>
    <script src="script.js"></script>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  text-align: center;
  padding: 40px;
  transition: background 0.3s, color 0.3s;
}
h1 {
  font-size: 80px;
  margin: 0 0 20px;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}
button {
  font-size: 20px;
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #ccc;
  cursor: pointer;
}
body.dark {
  background: #1d1d2b;
  color: white;
}
```

```js script.js
const countEl = document.querySelector('#count');
let count = 0;

function show() {
  countEl.textContent = count;
}

document.querySelector('#plus').addEventListener('click', () => {
  count = count + 1;
  show();
});

document.querySelector('#minus').addEventListener('click', () => {
  count = count - 1;
  show();
});

document.querySelector('#reset').addEventListener('click', () => {
  count = 0;
  show();
});

document.querySelector('#theme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
```

# Twist

Make the number turn **red** when it goes below zero, and back to normal otherwise. (Hint: inside `show()`, use an `if` and `countEl.style.color`.)

# Twist answer

```js script.js
const countEl = document.querySelector('#count');
let count = 0;

function show() {
  countEl.textContent = count;
  if (count < 0) {
    countEl.style.color = 'red';
  } else {
    countEl.style.color = '';
  }
}

document.querySelector('#plus').addEventListener('click', () => {
  count = count + 1;
  show();
});

document.querySelector('#minus').addEventListener('click', () => {
  count = count - 1;
  show();
});

document.querySelector('#reset').addEventListener('click', () => {
  count = 0;
  show();
});

document.querySelector('#theme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
```
