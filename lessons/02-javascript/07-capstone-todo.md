---
title: A to-do list that remembers
summary: Arrays, objects, the DOM and saving, all in one small app.
mode: web
capstone: true
---
This app uses everything from the module. Read the code in `script.js` from top to bottom. It's split into four small parts, and each part is something you've already done.

## 1. The data

```js
let todos = load();
```

All the to-dos live in one **array of objects**, like `{ text: 'Buy milk', done: false }`. The page is just a picture of this array.

## 2. Saving and loading (new: localStorage)

`localStorage` is a small storage box in the browser that survives page reloads. It only stores text, so we:

- turn the array into text with `JSON.stringify(todos)` when saving
- turn the text back into an array with `JSON.parse(text)` when loading

`|| '[]'` means "if nothing was saved yet, start with an empty list".

## 3. Drawing the list

`render()` empties the `<ul>` and then, for each to-do, creates an `<li>` with `document.createElement`, fills it in and adds it to the page. Every change to `todos` is followed by `save()` and `render()`. That "change the data, then redraw" pattern is exactly how React works, so you're already learning React's main idea.

## 4. The events

- **submit** on the form adds a new to-do. `event.preventDefault()` stops the browser from reloading the page (that's what forms do by default).
- **click** on a to-do's checkbox flips `done`.
- **click** on ✕ removes it with `filter`.

Add a few to-dos, then click **Run again**: they're still there.

# Answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main class="app">
      <h1>My to-dos</h1>
      <form id="form">
        <input id="input" placeholder="What do you need to do?" autocomplete="off">
        <button>Add</button>
      </form>
      <ul id="list"></ul>
      <p id="count"></p>
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

```css style.css
body {
  font-family: system-ui, sans-serif;
  background: #f0f0f5;
  margin: 0;
  padding: 24px 16px;
}
.app {
  max-width: 420px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
h1 {
  margin-top: 0;
}
form {
  display: flex;
  gap: 8px;
}
input {
  flex: 1;
  font-size: 16px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
button {
  font-size: 16px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: #6c4cf5;
  color: white;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
li span {
  flex: 1;
}
li.done span {
  text-decoration: line-through;
  color: #999;
}
li .remove {
  background: none;
  color: #999;
  padding: 0 6px;
}
#count {
  color: #888;
  font-size: 14px;
}
```

```js script.js
// 1. The data
let todos = load();

// 2. Saving and loading
function load() {
  return JSON.parse(localStorage.getItem('todos') || '[]');
}
function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// 3. Drawing the list
const list = document.querySelector('#list');
const count = document.querySelector('#count');

function render() {
  list.innerHTML = '';
  for (const todo of todos) {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = todo.done;
    box.addEventListener('click', () => {
      todo.done = !todo.done;
      save();
      render();
    });

    const text = document.createElement('span');
    text.textContent = todo.text;

    const remove = document.createElement('button');
    remove.textContent = '✕';
    remove.className = 'remove';
    remove.addEventListener('click', () => {
      todos = todos.filter((t) => t !== todo);
      save();
      render();
    });

    li.append(box, text, remove);
    list.append(li);
  }
  const left = todos.filter((t) => !t.done).length;
  count.textContent = `${left} left to do`;
}

// 4. The events
const form = document.querySelector('#form');
const input = document.querySelector('#input');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === '') return;
  todos.push({ text: text, done: false });
  input.value = '';
  save();
  render();
});

render();
```

# Twist

Add a **"Clear done"** button under the list that removes every to-do that's marked as done.

Hints: add a `<button id="clear">` to the HTML, then in `script.js` listen for its click and use `filter` to keep only the to-dos where `done` is false. Don't forget `save()` and `render()`.

# Twist answer

```html index.html
<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main class="app">
      <h1>My to-dos</h1>
      <form id="form">
        <input id="input" placeholder="What do you need to do?" autocomplete="off">
        <button>Add</button>
      </form>
      <ul id="list"></ul>
      <p id="count"></p>
      <button id="clear">Clear done</button>
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
// 1. The data
let todos = load();

// 2. Saving and loading
function load() {
  return JSON.parse(localStorage.getItem('todos') || '[]');
}
function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// 3. Drawing the list
const list = document.querySelector('#list');
const count = document.querySelector('#count');

function render() {
  list.innerHTML = '';
  for (const todo of todos) {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = todo.done;
    box.addEventListener('click', () => {
      todo.done = !todo.done;
      save();
      render();
    });

    const text = document.createElement('span');
    text.textContent = todo.text;

    const remove = document.createElement('button');
    remove.textContent = '✕';
    remove.className = 'remove';
    remove.addEventListener('click', () => {
      todos = todos.filter((t) => t !== todo);
      save();
      render();
    });

    li.append(box, text, remove);
    list.append(li);
  }
  const left = todos.filter((t) => !t.done).length;
  count.textContent = `${left} left to do`;
}

// 4. The events
const form = document.querySelector('#form');
const input = document.querySelector('#input');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === '') return;
  todos.push({ text: text, done: false });
  input.value = '';
  save();
  render();
});

document.querySelector('#clear').addEventListener('click', () => {
  todos = todos.filter((t) => !t.done);
  save();
  render();
});

render();
```
