## The method: answer first

You do not have to struggle to learn. Every lesson gives you the finished answer and explains it. Your job is to copy it, then change it a little. Every lesson has the same four steps:

1. **Read the answer.** The complete, working code, and what it looks like when it runs.
2. **Understand it.** A short explanation of each part, in plain words.
3. **Copy it.** Type the answer into your editor. Typing it yourself is what makes it stick. If you are short on time, one button pastes it for you.
4. **Twist it.** A small change to make by yourself: add one thing, rename one thing. The twist answer is right there, with the changed lines marked.

Then you press **Mark lesson done** and go to the next one.

No answer is ever hidden. If you would like one click between you and the twist answer, so you can try first, turn on *Fold the twist answer* in [Settings](#/settings).

## The checks

Under most twists there is a short list with boxes. The boxes fill in by themselves when your code does what the twist asks. They are there so you know you got it right. They never block you: you can mark a lesson done at any time.

## Skip what you already know

Every unit starts with a quick check: one task that uses everything the unit teaches, with its answer. If nothing in it is new to you, skip the unit with one click and move on. Skipped lessons stay open, so you can come back later.

## Your editor

- The colored area is your code. The white area under it is the result. It updates while you type.
- **Bigger code** and **Bigger result** give one of them the whole space.
- When your code prints something or has an error, a **Console** opens under the result. A red line is an error: read it, it usually names the problem.
- If you replace your code by mistake (with *Paste the answer*, for example), press **Undo** in the message at the bottom.

## Type faster

The editor has the same fast-typing keys as VS Code. The **Keys** button in the editor shows this list at any time. On a Mac, use `⌘` where it says `Ctrl`, and `Option` where it says `Alt`.

| Key | What it does |
| --- | --- |
| `Tab` | Jumps over the closing tag, bracket or quote right after the cursor. With the cursor in `you|</p>`, Tab puts it after `</p>`. Then `Enter` starts the next line. |
| `Tab` | Expands a short form into full HTML (this is called Emmet). Type `p` and press Tab: you get `<p></p>` with the cursor inside. Type your text, press Tab again, and the cursor jumps out after `</p>`. |
| `Ctrl` `Enter` | Starts a new line below, from anywhere in the line. You do not have to go to the end first. |
| `Ctrl` `Shift` `Enter` | Starts a new line above. |
| `End` and `Home` | Go to the end or the start of the line. |
| `Alt` `↑` or `↓` | Moves the line up or down. |
| `Shift` `Alt` `↓` | Copies the line down. |
| `Ctrl` `/` | Turns the line into a comment, and back. |
| `Ctrl` `D` | Selects the next place the same word appears, so you change both at once. |
| `Ctrl` `Z` | Undo. |
| `Esc` then `Tab` | Leaves the editor with the keyboard. |

Short forms worth knowing:

| Type this, then Tab | You get |
| --- | --- |
| `p` | `<p></p>` |
| `a` | `<a href=""></a>` |
| `img` | `<img src="" alt="">` |
| `ul>li*3` | A list with three items |
| `div.card` | `<div class="card"></div>` |
| `section#about>h2+p` | A section with the id `about`, with a heading and a paragraph inside |
| `!` | A whole empty page: doctype, `html`, `head` and `body` |

Short forms only expand for real HTML tags. A normal word like `hello` stays a word.

Use them after you have typed a tag by hand a few times. First learn what `<p>` is, then let Tab write it for you.

## Themes

In [Settings](#/settings) you can pick the colors you like to work in: TururuCoding's own look, or one of the best-known VS Code themes, such as One Dark Pro, Dracula, GitHub, Night Owl and Tokyo Night. A theme can color the whole site or only the code areas. The result area stays white, because it shows your page the way a browser shows it.

## Your work is saved

Everything you type is saved by itself, in this browser. [My work](#/work) shows all of it, running, and lets you download any page as a real file.

To use more than one device, link them. When the site was published you got a **device link**. Open it once on each device (computer, laptop, phone). From then on your progress and your code follow you. The link contains your private key, so keep it like a password. A linked device can show the link again in [Settings](#/settings).

A device that is not linked still works. It just keeps its progress to itself.

You can also download a backup file in Settings at any time.

## Units, projects and capstones

- A **unit** is about ten lessons on one topic, and ends with a small **unit project** that uses all of them. Every project comes with a finished example and every step explained.
- A **track** is a group of units, and ends with a **capstone**: a bigger project that you build on your own computer with real tools, and put online.

The [map](#/) shows the whole road. Units marked *Not written yet* are planned: their lessons are fixed, and they get written one unit at a time.

## Where the code runs

- **In the site editor:** HTML, CSS and JavaScript lessons. Nothing to install.
- **On your computer:** capstones, and lessons about tools such as Git, databases and deploying. The site gives you the steps and the code. Unit 7 sets up your computer.

Each unit page says which one it uses.
