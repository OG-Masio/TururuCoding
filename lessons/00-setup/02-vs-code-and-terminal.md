---
title: VS Code and the terminal
summary: Run a lesson on your own computer.
mode: web
---
Every lesson has a **Download for VS Code** button. It gives you a folder with the same code, plus a `README.md` with the explanation and the twist.

## One-time setup on Windows

1. Install **VS Code** from code.visualstudio.com.
2. Install **Node.js (LTS)** from nodejs.org. You'll need it from the JavaScript and React modules on.
3. Install **Git** from git-scm.com. Leave every option on its default.
4. In VS Code, open the Extensions panel (`Ctrl + Shift + X`) and install **Live Server**.

## Running a downloaded lesson

1. Unzip the folder.
2. In VS Code: **File > Open Folder** and pick it.
3. Right-click `index.html` and choose **Open with Live Server**. Your browser opens the page and reloads when you save.

## The terminal in 30 seconds

Open it inside VS Code with ``Ctrl + ` `` (the key under Esc). The commands you'll use most:

| Command | What it does |
|---|---|
| `cd folder-name` | Go into a folder |
| `cd ..` | Go back up one folder |
| `dir` (or `ls`) | List what's in this folder |
| `npm install` | Download a project's libraries |
| `npm run dev` | Start a project |
| `Ctrl + C` | Stop whatever is running |

The code on the right is a little "checklist" page. Download it and open it with Live Server to try the whole flow once.

# Answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>My setup checklist</h1>
    <ul>
      <li>VS Code installed</li>
      <li>Node.js installed</li>
      <li>Git installed</li>
      <li>Live Server extension installed</li>
    </ul>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  max-width: 500px;
  margin: 40px auto;
}
li {
  padding: 6px 0;
}
```

# Twist

Add one more item to the list: **"Opened a lesson with Live Server"**. Then download the lesson and do it for real.

# Twist answer

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>My setup checklist</h1>
    <ul>
      <li>VS Code installed</li>
      <li>Node.js installed</li>
      <li>Git installed</li>
      <li>Live Server extension installed</li>
      <li>Opened a lesson with Live Server</li>
    </ul>
  </body>
</html>
```
