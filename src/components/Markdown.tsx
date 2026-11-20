import { marked } from 'marked';
import { useMemo } from 'react';

// Lesson text is written by you (the site owner), so rendering it as HTML is safe.
export default function Markdown({ text }: { text: string }) {
  const html = useMemo(() => marked.parse(text, { async: false }) as string, [text]);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
