// Loads every lesson file in /lessons at build time.
// To add a lesson: drop a new .md file into a module folder. That's it.

export type LessonFile = { name: string; lang: string; code: string };
export type Mode = 'web' | 'react' | 'code';

export type Lesson = {
  id: string; // "01-html-css/03-flexbox"
  moduleId: string;
  slug: string;
  title: string;
  summary: string;
  mode: Mode;
  capstone: boolean;
  explanation: string; // markdown
  answer: LessonFile[];
  twist: string; // markdown
  twistAnswer: LessonFile[]; // only the files the twist changes (for showing)
  twistFull: LessonFile[]; // every file, with the twist changes applied (for loading)
};

export type Module = {
  id: string;
  title: string;
  summary: string;
  comingSoon?: boolean;
  lessons: Lesson[];
};

type ModuleMeta = { id: string; title: string; summary: string };

import modulesJson from '../../lessons/modules.json';

const raw = import.meta.glob('../../lessons/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(src: string): { meta: Record<string, string>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: src };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return { meta, body: src.slice(m[0].length) };
}

// Top-level "# " headings split a lesson into sections.
function splitSections(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  let current = 'explanation';
  let buf: string[] = [];
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (line.startsWith('```')) inFence = !inFence;
    const h = !inFence && line.match(/^# (.+)$/);
    if (h) {
      out[current] = (out[current] ?? '') + buf.join('\n');
      current = h[1].trim().toLowerCase();
      buf = [];
    } else buf.push(line);
  }
  out[current] = (out[current] ?? '') + buf.join('\n');
  return out;
}

// Code blocks written like ```html index.html become files.
export function parseFiles(md: string): LessonFile[] {
  const files: LessonFile[] = [];
  const re = /```(\w+)[ \t]+([^\s`]+)[ \t]*\r?\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) files.push({ lang: m[1], name: m[2], code: m[3].replace(/\n$/, '') });
  return files;
}

// Files in `over` replace files with the same name in `base`; new ones are added.
export function mergeFiles(base: LessonFile[], over: LessonFile[]): LessonFile[] {
  const out = base.map((f) => over.find((o) => o.name === f.name) ?? f);
  for (const o of over) if (!base.some((b) => b.name === o.name)) out.push(o);
  return out;
}

function buildLesson(path: string, src: string): Lesson {
  const parts = path.split('/');
  const moduleId = parts[parts.length - 2];
  const slug = parts[parts.length - 1].replace(/\.md$/, '');
  const { meta, body } = parseFrontmatter(src);
  const s = splitSections(body);
  const answer = parseFiles(s['answer'] ?? '');
  const twistAnswer = parseFiles(s['twist answer'] ?? '');
  return {
    id: `${moduleId}/${slug}`,
    moduleId,
    slug,
    title: meta.title ?? slug,
    summary: meta.summary ?? '',
    mode: (meta.mode as Mode) ?? 'web',
    capstone: meta.capstone === 'true',
    explanation: (s['explanation'] ?? '').trim(),
    answer,
    twist: (s['twist'] ?? '').trim(),
    twistAnswer,
    twistFull: mergeFiles(answer, twistAnswer),
  };
}

const allLessons = Object.entries(raw)
  .map(([p, src]) => buildLesson(p, src))
  .sort((a, b) => a.id.localeCompare(b.id));

export const modules: Module[] = (modulesJson as ModuleMeta[]).map((m) => {
  const lessons = allLessons.filter((l) => l.moduleId === m.id);
  return { ...m, lessons, comingSoon: lessons.length === 0 };
});

export const lessonsInOrder: Lesson[] = modules.flatMap((m) => m.lessons);

export function findLesson(id: string): Lesson | undefined {
  return lessonsInOrder.find((l) => l.id === id);
}

export function neighbours(id: string) {
  const i = lessonsInOrder.findIndex((l) => l.id === id);
  return { prev: lessonsInOrder[i - 1], next: lessonsInOrder[i + 1] };
}
