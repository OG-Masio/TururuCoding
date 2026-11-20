---
title: A flashcard app
summary: Components, props, state, lists, forms and effects in one app.
mode: react
capstone: true
---
A small flashcard app, in the spirit of Memorelio. It uses every idea from this module. There are three files, and each one has one job.

## `Flashcard.jsx`: shows one card

It gets the card and whether it's flipped through **props**, and calls `onFlip` when clicked. It doesn't hold any state itself; the parent decides. The flip animation is pure CSS: `.flipped` rotates the card 180°, and `backface-visibility: hidden` hides whichever side is facing away.

## `AddCardForm.jsx`: adds a new card

A form with two **controlled inputs**. When submitted, it calls the `onAdd` prop with the new card, then clears itself. The form doesn't know where cards are stored; it just hands them up.

## `App.jsx`: holds the data

- `cards`: the array of cards, loaded from localStorage at the start.
- `index`: which card you're looking at.
- `flipped`: whether that card shows its answer.
- One **effect** saves `cards` whenever they change.
- `go()` moves to another card. `%` (the remainder) makes it wrap around, so **Next** on the last card goes back to the first.

This split, where the parent owns the state and children receive props and report events back up, is how real React apps are organized, including your Pumdoki app later.

# Answer

```jsx App.jsx
import { useEffect, useState } from 'react';
import Flashcard from './Flashcard.jsx';
import AddCardForm from './AddCardForm.jsx';

const starterCards = [
  { id: 1, front: 'What does HTML stand for?', back: 'HyperText Markup Language' },
  { id: 2, front: 'Which hook stores state?', back: 'useState' },
  { id: 3, front: 'What does map() return?', back: 'A new array' },
];

function loadCards() {
  const saved = localStorage.getItem('cards');
  return saved ? JSON.parse(saved) : starterCards;
}

export default function App() {
  const [cards, setCards] = useState(loadCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  function go(newIndex) {
    setIndex((newIndex + cards.length) % cards.length);
    setFlipped(false);
  }

  function addCard(card) {
    setCards([...cards, { id: Date.now(), ...card }]);
  }

  const card = cards[index];

  return (
    <div className="app">
      <h1>Flashcards</h1>
      <p className="muted">
        Card {index + 1} of {cards.length}. Click the card to flip it.
      </p>

      <Flashcard card={card} flipped={flipped} onFlip={() => setFlipped(!flipped)} />

      <div className="nav">
        <button onClick={() => go(index - 1)}>← Back</button>
        <button onClick={() => go(index + 1)}>Next →</button>
      </div>

      <AddCardForm onAdd={addCard} />
    </div>
  );
}
```

```jsx Flashcard.jsx
export default function Flashcard({ card, flipped, onFlip }) {
  return (
    <div className="scene" onClick={onFlip}>
      <div className={flipped ? 'card flipped' : 'card'}>
        <div className="side front">{card.front}</div>
        <div className="side back">{card.back}</div>
      </div>
    </div>
  );
}
```

```jsx AddCardForm.jsx
import { useState } from 'react';

export default function AddCardForm({ onAdd }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onAdd({ front: front.trim(), back: back.trim() });
    setFront('');
    setBack('');
  }

  return (
    <form className="add" onSubmit={handleSubmit}>
      <h2>Add a card</h2>
      <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Question" />
      <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Answer" />
      <button>Add card</button>
    </form>
  );
}
```

```css styles.css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f0f0f5;
}
.app {
  max-width: 440px;
  margin: 0 auto;
  padding: 24px 16px;
}
h1 {
  margin-bottom: 4px;
}
.muted {
  color: #888;
  margin-top: 0;
}

.scene {
  perspective: 800px;
  height: 200px;
  cursor: pointer;
}
.card {
  position: relative;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.card.flipped {
  transform: rotateY(180deg);
}
.side {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  border-radius: 16px;
  font-size: 20px;
  backface-visibility: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.front {
  background: white;
}
.back {
  background: #6c4cf5;
  color: white;
  transform: rotateY(180deg);
}

.nav {
  display: flex;
  justify-content: space-between;
  margin: 16px 0 24px;
}
button {
  font-size: 16px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.add {
  display: grid;
  gap: 8px;
  background: white;
  padding: 16px;
  border-radius: 12px;
}
.add h2 {
  margin: 0;
  font-size: 18px;
}
.add input {
  font-size: 16px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.add button {
  background: #6c4cf5;
  color: white;
  border: none;
}
```

# Twist

Add a **Delete this card** button that removes the current card.

Hints:

- In `App.jsx`, write a `deleteCard()` function that uses `filter` to keep every card except the one at `index`, then calls `setIndex(0)` and `setFlipped(false)`.
- Only show the button when there's more than one card: `{cards.length > 1 && <button ...>}`, so the app never ends up with zero cards.

# Twist answer

```jsx App.jsx
import { useEffect, useState } from 'react';
import Flashcard from './Flashcard.jsx';
import AddCardForm from './AddCardForm.jsx';

const starterCards = [
  { id: 1, front: 'What does HTML stand for?', back: 'HyperText Markup Language' },
  { id: 2, front: 'Which hook stores state?', back: 'useState' },
  { id: 3, front: 'What does map() return?', back: 'A new array' },
];

function loadCards() {
  const saved = localStorage.getItem('cards');
  return saved ? JSON.parse(saved) : starterCards;
}

export default function App() {
  const [cards, setCards] = useState(loadCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  function go(newIndex) {
    setIndex((newIndex + cards.length) % cards.length);
    setFlipped(false);
  }

  function addCard(card) {
    setCards([...cards, { id: Date.now(), ...card }]);
  }

  function deleteCard() {
    setCards(cards.filter((c, i) => i !== index));
    setIndex(0);
    setFlipped(false);
  }

  const card = cards[index];

  return (
    <div className="app">
      <h1>Flashcards</h1>
      <p className="muted">
        Card {index + 1} of {cards.length}. Click the card to flip it.
      </p>

      <Flashcard card={card} flipped={flipped} onFlip={() => setFlipped(!flipped)} />

      <div className="nav">
        <button onClick={() => go(index - 1)}>← Back</button>
        {cards.length > 1 && <button onClick={deleteCard}>Delete this card</button>}
        <button onClick={() => go(index + 1)}>Next →</button>
      </div>

      <AddCardForm onAdd={addCard} />
    </div>
  );
}
```
