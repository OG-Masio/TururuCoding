---
title: Your first commit
summary: Save snapshots of your project with Git.
mode: code
---
**Git** saves snapshots of your project, called **commits**. If you break something, you can always go back to an earlier snapshot. Every company uses it, and it's how code gets to GitHub and Cloudflare.

This lesson runs on your computer. Click **Download for VS Code**, unzip the folder, open it in VS Code, and open the terminal (``Ctrl + ` ``). Then type the commands from `commands.txt`, one at a time.

## The commands, explained

**Once per computer:** tell Git who you are. This name and email go on every commit.

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**Once per project:** turn the folder into a Git project (a **repository**, or "repo").

```
git init
```

**Every time you want to save a snapshot:**

| Command | What it does |
|---|---|
| `git status` | shows what changed since the last commit. Run it all the time. |
| `git add .` | picks **all** changes to go into the next snapshot (the `.` means "everything here") |
| `git commit -m "message"` | takes the snapshot, with a short note about what you did |
| `git log --oneline` | lists your snapshots, newest first |

## The rhythm

Change some files, then `git add .`, then `git commit -m "..."`. Repeat. Write messages that say what changed, like `"Add contact section"`, not `"stuff"`.

## In VS Code, without typing

The **Source Control** panel (`Ctrl + Shift + G`) does the same thing with buttons: **+** is `git add`, and the ✓ button is `git commit`. Use whichever you like; the terminal version is worth knowing because every tutorial uses it.

# Answer

```txt commands.txt
# 1. Once per computer
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 2. Once per project
git init

# 3. Save your first snapshot
git status
git add .
git commit -m "First commit"

# 4. See your history
git log --oneline
```

```html index.html
<!doctype html>
<html>
  <body>
    <h1>My first Git project</h1>
  </body>
</html>
```

# Twist

Make a **second commit**: change the `<h1>` text in `index.html`, then run `git status`, `git add .` and `git commit -m "Change the heading"`. Run `git log --oneline` and you'll see two snapshots.

# Twist answer

```txt commands.txt
# (after editing index.html)
git status
git add .
git commit -m "Change the heading"
git log --oneline

# You should see something like:
# 4f2a9c1 Change the heading
# 8b1e3d0 First commit
```

```html index.html
<!doctype html>
<html>
  <body>
    <h1>My first Git project, now with two commits</h1>
  </body>
</html>
```
