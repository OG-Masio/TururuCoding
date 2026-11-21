---
title: "Text: fonts, size and weight"
minutes: 20
---

Most of a web page is text. Five properties decide how it reads: the font, its size, how thick it is, the space between lines, and where it lines up.

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
    <h2>About me</h2>
    <p>I have worked in logistics for <strong>eight years</strong>. This year I started learning to code, one small lesson at a time.</p>
    <p>When I am not working, I lift weights and make coffee that is almost good.</p>
  </body>
</html>
```

```css file=style.css
body {
  font-family: Georgia, serif;
  font-size: 18px;
  line-height: 1.6;
}

h1 {
  font-family: Arial, sans-serif;
  font-size: 40px;
  font-weight: 800;
}

h2 {
  font-family: Arial, sans-serif;
  font-size: 24px;
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
    <h1>Sam Rivera</h1>
    <h2>About me</h2>
    <p>I have worked in logistics for <strong>eight years</strong>. This year I started learning to code, one small lesson at a time.</p>
    <p>When I am not working, I lift weights and make coffee that is almost good.</p>
  </body>
</html>
```

## Explanation

- `font-family: Georgia, serif;` The font. It is a list: the browser uses the first font that the device has. `Georgia` is the one you want. `serif` is the safety net: "any font with small feet on the letters". Always end the list with one of the general words: `serif`, `sans-serif` (no feet) or `monospace` (every letter the same width, like code).
- `font-size: 18px;` How big the text is. `px` means pixels. Normal text in a browser is `16px` when you set nothing.
- `line-height: 1.6;` The height of a line, as a number times the font size. `1.6` gives lines room to breathe. No unit here: a plain number works for every size of text.
- These three are on `body`, so the whole page inherits them, like the text color in the last lesson.
- `font-weight: 800;` How thick the letters are, from `100` (thin) to `900` (very thick). `400` is normal and `700` is what `bold` means.
- `h1 { font-family: Arial, sans-serif; }` The headings get a different font from the text. Two fonts on a page is a good number: one for headings, one for reading.

| Property | Example values |
| --- | --- |
| `font-family` | `Georgia, serif` · `Arial, sans-serif` · `"Courier New", monospace` |
| `font-size` | `16px` · `24px` · `40px` |
| `font-weight` | `400` · `700` · `bold` |
| `line-height` | `1.4` · `1.6` |
| `text-align` | `left` · `center` · `right` |

A font name with a space in it needs quotes: `"Courier New"`.

## Twist

1. Put the `h1` in the middle of the page. The property is `text-align` and the value is `center`.
2. Make the `h2` normal weight (`400`) and a little smaller: `22px`.

## Checks

- The page text uses Georgia at 18px :: getComputedStyle(document.body).fontFamily.includes('Georgia') && getComputedStyle(document.querySelector('p')).fontSize === '18px'
- The h1 is centered :: getComputedStyle(document.querySelector('h1')).textAlign === 'center'
- The h2 has normal weight :: getComputedStyle(document.querySelector('h2')).fontWeight === '400'
- The h2 is 22px :: getComputedStyle(document.querySelector('h2')).fontSize === '22px'

## Twist answer

```css file=style.css
body {
  font-family: Georgia, serif;
  font-size: 18px;
  line-height: 1.6;
}

h1 {
  font-family: Arial, sans-serif;
  font-size: 40px;
  font-weight: 800;
  text-align: center;
}

h2 {
  font-family: Arial, sans-serif;
  font-size: 22px;
  font-weight: 400;
}
```

## What changed

- `text-align: center;` The text moves to the middle of its element. It moves the text **inside** the `h1`. It does not move the `h1` itself, which is still as wide as the page.
- `font-weight: 400;` Headings are bold when you set nothing. `400` takes that away. A big, thin heading under a big, thick one shows the reader which one is more important.
- `font-size: 22px;` The old value `24px` is simply replaced. A property appears once in a rule.
