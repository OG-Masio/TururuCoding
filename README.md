# TururuCoding

A personal, continuous-learning coding website.

The method is **answer first**: every lesson shows the finished code and explains it. You copy it, then
you twist it (a small change of your own). No answer is ever hidden.

- **The map** shows the whole course: 8 tracks, 38 units, 314 lessons, a project for every unit and a
  capstone for every track.
- **Lessons** have an editor with a live result next to it. Nothing to install.
- **Fast typing** like in VS Code: Tab expands short forms (Emmet) for HTML and CSS and jumps out of a
  closing tag, `!` then Enter writes a whole empty page, Alt+W wraps a selection in a tag, both tags
  of a pair are renamed at once, and Format fixes the indentation. The Keys button lists everything.
- **A tutor** you can ask when a lesson is not clear. It is an open AI model that runs in your own
  Cloudflare account (Workers AI), inside the free daily amount.
- **Themes:** TururuCoding's own look, or the colors of 45 well-known VS Code themes, for the code areas
  or for the whole site. See `THEMES.md` for who made each one.
- **Progress and code** are saved in the browser and can sync between your devices through your own
  Cloudflare account.
- **About** (a tab of the Guide) lists every version with its date and what changed.

Unit 1 (HTML) is written. The other units are planned in `content/curriculum.ts` and get written one
unit at a time.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20.19 or newer (22 LTS recommended).

**Windows:** double-click `start.bat`. The first run installs dependencies, then the site opens in your
browser at `http://localhost:5180`.

**Any OS, by hand:**

```bash
npm install
npm run dev        # http://localhost:5180
```

Progress made on `localhost` is stored by the browser for that address only. Link the local copy to the
published site in Settings, Your devices (paste the whole device link) if you want it to sync.

## Put it online (Cloudflare)

One Worker serves the site, syncs your devices and runs the tutor. It is designed to fit Cloudflare's
free plan.

**Windows:** double-click `cloud-deploy.bat`. **Any OS:** `npm run cloud:deploy`.

The first run:

