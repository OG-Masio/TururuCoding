---
title: Headings and paragraphs
minutes: 15
---

Most of the web is text. Headings give the text a structure, like the outline of a document. Paragraphs carry the content.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The yellow bird</title>
  </head>
  <body>
    <h1>The yellow bird</h1>
    <p>A small bird that sings every morning. People call its song <em>tururu</em>.</p>

    <h2>What it eats</h2>
    <p>Seeds, fruit and small insects. It <strong>never</strong> eats bread.</p>

    <h2>Where it lives</h2>
    <p>In trees near water.</p>
    <!-- A photo comes in lesson 4 -->
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The yellow bird</title>
  </head>
  <body>

  </body>
</html>
```

## Explanation

There are six heading levels, from `h1` (most important) to `h6` (least important). In practice you use `h1`, `h2` and `h3`.

- `<h1>The yellow bird</h1>` The title of the page. Use one `h1` per page.
- `<h2>What it eats</h2>` A section inside the page. Every new topic gets its own `h2`.
- `<p>` A paragraph. The browser puts space above and below each paragraph by itself.
- `<em>tururu</em>` Emphasis. The browser shows it in *italic*. The `em` element sits inside the paragraph, in the middle of the sentence.
- `<strong>never</strong>` Strong importance. The browser shows it in **bold**.
- `<!-- A photo comes in lesson 4 -->` A comment. It starts with `<!--` and ends with `-->`. The browser does not show it. Comments are notes for you.

Two things that surprise everybody at first:

- **Empty lines in the code do nothing.** The empty lines before each `h2` are only there to make the code easy to read. The space you see on the page comes from the elements, not from empty lines.
- **Choose a heading by meaning, not by size.** Do not pick `h3` because you want smaller text. Size is changed with CSS, in unit 2.

## Twist

Add a third section to the page:

1. Add an `h2` that says `How it sings`.
2. Under it, add a paragraph with one or two sentences.
3. Make one word in that paragraph `strong`.

## Checks

- There are three h2 headings :: document.querySelectorAll('h2').length >= 3
- The third h2 is followed by a paragraph :: (() => { const h = document.querySelectorAll('h2')[2]; return !!h && !!h.nextElementSibling && h.nextElementSibling.tagName === 'P'; })()
- That paragraph has a strong word :: (() => { const h = document.querySelectorAll('h2')[2]; return !!h && !!h.nextElementSibling && !!h.nextElementSibling.querySelector('strong'); })()
- The page still has exactly one h1 :: document.querySelectorAll('h1').length === 1

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The yellow bird</title>
  </head>
  <body>
    <h1>The yellow bird</h1>
    <p>A small bird that sings every morning. People call its song <em>tururu</em>.</p>

    <h2>What it eats</h2>
    <p>Seeds, fruit and small insects. It <strong>never</strong> eats bread.</p>

    <h2>Where it lives</h2>
    <p>In trees near water.</p>

    <h2>How it sings</h2>
    <p>Three short notes, then a pause. It sings <strong>loudest</strong> at sunrise.</p>
    <!-- A photo comes in lesson 4 -->
  </body>
</html>
```

## What changed

- `<h2>How it sings</h2>` A new section starts with a new `h2`, at the same level as the other two sections.
- `<p>Three short notes, then a pause. It sings <strong>loudest</strong> at sunrise.</p>` The paragraph goes right after its heading. `<strong>` opens before the word and `</strong>` closes after it, both inside the paragraph.
