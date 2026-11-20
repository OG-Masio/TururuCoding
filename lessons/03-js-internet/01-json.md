---
title: JSON
summary: The text format apps use to send data to each other.
mode: web
---
When apps talk to each other over the internet, they send data as **JSON** (JavaScript Object Notation). It looks almost exactly like JavaScript objects and arrays:

```json
{
  "name": "Ana",
  "age": 28,
  "skills": ["HTML", "CSS"],
  "isAdmin": false
}
```

The differences from a normal JS object:

- Property names **must** be in double quotes: `"name"`.
- Text must use double quotes too: `"Ana"`, never `'Ana'`.
- No functions, no comments, no trailing commas.

## Two functions you'll use forever

| Function | Turns | Into |
|---|---|---|
| `JSON.stringify(value)` | a JS object or array | JSON text |
| `JSON.parse(text)` | JSON text | a JS object or array |

You already used both in the to-do capstone to save to localStorage. The internet works the same way: data leaves as text, and you `parse` it back into objects.

`JSON.stringify(value, null, 2)` adds line breaks and 2-space indents so it's easy to read.

# Answer

```html index.html
<!doctype html>
<html>
  <body>
    <h1>JSON (see the Console)</h1>
    <pre id="out"></pre>
    <script src="script.js"></script>
  </body>
</html>
```

```js script.js
const user = {
  name: 'Ana',
  age: 28,
  skills: ['HTML', 'CSS'],
};

// Object -> text
const text = JSON.stringify(user);
console.log('As text:', text);
console.log('Type:', typeof text);

// Text -> object
const back = JSON.parse(text);
console.log('Back to an object. Name is', back.name);
console.log('First skill:', back.skills[0]);

// Pretty text, shown on the page
document.querySelector('#out').textContent = JSON.stringify(user, null, 2);
```

# Twist

Add `"JavaScript"` to the user's skills **after** parsing (`back.skills.push(...)`), then print the new JSON text with `JSON.stringify(back)`.

# Twist answer

```js script.js
const user = {
  name: 'Ana',
  age: 28,
  skills: ['HTML', 'CSS'],
};

// Object -> text
const text = JSON.stringify(user);
console.log('As text:', text);
console.log('Type:', typeof text);

// Text -> object
const back = JSON.parse(text);
console.log('Back to an object. Name is', back.name);
console.log('First skill:', back.skills[0]);

back.skills.push('JavaScript');
console.log('Updated:', JSON.stringify(back));

// Pretty text, shown on the page
document.querySelector('#out').textContent = JSON.stringify(user, null, 2);
```
