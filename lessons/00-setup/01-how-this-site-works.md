---
title: How this site works
summary: Copy the answer, run it, then twist it.
mode: web
---
Welcome to TururuCoding! Every lesson works the same way:

1. **The answer.** On the right you already have working code. This text explains it, piece by piece.
2. **The preview.** Below (or next to) the code you see what it does. It updates as you type.
3. **Your twist.** Click the *Your twist* tab for one small change to make. The twist answer is there if you want to peek.
4. **Mark as done** when you're happy. Your progress and your code save automatically.

## What's in the code

- `<h1>` is a big heading.
- `<p>` is a paragraph of text.
- `<button>` makes a button.
- `style.css` makes it look nice, and `script.js` makes the button do something.

Click the file names above the editor to switch between files. Try clicking the button in the preview.

**Tip:** if you break something, click **Reset** above the editor to get the original answer back.

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Hello, TururuCoding!</h1>
    <p>This page is made with HTML, CSS and JavaScript.</p>
    <button id="hi">Say hi</button>
    <script src="script.js"></script>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  text-align: center;
  padding: 40px;
}
button {
  font-size: 18px;
  padding: 10px 20px;
}
```

```js script.js
document.getElementById('hi').addEventListener('click', function () {
  alert('Hi there!');
});
```

# Twist

Change the heading to say **your own name**, and change the message in `script.js` to something else.

# Twist answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Hello, Master of the Universe!</h1>
    <p>This page is made with HTML, CSS and JavaScript.</p>
    <button id="hi">Say hi</button>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
document.getElementById('hi').addEventListener('click', function () {
  alert('Welcome to the universe!');
});
```
