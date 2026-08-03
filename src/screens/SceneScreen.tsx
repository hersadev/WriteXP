import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChoiceCard } from '@/components/nodes/ChoiceCard';
import { NarrativeCard } from '@/components/nodes/NarrativeCard';
import { WritingCard } from '@/components/nodes/WritingCard';
import { levelById } from '@/data/levels';
import { chapterById, chaptersByLevel } from '@/data/story';
import type { AnswerRecord, ChapterOutcome, RunStats } from '@/engine/progress';
import { emptyRunStats } from '@/engine/progress';
import { heroTitle } from '@/engine/xp';
import { useGame } from '@/state/GameContext';
import type { ChoiceNode, NarrativeNode, WritingNode } from '@/types';

/**
 * La `key` fuerza a remontar la escena al cambiar de capítulo: sin ella, al
 * encadenar "siguiente capítulo" se arrastrarían el índice y las stats de la partida.
 */
export function SceneScreen() {
  const { chapterId } = useParams<{ chapterId: string }>();
  if (!chapterId) return <Navigate to="/levels" replace />;
  return <Scene key={chapterId} chapterId={chapterId} />;
}

function Scene({ chapterId }: { chapterId: string }) {
  const { progress, commitAnswer, checkpoint, finishChapter } = useGame();
  const navigate = useNavigate();

  const chapter = chapterById(chapterId);

  // Reanuda donde se quedó, salvo que el capítulo ya estuviera terminado.
  const [index, setIndex] = useState(() => {
    if (!chapter) return 0;
    const state = progress.chapters[chapter.id];
    if (!state || state.completed) return 0;
    return Math.min(state.nodeIndex, chapter.nodes.length - 1);
  });
  const [run, setRun] = useState<RunStats>(emptyRunStats);
  const [outcome, setOutcome] = useState<ChapterOutcome | null>(null);

  const handleComplete = useCallback(
    (record: AnswerRecord) => {
      if (!chapter) return;
      const nextRun = commitAnswer(run, record);
      setRun(nextRun);

      const nextIndex = index + 1;
      if (nextIndex >= chapter.nodes.length) {
        setOutcome(finishChapter(chapter, nextRun));
      } else {
        setIndex(nextIndex);
        checkpoint(chapter.id, nextIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [chapter, commitAnswer, run, index, finishChapter, checkpoint],
  );

  if (!chapter) return <Navigate to="/levels" replace />;

  const level = levelById(chapter.level);

  if (outcome) {
    return <ChapterSummary chapterId={chapter.id} outcome={outcome} run={run} />;
  }

  const node = chapter.nodes[index];

  return (
    <div className="page stack" style={{ gap: 20 }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/level/${chapter.level}`)}>
          ← Salir al mapa
        </button>
        <span className="faint" style={{ fontSize: 12.5 }}>
          {level.id} · {chapter.title} · {index + 1}/{chapter.nodes.length}
        </span>
      </div>

      <div className="scene-progress" aria-label={`Nodo ${index + 1} de ${chapter.nodes.length}`}>
        {chapter.nodes.map((item, position) => (
          <span
            key={item.id}
            data-state={position < index ? 'done' : position === index ? 'current' : 'todo'}
          />
        ))}
      </div>

      {node.kind === 'narrative' && (
        <NarrativeCard key={node.id} node={node as NarrativeNode} onComplete={handleComplete} />
      )}

      {(node.kind === 'choice' || node.kind === 'readingCheck') && (
        <ChoiceCard key={node.id} node={node as ChoiceNode} onComplete={handleComplete} />
      )}

      {(node.kind === 'writeWord' ||
        node.kind === 'gapFill' ||
        node.kind === 'writeSentence' ||
        node.kind === 'writeFree') && (
        <WritingCard key={node.id} node={node as WritingNode} combo={run.combo} onComplete={handleComplete} />
      )}
    </div>
  );
}

function ChapterSummary({
  chapterId,
  outcome,
  run,
}: {
  chapterId: string;
  outcome: ChapterOutcome;
  run: RunStats;
}) {
  const navigate = useNavigate();
  const chapter = chapterById(chapterId)!;
  const siblings = chaptersByLevel(chapter.level);
  const next = siblings.find((item) => item.order === chapter.order + 1);
  const accuracy = run.answered ? Math.round((run.perfect / run.answered) * 100) : 100;
  const metIds = new Set(outcome.goalsMet.map((goal) => goal.id));

  return (
    <div className="page stack" style={{ gap: 20 }}>
      <div className="card summary-hero stack" style={{ gap: 10 }}>
        <span className="eyebrow">Capítulo completado</span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 27 }}>{chapter.title}</h1>
        <div className="summary-xp">+{run.xp + outcome.goalXp} XP</div>
        {outcome.leveledUpTo && (
          <span className="levelup-banner">
            <span className="levelup-banner-seal">{outcome.leveledUpTo}</span>
            Ascendido a {heroTitle(outcome.leveledUpTo)}
          </span>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat">
          <b>{accuracy}%</b>
          <span>Precisión</span>
        </div>
        <div className="stat">
          <b>{run.words}</b>
          <span>Palabras</span>
        </div>
        <div className="stat">
          <b>×{run.maxCombo}</b>
          <span>Mejor racha</span>
        </div>
        <div className="stat">
          <b>{run.reveals}</b>
          <span>Soluciones vistas</span>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <span className="eyebrow">Objetivos</span>
        <div className="goal-list" style={{ marginTop: 12 }}>
          {chapter.goals.map((goal) => (
            <span className={`goal${metIds.has(goal.id) ? ' is-met' : ''}`} key={goal.id}>
              <span className="goal-mark">✓</span>
              {goal.label}
              <span className="faint" style={{ marginLeft: 'auto' }}>
                {metIds.has(goal.id) ? `+${goal.xp} XP` : 'pendiente'}
              </span>
            </span>
          ))}
        </div>
        {outcome.goalsMet.length < chapter.goals.length && (
          <p className="faint" style={{ fontSize: 13, marginTop: 12 }}>
            Los objetivos pendientes siguen disponibles: repite el capítulo cuando quieras.
          </p>
        )}
      </div>

      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        {next ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate(`/play/${next.id}`)}>
            Siguiente capítulo: {next.title}
          </button>
        ) : (
          <Link to="/levels" className="btn btn-primary">
            Elegir el siguiente acto
          </Link>
        )}
        <Link to={`/level/${chapter.level}`} className="btn">
          Volver al mapa
        </Link>
        <Link to="/achievements" className="btn btn-ghost">
          Ver logros
        </Link>
      </div>
    </div>
  );
}
