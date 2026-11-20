---
title: CSS Grid
summary: Rows and columns, like a table for layouts.
mode: web
---
Flexbox is great for **one** row. Grid is for **rows and columns at the same time**, like a photo gallery.

```css
.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
```

- `grid-template-columns: 1fr 1fr 1fr` makes three equal columns. `fr` means "one share of the free space".
- Children fill the grid left to right, then wrap to the next row by themselves.

## The magic line

```css
grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
```

Read it as: "fit as many columns as you can, each at least 150px wide, and stretch them to fill the row". The gallery then rearranges itself on any screen size, with no extra code. Try resizing the preview.

## Making one item bigger

`grid-column: span 2;` makes an item take up two columns.

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>My gallery</h1>
    <div class="gallery">
      <img class="big" src="https://picsum.photos/id/10/600/300" alt="Forest">
      <img src="https://picsum.photos/id/20/300/300" alt="Desk">
      <img src="https://picsum.photos/id/30/300/300" alt="Mug">
      <img src="https://picsum.photos/id/40/300/300" alt="Cat">
      <img src="https://picsum.photos/id/50/300/300" alt="Bridge">
      <img src="https://picsum.photos/id/60/300/300" alt="Computer">
    </div>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  padding: 16px;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.gallery img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
}

.big {
  grid-column: span 2;
}
```

# Twist

Make the images taller (`200px`) and give the gallery more space between images (`20px`).

# Twist answer

```css style.css
body {
  font-family: sans-serif;
  padding: 16px;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.gallery img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

.big {
  grid-column: span 2;
}
```
