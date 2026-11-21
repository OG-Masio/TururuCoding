/**
 * Reads a lesson written in Markdown and turns it into data the pages can show.
 *
 * A lesson file looks like this:
 *
 *   ---
 *   title: Your first page
 *   minutes: 15
 *   ---
 *   One or two sentences of introduction.
 *
 *   ## Answer            the finished code, in ```html file=index.html blocks
 *   ## Explanation       what each part does
 *   ## Starter           (optional) what the editor starts with
 *   ## Twist             a small change to make
 *   ## Checks            (optional) "- Text you see :: JavaScript that is true when done"
 *   ## Twist answer      the code after the twist (only the files that changed)
 *   ## What changed      why the twist answer works
 *
 * Quick checks use "## Task" and projects use "## Result", "## Steps" and
 * "## Make it yours". The parser does not care which headings a file uses: it
 * returns every "## " section by name.
 */

export type Files = Record<string, string>;

export interface Check {
  label: string;
  test: string;
}

export interface Section {
  /** The heading text, lower-cased: "answer", "twist answer", ... */
  name: string;
  /** The heading as written. */
  heading: string;
  /** Markdown with the file blocks taken out. */
  prose: string;
  /** Code blocks that carry "file=name". */
  files: Files;
  /** Order in which the files appeared. */
  fileOrder: string[];
}

export interface ParsedDoc {
  meta: Record<string, string>;
  intro: string;
  sections: Section[];
}

const FENCE = /^(`{3,}|~{3,})(.*)$/;

/** Splits "key: value" front matter from the body. */
export function splitFrontMatter(source: string): { meta: Record<string, string>; body: string } {
  const text = source.replace(/\r\n/g, "\n");
  const meta: Record<string, string> = {};
  if (!text.startsWith("---\n")) return { meta, body: text };
  const end = text.indexOf("\n---", 4);
  if (end < 0) return { meta, body: text };
  for (const line of text.slice(4, end).split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  const rest = text.slice(end + 4);
  return { meta, body: rest.startsWith("\n") ? rest.slice(1) : rest };
}

/** Pulls ```lang file=name blocks out of a section and keeps the other Markdown. */
function extractFiles(markdown: string): { prose: string; files: Files; fileOrder: string[] } {
  const lines = markdown.split("\n");
  const prose: string[] = [];
  const files: Files = {};
  const fileOrder: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const open = FENCE.exec(lines[i]);
    if (!open) {
      prose.push(lines[i]);
      i++;
      continue;
    }
    const marker = open[1];
    const info = open[2].trim();
    const fileMatch = /(?:^|\s)file=(\S+)/.exec(info);
    const block: string[] = [];
    let j = i + 1;
    while (j < lines.length && !(lines[j].startsWith(marker) && lines[j].trim() === marker)) {
      block.push(lines[j]);
      j++;
    }
    if (fileMatch) {
      const name = fileMatch[1];
      if (!(name in files)) fileOrder.push(name);
      files[name] = block.join("\n") + "\n";
    } else {
      prose.push(lines[i], ...block, marker);
    }
    i = j + 1;
  }
  return { prose: prose.join("\n").trim(), files, fileOrder };
}

export function parseDoc(source: string): ParsedDoc {
  const { meta, body } = splitFrontMatter(source);
  const lines = body.split("\n");
  const chunks: { heading: string | null; lines: string[] }[] = [{ heading: null, lines: [] }];
  let fence: string | null = null;
  for (const line of lines) {
    const m = FENCE.exec(line);
    if (m) {
      if (fence === null) fence = m[1];
      else if (line.startsWith(fence) && line.trim() === fence) fence = null;
    }
    if (fence === null && !m && line.startsWith("## ")) {
      chunks.push({ heading: line.slice(3).trim(), lines: [] });
    } else {
      chunks[chunks.length - 1].lines.push(line);
    }
  }
  const intro = chunks[0].lines.join("\n").trim();
  const sections = chunks.slice(1).map((chunk) => {
    const heading = chunk.heading ?? "";
    return { name: heading.toLowerCase(), heading, ...extractFiles(chunk.lines.join("\n")) };
  });
  return { meta, intro, sections };
}

export const section = (doc: ParsedDoc, name: string): Section | undefined => doc.sections.find((s) => s.name === name);

/** "- Label :: expression" lines. */
export function parseChecks(markdown: string | undefined): Check[] {
  if (!markdown) return [];
  const checks: Check[] = [];
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("- ")) continue;
    const at = line.indexOf(" :: ");
    if (at < 0) continue;
    checks.push({ label: line.slice(2, at).trim(), test: line.slice(at + 4).trim() });
  }
  return checks;
}

// ------------------------------------------------------------------ lessons

export interface Lesson {
  title: string;
  minutes: number;
  intro: string;
  /** The finished example. */
  answer: Files;
  answerProse: string;
  fileOrder: string[];
  explanation: string;
  /** What the editor starts with. Empty files when the lesson has no starter. */
  starter: Files;
  twist: string;
  checks: Check[];
  /** Complete files after the twist (answer + the files the twist changed). */
  twistAnswer: Files;
  twistAnswerProse: string;
  whatChanged: string;
  /** Lessons that run on your computer: the steps to run the code, and what you should see. */
  runIt: string;
  /** Lessons that run on your computer: things you check with your own eyes. */
  selfChecks: string[];
}

