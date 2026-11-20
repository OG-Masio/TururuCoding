# TururuCoding

A personal, continuous-learning coding website. Every lesson follows **copy and twist**:

1. **The answer**: working code with a plain explanation.
2. **The preview**: see it run right away, in the browser.
3. **Your twist**: one small change to make, with the twist answer one click away.
4. **Download for VS Code**: the same lesson as a folder, to run on your own computer.

No quizzes. Progress and code autosave in the browser, and sync across devices when you sign in with Google.

## Curriculum

| # | Module | Status |
|---|---|---|
| 0 | Getting set up | ✅ |
| 1 | HTML and CSS refresh | ✅ capstone: portfolio page |
| 2 | JavaScript basics | ✅ capstone: to-do list |
| 3 | JavaScript and the internet | ✅ capstone: weather app |
| 4 | Git and GitHub | ✅ capstone: put your portfolio online |
| 5 | React | ✅ capstone: flashcard app |
| 6 | TypeScript basics | coming soon |
| 7 | Back end (Cloudflare Workers) | coming soon |
| 8 | Databases (SQL, Cloudflare D1) | coming soon |
| 9 | Login and security | coming soon |
| 10 | Testing | coming soon |
| 11 | Cloud deploys | coming soon |
| 12 | Mobile with React Native and Expo | coming soon |
| 13 | AI apps | coming soon |
| 14 | Final projects | coming soon |

## Adding a lesson

Lessons are Markdown files in `lessons/<module>/`. To add one, copy an existing file, rename it, and edit it. Files are shown in name order, so start the name with a number (`08-my-lesson.md`).

```md
---
title: My new lesson
summary: One line shown under the title.
mode: web            # web (HTML/CSS/JS), react, or code (runs on your computer only)
capstone: false      # true shows a "Capstone" tag
---
The explanation, in Markdown. Everything before the first "# " heading.

# Answer

(code blocks with a language AND a file name)

# Twist

What to change, in Markdown.

# Twist answer

(only the files that change; the others are kept as they are)
```

A code block becomes a file when its first line has a language and a file name, like ` ```html index.html ` or ` ```jsx App.jsx `.

- **web** lessons need an `index.html`. Linked `.css` and `.js` files are inlined for the preview.
- **react** lessons need an `App.jsx` with `export default function App`. Other `.jsx` files and `.css` files are included automatically. Write normal `import` lines; the preview handles them, and the VS Code download becomes a ready-to-run Vite project.
- **code** lessons (Git, Node, mobile) show the files and point to the VS Code download.

New modules are listed in `lessons/modules.json`. A module with no lesson files shows as "coming soon".

## Running it on your computer

```bash
npm install
npm run dev        # the site only, with progress saved in this browser
```

To include sign-in and syncing, build and run it the way Cloudflare does:

```bash
npm run build
npx wrangler pages dev dist --binding GOOGLE_CLIENT_ID=<your client id>
```

## How it's built

- **Site:** React + Vite + TypeScript (`src/`), hosted on Cloudflare Pages.
- **Editor and preview:** CodeMirror, plus a sandboxed `<iframe>` preview. React and Babel for React lessons are served from `public/vendor`, so previews don't depend on outside servers.
- **API:** Cloudflare Pages Functions (`functions/`): Google sign-in, sessions and progress.
- **Database:** Cloudflare D1. Tables are created automatically on first use (`functions/_lib.ts`, same SQL as `migrations/0001_init.sql`).

Setup steps for Cloudflare and Google are in [DEPLOY.md](DEPLOY.md).
