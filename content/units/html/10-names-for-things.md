---
title: "Names for things: id, class, div and span"
minutes: 20
---

So far every element had a meaning: a heading, a list, a form. Sometimes you only need a box to group things, and a name to find them later. This is the bridge to CSS.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <style>
      .card { border: 2px solid black; padding: 12px; margin-bottom: 12px; }
      .tag { background: yellow; }
    </style>
  </head>
  <body>
    <div class="card" id="profile">
      <h1>Sam Rivera</h1>
      <p class="note">Warehouse lead. <span class="tag">Learning to code</span></p>
    </div>

    <div class="card">
      <h2>This week</h2>
      <p>Finished the HTML unit.</p>
      <p class="note">Next: CSS.</p>
    </div>
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <style>
      .card { border: 2px solid black; padding: 12px; margin-bottom: 12px; }
      .tag { background: yellow; }
    </style>
  </head>
  <body>

  </body>
</html>
```

## Explanation

- `<div>` A box with no meaning of its own. Use it to group elements that belong together, when no better element (`header`, `section`, `nav`…) fits. Each `div` starts on a new line.
- `<span>` The same idea for a few words inside a line of text. A `span` does not start a new line.
- `class="card"` A name that **many** elements can share. Both boxes on this page are cards.
- `id="profile"` A name that only **one** element on the page may have. You used ids in lesson 3 as jump targets.
- `class="note"` Nothing uses this name yet, and that is fine. A name does nothing alone. It only matters when CSS or JavaScript looks for it.
- `<style>` … `</style>` A small piece of CSS, so you can see names doing their job. It is already in your editor. You do not need to understand it yet: unit 2 explains every word. Read it like this: "every element with the class `card` gets a border and some space; every element with the class `tag` gets a yellow background." In CSS, a dot in front of a word means *class*.

| | `class` | `id` |
| --- | --- | --- |
| How many elements can have the same one? | As many as you want | Only one per page |
| Used for | Styling groups of elements | Jump links, labels, one special element |
| In CSS it is written | `.card` | `#profile` |

An element can have more than one class. Write them with a space between: `class="card big"`.

## Twist

1. Add a third card with an `h2` that says `Goals` and an unordered list with two goals.
2. In one of the goals, put a `span` with the class `tag` around one or two words.

The new card should get a border by itself, and the tagged words a yellow background. You do not touch the CSS.

## Checks

- There are three cards :: document.querySelectorAll('.card').length >= 3
- The third card has a heading and a list with two items :: (() => { const c = document.querySelectorAll('.card')[2]; return !!c && !!c.querySelector('h2') && c.querySelectorAll('ul > li').length >= 2; })()
- A span with the class "tag" is inside a list item :: !!document.querySelector('.card li span.tag')
- The first card keeps its id, and no id is used twice :: (() => { const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); return !!document.querySelector('.card#profile') && new Set(ids).size === ids.length; })()

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Sam Rivera</title>
    <style>
      .card { border: 2px solid black; padding: 12px; margin-bottom: 12px; }
      .tag { background: yellow; }
    </style>
  </head>
  <body>
    <div class="card" id="profile">
      <h1>Sam Rivera</h1>
      <p class="note">Warehouse lead. <span class="tag">Learning to code</span></p>
    </div>

    <div class="card">
      <h2>This week</h2>
      <p>Finished the HTML unit.</p>
      <p class="note">Next: CSS.</p>
    </div>

    <div class="card">
      <h2>Goals</h2>
      <ul>
        <li>Put my <span class="tag">first site</span> online</li>
        <li>Build a small app for my phone</li>
      </ul>
    </div>
  </body>
</html>
```

## What changed

- `<div class="card">` The new box got its border without any new CSS. That is the point of a class: you write the style once, and every element with that name gets it.
- `<span class="tag">first site</span>` The `span` wraps only the two words, in the middle of the sentence, without breaking the line. Because it has the class `tag`, it turns yellow.