/** "- text" lines of a section, as a list. */
const listItems = (markdown: string | undefined): string[] =>
  (markdown ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());

export function toLesson(doc: ParsedDoc): Lesson {
  const answer = section(doc, "answer");
  if (!answer || answer.fileOrder.length === 0) throw new Error("A lesson needs an '## Answer' section with at least one file block.");
  const starter = section(doc, "starter");
  const twistAnswer = section(doc, "twist answer");
  const emptyFiles: Files = {};
  for (const name of answer.fileOrder) emptyFiles[name] = "";
  return {
    title: doc.meta.title ?? "Untitled lesson",
    minutes: Number(doc.meta.minutes) || 15,
    intro: doc.intro,
    answer: answer.files,
    answerProse: answer.prose,
    fileOrder: answer.fileOrder,
    explanation: section(doc, "explanation")?.prose ?? "",
    starter: starter ? { ...emptyFiles, ...starter.files } : emptyFiles,
    twist: section(doc, "twist")?.prose ?? "",
    checks: parseChecks(section(doc, "checks")?.prose),
    twistAnswer: { ...answer.files, ...(twistAnswer?.files ?? {}) },
    twistAnswerProse: twistAnswer?.prose ?? "",
    whatChanged: section(doc, "what changed")?.prose ?? "",
    runIt: section(doc, "run it")?.prose ?? "",
    selfChecks: listItems(section(doc, "check yourself")?.prose),
  };
}

// ------------------------------------------------------------- quick checks

export interface QuickCheck {
  title: string;
  intro: string;
  task: string;
  checks: Check[];
  starter: Files;
  answer: Files;
  fileOrder: string[];
  explanation: string;
}

export function toQuickCheck(doc: ParsedDoc): QuickCheck {
  const answer = section(doc, "answer");
  if (!answer || answer.fileOrder.length === 0) throw new Error("A quick check needs an '## Answer' section with at least one file block.");
  const starter = section(doc, "starter");
  const emptyFiles: Files = {};
  for (const name of answer.fileOrder) emptyFiles[name] = "";
  return {
    title: doc.meta.title ?? "Quick check",
    intro: doc.intro,
    task: section(doc, "task")?.prose ?? "",
    checks: parseChecks(section(doc, "checks")?.prose),
    starter: starter ? { ...emptyFiles, ...starter.files } : emptyFiles,
    answer: answer.files,
    fileOrder: answer.fileOrder,
    explanation: section(doc, "explanation")?.prose ?? "",
  };
}

// ----------------------------------------------------------------- projects

export interface ProjectStep {
  title: string;
  body: string;
}

export interface Project {
  title: string;
  minutes: number;
  intro: string;
  /** The finished example. */
  result: Files;
  fileOrder: string[];
  starter: Files;
  steps: ProjectStep[];
  checks: Check[];
  makeItYours: string;
  /** Optional: how to keep it as a real file on your computer. */
  onYourComputer: string;
}

/** Splits "### Step title" blocks inside the Steps section. */
function splitSteps(markdown: string): ProjectStep[] {
  const steps: ProjectStep[] = [];
  let fence: string | null = null;
  for (const line of markdown.split("\n")) {
    const m = FENCE.exec(line);
    if (m) {
      if (fence === null) fence = m[1];
      else if (line.startsWith(fence) && line.trim() === fence) fence = null;
    }
    if (fence === null && !m && line.startsWith("### ")) steps.push({ title: line.slice(4).trim(), body: "" });
    else if (steps.length) steps[steps.length - 1].body += line + "\n";
  }
  return steps.map((s) => ({ title: s.title, body: s.body.trim() }));
}

export function toProject(doc: ParsedDoc): Project {
  const result = section(doc, "result");
  if (!result || result.fileOrder.length === 0) throw new Error("A project needs a '## Result' section with at least one file block.");
  const starter = section(doc, "starter");
  const emptyFiles: Files = {};
  for (const name of result.fileOrder) emptyFiles[name] = "";
  return {
    title: doc.meta.title ?? "Project",
    minutes: Number(doc.meta.minutes) || 45,
    intro: doc.intro,
    result: result.files,
    fileOrder: result.fileOrder,
    starter: starter ? { ...emptyFiles, ...starter.files } : emptyFiles,
    steps: splitSteps(section(doc, "steps")?.prose ?? ""),
    checks: parseChecks(section(doc, "checks")?.prose),
    makeItYours: section(doc, "make it yours")?.prose ?? "",
    onYourComputer: section(doc, "on your computer")?.prose ?? "",
  };
}

// --------------------------------------------------------------------- diff

/**
 * Marks the lines of `after` that are not in `before`, so the twist answer can
 * show what changed. A simple longest-common-subsequence over trimmed lines.
 */
export function changedLines(before: string, after: string): boolean[] {
  const a = before.split("\n").map((l) => l.trim());
  const b = after.split("\n").map((l) => l.trim());
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const changed = new Array<boolean>(m).fill(true);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      changed[j] = false;
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++;
    else j++;
  }
  // Blank lines are never interesting.
  return changed.map((c, k) => c && b[k] !== "");
}