1. installs Wrangler (Cloudflare's tool) into `cloudflare/`,
2. opens your browser so you can sign in to Cloudflare and click **Allow**,
3. asks which account to use if your login has more than one,
4. makes a device key, builds the site and deploys it,
5. prints your **device link** and opens it, which links this computer's browser.

Open the same device link once on every other device (laptop, phone). Save it in your password manager.
Any linked device can show it again under Settings, Your devices.

### Update, change the key, sign out

| What | Windows | Any OS |
| --- | --- | --- |
| Publish the newest version (devices stay linked) | `cloud-deploy.bat` | `npm run cloud:deploy` |
| Make a new device key (old device links stop working) | `cloud-deploy.bat new-key` | `npm run cloud:new-key` |
| Sign Wrangler out of Cloudflare on this computer | | `npm run cloud:logout` |

### How it is secured

- The site itself (the lessons) is public: anyone who has the address can read it.
- Your progress and your code are private. Every request to `/api` must carry the device key. The server
  only stores a SHA-256 hash of the key (`SYNC_KEY_HASH`), never the key.
- The device key lives in the browser of each linked device. It arrives in the part of the address after
  `#`, which browsers do not send to servers, and the site removes it from the address at once.
- `cloudflare/wrangler.jsonc` and `cloudflare/deploy.json` are written on the computer you publish from.
  They hold no secrets, but they name your Cloudflare account, so `.gitignore` keeps them out of the
  repository. Keep publishing from the same computer, or copy those two files to the new one. Without
  them the script makes a new key, and you link your devices again (your data stays).
- Code typed in a lesson runs in a sandboxed frame that cannot read the site's storage.

### The tutor and what it costs

- The tutor is `POST /api/tutor`. Like every `/api` route it needs the device key, so nobody else can
  use it.
- The Worker asks an open model through Cloudflare's Workers AI binding (`env.AI`). There is no API key
  and no other company in between. The model and its backup are named at the top of
  `cloudflare/tutor.ts`.
- Workers AI gives an account a free amount of use per day. `DAILY_LIMIT` in `cloudflare/tutor.ts` (80
  questions a day) is sized so that even the longest questions stay inside it. The comment next to it
  shows the sum. Do the sum again before you change the model or raise the limit.
- A question sends the lesson text, your code and your question to Cloudflare to be answered. The chat
  is not stored on the server.
- An answer from the model is shown as text only: any HTML in it is displayed, never run
  (`src/lib/safeMarkdown.ts`).

## How it is put together

```
content/
  curriculum.ts          the map: every track, unit, lesson title, project and capstone
  guide.md               the Guide page
  changelog.ts           every version, with its date and what changed (the About tab)
  units/<unit>/          the written lessons of one unit
    01-….md … NN-….md    lessons
    check.md             the quick check ("skip this unit")
    project.md           the unit project
public/sandbox/images/   sample images lessons can use as images/<name>.svg
src/
  lib/lesson.ts          reads a lesson file
  lib/preview.ts         builds the page that runs in the result frame
  lib/tokens.ts          names each piece of code (tag, attribute, string…) so themes can color it
  lib/themes.ts          the colors of the VS Code themes (generated, do not edit by hand)
  lib/theme.ts           puts the chosen theme on the page
  lib/editorKeys.ts      the fast-typing keys
  lib/cssShortForms.ts   short forms for CSS, with the checked word list
  lib/linkedTags.ts      rename both tags of a pair at once
  lib/wrapWith.ts        wrap the selection in a tag
  lib/format.ts          the Format button
  lib/tutor.ts           asks the tutor and reads its answer while it is written
  lib/safeMarkdown.ts    shows an answer of the tutor without running anything in it
  lib/store.ts           progress and code in the browser
  lib/sync.ts            syncing with the server
  lib/course.ts          ids, numbers, progress, loading lessons
  components/            editor, result frame, workbench, answer box, tutor
  pages/                 map, unit, lesson, quick check, project, capstone, my work, guide, settings
cloudflare/worker.ts     the server: static files, /api/sync (a Durable Object with SQLite), /api/tutor
cloudflare/tutor.ts      the tutor's limits, its instructions for the model, and the call to the model
scripts/cloudflare.mjs   the publish script behind cloud-deploy.bat
scripts/check-lessons.mjs  opens every lesson in Chrome and runs its checks
scripts/build-themes.mjs   reads real VS Code theme files and writes src/lib/themes.ts and THEMES.md
tests/                   unit tests
```

## Writing a unit

1. In `content/curriculum.ts`, give the unit `ready: true` and `folder: "<name>"`.
2. Create `content/units/<name>/` with one file per lesson. The file name starts with the lesson number:
   `01-first-page.md`. The order and titles come from `curriculum.ts`.

A lesson file:

````markdown
---
title: Your first page
minutes: 15
---

One or two sentences: what this lesson is about.

## Answer

```html file=index.html
<!DOCTYPE html>
…
```

## Explanation

- `<h1>` Each point starts with the piece of code it explains.

## Starter

```html file=index.html
(optional: what the editor starts with)
```

## Twist

A small change to make.

## Checks

- Text the learner sees :: JavaScript that is true when the twist is done

## Twist answer

```html file=index.html
(the files that changed; other files are taken from the answer)
```

## What changed

- `<p>` Why the twist answer works.
````

- A code block with `file=name` is a file in the editor. A code block without it is only shown.
- A lesson can have several files (`index.html`, `style.css`, `script.js`). A `<link rel="stylesheet">`
  or `<script src>` that names one of them works in the result.
- Checks run inside the result frame. Write each as one JavaScript expression.
- `check.md` uses `## Task`, `## Checks`, `## Answer`, `## Explanation`.
- `project.md` uses `## Result`, `## Starter`, `## Steps` (with `### Step …` headings), `## Checks`,
  `## Make it yours`, `## On your computer`.

## Releasing a version

Every update of the site gets an entry at the top of `content/changelog.ts`: the version, the time it
was finished, one or two sentences, and the full story in Markdown. The About tab shows the list. Set
the same version in `package.json`.

## Check your work

```bash
npm run typecheck       # TypeScript
npm test                # unit tests
npm run build
npm run check:lessons   # needs Chrome: every lesson, with starter, answer and twist answer
node scripts/cloudflare.mjs --dry-run   # builds and lets Wrangler validate the Worker, uploads nothing
```

`check:lessons` fails when a twist answer does not pass its own checks, or when the plain answer already
passes all of them (then the twist asks for nothing new).

## Adding a theme

The theme colors are not typed by hand. `scripts/build-themes.mjs` reads the theme's own VS Code file,
finds the color of each kind of code the way VS Code does, and checks that text stays readable. The top
of that script says how to run it. Add the theme to its list, run it, and commit `src/lib/themes.ts` and
`THEMES.md`. `npm test` then checks every theme for readable contrast.
