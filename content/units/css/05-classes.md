---
title: "Classes: style many things at once"
minutes: 20
---

A tag selector like `p` finds every paragraph. Often you want only some elements: these two boxes, that one word. You give them a name in the HTML, and CSS finds them by that name. You met `class` and `id` in the last lesson of unit 1. Now they do their real job.

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
    <h1 id="top">Sam Rivera</h1>

    <div class="card">
      <h2>About me</h2>
      <p>Warehouse lead. <span class="tag">Learning to code</span></p>
    </div>

    <div class="card featured">
      <h2>This week</h2>
      <p>Finished the lesson about the box model.</p>
      <p>Next: classes.</p>
    </div>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

#top {
  color: #1d4ed8;
}

.card {
  border: 2px solid #cbd2d9;
  padding: 12px 24px;
  margin-bottom: 24px;
}

.featured {
  border-color: #1d4ed8;
}

.tag {
  background-color: #fde68a;
  padding: 2px 8px;
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
    <h1 id="top">Sam Rivera</h1>

    <div class="card">
      <h2>About me</h2>
      <p>Warehouse lead. <span class="tag">Learning to code</span></p>
    </div>

    <div class="card featured">
      <h2>This week</h2>
      <p>Finished the lesson about the box model.</p>
      <p>Next: classes.</p>
    </div>
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

- `.card` A dot, then a name: a **class selector**. It finds every element that has `class="card"` in the HTML. Both boxes have it, so both get the border and the padding.
- `.featured` A second class on the second box. In the HTML it says `class="card featured"`: two names with a space between them. That box gets the rules of `.card` **and** the rules of `.featured`.
- `border-color: #1d4ed8;` Changes only the color of the border. The thickness and the kind of line still come from `.card`. A later rule replaces only what it names.
- `.tag` Finds the `span`. Padding and background work on a few words in a line too.
- `#top` A hash sign, then a name: an **id selector**. It finds the one element with `id="top"`.

| Selector | Finds | Use it for |
| --- | --- | --- |
| `p` | Every `p` | The normal look of an element |
| `.card` | Every element with `class="card"` | Almost everything. This is the one you will write most |
| `#top` | The one element with `id="top"` | Rarely. Ids are better for jump links |

When two rules disagree about the same property, the more exact selector wins: an id beats a class, and a class beats a tag. When two selectors are equally exact, the rule that comes later in the file wins.

Class names are yours to invent. Use small letters and a hyphen between words: `card`, `tag`, `site-title`. Name a class after what the thing **is** (`card`), not after what it looks like (`blue-box`). Looks change.

## Twist

1. In `index.html`, give the paragraph `Next: classes.` the class `note`.
2. In `style.css`, add a rule for `.note`: `font-style: italic;` and the color `#52606d`.

## Checks

- There are still two cards with a border :: document.querySelectorAll('.card').length >= 2 && [...document.querySelectorAll('.card')].every((c) => getComputedStyle(c).borderTopWidth === '2px')
- The featured card has a blue border :: getComputedStyle(document.querySelector('.featured')).borderTopColor === 'rgb(29, 78, 216)'
- A paragraph has the class "note" :: !!document.querySelector('p.note')
- The note is italic and gray :: (() => { const n = document.querySelector('.note'); return !!n && getComputedStyle(n).fontStyle === 'italic' && getComputedStyle(n).color === 'rgb(82, 96, 109)'; })()
- The other paragraphs are not italic :: [...document.querySelectorAll('p:not(.note)')].length >= 2 && [...document.querySelectorAll('p:not(.note)')].every((p) => getComputedStyle(p).fontStyle === 'normal')

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1 id="top">Sam Rivera</h1>

    <div class="card">
      <h2>About me</h2>
      <p>Warehouse lead. <span class="tag">Learning to code</span></p>
    </div>

    <div class="card featured">
      <h2>This week</h2>
      <p>Finished the lesson about the box model.</p>
      <p class="note">Next: classes.</p>
    </div>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Arial, sans-serif;
  color: #1f2933;
}

#top {
  color: #1d4ed8;
}

.card {
  border: 2px solid #cbd2d9;
  padding: 12px 24px;
  margin-bottom: 24px;
}

.featured {
  border-color: #1d4ed8;
}

.tag {
  background-color: #fde68a;
  padding: 2px 8px;
}

.note {
  font-style: italic;
  color: #52606d;
}
```

## What changed

- `<p class="note">` The name goes in the HTML. Until CSS has a rule for it, nothing happens.
- `.note { … }` The rule goes in the CSS. Now the two halves meet: one paragraph is italic and gray, the others stay as they were.
- This is the daily work of CSS: give something a class in the HTML, write a rule for that class in the CSS.
