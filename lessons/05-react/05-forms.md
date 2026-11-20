---
title: Forms and adding items
summary: Type something, press Add, and it appears in the list.
mode: react
---
This is the pattern behind almost every app: a form that adds things to a list.

## 1. A "controlled" input

```jsx
const [text, setText] = useState('');

<input value={text} onChange={(e) => setText(e.target.value)} />
```

The input shows `text`, and every keystroke updates `text`. React state is always the source of truth.

## 2. Submitting the form

```jsx
function handleSubmit(e) {
  e.preventDefault();      // stop the page from reloading
  setItems([...items, { id: Date.now(), text }]);
  setText('');             // empty the box
}
```

## 3. The `...` (spread) trick

`[...items, newItem]` means "a **new** array with everything from `items`, plus `newItem` at the end".

In React you never change an array in place (no `items.push(...)`). You always make a new one and give it to the setter. That's how React notices the change.

Removing works the same way, with `filter`:

```jsx
setItems(items.filter((item) => item.id !== id));
```

`Date.now()` gives the current time in milliseconds, which works as a quick unique id.

# Answer

```jsx App.jsx
import { useState } from 'react';

export default function App() {
  const [items, setItems] = useState([
    { id: 1, text: 'Learn props' },
    { id: 2, text: 'Learn state' },
  ]);
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (text.trim() === '') return;
    setItems([...items, { id: Date.now(), text: text.trim() }]);
    setText('');
  }

  function remove(id) {
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="app">
      <h1>Shopping list</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an item"
        />
        <button>Add</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.text}
            <button className="remove" onClick={() => remove(item.id)}>✕</button>
          </li>
        ))}
      </ul>
      <p className="muted">{items.length} items</p>
    </div>
  );
}
```

```css styles.css
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
form {
  display: flex;
  gap: 8px;
  max-width: 360px;
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
  border-radius: 8px;
  border: none;
  background: #6c4cf5;
  color: white;
  cursor: pointer;
}
ul {
  padding: 0;
  list-style: none;
  max-width: 360px;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}
.remove {
  background: none;
  color: #999;
  padding: 0 6px;
}
.muted {
  color: #888;
}
```

# Twist

Add a **Clear all** button under the list that empties it. (Hint: `setItems([])`.)

# Twist answer

```jsx App.jsx
import { useState } from 'react';

export default function App() {
  const [items, setItems] = useState([
    { id: 1, text: 'Learn props' },
    { id: 2, text: 'Learn state' },
  ]);
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (text.trim() === '') return;
    setItems([...items, { id: Date.now(), text: text.trim() }]);
    setText('');
  }

  function remove(id) {
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="app">
      <h1>Shopping list</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an item"
        />
        <button>Add</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.text}
            <button className="remove" onClick={() => remove(item.id)}>✕</button>
          </li>
        ))}
      </ul>
      <p className="muted">{items.length} items</p>
      <button onClick={() => setItems([])}>Clear all</button>
    </div>
  );
}
```
