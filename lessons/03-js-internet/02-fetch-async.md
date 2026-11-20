---
title: Getting data with fetch
summary: Ask a server for data with fetch, async and await.
mode: web
---
`fetch` asks a web address (an **API**) for data. It takes a moment for the answer to arrive, so JavaScript gives you a **promise**: an "I'll tell you when it's ready".

`async` and `await` make waiting easy to read:

```js
async function getDog() {
  const response = await fetch('https://dog.ceo/api/breeds/image/random');
  const data = await response.json();
  console.log(data);
}
```

Line by line:

1. `async function` marks a function that's allowed to wait.
2. `await fetch(url)` waits for the server to answer.
3. `await response.json()` waits for the body and turns the JSON text into an object (it's `JSON.parse` for you).

## When things go wrong

The internet can fail: no connection, a typo in the address, the server is down. Wrap the risky part in `try` / `catch`:

```js
try {
  // code that might fail
} catch (error) {
  // runs only if something above failed
}
```

`response.ok` is `false` when the server answered with an error (like "404 not found"), so we check it and `throw` our own error.

## The answer

The free Dog API sends back JSON like `{ "message": "https://...jpg", "status": "success" }`. We put `data.message` into an `<img>`. Every click fetches a new dog.

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Random dog</h1>
    <button id="btn">Show me a dog</button>
    <p id="status"></p>
    <img id="dog" alt="A random dog">
    <script src="script.js"></script>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  text-align: center;
  padding: 24px;
}
button {
  font-size: 18px;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}
img {
  display: block;
  margin: 16px auto;
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
}
img:not([src]) {
  display: none;
}
```

```js script.js
const btn = document.querySelector('#btn');
const img = document.querySelector('#dog');
const status = document.querySelector('#status');

async function showDog() {
  status.textContent = 'Loading...';
  try {
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    if (!response.ok) throw new Error('Server said ' + response.status);
    const data = await response.json();
    console.log('The API sent:', data);
    img.src = data.message;
    status.textContent = '';
  } catch (error) {
    status.textContent = 'Something went wrong: ' + error.message;
  }
}

btn.addEventListener('click', showDog);
showDog();
```

# Twist

Show only **husky** pictures. The Dog API has a different address for one breed: `https://dog.ceo/api/breed/husky/images/random`.

# Twist answer

```js script.js
const btn = document.querySelector('#btn');
const img = document.querySelector('#dog');
const status = document.querySelector('#status');

async function showDog() {
  status.textContent = 'Loading...';
  try {
    const response = await fetch('https://dog.ceo/api/breed/husky/images/random');
    if (!response.ok) throw new Error('Server said ' + response.status);
    const data = await response.json();
    console.log('The API sent:', data);
    img.src = data.message;
    status.textContent = '';
  } catch (error) {
    status.textContent = 'Something went wrong: ' + error.message;
  }
}

btn.addEventListener('click', showDog);
showDog();
```
