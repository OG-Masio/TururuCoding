---
title: Making decisions with if
summary: Run different code depending on a condition.
mode: web
---
`if` runs code only when something is true:

```js
if (temperature > 30) {
  console.log('Hot!');
} else if (temperature > 15) {
  console.log('Nice.');
} else {
  console.log('Cold.');
}
```

JavaScript checks each condition from top to bottom and runs the **first** one that's true. `else` is the "none of the above" case.

## Comparing things

| Code | Means |
|---|---|
| `a === b` | a equals b (always use three `=`) |
| `a !== b` | a is not equal to b |
| `a > b`, `a < b` | bigger, smaller |
| `a >= b`, `a <= b` | bigger or equal, smaller or equal |

## Combining conditions

- `&&` means **and**: both must be true.
- `||` means **or**: at least one must be true.
- `!` means **not**: flips true and false.

The answer has a function that turns a test score into a grade.

# Answer

```html index.html
<!doctype html>
<html>
  <body>
    <h1>Grades (see the Console)</h1>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
function grade(score) {
  if (score >= 90) {
    return 'A';
  } else if (score >= 80) {
    return 'B';
  } else if (score >= 70) {
    return 'C';
  } else {
    return 'Try again';
  }
}

console.log('95 ->', grade(95));
console.log('83 ->', grade(83));
console.log('71 ->', grade(71));
console.log('40 ->', grade(40));

const isWeekend = true;
const isSunny = false;

if (isWeekend && isSunny) {
  console.log('Go to the beach');
} else if (isWeekend) {
  console.log('Stay in and code');
} else {
  console.log('Work day');
}
```

# Twist

Add a grade for `100` exactly that returns **"Perfect!"**. Where does it need to go so it gets checked first?

# Twist answer

```js script.js
function grade(score) {
  if (score === 100) {
    return 'Perfect!';
  } else if (score >= 90) {
    return 'A';
  } else if (score >= 80) {
    return 'B';
  } else if (score >= 70) {
    return 'C';
  } else {
    return 'Try again';
  }
}

console.log('100 ->', grade(100));
console.log('95 ->', grade(95));
console.log('83 ->', grade(83));
console.log('71 ->', grade(71));
console.log('40 ->', grade(40));

const isWeekend = true;
const isSunny = false;

if (isWeekend && isSunny) {
  console.log('Go to the beach');
} else if (isWeekend) {
  console.log('Stay in and code');
} else {
  console.log('Work day');
}
```
