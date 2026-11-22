---
title: Backgrounds and rounded corners
minutes: 15
---

White cards on a soft background, round corners, a round picture. Two properties do most of it: `background` and `border-radius`.

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
    <header>
      <img class="avatar" src="images/avatar.svg" alt="Portrait of Sam Rivera">
      <h1>Sam Rivera</h1>
    </header>

    <main>
      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead. <span class="tag">Learning to code</span></p>
      </div>
    </main>
  </body>
</html>
```

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #1f2933;
  background-color: #f5f7fa;
}

header {
  padding: 2rem 1rem;
  text-align: center;
  background-color: #dbeafe;
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

.avatar {
  width: 6rem;
  border-radius: 50%;
  background-color: #ffffff;
}

.card {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: 12px;
}

.tag {
  padding: 2px 8px;
  background-color: #fde68a;
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
    <header>
      <img class="avatar" src="images/avatar.svg" alt="Portrait of Sam Rivera">
      <h1>Sam Rivera</h1>
    </header>

    <main>
      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead. <span class="tag">Learning to code</span></p>
      </div>
    </main>
  </body>
</html>
```

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #1f2933;
}

header {
  padding: 2rem 1rem;
  text-align: center;
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

.avatar {
  width: 6rem;
}

.card {
  padding: 1rem 1.5rem;
}

.tag {
  padding: 2px 8px;
}
```

## Explanation

Your editor already has the sizes and the spacing from the earlier lessons. You add the colors and the corners.

- `body { margin: 0; }` The browser puts a small margin around the whole page. `0` removes it, so the blue header can reach the edges of the screen.
- `background-color: #f5f7fa;` on `body`, `#dbeafe` on `header`, `#ffffff` on `.card`. Three layers: a soft page, a colored top, white cards on it. A card looks like a card because it is lighter than what is behind it.
- `border-radius: 12px;` Rounds the corners of the box. The number is how big the curve is. `4px` is a little soft, `12px` is clearly round.
- `border-radius: 50%;` On a square element, 50% makes a circle. This is how every round profile picture on the web is made.
- `border: 1px solid #cbd2d9;` A thin, light line. Borders do not have to be black and thick.

| `border-radius` | Looks like |
| --- | --- |
| `0` | Sharp corners. What you get when you set nothing |
| `4px` | A little soft |
| `12px` | Clearly round |
| `999px` | A pill: the ends are half circles |
| `50%` | A circle, if the box is square |

## Twist

1. Turn the tag into a pill: give `.tag` a `border-radius` of `999px`.
2. Give the `header` a color that changes from top to bottom. Replace its `background-color` with this declaration: `background: linear-gradient(#dbeafe, #f5f7fa);`

## Checks

- The card is white with round corners :: (() => { const c = getComputedStyle(document.querySelector('.card')); return c.backgroundColor === 'rgb(255, 255, 255)' && c.borderTopLeftRadius === '12px'; })()
- The avatar is a circle :: getComputedStyle(document.querySelector('.avatar')).borderTopLeftRadius === '50%'
- The tag is a pill :: getComputedStyle(document.querySelector('.tag')).borderTopLeftRadius === '999px'
- The header has a gradient :: getComputedStyle(document.querySelector('header')).backgroundImage.includes('linear-gradient')

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: #1f2933;
  background-color: #f5f7fa;
}

header {
  padding: 2rem 1rem;
  text-align: center;
  background: linear-gradient(#dbeafe, #f5f7fa);
}

main {
  max-width: 600px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

.avatar {
  width: 6rem;
  border-radius: 50%;
  background-color: #ffffff;
}

.card {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border: 1px solid #cbd2d9;
  border-radius: 12px;
}

.tag {
  padding: 2px 8px;
  background-color: #fde68a;
  border-radius: 999px;
}
```

## What changed

- `border-radius: 999px;` A number bigger than the box can use. The browser makes the curve as big as fits, so both ends become half circles. This works for any height, which is why people write `999px` and not an exact number.
- `background: linear-gradient(#dbeafe, #f5f7fa);` A gradient goes from the first color to the second one, from top to bottom. The second color is the color of the page, so the header fades into the page without a hard line. `background` is the short property: it can hold a color, a gradient or a picture.
