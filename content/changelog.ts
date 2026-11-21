/**
 * Every version of TururuCoding, newest first. The About tab in the Guide shows this list.
 *
 * Rule: every update of the site adds one entry here.
 *   version   "1.3" for new features, "1.2.1" for a fix
 *   date      when it was finished, with the time and the time zone
 *   summary   one or two sentences: what changed
 *   details   the full story, in Markdown: what is new and how to use it
 */

export interface Release {
  version: string;
  /** ISO 8601, for example "2026-11-21T13:30:00-05:00". */
  date: string;
  title: string;
  summary: string;
  details: string;
}

export const releases: Release[] = [
  {
    version: "1.4",
    date: "2026-11-21T14:14:00-05:00",
    title: "Unit 2: CSS",
    summary: "Unit 2 is written: 11 lessons about CSS, the quick check, and the project \"Profile page with two themes\".",
    details: `
### Unit 2 is written

- **CSS: make it look good** has 11 lessons, a quick check and a unit project. Same four steps as unit 1: read the answer, understand it, copy it, twist it.
- The editor has two tabs in this unit: \`index.html\` and \`style.css\`. That is how real sites keep their CSS.
- The checks under a twist read the real styles of your page. "The heading is dark blue" is only ticked when the browser really shows it dark blue.

| Lesson | You learn |
| --- | --- |
| 1. Your first style rule | Connect \`style.css\`, and what selector, property and value are |
| 2. Colors | Names, hex codes and \`rgb()\`. Text color and background color |
| 3. Text | Font, size, weight, line height, alignment |
| 4. The box model | Padding, border and margin |
| 5. Classes | \`.card\`, two classes on one element, and when to use an id |
| 6. Width and units | \`max-width\`, centering a column, \`px\`, \`%\` and \`rem\` |
| 7. Backgrounds and corners | Layers of color, round corners, a round picture, a gradient |
| 8. Hover and focus | \`:hover\` for the mouse, \`:focus-visible\` for the keyboard |
| 9. Variables | One place for your colors |
| 10. Shadows and motion | \`box-shadow\`, \`transition\`, \`@keyframes\` |
| 11. Light and dark themes | A dark theme with a switch, without JavaScript |

### The project

- **Profile page with two themes.** Sam's page from unit 1 gets a header, cards, a clean table, a form that is nice to fill in, and a dark theme.
- Eight steps. Each one gives you the CSS and explains every part of it.
- *Make it yours* at the end: your colors, your corners, your font, your own text.

### Fixed

- **Bigger result** showed only a thin strip of the page. It now gives the result the whole space.
- The small piece of CSS in lesson 10 of unit 1 is written one declaration per line, like everywhere else. Format leaves it alone now.
`,
  },
  {
    version: "1.3",
    date: "2026-11-21T13:57:00-05:00",
    title: "Four more ways to type faster",
    summary: "Wrap selected text in a tag, rename both tags at once, a Format button, and short forms for CSS.",
    details: `
### Wrap with a tag

- Select some text and press \`Alt\` \`W\`. A small bar opens at the top of the editor.
- Type a short form and press Enter. \`Hello\` with \`strong\` becomes \`<strong>Hello</strong>\`.
- \`a\` gives \`<a href="">…</a>\` and puts the cursor in \`href\`.
- Several lines with \`div.card\` get a box around them. Several lines with \`ul>li*\` become a list, one item for every line.
- With nothing selected, it wraps the text of the line the cursor is on. \`Esc\` closes the bar.
- In VS Code this is *Emmet: Wrap with Abbreviation*.

### Rename both tags at once

- Put the cursor in the name of a tag and change it. The closing tag changes with it.
- It works from the closing tag too, and while you delete the whole name and type a new one.
- Both names are underlined while they are linked.
- An attribute you add (\`class="x"\`) stays in the opening tag only.
- One Undo takes both changes back. In VS Code this is *linked editing*.

### Format

- The editor bar has a **Format** button. \`Shift\` \`Alt\` \`F\` does the same, like in VS Code.
- It puts every line at the right indent, in HTML, CSS and JavaScript. CSS inside \`<style>\` gets one declaration per line.
- It only moves your code. It never rewrites it: \`<br>\` stays \`<br>\`, and a long line is never broken.
- It is the formatter VS Code uses for HTML. The lessons' own code comes out of it unchanged.
- Undo brings back the text from before.

### Short forms for CSS

- Between the \`{\` and \`}\` of a rule, a short form becomes a full line: \`m10\` is \`margin: 10px;\`, \`p10-20\` is \`padding: 10px 20px;\`, \`fz18\` is \`font-size: 18px;\`, \`c#333\` is \`color: #333;\`.
- Some words work too: \`df\` is \`display: flex;\`, \`tac\` is \`text-align: center;\`, \`fwb\` is \`font-weight: bold;\`, \`bgc\` is \`background-color: #fff;\` with the cursor on the color.
- A small list shows what you will get. Tab or Enter accepts it.
- It works in \`.css\` files, inside \`<style>\` and inside \`style=""\`.
- Words only work when they are on a fixed, checked list. Emmet itself guesses when it does not know a word. Here a short form never becomes something you did not mean.
- The Guide has the table under *Type faster*.

### Fixed

- Selected text on the line the cursor is on was almost invisible. The line highlight now steps aside while text is selected.
`,
  },
  {
    version: "1.2",
    date: "2026-11-21T13:26:00-05:00",
    title: "About, the page starter and the tutor",
    summary: "An About tab with the history of every version, `!` + Enter to start a page, and a tutor you can ask when a lesson is not clear.",
    details: `
### About tab

- The Guide now has a second tab, **About**. It shows the version you are using and every version before it.
- Each version has the time it was finished and a short description. Click a version to read everything that changed, and how to use it.
- From now on, every update adds an entry here.

### Page starter: \`!\` then Enter

- Type \`!\` in an empty HTML file. A small list opens and shows what you will get: a whole empty page.
- Press **Enter** (or Tab) to accept it. The cursor lands on the page title. Tab moves on into the \`body\`.
- The same list opens for other short forms, such as \`ul>li*3\` or \`div.card\`. It shows the HTML before you accept it.
- A plain tag name, such as \`p\`, still expands with Tab only. This keeps Enter free for starting a new line.
- To keep what you typed as normal text, press **Esc**. The list closes and Enter makes a new line again.
- The list for \`!\` only opens when it stands alone on its line and the file has no page yet. A page inside a page is never what you want.
- A list that is on the screen now works at once. Before, a very fast Tab or Enter could miss it.

### The tutor

- Lessons, quick checks and unit projects have a new button in the bottom left corner: **Ask the tutor**.
- Ask anything about the lesson in your own words, for example "what is an id for?". The tutor answers in plain words, with a small example.
- The tutor can see the lesson you are on and the code in your editor. So "why does my code not work?" is a good question.
- Select a piece of the text or the code in the lesson first, and a button appears to ask about exactly that part.
- Ready-made questions: explain it more simply, show one more example, what is wrong with my code.
- The panel lies over a part of the page. **Move right** puts it on the other side. On a very wide screen it fits beside the lesson.
- It works on the published site, on a linked device.

How it is built, and what it costs:

- The tutor is an open AI model that runs on Cloudflare Workers AI, in the same Cloudflare account that hosts this site. There is no other company in between and no API key in the browser.
- Cloudflare gives every account a free amount of AI use each day. The site allows 80 tutor questions a day. That number is chosen so that even 80 very long questions stay inside the free amount.
- The count starts again every day at midnight UTC.
- An AI model can be wrong. When the tutor and the lesson say different things, trust the lesson.

### Fixed

- Opening your device link in a tab that already shows the site now links the device. Before, it showed "there is no page at this address".

### Curriculum

- New unit in track 4: **AI in your site: build a chat helper**. Eight lessons and a project that rebuild this tutor step by step, the proper way: on your own server, without a middleman.
- The course now has 38 units and 314 lessons.
`,
  },
  {
    version: "1.1",
    date: "2026-11-20T14:36:00-05:00",
    title: "Wide screens, themes and fast typing",
    summary: "The site is centered on wide screens, has 45 VS Code themes, and the editor got the fast-typing keys of VS Code.",
    details: `
### Centered on wide screens

- Lesson pages and the top bar stay in the middle of the screen. They are never wider than 1800 pixels.
- Before this, an ultra-wide monitor pushed the lesson text to one side and stretched the editor.

### Themes

- **Settings** has a gallery with 45 well-known VS Code themes, dark and light, next to TururuCoding's own look. Some of them: One Dark Pro, Dracula, GitHub, Night Owl, Tokyo Night, Catppuccin, Monokai, Nord, Gruvbox, Ayu, Solarized, SynthWave '84, Shades of Purple, Cobalt2.
- The colors are read from each theme's own files, so a theme looks here the way it looks in VS Code.
- **Use the theme for the whole site** (on at the start): the pages, the menu and the buttons take the theme's colors too. Turn it off and only the code areas change.
- The Result area always stays white, because it shows your page the way a browser shows it.
- Your theme follows you to your other linked devices.

### Fast typing

**Tab jumps out.** When a closing tag, a bracket or a quote is right after the cursor, Tab jumps over it.

- Example: the cursor is in \`you|</p>\`. Press Tab and it stands after \`</p>\`. Press Enter and you are on the next line.
- In VS Code this is what the TabOut extension does.

**Short forms (Emmet).** Type a short form and press Tab. It becomes full HTML. Tab again moves to the next empty spot, and at the end it jumps out.

| Type this, then Tab | You get |
| --- | --- |
| \`p\` | \`<p></p>\`, with the cursor inside |
| \`a\` | \`<a href=""></a>\`: first the address, Tab, then the text |
| \`img\` | \`<img src="" alt="">\` |
| \`ul>li*3\` | A list with three items |
| \`div.card\` | \`<div class="card"></div>\` |
| \`section#about>h2+p\` | A section with the id \`about\`, with a heading and a paragraph |
| \`!\` | A whole empty page |

- Short forms only work for real HTML tags, typed in small letters, standing alone. A word in a sentence, such as "menu" or "link", stays a word.

**New lines.**

- \`Ctrl\` \`Enter\`: a new line below, from anywhere in the line. You do not have to go to the end first.
- \`Ctrl\` \`Shift\` \`Enter\`: a new line above.

**More keys.**

- \`Alt\` \`↑\` or \`↓\` moves the line. \`Shift\` \`Alt\` \`↓\` copies it.
- \`Ctrl\` \`/\` turns the line into a comment, and back.
- \`Ctrl\` \`D\` selects the next place the same word appears.
- Tab accepts a suggestion from the list.

**Keys button.** The editor bar has a **Keys** button that shows all of this at any time. The Guide has the same list under *Type faster*.

### Under the hood

- Code is now colored by what it is (tag, attribute, text in quotes, CSS property and so on), using the names VS Code themes use.
- After an update, \`cloud-deploy.bat\` and \`start.bat\` install new parts by themselves.
`,
  },
  {
    version: "1.0",
    date: "2026-11-20T13:54:00-05:00",
    title: "The first version",
    summary: "The site, the whole curriculum map, unit 1 (HTML) fully written, and syncing between your devices.",
    details: `
### The method

- Every lesson has four steps: **read the answer**, **understand it**, **copy it**, **twist it**.
- No answer is ever hidden. The twist answer is open, with the changed lines marked.

### The site

- **Map:** the whole course on one page, with one dot for every lesson and a square for every unit project.
- **Lessons:** an editor with a live result next to it. Nothing to install. Checks under each twist tick themselves while you type.
- **Console:** opens under the result when your code prints something or has an error.
- **Quick check:** every unit starts with one task. If nothing in it is new, skip the unit with one click.
- **Unit projects:** a finished example first, then every step with its code and the reason for it.
- **My work:** everything you wrote, running, with a download for each page.
- **Settings:** light and dark paper, fold the twist answer, your devices, backup and restore.

### The curriculum

- 8 tracks, 37 units, 306 lessons, a project for every unit and a capstone for every track.
- Tracks: web foundations, front end with React, back end and databases, cloud and deploy, security and payments, mobile with React Native and Expo, SQL and data for inventory work, working with AI coders.
- **Unit 1 (HTML) is written:** 10 lessons, the quick check and the profile page project.

### Your devices

- Progress and code are saved in the browser by themselves.
- One Cloudflare Worker hosts the site and syncs your devices. A device is linked by opening your private device link once.
- The server only keeps a scrambled form (a hash) of your device key, never the key.
- \`cloud-deploy.bat\` publishes the site. \`start.bat\` runs it on your own computer.
`,
  },
];

export const currentVersion = releases[0].version;
