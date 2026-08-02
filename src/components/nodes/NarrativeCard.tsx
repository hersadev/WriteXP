import { useState } from 'react';
import { GlossText } from '@/components/GlossText';
import type { AnswerRecord } from '@/engine/progress';
import type { NarrativeNode } from '@/types';

export function NarrativeCard({
  node,
  onComplete,
}: {
  node: NarrativeNode;
  onComplete: (record: AnswerRecord) => void;
}) {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="parchment">
        {node.speaker && <span className="speaker">{node.speaker}</span>}
        <p>
          <GlossText text={node.text} glossary={node.glossary} />
        </p>
        {showTranslation && node.translation && <p className="translation">{node.translation}</p>}
      </div>

      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        {node.translation && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTranslation((v) => !v)}>
            {showTranslation ? 'Ocultar traducción' : 'Ver traducción'}
          </button>
        )}
        <span className="faint" style={{ fontSize: 12.5, marginLeft: 'auto' }}>
          Toca las palabras subrayadas para traducirlas
        </span>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={() =>
          onComplete({
            nodeId: node.id,
            grade: 'perfect',
            attempts: 1,
            revealed: false,
            usedHint: showTranslation,
            xp: node.xp,
            words: 0,
            scored: false,
          })
        }
      >
        Continuar
      </button>
    </div>
  );
}
