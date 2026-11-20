import { Link } from 'react-router-dom';
import { lessonsInOrder, modules } from '../lib/lessons';
import { useProgress } from '../lib/progress';
import { useAuth } from '../lib/auth';

export default function Home() {
  const progress = useProgress();
  const { user } = useAuth();
  const next = lessonsInOrder.find((l) => !progress[l.id]?.completed) ?? lessonsInOrder[0];
  return (
    <main className="page">
      <section className="hero">
        <h1>{user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Learn to code by copying and twisting'}</h1>
        <p>
          Every lesson gives you the answer first, with a plain explanation. Run it, then make one small twist.
          No quizzes. Go at your own pace.
        </p>
        {next && (
          <Link className="btn primary" to={`/lesson/${next.id}`}>
            {progress[next.id] ? 'Continue' : 'Start'}: {next.title}
          </Link>
        )}
      </section>

      <ol className="modules">
        {modules.map((m, i) => {
          const done = m.lessons.filter((l) => progress[l.id]?.completed).length;
          return (
            <li key={m.id} className={'module' + (m.comingSoon ? ' soon' : '')}>
              <div className="module-head">
                <span className="module-num">{i}</span>
                <div>
                  <h2>{m.title}</h2>
                  <p>{m.summary}</p>
                </div>
                <span className="module-count">
                  {m.comingSoon ? 'Coming soon' : `${done} / ${m.lessons.length}`}
                </span>
              </div>
              {!m.comingSoon && (
                <ul className="lesson-list">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <Link to={`/lesson/${l.id}`} className={progress[l.id]?.completed ? 'done' : ''}>
                        <span className="check">{progress[l.id]?.completed ? '✓' : ''}</span>
                        {l.capstone && <span className="tag">Capstone</span>}
                        {l.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
