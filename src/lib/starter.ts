// Builds the "do it in VS Code" folder for a lesson as a .zip download.
import JSZip from 'jszip';
import type { Lesson, LessonFile } from './lessons';

function readme(lesson: Lesson, howToRun: string) {
  return `# ${lesson.title}

${lesson.explanation}

## How to run it

${howToRun}

## Your twist

${lesson.twist || 'Change one thing and see what happens.'}

The twist answer is in the \`twist-answer\` folder, if you want to peek.
`;
}

const WEB_RUN = `1. Open this folder in VS Code (File > Open Folder).
2. Install the "Live Server" extension once.
3. Right-click \`index.html\` and choose "Open with Live Server".`;

const REACT_RUN = `1. Install Node.js (LTS) from https://nodejs.org once.
2. Open this folder in VS Code, then open the terminal (Ctrl + \`).
3. Run \`npm install\` and then \`npm run dev\`.
4. Open the address it prints (usually http://localhost:5173).`;

const CODE_RUN = `1. Install Node.js (LTS) from https://nodejs.org once.
2. Open this folder in VS Code, then open the terminal (Ctrl + \`).
3. Follow the steps in the lesson above.`;

function reactProject(zip: JSZip, files: LessonFile[], title: string) {
  zip.file('package.json', JSON.stringify({
    name: 'tururu-lesson', private: true, type: 'module',
    scripts: { dev: 'vite', build: 'vite build' },
    dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
    devDependencies: { vite: '^5.4.0', '@vitejs/plugin-react': '^4.3.0' },
  }, null, 2));
  zip.file('vite.config.js', `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n`);
  zip.file('index.html', `<!doctype html>\n<html>\n  <head><meta charset="utf-8" /><title>${title}</title></head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`);
  const cssFiles = files.filter((f) => f.name.endsWith('.css'));
  zip.file('src/main.jsx', `import { createRoot } from 'react-dom/client';\nimport App from './App.jsx';\n${cssFiles.map((f) => `import './${f.name}';\n`).join('')}\ncreateRoot(document.getElementById('root')).render(<App />);\n`);
}

function withReactImports(code: string) {
  if (/from ['"]react['"]/.test(code)) return code;
  const hooks = ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useReducer', 'useContext', 'createContext']
    .filter((h) => new RegExp(`\\b${h}\\b`).test(code));
  return hooks.length ? `import { ${hooks.join(', ')} } from 'react';\n\n${code}` : code;
}

export async function downloadStarter(lesson: Lesson, files: LessonFile[]) {
  const zip = new JSZip();
  const run = lesson.mode === 'react' ? REACT_RUN : lesson.mode === 'code' ? CODE_RUN : WEB_RUN;
  zip.file('README.md', readme(lesson, run));
  const put = (dir: string, fs: LessonFile[]) => {
    for (const f of fs) {
      const code = lesson.mode === 'react' && /\.jsx?$/.test(f.name) ? withReactImports(f.code) : f.code;
      zip.file(dir + f.name, code + '\n');
    }
  };
  if (lesson.mode === 'react') {
    reactProject(zip, files, lesson.title);
    put('src/', files);
    put('twist-answer/', lesson.twistFull);
  } else {
    put('', files);
    put('twist-answer/', lesson.twistFull);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${lesson.slug}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
