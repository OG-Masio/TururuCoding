---
title: Your first style rule
minutes: 15
---

HTML says what is on the page. CSS says what it looks like. CSS lives in its own file, and one line in the HTML connects the two.

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
    <h1>Sam Rivera</h1>
    <p>Warehouse lead who is learning to build websites.</p>
    <p>This page gets its looks from a second file.</p>
  </body>
</html>
```

```css file=style.css
h1 {
  color: darkblue;
}
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
  </head>
  <body>
    <h1>Sam Rivera</h1>
    <p>Warehouse lead who is learning to build websites.</p>
    <p>This page gets its looks from a second file.</p>
  </body>
</html>
```

## Explanation

Your editor now has two tabs: `index.html` and `style.css`. Click a tab to work in that file.

- `<link rel="stylesheet" href="style.css">` This line goes in the `head`. It tells the browser: "the looks of this page are in the file `style.css`, go and read it." Without this line, the CSS file is ignored. `link` has no closing tag.
- `h1` The **selector**. It says which elements the rule is for. Here: every `h1` on the page.
- `{` … `}` Everything between the curly brackets belongs to this selector.
- `color: darkblue;` One **declaration**. It has two parts with a colon between them.
- `color` The **property**: what you want to change. `color` is the color of the text.
- `darkblue` The **value**: what you change it to.
- `;` Every declaration ends with a semicolon. It is the full stop of CSS.

The whole thing, selector plus brackets plus declarations, is called a **rule**:

```css
selector {
  property: value;
}
```

A CSS file is a list of rules. That is all CSS is.

## Twist

Add a second rule to `style.css`, under the first one. It makes every paragraph `gray`.

The selector for a paragraph is the tag name without the angle brackets: `p`.

## Checks

- The page is connected to style.css :: !!document.querySelector('style[data-file="style.css"], link[href="style.css"]')
- The heading is dark blue :: getComputedStyle(document.querySelector('h1')).color === 'rgb(0, 0, 139)'
- Both paragraphs are gray :: document.querySelectorAll('p').length >= 2 && [...document.querySelectorAll('p')].every((p) => getComputedStyle(p).color === 'rgb(128, 128, 128)')

## Twist answer

```css file=style.css
h1 {
  color: darkblue;
}

p {
  color: gray;
}
```

## What changed

- `p { color: gray; }` One rule, and both paragraphs changed. A selector with a tag name finds **every** element with that tag. If the page had fifty paragraphs, all fifty would be gray.
- The empty line between the two rules is only for you. The browser does not need it. It makes the file easier to read.
