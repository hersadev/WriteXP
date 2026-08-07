import { useMemo, useState } from 'react';
import { GlossText } from '@/components/GlossText';
import { XpStake } from '@/components/XpStake';
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
  /** Cuántas pistas de la escalera se han pedido. */
  const [hintsShown, setHintsShown] = useState(0);

  const solved = result?.grade === 'perfect';
  const words = wordCount(value);
  const minWords = node.rubric?.minWords;
  const maxWords = node.rubric?.maxWords;
  const hasLimits = minWords !== undefined || maxWords !== undefined;

  /** Palabras de más sobre el máximo. Se cuenta mientras se teclea, no al enviar. */
  const overBy = maxWords !== undefined ? Math.max(0, words - maxWords) : 0;
  // Se avisa desde el 90% del máximo: da margen para cerrar la frase antes de pasarse.
  const nearMax = maxWords !== undefined && !overBy && words >= Math.ceil(maxWords * 0.9);
  const countState = overBy
    ? 'over'
    : nearMax
      ? 'near'
      : minWords !== undefined && words >= minWords
        ? 'ok'
        : undefined;

  /** La solución modelo: el texto ejemplar, la primera respuesta válida o, en último caso, la pista. */
  const model = useMemo(() => node.model ?? node.answers?.[0] ?? node.hint ?? '', [node]);

  /** Pistas de menos a más explícitas. La segunda evita tener que rendirse. */
  const hints = useMemo(
    () => [node.hint, node.hint2].filter((hint): hint is string => Boolean(hint)),
    [node],
  );

  // Se puede seguir si está perfecto, si tras dos intentos está "casi", o si se rindió.
  const canAdvance = solved || revealed || (result?.grade === 'close' && attempts >= 2);
  /** XP que se lleva quien continúe ahora mismo, con el resultado que tenga. */
  const gain = result ? computeXp(node.xp, result, Math.max(1, attempts), revealed) : 0;
  const canReveal = !solved && !revealed && attempts >= 2 && Boolean(model);
  // Cada pista nueva pide un intento más: la ayuda acompaña, no sustituye.
  const canAskHint = !solved && !revealed && hintsShown < hints.length && attempts > hintsShown;

  function submit() {
    if (!value.trim() || solved || revealed) return;
    setAttempts(attempts + 1);
    setResult(gradeWriting(node, value));
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
      usedHint: hintsShown > 0,
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

      {node.example && (
        <div className="example-box">
          <strong>Ejemplo</strong>
          <p>{node.example}</p>
        </div>
      )}

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
        {hasLimits ? (
          <span className="word-count" data-state={countState}>
            {words}
            {minWords !== undefined && ` / ${minWords}`} palabras
            {maxWords !== undefined && ` · máx. ${maxWords}`}
            {overBy > 0 && <span className="over-pill">+{overBy}</span>}
          </span>
        ) : (
          <span />
        )}
        <span className="row" style={{ gap: 8 }}>
          {combo >= 2 && <span className="combo-pill">🔥 racha ×{combo}</span>}
          {node.multiline && <span className="faint">⌘/Ctrl + Enter para enviar</span>}
        </span>
      </div>

      {/* El aviso salta mientras se escribe, no al corregir: el texto es fijo a
          propósito —lo dicta un `role="status"`— y las palabras de más se cuentan
          arriba, en el contador. */}
      {overBy > 0 && !solved && !revealed && (
        <p className="limit-warning" role="status">
          Te has pasado del máximo de {maxWords} palabras. Recorta antes de comprobar: pasarse
          cuenta como requisito incumplido y te gasta un intento.
        </p>
      )}

      <XpStake
        base={node.xp}
        attempts={attempts}
        revealed={revealed}
        earned={solved || revealed ? gain : undefined}
      />

      {!revealed &&
        hints.slice(0, hintsShown).map((hint, index) => (
          <div className="hint-box" key={index}>
            <strong>{hints.length > 1 ? `Pista ${index + 1}:` : 'Pista:'}</strong> {hint}
          </div>
        ))}

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
            <p style={{ marginTop: 10, fontFamily: 'var(--prose)', fontSize: 17 }}>«{model}»</p>
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

        {canAskHint && (
          <button type="button" className="btn btn-sm" onClick={() => setHintsShown(hintsShown + 1)}>
            {hintsShown === 0 ? 'Ver pista' : 'Ver otra pista'}
          </button>
        )}

        {canReveal && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={reveal}>
            Rendirse y ver la solución
          </button>
        )}

        {canAdvance && (
          <button type="button" className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={finish}>
            Continuar <span className={solved ? 'xp-float' : 'xp-gain'}>+{gain} XP</span>
          </button>
        )}
      </div>
    </div>
  );
}
