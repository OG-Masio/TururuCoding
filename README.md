# TururuCoding

A personal, continuous-learning coding website.

The method is **answer first**: every lesson shows the finished code and explains it. You copy it, then
you twist it (a small change of your own). No answer is ever hidden.

- **The map** shows the whole course: 8 tracks, 37 units, 306 lessons, a project for every unit and a
  capstone for every track.
- **Lessons** have an editor with a live result next to it. Nothing to install.
- **Progress and code** are saved in the browser and can sync between your devices through your own
  Cloudflare account.

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

One Worker serves the site and syncs your devices. It is designed to fit Cloudflare's free plan.

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

## How it is put together

```
content/
  curriculum.ts          the map: every track, unit, lesson title, project and capstone
  guide.md               the Guide page
  units/<unit>/          the written lessons of one unit
    01-….md … NN-….md    lessons
    check.md             the quick check ("skip this unit")
    project.md           the unit project
public/sandbox/images/   sample images lessons can use as images/<name>.svg
src/
  lib/lesson.ts          reads a lesson file
  lib/preview.ts         builds the page that runs in the result frame
  lib/store.ts           progress and code in the browser
  lib/sync.ts            syncing with the server
  lib/course.ts          ids, numbers, progress, loading lessons
  components/            editor, result frame, workbench, answer box
  pages/                 map, unit, lesson, quick check, project, capstone, my work, guide, settings
cloudflare/worker.ts     the server: static files + /api/sync (a Durable Object with SQLite)
scripts/cloudflare.mjs   the publish script behind cloud-deploy.bat
scripts/check-lessons.mjs  opens every lesson in Chrome and runs its checks
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
