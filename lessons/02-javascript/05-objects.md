---
title: Objects
summary: Group related values together.
mode: web
---
An **object** groups related values under names, using curly braces:

```js
const user = {
  name: 'Ana',
  age: 28,
  isAdmin: false,
};
```

- Each `name: value` pair is a **property**.
- Read one with a dot: `user.name` gives `'Ana'`.
- Change one the same way: `user.age = 29;`

## Arrays of objects

This is how almost all real app data looks, from a list of products to a list of flashcards:

```js
const cards = [
  { front: 'Hola', back: 'Hello' },
  { front: 'Gracias', back: 'Thank you' },
];
```

Combine it with `map` and `filter` from the last lesson and you can do a lot.

## Destructuring (a shortcut you'll see in React)

```js
const { name, age } = user;
```

That makes two variables, `name` and `age`, from the object's properties in one line.

# Answer

```html index.html
<!doctype html>
<html>
  <body>
    <h1>Objects (see the Console)</h1>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
const user = {
  name: 'Ana',
  age: 28,
  isAdmin: false,
};

console.log(user.name, 'is', user.age);
user.age = 29;
console.log('Birthday! Now', user.age);

const { name, isAdmin } = user;
console.log(name, 'admin?', isAdmin);

const products = [
  { name: 'Keyboard', price: 50, inStock: true },
  { name: 'Mouse', price: 20, inStock: false },
  { name: 'Monitor', price: 200, inStock: true },
];

const names = products.map((p) => p.name);
console.log('All products:', names);

const available = products.filter((p) => p.inStock);
console.log('In stock:', available.map((p) => p.name));

let total = 0;
for (const p of products) {
  total = total + p.price;
}
console.log('Total price of everything:', total);
```

# Twist

Add a fourth product (a **Webcam** for 35, in stock) and check that the Console totals update.

# Twist answer

```js script.js
const user = {
  name: 'Ana',
  age: 28,
  isAdmin: false,
};

console.log(user.name, 'is', user.age);
user.age = 29;
console.log('Birthday! Now', user.age);

const { name, isAdmin } = user;
console.log(name, 'admin?', isAdmin);

const products = [
  { name: 'Keyboard', price: 50, inStock: true },
  { name: 'Mouse', price: 20, inStock: false },
  { name: 'Monitor', price: 200, inStock: true },
  { name: 'Webcam', price: 35, inStock: true },
];

const names = products.map((p) => p.name);
console.log('All products:', names);

const available = products.filter((p) => p.inStock);
console.log('In stock:', available.map((p) => p.name));

let total = 0;
for (const p of products) {
  total = total + p.price;
}
console.log('Total price of everything:', total);
```
