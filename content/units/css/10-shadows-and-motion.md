---
title: Shadows, transitions and small animations
minutes: 20
---

A shadow lifts a card off the page. A transition makes a change smooth and not sudden. An animation moves something by itself. A little of each makes a page feel finished. A lot of each makes it tiring.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
      <h1>Sam Rivera</h1>

      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead. <span class="tag">New</span></p>
      </div>

      <button class="button" type="button">Say hello</button>
    </main>
  </body>
</html>
```

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --accent: #1d4ed8;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border-radius: var(--radius);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.tag {
  padding: 2px 8px;
  background-color: #fde68a;
  border-radius: 999px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.4;
  }
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
}

.button:hover {
  background-color: #1e3a8a;
}
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
      <h1>Sam Rivera</h1>

      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead. <span class="tag">New</span></p>
      </div>

      <button class="button" type="button">Say hello</button>
    </main>
  </body>
</html>
```

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --accent: #1d4ed8;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border-radius: var(--radius);
}

.tag {
  padding: 2px 8px;
  background-color: #fde68a;
  border-radius: 999px;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
}

.button:hover {
  background-color: #1e3a8a;
}
```

## Explanation

Move the mouse over the card in the result, and watch the yellow tag.

- `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);` A shadow behind the box. Four parts: how far to the right (`0`), how far down (`2px`), how soft (`6px`), and the color.
- `rgba(0, 0, 0, 0.15)` A color with a fourth number: how solid it is, from `0` (invisible) to `1` (solid). This is black at 15%. Shadows should be soft: a solid black shadow looks like a mistake.
- `.card:hover { transform: translateY(-4px); … }` While the mouse is over the card, it moves 4 pixels **up** (minus is up) and gets a bigger shadow. Together that looks like the card lifts off the page.
- `transform` Moves, turns or resizes an element without pushing its neighbors around. `translateY` moves it up or down, `translateX` left or right, `scale(1.05)` makes it 5% bigger, `rotate(3deg)` turns it.
- `transition: transform 0.2s, box-shadow 0.2s;` Without this line the card would jump. With it, a change of `transform` or `box-shadow` takes `0.2s` (a fifth of a second). The transition goes on the normal rule, not on the `:hover` rule, so it works on the way in **and** on the way out.
- `@keyframes pulse { 50% { opacity: 0.4; } }` Describes an animation and gives it the name `pulse`. Half-way through (`50%`), the element is 40% visible. The start and the end are the element's normal look.
- `animation: pulse 2s infinite;` Plays `pulse` on the tag. One round takes `2s`, and `infinite` means it never stops.

| | Starts when | Good for |
| --- | --- | --- |
| `transition` | A value changes (a hover, a new class) | Making a change smooth |
| `animation` | The page loads. It can repeat | Something that moves by itself |

Keep it short and small. `0.2s` feels quick. `1s` feels slow. Some people get sick from things that move on a screen, so never animate anything big all the time.

## Twist

1. The button changes color with a jump. Make it smooth: give `.button` a transition for `background-color` that takes `0.2s`.
2. Let the heading fade in when the page opens. Write `@keyframes fade-in` that starts invisible (`from { opacity: 0; }`), and play it once on the `h1`, taking `1s`.

## Checks

- The card has a soft shadow and lifts on hover :: getComputedStyle(document.querySelector('.card')).boxShadow !== 'none' && [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.card:hover' && r.style.transform.includes('translateY'))
- The button changes color smoothly, in 0.2s :: (() => { const c = getComputedStyle(document.querySelector('.button')); return c.transitionProperty.includes('background-color') && c.transitionDuration.split(',')[0].trim() === '0.2s'; })()
- There are keyframes named fade-in that start invisible :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.type === 7 && r.name === 'fade-in' && [...r.cssRules].some((k) => (k.keyText === '0%' || k.keyText === 'from') && k.style.opacity === '0'))
- The h1 plays fade-in once, for 1s :: (() => { const c = getComputedStyle(document.querySelector('h1')); return c.animationName === 'fade-in' && c.animationDuration === '1s' && c.animationIterationCount === '1'; })()

## Twist answer

```css file=style.css
:root {
  --paper: #f5f7fa;
  --ink: #1f2933;
  --accent: #1d4ed8;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: var(--ink);
  background-color: var(--paper);
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

h1 {
  animation: fade-in 1s;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border-radius: var(--radius);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.tag {
  padding: 2px 8px;
  background-color: #fde68a;
  border-radius: 999px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.4;
  }
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #1e3a8a;
}
```

## What changed

- `transition: background-color 0.2s;` The line is on `.button`, not on `.button:hover`. The color now slides from the light blue to the dark blue and back.
- `@keyframes fade-in { from { opacity: 0; } }` `from` is the start of the animation, and another word for `0%`. There is no `to`, so the animation ends at the element's normal look: fully visible.
- `animation: fade-in 1s;` No `infinite` this time, so it plays once. In the result, use **Paste the answer** or type a letter to load the page again and see it.
