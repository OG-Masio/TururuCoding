---
title: Your first component
summary: A component is a function that returns what to show.
mode: react
---
React builds pages out of **components**. A component is just a function that returns some HTML-looking code:

```jsx
function Hello() {
  return <h1>Hello!</h1>;
}
```

That HTML-looking code is called **JSX**. It's almost HTML, with a few differences:

| HTML | JSX | Why |
|---|---|---|
| `class="box"` | `className="box"` | `class` is a reserved word in JavaScript |
| `<img src="a.png">` | `<img src="a.png" />` | every tag must be closed |
| `style="color: red"` | `style={{ color: 'red' }}` | styles are a JavaScript object |

## Using a component

Once you have a component, you use it like a tag: `<Hello />`. Component names **must start with a capital letter**, so React can tell them apart from normal tags like `<div>`.

## Curly braces = JavaScript

Inside JSX, `{ }` means "run this JavaScript and show the result":

```jsx
const name = 'Ana';
return <p>Hi {name}, 2 + 2 is {2 + 2}</p>;
```

## A component must return one parent

If you want to return several things, wrap them in one `<div>`, or in an empty `<>...</>` (called a fragment).

## In this lesson

`App` is the main component; React shows it on the page. It uses a smaller `Badge` component three times.

# Answer

```jsx App.jsx
function Badge() {
  return <span className="badge">React</span>;
}

export default function App() {
  const name = 'Tururu';
  const year = 2026;

  return (
    <div className="app">
      <h1>Hello, {name}!</h1>
      <p>It's {year}, and I'm learning React.</p>
      <p>
        <Badge /> <Badge /> <Badge />
      </p>
    </div>
  );
}
```

```css styles.css
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
.badge {
  background: #61dafb;
  color: #123;
  padding: 4px 10px;
  border-radius: 99px;
  font-weight: 600;
}
```

# Twist

Make a new component called `Footer` that returns `<footer>Made with React</footer>`, and use it at the bottom of `App`.

# Twist answer

```jsx App.jsx
function Badge() {
  return <span className="badge">React</span>;
}

function Footer() {
  return <footer>Made with React</footer>;
}

export default function App() {
  const name = 'Tururu';
  const year = 2026;

  return (
    <div className="app">
      <h1>Hello, {name}!</h1>
      <p>It's {year}, and I'm learning React.</p>
      <p>
        <Badge /> <Badge /> <Badge />
      </p>
      <Footer />
    </div>
  );
}
```
