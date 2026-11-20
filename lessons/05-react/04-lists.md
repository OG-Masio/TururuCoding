---
title: Showing lists
summary: Turn an array into a list on screen with map.
mode: react
---
Remember `map` from the arrays lesson? It turns each item of an array into something new. In React, you use it to turn **data into JSX**:

```jsx
const fruits = ['apple', 'banana', 'mango'];

<ul>
  {fruits.map((fruit) => (
    <li key={fruit}>{fruit}</li>
  ))}
</ul>
```

## What's `key`?

Every item in a list needs a `key` prop with a value that's **unique** in that list, like an id. React uses it to know which item is which when the list changes. If you forget it, the Console shows a warning.

## Filtering what you show

Combine state with `filter` to show only some items. In the answer:

1. `search` is state that holds what you typed.
2. `visible` is the list of movies whose title includes the search text.
3. We `map` over `visible`, not over all `movies`.

Type in the search box and the list updates by itself, because changing `search` re-runs the component.

## Showing something only sometimes

```jsx
{visible.length === 0 && <p>No results</p>}
```

`&&` means "if the left side is true, show the right side". It's the shortest way to show something conditionally.

# Answer

```jsx App.jsx
import { useState } from 'react';

const movies = [
  { id: 1, title: 'Spirited Away', year: 2001 },
  { id: 2, title: 'Toy Story', year: 1995 },
  { id: 3, title: 'Coco', year: 2017 },
  { id: 4, title: 'Up', year: 2009 },
  { id: 5, title: 'Inside Out', year: 2015 },
];

export default function App() {
  const [search, setSearch] = useState('');

  const visible = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <h1>Movies</h1>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {visible.map((movie) => (
          <li key={movie.id}>
            <strong>{movie.title}</strong> <span>({movie.year})</span>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p>No results</p>}
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
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
li {
  padding: 6px 0;
}
li span {
  color: #888;
}
```

# Twist

Show only movies from **2005 or later**, in addition to the search. (Hint: add `&& m.year >= 2005` inside the filter.)

# Twist answer

```jsx App.jsx
import { useState } from 'react';

const movies = [
  { id: 1, title: 'Spirited Away', year: 2001 },
  { id: 2, title: 'Toy Story', year: 1995 },
  { id: 3, title: 'Coco', year: 2017 },
  { id: 4, title: 'Up', year: 2009 },
  { id: 5, title: 'Inside Out', year: 2015 },
];

export default function App() {
  const [search, setSearch] = useState('');

  const visible = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) && m.year >= 2005
  );

  return (
    <div className="app">
      <h1>Movies</h1>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {visible.map((movie) => (
          <li key={movie.id}>
            <strong>{movie.title}</strong> <span>({movie.year})</span>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p>No results</p>}
    </div>
  );
}
```
