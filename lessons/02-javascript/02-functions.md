---
title: Functions
summary: Reusable chunks of code.
mode: web
---
A **function** is a recipe with a name. You write it once and use it as many times as you like.

```js
function greet(name) {
  return `Hello, ${name}!`;
}

greet('Ana'); // "Hello, Ana!"
```

- `name` is a **parameter**: an input to the recipe.
- `return` hands a value back to whoever called the function.
- `greet('Ana')` **calls** the function with `'Ana'` as the input.

## Arrow functions

You'll see this shorter style everywhere in React code. It does the same thing:

```js
const greet = (name) => `Hello, ${name}!`;
```

If the body is one expression, you can skip `{ }` and `return`.

## The answer

Three small functions: a greeting, a price with tax, and a converter from Celsius to Fahrenheit. Each one is called a few times with different inputs. Look at the Console.

# Answer

```html index.html
<!doctype html>
<html>
  <body>
    <h1>Functions (see the Console)</h1>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
function greet(name) {
  return `Hello, ${name}!`;
}

function withTax(price) {
  const tax = price * 0.16;
  return price + tax;
}

const toFahrenheit = (celsius) => celsius * 9 / 5 + 32;

console.log(greet('Ana'));
console.log(greet('Leo'));

console.log('100 with tax:', withTax(100));
console.log('250 with tax:', withTax(250));

console.log('0°C is', toFahrenheit(0), '°F');
console.log('30°C is', toFahrenheit(30), '°F');
```

# Twist

Write an arrow function called `double` that returns a number times 2, and print `double(21)`.

# Twist answer

```js script.js
function greet(name) {
  return `Hello, ${name}!`;
}

function withTax(price) {
  const tax = price * 0.16;
  return price + tax;
}

const toFahrenheit = (celsius) => celsius * 9 / 5 + 32;

console.log(greet('Ana'));
console.log(greet('Leo'));

console.log('100 with tax:', withTax(100));
console.log('250 with tax:', withTax(250));

console.log('0°C is', toFahrenheit(0), '°F');
console.log('30°C is', toFahrenheit(30), '°F');

const double = (n) => n * 2;
console.log('double(21) =', double(21));
```
