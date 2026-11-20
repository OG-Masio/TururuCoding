---
title: Arrays and loops
summary: Lists of things, and doing something to each one.
mode: web
---
An **array** is a list, written with square brackets:

```js
const fruits = ['apple', 'banana', 'mango'];
```

- `fruits[0]` is the first item (`'apple'`). Counting starts at **0**.
- `fruits.length` is how many items there are (`3`).
- `fruits.push('kiwi')` adds an item to the end.

## Looping over an array

`for...of` runs some code once for each item:

```js
for (const fruit of fruits) {
  console.log(fruit);
}
```

## The three array tools React uses all the time

| Tool | What it does | Example result |
|---|---|---|
| `map` | makes a **new array** by changing each item | `[1,2,3].map(n => n * 2)` gives `[2,4,6]` |
| `filter` | keeps only the items that pass a test | `[1,2,3].filter(n => n > 1)` gives `[2,3]` |
| `find` | gives back the **first** item that passes a test | `[1,2,3].find(n => n > 1)` gives `2` |

Learn these three well: in React, `map` is how you show a list on screen.

# Answer

```html index.html
<!doctype html>
<html>
  <body>
    <h1>Arrays (see the Console)</h1>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
const fruits = ['apple', 'banana', 'mango'];

console.log('First fruit:', fruits[0]);
console.log('How many:', fruits.length);

fruits.push('kiwi');
console.log('After push:', fruits);

for (const fruit of fruits) {
  console.log('I like', fruit);
}

const prices = [10, 25, 4, 60];

const doubled = prices.map((p) => p * 2);
console.log('Doubled:', doubled);

const cheap = prices.filter((p) => p < 20);
console.log('Cheap ones:', cheap);

const firstBig = prices.find((p) => p > 20);
console.log('First over 20:', firstBig);
```

# Twist

Use `filter` to make an array called `expensive` with only the prices **over 20**, and print it.

# Twist answer

```js script.js
const fruits = ['apple', 'banana', 'mango'];

console.log('First fruit:', fruits[0]);
console.log('How many:', fruits.length);

fruits.push('kiwi');
console.log('After push:', fruits);

for (const fruit of fruits) {
  console.log('I like', fruit);
}

const prices = [10, 25, 4, 60];

const doubled = prices.map((p) => p * 2);
console.log('Doubled:', doubled);

const cheap = prices.filter((p) => p < 20);
console.log('Cheap ones:', cheap);

const firstBig = prices.find((p) => p > 20);
console.log('First over 20:', firstBig);

const expensive = prices.filter((p) => p > 20);
console.log('Expensive:', expensive);
```
