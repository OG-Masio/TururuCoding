---
title: GitHub and pull requests
summary: Put your repo online and propose changes the way teams do.
mode: code
---
**Git** lives on your computer. **GitHub** is a website that keeps a copy of your repo online, so it's backed up, you can share it, and services like Cloudflare can deploy from it.

## Connecting your folder to GitHub (once per project)

1. On github.com, click **New repository**. Give it a name, leave everything else empty, and click **Create repository**.
2. GitHub shows you a web address ending in `.git`. Back in VS Code's terminal:

```
git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

- `remote add origin ...` tells Git where the online copy lives. `origin` is just the usual nickname for it.
- `branch -M main` makes sure your branch is called `main`.
- `push` uploads your commits. `-u` remembers the connection, so next time a plain `git push` is enough.

The first push opens a browser window to sign in to GitHub. Refresh the GitHub page afterwards and your files are there.

## The daily loop

```
git add .
git commit -m "Describe the change"
git push
```

And `git pull` downloads changes that are on GitHub but not on your computer yet (for example, edits you made on another PC).

## Pull requests

A **pull request** (PR) says: "here's a branch, please review it and merge it into `main`". Teams use them so someone checks the code before it goes live, and you'll see them on every project, including the ones I open for you.

1. Make a branch and commit to it, like in the last lesson.
2. Push the branch: `git push -u origin my-branch`.
3. GitHub shows a **Compare & pull request** button. Click it, write what you changed, and click **Create pull request**.
4. On the PR page, click **Merge pull request**. Your change is now on `main`.
5. Back in VS Code: `git switch main` and `git pull` to get the merged result.

# Answer

```txt commands.txt
# Once per project (use your own address from GitHub)
git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
git branch -M main
git push -u origin main

# Every time after that
git add .
git commit -m "Describe the change"
git push

# A pull request
git switch -c new-section
# ...edit files...
git add .
git commit -m "Add a new section"
git push -u origin new-section
# Then on github.com: Compare & pull request > Create > Merge

# Back on your computer
git switch main
git pull
```

```html index.html
<!doctype html>
<html>
  <body>
    <h1>My project, now on GitHub</h1>
  </body>
</html>
```

# Twist

Open a pull request of your own: make a branch called `readme`, add a `README.md` file with one line describing the project, push the branch, and merge it on GitHub.

# Twist answer

```txt commands.txt
git switch -c readme
# create README.md with one line in it
git add .
git commit -m "Add README"
git push -u origin readme
# github.com: Compare & pull request > Create pull request > Merge pull request
git switch main
git pull
```

```md README.md
# My project

A small page I'm using to practice Git and GitHub.
```
