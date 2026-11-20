---
title: Branches
summary: Try ideas safely without touching your working code.
mode: code
---
A **branch** is a separate line of work. You make one to try something, and your main code stays untouched until you decide to bring the change in.

Picture it like a save file in a game: you copy your save, try something risky in the copy, and if it works you keep it. If not, you throw the copy away.

## The commands

| Command | What it does |
|---|---|
| `git branch` | lists branches. The one with `*` is where you are. |
| `git switch -c dark-mode` | **c**reates a branch called `dark-mode` and moves to it |
| `git switch main` | goes back to `main` |
| `git merge dark-mode` | brings the commits from `dark-mode` into the branch you're on |
| `git branch -d dark-mode` | deletes the branch once it's merged |

Your first branch is usually called `main`. If yours says `master`, that's the same thing with an older name; just use `master` wherever this lesson says `main`.

## What to watch for

When you `git switch main`, the files in VS Code **change back** to how they are on `main`. Your work isn't lost: it's on the other branch. Switch back and it reappears. That's the magic moment that makes branches click.

## Following along

Use the folder from the last lesson (the one where you already ran `git init`), or download this one and run `git init`, `git add .` and `git commit -m "Start"` first.

# Answer

```txt commands.txt
# Start on main, with everything committed
git status

# 1. Make a branch and move to it
git switch -c dark-mode

# 2. Edit style.css (add the dark colors), then save a snapshot
git add .
git commit -m "Add dark mode"

# 3. Go back to main: style.css goes back to the old version!
git switch main

# 4. Bring the dark mode work into main
git merge dark-mode

# 5. Tidy up
git branch -d dark-mode
git log --oneline
```

```html index.html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Branches</h1>
    <p>Try changing the colors on a branch.</p>
  </body>
</html>
```

```css style.css
body {
  font-family: sans-serif;
  background: white;
  color: black;
}
```

# Twist

Make another branch called `big-title`, change the `<h1>` font size in `style.css` on it, commit, and merge it into `main`.

# Twist answer

```txt commands.txt
git switch -c big-title
# edit style.css: h1 { font-size: 60px; }
git add .
git commit -m "Make the title bigger"
git switch main
git merge big-title
git branch -d big-title
```

```css style.css
body {
  font-family: sans-serif;
  background: white;
  color: black;
}
h1 {
  font-size: 60px;
}
```
