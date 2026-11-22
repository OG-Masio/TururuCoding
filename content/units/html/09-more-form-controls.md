---
title: More form controls
minutes: 20
---

Not every answer is typed. Sometimes the user picks from a menu, chooses one of a few options, ticks a box, or writes a long note.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Order a coffee</title>
  </head>
  <body>
    <h1>Order a coffee</h1>

    <form>
      <p>
        <label for="drink">Drink</label><br>
        <select id="drink" name="drink">
          <option value="espresso">Espresso</option>
          <option value="latte">Latte</option>
          <option value="cold-brew">Cold brew</option>
        </select>
      </p>

      <fieldset>
        <legend>Size</legend>
        <label><input type="radio" name="size" value="small" checked> Small</label>
        <label><input type="radio" name="size" value="large"> Large</label>
      </fieldset>

      <p>
        <label><input type="checkbox" name="extra-shot"> Extra shot</label>
      </p>

      <p>
        <label for="notes">Notes</label><br>
        <textarea id="notes" name="notes" rows="3"></textarea>
      </p>

      <p>
        <label for="pickup">Name for pickup</label><br>
        <input type="text" id="pickup" name="pickup" required>
      </p>

      <button type="submit">Place order</button>
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
    <title>Order a coffee</title>
  </head>
  <body>
    <h1>Order a coffee</h1>

    <form>

    </form>
  </body>
</html>
```

## Explanation

- `<select>` A drop-down menu. Each choice is an `<option>`.
- `<option value="cold-brew">Cold brew</option>` The text between the tags is what the user sees. The `value` is what is sent. They can be different: people read "Cold brew", the server receives `cold-brew`.
- `<input type="radio" name="size" value="small" checked>` A radio button: one choice out of a few. Radio buttons that share the same `name` belong together, so only one of them can be selected. `checked` selects this one from the start.
- `<fieldset>` and `<legend>` A box around fields that belong together, and the title of that box. Use them for a group of radio buttons.
- `<label><input type="radio" …> Small</label>` A second way to connect a label: put the input **inside** the label. Then you do not need `for` and `id`.
- `<input type="checkbox" name="extra-shot">` A box to tick: yes or no. Each checkbox is independent.
- `<textarea id="notes" name="notes" rows="3"></textarea>` A field for longer text. It **does** have a closing tag. `rows="3"` makes it three lines tall.
- `required` The form cannot be sent while this field is empty. The browser shows a message by itself. Notice that `required` and `checked` have no value: the word alone is enough.

Try it in the Result: press `Place order` with an empty pickup name. Then fill it in and send again. Look at the yellow note: the radio group sends one value, and the checkbox is only in the list when it is ticked.

## Twist

1. Add a fourth drink to the menu: `Tea`, with the value `tea`.
2. Add a third size, `Medium`, between Small and Large. It must belong to the same group, so only one size can be selected.
3. Add a second checkbox: `Oat milk`, with the name `oat-milk`.

## Checks

- The drink menu has four options :: document.querySelectorAll('select[name="drink"] option').length >= 4
- One option has the value "tea" :: !!document.querySelector('select[name="drink"] option[value="tea"]')
- There are three sizes in the same group :: document.querySelectorAll('input[type="radio"][name="size"]').length === 3
- One size has the value "medium" :: !!document.querySelector('input[type="radio"][name="size"][value="medium"]')
- There is a checkbox with the name "oat-milk" :: !!document.querySelector('input[type="checkbox"][name="oat-milk"]')

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Order a coffee</title>
  </head>
  <body>
    <h1>Order a coffee</h1>

    <form>
      <p>
        <label for="drink">Drink</label><br>
        <select id="drink" name="drink">
          <option value="espresso">Espresso</option>
          <option value="latte">Latte</option>
          <option value="cold-brew">Cold brew</option>
          <option value="tea">Tea</option>
        </select>
      </p>

      <fieldset>
        <legend>Size</legend>
        <label><input type="radio" name="size" value="small" checked> Small</label>
        <label><input type="radio" name="size" value="medium"> Medium</label>
        <label><input type="radio" name="size" value="large"> Large</label>
      </fieldset>

      <p>
        <label><input type="checkbox" name="extra-shot"> Extra shot</label>
      </p>
      <p>
        <label><input type="checkbox" name="oat-milk"> Oat milk</label>
      </p>

      <p>
        <label for="notes">Notes</label><br>
        <textarea id="notes" name="notes" rows="3"></textarea>
      </p>

      <p>
        <label for="pickup">Name for pickup</label><br>
        <input type="text" id="pickup" name="pickup" required>
      </p>

      <button type="submit">Place order</button>
    </form>
  </body>
</html>
```

## What changed

- `<option value="tea">Tea</option>` One more `option` inside the same `select`.
- `<input type="radio" name="size" value="medium">` The important part is `name="size"`. Because it is the same name as the other two, the browser treats the three as one group. With a different name, you could select Medium and Small at the same time.
- `<input type="checkbox" name="oat-milk">` A second checkbox with its own name. Checkboxes do not form a group: each one is its own yes or no.
