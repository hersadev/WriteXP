import { useEffect } from 'react';
import { useGame } from '@/state/GameContext';

/**
 * Chispas de pan de oro que salen despedidas del sello. Las posiciones se
 * calculan una sola vez y sin azar: si cambiaran entre renders, la ráfaga
 * daría un salto a mitad de vuelo.
 */
const SPARKS = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 3) * 0.3;
  const reach = 120 + (i % 5) * 46;
  return {
    x: Math.round(Math.cos(angle) * reach),
    y: Math.round(Math.sin(angle) * reach * 0.8),
    delay: (i % 7) * 0.055,
    size: 5 + (i % 4) * 2.5,
  };
});

/** Se va sola por si el jugador ha soltado el teclado; también se cierra al tocar. */
const AUTO_DISMISS_MS = 5200;

/** Pregón de ascenso: sello de lacre, rayos de oro y lluvia de chispas. */
export function LevelUpCelebration() {
  const { levelUp, dismissLevelUp } = useGame();
  const eventId = levelUp?.id ?? null;

  useEffect(() => {
    if (eventId === null) return;

    const timer = window.setTimeout(dismissLevelUp, AUTO_DISMISS_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissLevelUp();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [eventId, dismissLevelUp]);

  if (!levelUp) return null;

  return (
    <div
      key={levelUp.id}
      className="levelup"
      role="status"
      aria-live="assertive"
      onClick={dismissLevelUp}
    >
      <span className="levelup-rays" aria-hidden="true" />

      <span className="levelup-sparks" aria-hidden="true">
        {SPARKS.map((spark, i) => (
          <span
            key={i}
            className="levelup-spark"
            style={
              {
                '--x': `${spark.x}px`,
                '--y': `${spark.y}px`,
                '--delay': `${spark.delay}s`,
                '--size': `${spark.size}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>

      <div className="levelup-plaque" onClick={(event) => event.stopPropagation()}>
        <span className="levelup-seal" aria-hidden="true">
          {levelUp.level}
        </span>
        <span className="eyebrow levelup-line" style={{ '--d': '0.34s' } as React.CSSProperties}>
          Ascenso de rango
        </span>
        <strong className="levelup-name levelup-line" style={{ '--d': '0.42s' } as React.CSSProperties}>
          {levelUp.title}
        </strong>
        <span className="levelup-rank levelup-line" style={{ '--d': '0.5s' } as React.CSSProperties}>
          Nivel {levelUp.level}
        </span>
        <button
          type="button"
          className="btn btn-primary levelup-line"
          style={{ '--d': '0.58s' } as React.CSSProperties}
          onClick={dismissLevelUp}
        >
          Seguir escribiendo
        </button>
      </div>
    </div>
  );
}
