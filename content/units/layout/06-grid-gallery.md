---
title: "Grid: a photo gallery"
minutes: 25
---

A gallery needs many columns on a big screen and few on a phone. One line of grid does that by itself: the number of columns follows the width of the screen.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Photos</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Photos</h1>

    <div class="gallery">
      <img src="images/mountain.svg" alt="Mountains under a rising sun">
      <img src="images/bird.svg" alt="A small yellow bird singing on a branch">
      <img src="images/coffee.svg" alt="A cup of hot coffee">
      <img src="images/boxes.svg" alt="Boxes stacked on a pallet">
      <img src="images/avatar.svg" alt="Portrait of Sam Rivera">
      <img src="images/mountain.svg" alt="The same mountains again">
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

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.gallery img {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
}
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Photos</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Photos</h1>

    <div class="gallery">
      <img src="images/mountain.svg" alt="Mountains under a rising sun">
      <img src="images/bird.svg" alt="A small yellow bird singing on a branch">
      <img src="images/coffee.svg" alt="A cup of hot coffee">
      <img src="images/boxes.svg" alt="Boxes stacked on a pallet">
      <img src="images/avatar.svg" alt="Portrait of Sam Rivera">
      <img src="images/mountain.svg" alt="The same mountains again">
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
```

## Explanation

The long line first. Read it from the inside to the outside.

- `minmax(160px, 1fr)` The width of one column: **at least** 160 pixels, **at most** one share of the free space.
- `repeat(auto-fit, …)` In lesson 5 you wrote `repeat(3, 1fr)`: three columns. `auto-fit` in the place of the number means: **as many columns as fit**.
- Together: "Make as many columns as you can, but no column may be narrower than 160 pixels. Then share the space that is left."
- Press **Phone**, **Tablet** and **Desktop** above the result. The number of columns changes, and you wrote no rule for any screen size.

Now the pictures.

- `.gallery img` A space between two selectors means "inside": every `img` inside `.gallery`.
- `display: block;` An `img` is inline, so it sits on a line of text. A line of text keeps a little room under it for letters like g and y. `block` takes that small gap away.
- `width: 100%;` Each picture fills its column.
- `height: 160px;` All pictures get the same height, so the rows are straight.
- `object-fit: cover;` The pictures do not have the shape of their box. Without this line the browser squeezes them into it. With `cover`, a picture keeps its shape, fills the whole box, and the part that does not fit is cut off.

Delete the `object-fit` line for a moment and look at the bird. Then put it back.

## Twist

1. Make the pictures bigger: a column is at least `220px` wide.
2. Make the pictures square. Take away `height: 160px;` and write `aspect-ratio: 1;` in its place.
3. Make it a tight wall of pictures: a gap of `4px`, and `border-radius: 0`.

## Checks

- A column is at least 220 pixels wide, and there are as many as fit :: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r.selectorText === '.gallery' && /auto-fit/.test(r.style.gridTemplateColumns) && /minmax\(220px,\s*1fr\)/.test(r.style.gridTemplateColumns))
- The pictures are square :: (() => { const i = document.querySelector('.gallery img'); return getComputedStyle(i).aspectRatio === '1 / 1' && i.offsetWidth > 0 && Math.abs(i.offsetWidth - i.offsetHeight) < 2; })()
- The pictures still fill their box without being squeezed :: getComputedStyle(document.querySelector('.gallery img')).objectFit === 'cover'
- A tight wall: 4 pixels between the pictures, and square corners :: (() => { const g = getComputedStyle(document.querySelector('.gallery')); return g.columnGap === '4px' && g.rowGap === '4px' && getComputedStyle(document.querySelector('.gallery img')).borderTopLeftRadius === '0px'; })()

## Twist answer

```css file=style.css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 4px;
}

.gallery img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 0;
}
```

## What changed

- `minmax(220px, 1fr)` Wider columns, so fewer of them fit. The same screen now shows fewer and bigger pictures.
- `aspect-ratio: 1;` The **aspect ratio** is width divided by height. `1` means the two are equal: a square. The width comes from the column, and the height follows it. With `height: 160px` the pictures were always 160 pixels high. Now they grow and shrink with the column, and they stay square.
- `aspect-ratio: 16 / 9;` would give the shape of a video. Try it.
- `gap: 4px;` and `border-radius: 0;` Two small numbers, and the gallery has another character.
