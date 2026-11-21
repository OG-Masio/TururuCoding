---
title: Hover and focus states
minutes: 20
---

A link that changes when the mouse is over it tells the user: "you can click me". CSS can style an element only while something is true about it. That "while" is called a **state**.

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
        <h2>Links</h2>
        <p><a href="https://developer.mozilla.org" target="_blank">MDN: where I look things up</a></p>
        <p><a href="https://www.wikipedia.org" target="_blank">Wikipedia</a></p>
      </div>

      <button class="button" type="button">Say hello</button>
    </main>
  </body>
</html>
```

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
  background-color: #f5f7fa;
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: 12px;
}

a {
  color: #1d4ed8;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: #1d4ed8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.button:hover {
  background-color: #1e3a8a;
}

.button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
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
        <h2>Links</h2>
        <p><a href="https://developer.mozilla.org" target="_blank">MDN: where I look things up</a></p>
        <p><a href="https://www.wikipedia.org" target="_blank">Wikipedia</a></p>
      </div>

      <button class="button" type="button">Say hello</button>
    </main>
  </body>
</html>
```

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
  background-color: #f5f7fa;
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: 12px;
}
```

## Explanation

Try it in the result first: move the mouse over the links and the button. Then click on the page and press the Tab key a few times.

- `a { text-decoration: none; }` Takes away the underline that links have when you set nothing.
- `a:hover` A selector, a colon, and a state. This rule only counts **while the mouse is over** the link. Move the mouse away, and the rule is off again.
- `text-decoration: underline;` The underline comes back on hover. Now the link is calm when you read and clear when you point at it.
- `.button` A button with its own look: padding for size, white text on blue, `border: none` to remove the gray browser border.
- `cursor: pointer;` The mouse arrow becomes a hand over the button. Links have this by themselves, buttons do not.
- `.button:hover { background-color: #1e3a8a; }` A darker blue while the mouse is over it.
- `.button:focus-visible` **Focus** is where the keyboard is. People who do not use a mouse move through a page with the Tab key, and they must see where they are. This state is on while the element has the keyboard focus.
- `outline: 3px solid #f59e0b;` A line around the element, written like a border. An outline does not take up space, so nothing on the page moves when it appears.
- `outline-offset: 2px;` A small gap between the element and the outline.

| State | Is on while… |
| --- | --- |
| `:hover` | the mouse is over the element |
| `:focus-visible` | the element has the keyboard focus |
| `:active` | the element is being pressed |
| `:visited` | a link goes to a page you opened before |

Never remove a focus outline without giving a better one. A page without visible focus cannot be used with a keyboard.

## Twist

1. Make the card answer to the mouse: while the mouse is over `.card`, its border color is `#1d4ed8`.
2. Links need a visible focus too. Give `a:focus-visible` the same outline as the button: `3px solid #f59e0b`.

## Checks

- Links have no underline until the mouse is over them :: getComputedStyle(document.querySelector('a')).textDecorationLine === 'none' && [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === 'a:hover' && r.style.textDecoration.includes('underline'))
- The button gets darker on hover :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.button:hover' && r.style.backgroundColor !== '')
- The card gets a blue border on hover :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.card:hover' && r.style.borderTopColor === 'rgb(29, 78, 216)')
- Links show an outline when they have the keyboard focus :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === 'a:focus-visible' && r.style.outlineStyle === 'solid' && r.style.outlineWidth === '3px')

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
  background-color: #f5f7fa;
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
}

.card {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: 12px;
}

.card:hover {
  border-color: #1d4ed8;
}

a {
  color: #1d4ed8;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

a:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

.button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: #1d4ed8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.button:hover {
  background-color: #1e3a8a;
}

.button:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}
```

## What changed

- `.card:hover { border-color: #1d4ed8; }` A state works on any element, not only on links and buttons. The rule changes one thing, the color of the border. The rest of the card stays as `.card` says.
- `a:focus-visible { … }` Press Tab in the result: the outline jumps from link to link, then to the button. The same color for every focus outline on a page helps: the user learns once what "you are here" looks like.
