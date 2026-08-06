import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { levelById } from '@/data/levels';
import { chapterMaxXp, chaptersByLevel } from '@/data/story';
import { isChapterUnlocked } from '@/engine/progress';
import { useGame } from '@/state/GameContext';
import type { CEFRLevel } from '@/types';

const VALID: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

export function ChapterMapScreen() {
  const { levelId } = useParams<{ levelId: string }>();
  const { progress } = useGame();
  const navigate = useNavigate();

  if (!levelId || !VALID.includes(levelId as CEFRLevel)) return <Navigate to="/levels" replace />;

  const level = levelById(levelId as CEFRLevel);
  const chapters = chaptersByLevel(level.id);

  return (
    <div className="page stack" style={{ gap: 24 }} data-accent={level.accent}>
      <div className="stack" style={{ gap: 8 }}>
        <Link to="/levels" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginLeft: -14 }}>
          ← Todos los niveles
        </Link>
        <span className="eyebrow" style={{ color: level.accent }}>
          {level.act} · {level.id}
        </span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32 }}>{level.title}</h1>
        <p className="muted" style={{ maxWidth: 640 }}>
          {level.description}
        </p>
        <div className="chip-row" style={{ marginTop: 6 }}>
          {[...level.grammarFocus, ...level.vocabFocus].map((item) => (
            <span className="chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="chapter-list">
        {chapters.map((chapter, index) => {
          const state = progress.chapters[chapter.id];
          const unlocked = isChapterUnlocked(progress, chapter);
          const done = Boolean(state?.completed);
          const metGoals = new Set(state?.goalsMet ?? []);

          return (
            <button
              key={chapter.id}
              type="button"
              className={`card chapter-card${unlocked ? '' : ' is-locked'}${done ? ' is-done' : ''}`}
              disabled={!unlocked}
              onClick={() => navigate(`/play/${chapter.id}`)}
            >
              <span className="chapter-index">{done ? '✓' : unlocked ? index + 1 : '🔒'}</span>

              <span className="stack" style={{ gap: 12, flex: 1, minWidth: 0 }}>
                <span className="stack" style={{ gap: 4 }}>
                  <span className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{chapter.title}</strong>
                    <span className="faint" style={{ fontSize: 13 }}>
                      {chapter.titleEs}
                    </span>
                  </span>
                  <span className="muted" style={{ fontSize: 14 }}>
                    {chapter.summary}
                  </span>
                </span>

                <span className="goal-list">
                  {chapter.goals.map((goal) => (
                    <span className={`goal${metGoals.has(goal.id) ? ' is-met' : ''}`} key={goal.id}>
                      <span className="goal-mark">✓</span>
                      {goal.label}
                      <span className="faint" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        +{goal.xp} XP
                      </span>
                    </span>
                  ))}
                </span>

                <span className="chip-row">
                  {chapter.focus.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                  <span className="chip">hasta {chapterMaxXp(chapter)} XP</span>
                  {state && !done && state.nodeIndex > 0 && <span className="chip">▶ reanudar</span>}
                  {done && <span className="chip">↻ rejugar</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
