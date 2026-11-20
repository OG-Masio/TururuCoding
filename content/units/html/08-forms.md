---
title: "Forms: asking for information"
minutes: 20
---

Sign up, log in, search, checkout: every time a site asks you for something, that is a form. Here you build one.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Morning class</title>
  </head>
  <body>
    <h1>Join the morning class</h1>

    <form>
      <p>
        <label for="name">Your name</label><br>
        <input type="text" id="name" name="name">
      </p>
      <p>
        <label for="email">Email</label><br>
        <input type="email" id="email" name="email" placeholder="you@example.com">
      </p>
      <p>
        <label for="people">How many people?</label><br>
        <input type="number" id="people" name="people" value="1" min="1" max="6">
      </p>
      <button type="submit">Sign me up</button>
    </form>
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Morning class</title>
  </head>
  <body>

  </body>
</html>
```

## Explanation

- `<form>` The box around all the fields that are sent together.
- `<input type="text" id="name" name="name">` A field the user types in. `input` has no closing tag. The `type` decides what kind of field it is.
- `type="email"` A field for an email address. The browser checks that the text looks like an email, and phones show a keyboard with `@`.
- `type="number"` A field for numbers only, with small arrows. `min` and `max` set the lowest and highest number allowed. `value="1"` is what the field starts with.
- `placeholder="you@example.com"` Grey example text that disappears when the user types.
- `<label for="name">Your name</label>` The text that says what a field is for. `for="name"` connects the label to the input that has `id="name"`. Try it in the Result: click the words "Your name" and the cursor jumps into the field.
- `name="name"` The name of the value when the form is sent. `id` is for the label (and later for CSS and JavaScript). `name` is for the data. They are often the same word, but they do different jobs.
- `<br>` A line break. It puts the field on the line under its label. It has no closing tag.
- `<button type="submit">Sign me up</button>` The button that sends the form.

Fill in the form in the Result box and press the button. A yellow note shows what the form would send: each `name` with its value. On a real site this goes to a server. You build that server in track 3.

## Twist

1. Add a phone field under the email field: a label that says `Phone`, and an input with the type `tel`. Use `phone` for the `id`, the `name` and the label's `for`.
2. Change the text on the button to `Save my place`.

Then fill in the form and send it. Check that the yellow note shows a line for `phone`.

## Checks

- There is a phone field with type tel and the name "phone" :: !!document.querySelector('input[type="tel"][name="phone"]')
- A label is connected to it :: !!document.querySelector('label[for="phone"]') && !!document.getElementById('phone')
- The form has four fields :: document.querySelectorAll('form input').length >= 4
- The button has new text :: (() => { const b = document.querySelector('form button'); return !!b && b.textContent.trim() !== '' && b.textContent.trim() !== 'Sign me up'; })()

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Morning class</title>
  </head>
  <body>
    <h1>Join the morning class</h1>

    <form>
      <p>
        <label for="name">Your name</label><br>
        <input type="text" id="name" name="name">
      </p>
      <p>
        <label for="email">Email</label><br>
        <input type="email" id="email" name="email" placeholder="you@example.com">
      </p>
      <p>
        <label for="phone">Phone</label><br>
        <input type="tel" id="phone" name="phone">
      </p>
      <p>
        <label for="people">How many people?</label><br>
        <input type="number" id="people" name="people" value="1" min="1" max="6">
      </p>
      <button type="submit">Save my place</button>
    </form>
  </body>
</html>
```

## What changed

- `<label for="phone">Phone</label>` and `<input type="tel" id="phone" name="phone">` A new field is always the same three things: a label, an input, and the words that connect them (`for` and `id`). `type="tel"` gives phones a number keyboard.
- `<button type="submit">Save my place</button>` Only the text between the tags changed. The button still sends the form.
