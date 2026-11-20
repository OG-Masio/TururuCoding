import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect, useState } from 'react';

function langFor(name: string) {
  if (name.endsWith('.html')) return [html()];
  if (name.endsWith('.css')) return [css()];
  if (/\.(jsx|tsx)$/.test(name)) return [javascript({ jsx: true, typescript: name.endsWith('.tsx') })];
  if (/\.(js|mjs|ts)$/.test(name)) return [javascript({ typescript: name.endsWith('.ts') })];
  return [];
}

function useDark() {
  const q = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setDark(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return dark;
}

export default function CodeEditor({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  const dark = useDark();
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={langFor(name)}
      theme={dark ? 'dark' : 'light'}
      height="100%"
      basicSetup={{ tabSize: 2 }}
      className="cm-wrap"
    />
  );
}
