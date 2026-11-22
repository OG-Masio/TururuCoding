---
title: Lists
minutes: 15
---

Menus, steps, shopping lists, navigation bars: a lot of what you see on web pages is a list. HTML has two kinds.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Leg day</title>
  </head>
  <body>
    <h1>Leg day</h1>

    <h2>What to bring</h2>
    <ul>
      <li>Water bottle</li>
      <li>Towel</li>
      <li>Lifting shoes</li>
    </ul>

    <h2>The workout, in order</h2>
    <ol>
      <li>Warm up for 5 minutes</li>
      <li>Squats: 4 sets of 8</li>
      <li>Lunges: 3 sets of 10
        <ul>
          <li>Left leg first</li>
          <li>Rest 60 seconds between sets</li>
        </ul>
      </li>
      <li>Stretch</li>
    </ol>
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Leg day</title>
  </head>
  <body>

  </body>
</html>
```

## Explanation

- `<ul>` An **unordered list**. Use it when the order does not matter. The browser puts a dot in front of each item.
- `<ol>` An **ordered list**. Use it when the order matters, like steps. The browser writes the numbers for you. If you add a step in the middle, the numbers fix themselves.
- `<li>` A **list item**. Every item is its own `li`. Only `li` elements go directly inside `ul` or `ol`.
- `<li>Lunges: 3 sets of 10` … `</li>` A list inside a list. The inner `<ul>` is written *inside* the `li` it belongs to, before that `li` closes. The browser indents it and uses a different dot.

A quick way to choose: if you could shuffle the items and the list would still be correct, use `ul`. If not, use `ol`.

## Twist

1. The workout needs a fifth step. Add `Drink water` at the end of the ordered list.
2. Add a third section with the heading `After the workout` (an `h2`) and an unordered list with two things you do after training.

## Checks

- The workout has five steps :: document.querySelectorAll('ol > li').length >= 5
- There are three h2 headings :: document.querySelectorAll('h2').length >= 3
- The third heading is followed by a list with two items :: (() => { const h = document.querySelectorAll('h2')[2]; const list = h && h.nextElementSibling; return !!list && list.tagName === 'UL' && list.children.length >= 2; })()

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Leg day</title>
  </head>
  <body>
    <h1>Leg day</h1>

    <h2>What to bring</h2>
    <ul>
      <li>Water bottle</li>
      <li>Towel</li>
      <li>Lifting shoes</li>
    </ul>

    <h2>The workout, in order</h2>
    <ol>
      <li>Warm up for 5 minutes</li>
      <li>Squats: 4 sets of 8</li>
      <li>Lunges: 3 sets of 10
        <ul>
          <li>Left leg first</li>
          <li>Rest 60 seconds between sets</li>
        </ul>
      </li>
      <li>Stretch</li>
      <li>Drink water</li>
    </ol>

    <h2>After the workout</h2>
    <ul>
      <li>Eat something with protein</li>
      <li>Write the workout in my log</li>
    </ul>
  </body>
</html>
```

## What changed

- `<li>Drink water</li>` A new `li` before `</ol>`. You did not type the number 5. The browser counted.
- `<ul>` … `</ul>` A new list for the new section. It is a `ul` because the order of these two things does not matter.
