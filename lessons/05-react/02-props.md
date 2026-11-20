---
title: Props
summary: Pass information into a component.
mode: react
---
In the last lesson every `Badge` said "React". **Props** let each one say something different.

Props are like the attributes on an HTML tag:

```jsx
<Badge text="CSS" color="pink" />
```

The component receives them as one object, usually unpacked right away with destructuring:

```jsx
function Badge({ text, color }) {
  return <span style={{ background: color }}>{text}</span>;
}
```

- Text props go in quotes: `text="CSS"`.
- Anything else goes in curly braces: `count={3}`, `done={true}`, `items={['a', 'b']}`.
- You can give a default value: `function Badge({ text, color = 'gray' })`.

## A component in its own file

Real projects keep each component in its own file. Here, `ProjectCard.jsx` has the card, and `App.jsx` **imports** it with:

```jsx
import ProjectCard from './ProjectCard.jsx';
```

`export default` at the start of the card's function is what makes it importable.

# Answer

```jsx App.jsx
import ProjectCard from './ProjectCard.jsx';

export default function App() {
  return (
    <div className="app">
      <h1>My projects</h1>
      <ProjectCard name="Pumdoki" description="A React app" stars={5} />
      <ProjectCard name="Memorelio" description="Remember anything" stars={4} />
      <ProjectCard name="Exodia141" description="Top secret" />
    </div>
  );
}
```

```jsx ProjectCard.jsx
export default function ProjectCard({ name, description, stars = 0 }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{description}</p>
      <p>{'⭐'.repeat(stars)}</p>
    </div>
  );
}
```

```css styles.css
body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  background: #f0f0f5;
}
.card {
  background: white;
  padding: 12px 18px;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.card h2 {
  margin: 0;
}
```

# Twist

Add a `color` prop to `ProjectCard` and use it as the card's left border (`style={{ borderLeft: '6px solid ' + color }}`). Give each project a different color.

# Twist answer

```jsx App.jsx
import ProjectCard from './ProjectCard.jsx';

export default function App() {
  return (
    <div className="app">
      <h1>My projects</h1>
      <ProjectCard name="Pumdoki" description="A React app" stars={5} color="orange" />
      <ProjectCard name="Memorelio" description="Remember anything" stars={4} color="purple" />
      <ProjectCard name="Exodia141" description="Top secret" color="black" />
    </div>
  );
}
```

```jsx ProjectCard.jsx
export default function ProjectCard({ name, description, stars = 0, color = 'gray' }) {
  return (
    <div className="card" style={{ borderLeft: '6px solid ' + color }}>
      <h2>{name}</h2>
      <p>{description}</p>
      <p>{'⭐'.repeat(stars)}</p>
    </div>
  );
}
```
