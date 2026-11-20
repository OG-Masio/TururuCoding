---
title: Effects with useEffect
summary: Run code after the screen updates, like saving or timers.
mode: react
---
A component's main job is to return JSX. But sometimes you need to do something **besides** drawing: save to localStorage, start a timer, or load data from the internet. Those are called **effects**, and they go in `useEffect`:

```jsx
useEffect(() => {
  // runs after React has drawn the screen
}, [name]);
```

## The array at the end matters

That array is the list of values the effect "watches":

| You write | The effect runs |
|---|---|
| `[name]` | after the first draw, and again every time `name` changes |
| `[]` | only once, after the first draw |
| nothing | after every draw (rarely what you want) |

## Cleaning up

If an effect starts something that keeps going, like a timer, return a function that stops it:

```jsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
```

React calls that cleanup function when the component goes away.

## `setSeconds((s) => s + 1)`

When the new value depends on the old one, pass a function to the setter. React gives you the latest value as `s`. Inside timers this avoids bugs where you'd always see an old number.

## This lesson has two effects

1. **Saving:** whenever `name` changes, it's saved to localStorage. The starting value is read from localStorage too, so your name survives a reload. Type your name, then click **Run again**.
2. **A timer:** counts the seconds since the page opened, and the Pause button stops it.

# Answer

```jsx App.jsx
import { useEffect, useState } from 'react';

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem('name') || '');
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  // Effect 1: save the name every time it changes
  useEffect(() => {
    localStorage.setItem('name', name);
  }, [name]);

  // Effect 2: a timer that runs while "running" is true
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="app">
      <h1>Hello{name ? `, ${name}` : ''}!</h1>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p className="timer">You've been here {seconds} seconds.</p>
      <button onClick={() => setRunning(!running)}>
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
```

```css styles.css
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
input {
  font-size: 16px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.timer {
  font-size: 20px;
}
button {
  font-size: 16px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
}
```

# Twist

Add a third effect that changes the browser tab title to the number of seconds: `document.title = seconds + 's';`. Which value should it watch?

# Twist answer

```jsx App.jsx
import { useEffect, useState } from 'react';

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem('name') || '');
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  // Effect 1: save the name every time it changes
  useEffect(() => {
    localStorage.setItem('name', name);
  }, [name]);

  // Effect 2: a timer that runs while "running" is true
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Effect 3: show the seconds in the tab title
  useEffect(() => {
    document.title = seconds + 's';
  }, [seconds]);

  return (
    <div className="app">
      <h1>Hello{name ? `, ${name}` : ''}!</h1>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p className="timer">You've been here {seconds} seconds.</p>
      <button onClick={() => setRunning(!running)}>
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
```
