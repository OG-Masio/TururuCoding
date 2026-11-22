---
title: "Width, height and units: px, % and rem"
minutes: 20
---

A box is as wide as the page unless you say something else. This lesson sets widths, puts a column in the middle of the page, and explains the three units you will use most.

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
      <img class="avatar" src="images/avatar.svg" alt="Portrait of Sam Rivera">

      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead who is learning to build websites, one small lesson at a time.</p>
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
  font-family: Arial, sans-serif;
  color: #1f2933;
}

main {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
}

.avatar {
  width: 160px;
}

.card {
  width: 100%;
  border: 2px solid #cbd2d9;
  padding: 1rem;
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
      <img class="avatar" src="images/avatar.svg" alt="Portrait of Sam Rivera">

      <div class="card">
        <h2>About me</h2>
        <p>Warehouse lead who is learning to build websites, one small lesson at a time.</p>
      </div>
    </main>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}
```

## Explanation

- `max-width: 600px;` The box may be **at most** 600 pixels wide. On a big screen it stops at 600. On a phone it gets narrower by itself. Lines of text that run across a whole wide screen are hard to read, so almost every page has a rule like this.
- `margin: 0 auto;` Top and bottom `0`, left and right `auto`. `auto` means "share the free space equally". Equal space left and right puts the box in the middle. This is the classic way to center a column.
- `width: 160px;` An exact width. The picture keeps its shape: the height follows by itself.
- `width: 100%;` A **percentage** is counted from the element it is inside. The card is as wide as `main`.
- `font-size: 2.5rem;` `rem` means "times the font size of the page". The page font size is `16px` unless someone changed it, so `2.5rem` is 40 pixels.
- `padding: 1rem;` Spacing in `rem` grows together with the text. That is why many people use it for spacing too.
- `* { box-sizing: border-box; }` `*` finds every element. This rule changes what `width` means: with it, the width **includes** the padding and the border. Without it, a box with `width: 100%` and padding is wider than its parent and sticks out. Put this rule at the top of every CSS file you write.

| Unit | Means | Use it for |
| --- | --- | --- |
| `px` | Pixels: a fixed size | Borders, small details, exact picture sizes |
| `%` | A part of the parent's size | Widths that follow the box around them |
| `rem` | Times the page font size (normally 16px) | Font sizes and spacing |

There is `height` too, and it works the same way. You need it less often: a box is as high as its content, and that is usually what you want.

## Twist

1. Make the column narrower: `main` may be at most `480px` wide.
2. Write the width of the avatar in `rem`: `8rem`. Work out how many pixels that is before you look at the result.

## Checks

- Every box counts padding and border as part of its width :: getComputedStyle(document.querySelector('.card')).boxSizing === 'border-box'
- The column is at most 480px wide :: getComputedStyle(document.querySelector('main')).maxWidth === '480px'
- The column is still centered with auto margins :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === 'main' && r.style.marginLeft === 'auto' && r.style.marginRight === 'auto')
- The avatar is 8rem wide, which is 128 pixels :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.avatar' && r.style.width === '8rem') && getComputedStyle(document.querySelector('.avatar')).width === '128px'

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

main {
  max-width: 480px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
}

.avatar {
  width: 8rem;
}

.card {
  width: 100%;
  border: 2px solid #cbd2d9;
  padding: 1rem;
}
```

## What changed

- `max-width: 480px;` The column is narrower, and it is still in the middle, because `margin: 0 auto` shares whatever space is left.
- `width: 8rem;` 8 times 16 is 128 pixels. The picture is a bit smaller than before. If the page font size ever changes, the picture changes with it. A value in `px` would stay the same.
