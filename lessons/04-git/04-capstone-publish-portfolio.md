---
title: Put your portfolio online
summary: Publish the portfolio from the HTML module with GitHub Pages.
mode: code
capstone: true
---
Time to put your portfolio from the HTML and CSS module on the internet, free, with **GitHub Pages**. You'll get an address like `https://your-name.github.io/portfolio/` that you can send to anyone.

## Step by step

**1. Get the files.** Go to the portfolio capstone lesson, click **Download for VS Code**, unzip it, and open the folder in VS Code. (If you made your own changes in the editor, they're included.)

**2. Make it a Git repo and commit.**

```
git init
git add .
git commit -m "My portfolio"
```

**3. Create the GitHub repo.** On github.com: **New repository**, name it `portfolio`, make it **Public**, leave everything else empty, then **Create repository**.

**4. Push.** (Use the address GitHub shows you.)

```
git remote add origin https://github.com/YOUR-NAME/portfolio.git
git branch -M main
git push -u origin main
```

**5. Turn on Pages.** In the repo on GitHub: **Settings > Pages**. Under **Branch**, pick `main` and `/ (root)`, then **Save**.

**6. Wait a minute**, then refresh the Pages settings. Your address appears at the top. Open it: that's your site, live.

## Updating it later

Edit, then:

```
git add .
git commit -m "Update portfolio"
git push
```

GitHub Pages republishes by itself within a minute or so. Later, in the Cloud deploys module, you'll do the same thing with Cloudflare, which is where this learning site lives too.

## Why it works

GitHub Pages serves whatever `index.html` is in the root of your `main` branch. That's why the file must be called exactly `index.html`.

# Answer

```txt commands.txt
# In your portfolio folder
git init
git add .
git commit -m "My portfolio"

# After creating the empty "portfolio" repo on github.com
git remote add origin https://github.com/YOUR-NAME/portfolio.git
git branch -M main
git push -u origin main

# Then on github.com: Settings > Pages > Branch: main, / (root) > Save
# Your site: https://YOUR-NAME.github.io/portfolio/

# Every update after that
git add .
git commit -m "Update portfolio"
git push
```

# Twist

Change something visible on your portfolio (a new project card, or a new `--accent` color), push it, and check that the live site updates.

# Twist answer

```txt commands.txt
# edit index.html or style.css, then:
git add .
git commit -m "Add a new project card"
git push
# wait about a minute and refresh https://YOUR-NAME.github.io/portfolio/
```
