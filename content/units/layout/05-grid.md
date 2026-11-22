---
title: "Grid: rows and columns"
minutes: 20
---

Flexbox arranges things in one line: a row or a column. **Grid** arranges things in rows and columns at the same time, like a table without the table. You say how many columns you want, and the grid does the rest.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Warehouse map</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Warehouse map</h1>

    <div class="grid">
      <div class="box wide">Loading dock</div>
      <div class="box">Aisle 1</div>
      <div class="box">Aisle 2</div>
      <div class="box">Aisle 3</div>
      <div class="box">Aisle 4</div>
      <div class="box full">Office</div>
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

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.box {
  padding: 20px;
  background: #dbeafe;
  border-radius: 8px;
}

.wide {
  grid-column: span 2;
}
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Warehouse map</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Warehouse map</h1>

    <div class="grid">
      <div class="box wide">Loading dock</div>
      <div class="box">Aisle 1</div>
      <div class="box">Aisle 2</div>
      <div class="box">Aisle 3</div>
      <div class="box">Aisle 4</div>
      <div class="box full">Office</div>
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

.box {
  padding: 20px;
  background: #dbeafe;
  border-radius: 8px;
}
```

## Explanation

- `display: grid;` Like flexbox, you write it on the box **around** the things. `.grid` is the **grid container**, and its direct children are the grid items.
- `grid-template-columns: 1fr 1fr 1fr;` This line makes the columns. Every value is one column, so this is three columns. `fr` means **fraction**: one share of the free space. Three times `1fr` is three equal columns.
- You do not write the rows. The items fill the first row from left to right. When a row is full, the grid starts a new one.
- `gap: 12px;` The space between the columns and between the rows. The same property as in flexbox.
- `grid-column: span 2;` This line is written on an item. The loading dock takes two columns in place of one. The next item moves to the cell after it.
- Count the cells: the dock takes two and Aisle 1 takes one. That is row one. Aisles 2, 3 and 4 fill row two. The office starts row three, alone.

You can mix units in `grid-template-columns`:

| Value | Columns |
| --- | --- |
| `1fr 1fr 1fr` | Three equal columns |
| `repeat(3, 1fr)` | The same, written shorter: "three times `1fr`" |
| `200px 1fr` | A fixed column of 200 pixels, and one column that takes the rest |
| `1fr 2fr` | Two columns. The second is twice as wide as the first. |

**Flexbox or grid?** Use flexbox for one line of things: a nav bar, a row of buttons, a list of tags. Use grid when things must line up in rows **and** columns: a gallery, a set of cards, the big parts of a page. Many pages use both: grid for the page, flexbox inside the parts.

## Twist

1. Make the first column exactly `200px` wide. The other two share the rest equally.
2. The office has the class `full`. Make it go across the whole grid: `.full { grid-column: span 3; }`.
3. Change the gap to `20px`.

## Checks

- Three columns, and the first is exactly 200 pixels wide :: (() => { const c = getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' '); return c.length === 3 && c[0] === '200px'; })()
- The other two columns share the rest equally :: (() => { const c = getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').map(parseFloat); return c.length === 3 && Math.abs(c[1] - c[2]) < 1; })()
- The office goes across the whole grid :: (() => { const g = document.querySelector('.grid'); const f = document.querySelector('.full'); return getComputedStyle(g).display === 'grid' && Math.abs(f.offsetWidth - g.clientWidth) < 2; })()
- There are 20 pixels between the boxes, in both directions :: (() => { const g = getComputedStyle(document.querySelector('.grid')); return g.columnGap === '20px' && g.rowGap === '20px'; })()

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  gap: 20px;
}

.box {
  padding: 20px;
  background: #dbeafe;
  border-radius: 8px;
}

.wide {
  grid-column: span 2;
}

.full {
  grid-column: span 3;
}
```

## What changed

- `grid-template-columns: 200px 1fr 1fr;` The first column gets its 200 pixels first. What is left is the free space, and the two `1fr` columns share it. Press **Phone** and **Desktop** above the result: the first column stays the same, and the other two grow and shrink.
- `.full { grid-column: span 3; }` The office takes all three columns, so it is as wide as the grid.
- The loading dock still takes two columns. Its first column is the fixed one, so it is no longer two thirds of the width.
