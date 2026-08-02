import { useState } from 'react';
import { GlossText } from '@/components/GlossText';
import { computeXp } from '@/engine/grading';
import type { AnswerRecord } from '@/engine/progress';
import type { ChoiceNode, ChoiceOption } from '@/types';

/**
 * Cubre dos casos:
 * - `choice`: bifurcación narrativa, no hay opción incorrecta.
 * - `readingCheck`: comprensión lectora, hay una correcta y se puede reintentar.
 */
export function ChoiceCard({
  node,
  onComplete,
}: {
  node: ChoiceNode;
  onComplete: (record: AnswerRecord) => void;
}) {
  const isQuiz = node.kind === 'readingCheck';
  const [attempts, setAttempts] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [chosen, setChosen] = useState<ChoiceOption | null>(null);

  const settled = chosen !== null && (!isQuiz || chosen.correct === true);

  function select(option: ChoiceOption) {
    if (settled) return;

    if (!isQuiz) {
      setChosen(option);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (option.correct) {
      setChosen(option);
    } else {
      setWrongIds((ids) => [...ids, option.id]);
      setChosen(option);
    }
  }

  function stateOf(option: ChoiceOption): string | undefined {
    if (!isQuiz) return chosen && chosen.id !== option.id ? 'muted' : undefined;
    if (wrongIds.includes(option.id)) return 'incorrect';
    if (settled && option.correct) return 'correct';
    return undefined;
  }

  function finish() {
    const grade = !isQuiz ? 'perfect' : attempts === 1 ? 'perfect' : 'close';
    onComplete({
      nodeId: node.id,
      grade,
      attempts: Math.max(1, attempts),
      revealed: false,
      usedHint: false,
      xp: isQuiz
        ? computeXp(node.xp, { grade, ratio: grade === 'perfect' ? 1 : 0.7, notes: [] }, Math.max(1, attempts), false)
        : node.xp,
      words: 0,
      scored: isQuiz,
    });
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      {node.passage && (
        <div className="parchment">
          <p>
            <GlossText text={node.passage} glossary={node.glossary} />
          </p>
        </div>
      )}

      <div className="prompt-block">
        <p className="prompt-en">
          <GlossText text={node.prompt} glossary={node.glossary} />
        </p>
        {node.promptEs && <p className="prompt-es">{node.promptEs}</p>}
      </div>

      <div className="option-list">
        {node.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="option"
            data-state={stateOf(option)}
            disabled={settled}
            onClick={() => select(option)}
          >
            {option.text}
          </button>
        ))}
      </div>

      {chosen?.feedback && (
        <div className="feedback" data-grade={!isQuiz ? 'perfect' : chosen.correct ? 'perfect' : 'wrong'}>
          {chosen.feedback}
        </div>
      )}

      {settled ? (
        <button type="button" className="btn btn-primary btn-block" onClick={finish}>
          Continuar
        </button>
      ) : (
        isQuiz &&
        chosen &&
        !chosen.correct && (
          <button type="button" className="btn btn-block" onClick={() => setChosen(null)}>
            Volver a intentarlo
          </button>
        )
      )}
    </div>
  );
}
