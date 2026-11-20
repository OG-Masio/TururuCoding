import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { lazy, Suspense } from 'react';

// The lesson page carries the code editor, so it loads only when you open a lesson.
const LessonPage = lazy(() => import('./pages/LessonPage'));
import AccountBox from './components/AccountBox';
import { lessonsInOrder } from './lib/lessons';
import { useProgress } from './lib/progress';

export default function App() {
  const progress = useProgress();
  const done = lessonsInOrder.filter((l) => progress[l.id]?.completed).length;
  const pct = lessonsInOrder.length ? Math.round((done / lessonsInOrder.length) * 100) : 0;
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">
          <span className="logo-mark">{'</>'}</span> TururuCoding
        </Link>
        <div className="topbar-progress" title={`${done} of ${lessonsInOrder.length} lessons done`}>
          <div className="bar"><div style={{ width: pct + '%' }} /></div>
          <span>{pct}%</span>
        </div>
        <AccountBox />
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lesson/:moduleId/:slug" element={<Suspense fallback={<main className="page muted">Loading…</main>}><LessonPage /></Suspense>} />
        <Route path="*" element={<main className="page"><p>Page not found. <Link to="/">Go home</Link></p></main>} />
      </Routes>
    </div>
  );
}
