---
title: "Flexbox: a row of things"
minutes: 20
---

Blocks stack on top of each other. To put them next to each other you need one line of CSS: `display: flex`. This is **flexbox**, the layout tool you will use most.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>What I do</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>What I do</h1>

    <div class="row">
      <div class="card">
        <h2>Receive</h2>
        <p>Check every delivery against its order.</p>
      </div>
      <div class="card featured">
        <h2>Store</h2>
        <p>Give every pallet a place, so that anyone finds it again in a minute.</p>
      </div>
      <div class="card">
        <h2>Ship</h2>
        <p>Load the trucks in the order of their stops.</p>
      </div>
    </div>
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

.row {
  display: flex;
  gap: 16px;
}

.card {
  flex: 1;
  padding: 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>What I do</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>What I do</h1>

    <div class="row">
      <div class="card">
        <h2>Receive</h2>
        <p>Check every delivery against its order.</p>
      </div>
      <div class="card featured">
        <h2>Store</h2>
        <p>Give every pallet a place, so that anyone finds it again in a minute.</p>
      </div>
      <div class="card">
        <h2>Ship</h2>
        <p>Load the trucks in the order of their stops.</p>
      </div>
    </div>
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

.card {
  padding: 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}
```

## Explanation

- `.row { display: flex; }` The three cards now stand next to each other. Look at where the line is written: on `.row`, the box **around** the cards, not on the cards. The box with `display: flex` is called the **flex container**. Its direct children are the **flex items**.
- A flex container puts its items in one row, from left to right. That is all `display: flex` does, and it is already most of what you need.
- `gap: 16px;` The space **between** the items. There is no space before the first card or after the last one. That is why `gap` is easier than giving every card a margin.
- `flex: 1;` This line is written on the items. It means: "take one share of the free space". All three cards say `1`, so the three are equally wide. Delete the line and look: each card is then only as wide as its text needs.
- The cards are equally **high** too, and you did not ask for that. The row is as high as its highest item, and the other items stretch to fit. Before flexbox this was very hard to do.
- `<div class="card featured">` The middle card has two classes. The answer does not use `featured` yet. The twist does.

A flex container only arranges its **direct children**. The `h2` and `p` inside a card are not flex items: inside the card they stack as normal blocks.

## Twist

1. Give the cards more air: change the gap to `24px`.
2. Make the middle card twice as wide as the others. Write a new rule under `.card`: `.featured { flex: 2; }`.

## Checks

- The row is a flex container :: getComputedStyle(document.querySelector('.row')).display === 'flex'
- There are 24 pixels between the cards :: getComputedStyle(document.querySelector('.row')).columnGap === '24px'
- The three cards stand next to each other :: (() => { const c = [...document.querySelectorAll('.card')]; return c.length === 3 && c.every((x) => Math.abs(x.getBoundingClientRect().top - c[0].getBoundingClientRect().top) < 1) && c[1].getBoundingClientRect().left > c[0].getBoundingClientRect().left; })()
- The featured card takes two shares, so it is clearly wider :: (() => { const f = document.querySelector('.featured'); const c = document.querySelector('.card'); return getComputedStyle(f).flexGrow === '2' && getComputedStyle(c).flexGrow === '1' && f.offsetWidth > c.offsetWidth * 1.3; })()

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

.row {
  display: flex;
  gap: 24px;
}

.card {
  flex: 1;
  padding: 16px;
  border: 2px solid #cbd2d9;
  border-radius: 8px;
}

.featured {
  flex: 2;
}
```

## What changed

- `gap: 24px;` One number changed, and both spaces between the cards changed with it.
- `.featured { flex: 2; }` The free space is now cut into four shares: one for the first card, two for the middle card, one for the last. The numbers are shares, not pixels. With `1`, `2`, `1` the middle card is always the widest, on every screen.
- The rule is written **under** `.card`. Both rules say something about `flex` for the middle card, and the later one wins.
