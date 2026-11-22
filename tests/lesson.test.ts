import { describe, expect, it } from "vitest";
import { changedLines, parseChecks, parseDoc, splitFrontMatter, toLesson, toProject, toQuickCheck } from "../src/lib/lesson";

const lessonSource = `---
title: "Links: the basics"
minutes: 12
---

Intro text.

## Answer

Some words before the code.

\`\`\`html file=index.html
<h1>Hi</h1>
## not a heading, this is inside code
\`\`\`

\`\`\`css file=style.css
h1 { color: red; }
\`\`\`

## Explanation

- \`<h1>\` A heading.

\`\`\`html
<p>shown as an example, not a file</p>
\`\`\`

## Twist

Change it.

## Checks

- Has a paragraph :: !!document.querySelector('p')
- Text with :: inside :: 1 === 1
- not a check line

## Twist answer

\`\`\`html file=index.html
<h1>Hi</h1>
<p>New</p>
\`\`\`

## What changed

- \`<p>\` was added.
`;

describe("front matter", () => {
  it("reads keys and strips quotes", () => {
    const { meta, body } = splitFrontMatter(lessonSource);
    expect(meta.title).toBe("Links: the basics");
    expect(meta.minutes).toBe("12");
    expect(body.startsWith("\nIntro text.")).toBe(true);
  });

  it("returns the text unchanged when there is none", () => {
    expect(splitFrontMatter("hello").body).toBe("hello");
  });
});

describe("lessons", () => {
  const lesson = toLesson(parseDoc(lessonSource));

  it("reads the title, time and intro", () => {
    expect(lesson.title).toBe("Links: the basics");
    expect(lesson.minutes).toBe(12);
    expect(lesson.intro).toBe("Intro text.");
  });

  it("takes file blocks out of the answer and keeps their order", () => {
    expect(lesson.fileOrder).toEqual(["index.html", "style.css"]);
    expect(lesson.answer["index.html"]).toBe("<h1>Hi</h1>\n## not a heading, this is inside code\n");
    expect(lesson.answerProse).toBe("Some words before the code.");
  });

  it("keeps code without a file name inside the explanation", () => {
    expect(lesson.explanation).toContain("shown as an example");
  });

  it("starts the editor with empty files when there is no starter", () => {
    expect(lesson.starter).toEqual({ "index.html": "", "style.css": "" });
  });

  it("fills the twist answer with unchanged files from the answer", () => {
    expect(lesson.twistAnswer["index.html"]).toBe("<h1>Hi</h1>\n<p>New</p>\n");
    expect(lesson.twistAnswer["style.css"]).toBe("h1 { color: red; }\n");
  });

  it("reads checks and splits at the first ' :: '", () => {
    expect(lesson.checks).toEqual([
      { label: "Has a paragraph", test: "!!document.querySelector('p')" },
      { label: "Text with", test: "inside :: 1 === 1" },
    ]);
  });

  it("refuses a lesson without an answer", () => {
    expect(() => toLesson(parseDoc("## Twist\nx"))).toThrow();
  });
});

describe("checks", () => {
  it("ignores text that is not a check", () => {
    expect(parseChecks(undefined)).toEqual([]);
    expect(parseChecks("hello\n- no separator")).toEqual([]);
  });
});

describe("quick checks and projects", () => {
  it("reads a quick check", () => {
    const check = toQuickCheck(parseDoc("Intro\n\n## Task\nDo it.\n\n## Answer\n```html file=index.html\n<p>x</p>\n```\n"));
    expect(check.task).toBe("Do it.");
    expect(check.answer["index.html"]).toBe("<p>x</p>\n");
  });

  it("splits project steps at ### headings, but not inside code", () => {
    const project = toProject(
      parseDoc(
        "## Result\n```html file=index.html\n<p>x</p>\n```\n\n## Steps\n\n### Step 1: One\nText one.\n\n```md\n### not a step\n```\n\n### Step 2: Two\nText two.\n",
      ),
    );
    expect(project.steps.map((s) => s.title)).toEqual(["Step 1: One", "Step 2: Two"]);
    expect(project.steps[0].body).toContain("### not a step");
    expect(project.steps[1].body).toBe("Text two.");
  });
});

describe("changed lines", () => {
  it("marks only the lines that are new", () => {
    const before = "<h1>A</h1>\n<p>one</p>\n";
    const after = "<h1>A</h1>\n<p>one</p>\n<p>two</p>\n";
    expect(changedLines(before, after)).toEqual([false, false, true, false]);
  });

  it("marks a line that was edited", () => {
    expect(changedLines("<h1>A</h1>\n<p>one</p>", "<h1>B</h1>\n<p>one</p>")).toEqual([true, false]);
  });

  it("does not care about indentation and never marks blank lines", () => {
    expect(changedLines("<p>one</p>", "  <p>one</p>\n\n<p>two</p>")).toEqual([false, false, true]);
  });
});
