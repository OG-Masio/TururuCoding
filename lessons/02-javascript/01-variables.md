---
title: Variables and console.log
summary: Store values and print them.
mode: web
---
A **variable** is a labelled box that holds a value.

```js
let age = 30;
const name = 'Tururu';
```

- `let` makes a box you can change later (`age = 31;`).
- `const` makes a box you can't change. Use `const` by default, and `let` only when the value needs to change.

## The main types of value

| Type | Example | Used for |
|---|---|---|
| string | `'hello'` | text (in quotes) |
| number | `42`, `3.5` | math |
| boolean | `true`, `false` | yes/no |

## console.log

`console.log(something)` prints it to the **Console**, the panel under the preview. Programmers use it all day to see what their code is doing.

## Template strings

Backticks (`` ` ``) let you drop variables into text with `${...}`:

```js
console.log(`Hi ${name}, you are ${age}`);
```

This lesson's page is almost empty on purpose: look at the **Console** under the preview.

# Answer

```html index.html
<!doctype html>
<html>
  <body>
    <h1>Open the Console below</h1>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
const name = 'Tururu';
let age = 30;
const likesCoding = true;

console.log(name);
console.log(age);

age = age + 1;
console.log('Next year I will be', age);

console.log(`Hi ${name}, you are ${age}. Likes coding: ${likesCoding}`);

const price = 19.99;
const quantity = 3;
console.log('Total:', price * quantity);
```

# Twist

Make a new `const` called `city` with your city in it, and print the sentence **"I live in ..."** using a template string.

# Twist answer

```js script.js
const name = 'Tururu';
let age = 30;
const likesCoding = true;

console.log(name);
console.log(age);

age = age + 1;
console.log('Next year I will be', age);

console.log(`Hi ${name}, you are ${age}. Likes coding: ${likesCoding}`);

const price = 19.99;
const quantity = 3;
console.log('Total:', price * quantity);

const city = 'Monterrey';
console.log(`I live in ${city}`);
```
