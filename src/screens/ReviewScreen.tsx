import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChoiceCard } from '@/components/nodes/ChoiceCard';
import { WritingCard } from '@/components/nodes/WritingCard';
import type { AnswerRecord } from '@/engine/progress';
import { REVIEW_INTERVALS_DAYS, reviewBase, type DueReview } from '@/engine/review';
import { useGame } from '@/state/GameContext';
import type { ChoiceNode, WritingNode } from '@/types';

/** Recuento de la sesión, para el resumen final. */
interface Tally {
  recalled: number;
  shaky: number;
  forgotten: number;
  learned: number;
  xp: number;
}

const EMPTY_TALLY: Tally = { recalled: 0, shaky: 0, forgotten: 0, learned: 0, xp: 0 };

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function ReviewScreen() {
  const { due, queueSize, nextReview, commitReview } = useGame();

  /*
   * La tanda se congela al entrar. Si se leyera del contexto en cada render, el
   * nodo que acabas de acertar saldría de la cola y la lista se recolocaría
   * debajo de tus pies: responderías el tercer ejercicio creyendo que es el
   * segundo, y el contador iría dando saltos.
   */
  const [session] = useState<DueReview[]>(due);
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState<Tally>(EMPTY_TALLY);

  const current = session[index];

  const handleComplete = useCallback(
    (record: AnswerRecord) => {
      const applied = commitReview({
        nodeId: record.nodeId,
        grade: record.grade,
        attempts: record.attempts,
        revealed: record.revealed,
        xp: record.xp,
        words: record.words,
      });

      setTally((previous) => ({
        recalled: previous.recalled + (applied.grade === 'perfect' ? 1 : 0),
        shaky: previous.shaky + (applied.grade === 'close' ? 1 : 0),
        forgotten: previous.forgotten + (applied.grade === 'wrong' ? 1 : 0),
        learned: previous.learned + (applied.graduated ? 1 : 0),
        xp: previous.xp + record.xp,
      }));

      setIndex((position) => position + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [commitReview],
  );

  if (!session.length) {
    return (
      <div className="page stack" style={{ gap: 18 }}>
        <span className="eyebrow">Repaso</span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30 }}>Hoy no te espera nada</h1>
        <p className="muted" style={{ maxWidth: 620 }}>
          {queueSize === 0
            ? 'No hay nada en la cola: todo lo que has escrito te ha salido a la primera. Sigue con la historia y, en cuanto algo se te atragante, aparecerá aquí.'
            : nextReview
              ? `Tienes ${queueSize} ${queueSize === 1 ? 'ejercicio esperando' : 'ejercicios esperando'}, pero ninguno vence todavía. El siguiente vuelve el ${formatDate(nextReview)}.`
              : `Tienes ${queueSize} ${queueSize === 1 ? 'ejercicio' : 'ejercicios'} en la cola.`}
        </p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link to="/levels" className="btn btn-primary">
            Seguir la historia
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return <ReviewSummary tally={tally} total={session.length} nextReview={nextReview} />;
  }

  const base = reviewBase(current.node.xp);
  const isFirstBox = current.item.box === 0;

  return (
    <div className="page stack" style={{ gap: 20 }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
        <Link to="/levels" className="btn btn-ghost btn-sm">
          ← Dejarlo por hoy
        </Link>
        <span className="faint" style={{ fontSize: 12.5 }}>
          Repaso · {index + 1}/{session.length}
        </span>
      </div>

      <div className="scene-progress" aria-label={`Repaso ${index + 1} de ${session.length}`}>
        {session.map((entry, position) => (
          <span
            key={entry.item.nodeId}
            data-state={position < index ? 'done' : position === index ? 'current' : 'todo'}
          />
        ))}
      </div>

      {/*
        De dónde salió el nodo. Un ejercicio fuera de su capítulo pierde el hilo
        de la historia, y decir de qué capítulo viene devuelve el contexto
        suficiente para entender de qué se estaba hablando.
      */}
      <div className="review-context">
        <span className="review-chip">{current.chapter.level}</span>
        <span className="muted" style={{ fontSize: 13.5 }}>
          {current.chapter.title}
        </span>
        <span className="faint" style={{ marginLeft: 'auto', fontSize: 12.5 }}>
          {isFirstBox
            ? current.item.lapses > 1
              ? `Se te ha resistido ${current.item.lapses} veces`
              : 'Primer repaso'
            : `Escalón ${current.item.box + 1} de ${REVIEW_INTERVALS_DAYS.length}`}
        </span>
      </div>

      {current.node.kind === 'readingCheck' ? (
        <ChoiceCard
          key={current.node.id}
          node={current.node as ChoiceNode}
          xpBase={base}
          onComplete={handleComplete}
        />
      ) : (
        <WritingCard
          key={current.node.id}
          node={current.node as WritingNode}
          combo={0}
          xpBase={base}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

function ReviewSummary({
  tally,
  total,
  nextReview,
}: {
  tally: Tally;
  total: number;
  nextReview: Date | null;
}) {
  return (
    <div className="page stack" style={{ gap: 20 }}>
      <div className="card summary-hero stack" style={{ gap: 10 }}>
        <span className="eyebrow">Repaso terminado</span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 27 }}>
          {total} {total === 1 ? 'ejercicio revisado' : 'ejercicios revisados'}
        </h1>
        <div className="summary-xp">+{tally.xp} XP</div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <b>{tally.recalled}</b>
          <span>Recordados</span>
        </div>
        <div className="stat">
          <b>{tally.shaky}</b>
          <span>A medias</span>
        </div>
        <div className="stat">
          <b>{tally.forgotten}</b>
          <span>Vuelven al principio</span>
        </div>
        <div className="stat">
          <b>{tally.learned}</b>
          <span>Aprendidos del todo</span>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <span className="eyebrow">Qué pasa ahora</span>
        <p className="muted" style={{ fontSize: 14, marginTop: 10 }}>
          Lo que has recordado tardará más en volver; lo que has fallado vuelve mañana. Un ejercicio
          sale de la cola cuando lo aciertas {REVIEW_INTERVALS_DAYS.length} veces seguidas, la última
          tras {REVIEW_INTERVALS_DAYS[REVIEW_INTERVALS_DAYS.length - 1]} días sin verlo.
        </p>
        {nextReview && (
          <p className="faint" style={{ fontSize: 13.5, marginTop: 8 }}>
            Siguiente repaso: {formatDate(nextReview)}.
          </p>
        )}
      </div>

      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <Link to="/levels" className="btn btn-primary">
          Seguir la historia
        </Link>
        <Link to="/achievements" className="btn btn-ghost">
          Ver logros
        </Link>
      </div>
    </div>
  );
}
