---
title: State with useState
summary: Values that change, and the screen updates by itself.
mode: react
---
Remember the counter from the JavaScript module? We had to call `show()` after every change to redraw the number. In React, you never redraw by hand. You use **state**:

```jsx
const [count, setCount] = useState(0);
```

Read it as: "give me a value called `count` that starts at `0`, and a function `setCount` to change it".

- To **show** it: `{count}`
- To **change** it: `setCount(count + 1)`

When you call `setCount`, React runs your component again and updates the screen for you. That's the whole trick.

## Events in React

```jsx
<button onClick={() => setCount(count + 1)}>+</button>
```

- It's `onClick` (camelCase), not `onclick`.
- You pass a **function**, so it runs on click, not right away.

## Never change state directly

`count = count + 1` does nothing on screen. Always use the setter (`setCount`).

## This lesson

The same counter as before, plus a dark mode switch. Compare it with the JavaScript version: no `querySelector`, no `addEventListener`, no `show()`.

# Answer

```jsx App.jsx
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <h1>{count}</h1>
      <div className="buttons">
        <button onClick={() => setCount(count - 1)}>−</button>
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
      <button onClick={() => setDark(!dark)}>
        {dark ? 'Light mode' : 'Dark mode'}
      </button>
    </div>
  );
}
```

```css styles.css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
.app {
  min-height: 100vh;
  text-align: center;
  padding: 40px;
  box-sizing: border-box;
  transition: background 0.3s;
}
.app.dark {
  background: #1d1d2b;
  color: white;
}
h1 {
  font-size: 80px;
  margin: 0 0 20px;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}
button {
  font-size: 18px;
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid #ccc;
  cursor: pointer;
}
```

# Twist

Add a **+10** button that adds ten at once.

# Twist answer

```jsx App.jsx
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <h1>{count}</h1>
      <div className="buttons">
        <button onClick={() => setCount(count - 1)}>−</button>
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count + 10)}>+10</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
      <button onClick={() => setDark(!dark)}>
        {dark ? 'Light mode' : 'Dark mode'}
      </button>
    </div>
  );
}
```
