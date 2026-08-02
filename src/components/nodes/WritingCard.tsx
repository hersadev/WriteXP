import { useMemo, useState } from 'react';
import { GlossText } from '@/components/GlossText';
import { computeXp, gradeWriting, type GradeResult } from '@/engine/grading';
import type { AnswerRecord } from '@/engine/progress';
import { wordCount } from '@/engine/text';
import type { WritingNode } from '@/types';

const GRADE_TITLE: Record<GradeResult['grade'], string> = {
  perfect: '✓ Perfecto',
  close: '≈ Casi',
  wrong: '✗ Todavía no',
};

export function WritingCard({
  node,
  combo,
  onComplete,
}: {
  node: WritingNode;
  combo: number;
  onComplete: (record: AnswerRecord) => void;
}) {
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const solved = result?.grade === 'perfect';
  const words = wordCount(value);
  const minWords = node.rubric?.minWords;

  /** La solución modelo: el texto ejemplar, la primera respuesta válida o, en último caso, la pista. */
  const model = useMemo(() => node.model ?? node.answers?.[0] ?? node.hint ?? '', [node]);

  // Se puede seguir si está perfecto, si tras dos intentos está "casi", o si se rindió.
  const canAdvance = solved || revealed || (result?.grade === 'close' && attempts >= 2);
  const canReveal = !solved && !revealed && attempts >= 2 && Boolean(model);

  function submit() {
    if (!value.trim() || solved || revealed) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setResult(gradeWriting(node, value));
    if (!showHint && nextAttempts >= 1) setShowHint(false);
  }

  function reveal() {
    setRevealed(true);
    setResult({ grade: 'wrong', ratio: 0, notes: ['Estudia la solución y sigue: la verás otra vez más adelante.'], model });
  }

  function finish() {
    const graded = result ?? { grade: 'wrong' as const, ratio: 0, notes: [] };
    onComplete({
      nodeId: node.id,
      grade: revealed ? 'wrong' : graded.grade,
      attempts: Math.max(1, attempts),
      revealed,
      usedHint: showHint,
      xp: computeXp(node.xp, graded, Math.max(1, attempts), revealed),
      words,
    });
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="prompt-block">
        <p className="prompt-en">
          <GlossText text={node.prompt} glossary={node.glossary} />
        </p>
        {node.promptEs && <p className="prompt-es">{node.promptEs}</p>}
      </div>

      {node.multiline ? (
        <textarea
          className="textarea"
          value={value}
          placeholder={node.placeholder ?? 'Escribe en inglés…'}
          disabled={solved || revealed}
          spellCheck={false}
          autoFocus
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit();
          }}
        />
      ) : (
        <input
          className="input"
          value={value}
          placeholder={node.placeholder ?? 'Escribe en inglés…'}
          disabled={solved || revealed}
          spellCheck={false}
          autoFocus
          autoComplete="off"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
        />
      )}

      <div className="writer-meta">
        <span>
          {minWords !== undefined ? (
            <>
              {words} / {minWords} palabras{node.rubric?.maxWords ? ` (máx. ${node.rubric.maxWords})` : ''}
            </>
          ) : (
            <>Vale {node.xp} XP · intento {Math.max(1, attempts)}</>
          )}
        </span>
        <span className="row" style={{ gap: 8 }}>
          {combo >= 2 && <span className="combo-pill">🔥 racha ×{combo}</span>}
          {node.multiline && <span className="faint">⌘/Ctrl + Enter para enviar</span>}
        </span>
      </div>

      {showHint && node.hint && !revealed && (
        <div className="hint-box">
          <strong>Pista:</strong> {node.hint}
        </div>
      )}

      {result && (
        <div className="feedback" data-grade={revealed ? 'wrong' : result.grade}>
          <strong>{revealed ? '📖 Solución' : GRADE_TITLE[result.grade]}</strong>
          {result.notes.length > 0 && (
            <ul>
              {result.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}

          {result.checklist && result.checklist.length > 0 && (
            <div className="checklist">
              {result.checklist.map((item, index) => (
                <span className="check-item" key={index} data-met={item.met}>
                  <span>{item.met ? '✓' : '○'}</span>
                  {item.label}
                </span>
              ))}
            </div>
          )}

          {revealed && model && (
            <p style={{ marginTop: 10, fontFamily: 'var(--serif)', fontSize: 16 }}>«{model}»</p>
          )}
        </div>
      )}

      {solved && node.success && (
        <div className="parchment">
          <p>{node.success}</p>
        </div>
      )}

      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        {!solved && !revealed && (
          <button type="button" className="btn btn-primary" onClick={submit} disabled={!value.trim()}>
            Comprobar
          </button>
        )}

        {!solved && !revealed && node.hint && attempts >= 1 && !showHint && (
          <button type="button" className="btn btn-sm" onClick={() => setShowHint(true)}>
            Ver pista (−30% XP)
          </button>
        )}

        {canReveal && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={reveal}>
            Rendirse y ver la solución
          </button>
        )}

        {canAdvance && (
          <button type="button" className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={finish}>
            Continuar {solved && <span className="xp-float">+{computeXp(node.xp, result!, Math.max(1, attempts), false)} XP</span>}
          </button>
        )}
      </div>
    </div>
  );
}
