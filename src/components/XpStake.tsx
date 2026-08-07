import { ATTEMPT_MULTIPLIERS, REVEAL_MULTIPLIER, attemptMultiplier } from '@/engine/grading';

function percent(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`;
}

/**
 * Escala de XP por intentos, a la vista.
 *
 * La penalización ya existía —100% a la primera, 70% a la segunda, 45% de ahí
 * en adelante— pero sólo se notaba al cobrar. Aquí se enseña antes de enviar:
 * cuánto vale el nodo ahora mismo y en qué peldaño de la escalera se está, para
 * que reintentar sea una decisión y no una sorpresa.
 */
export function XpStake({
  base,
  attempts,
  revealed = false,
  earned,
}: {
  base: number;
  attempts: number;
  revealed?: boolean;
  /** XP definitiva. Sólo cuando el nodo ya está cerrado: resuelto o rendido. */
  earned?: number;
}) {
  const settled = earned !== undefined;
  // Sin cerrar, lo que importa es el intento que viene; ya cerrado, el que valió.
  const step = Math.min(settled ? Math.max(attempts, 1) : attempts + 1, ATTEMPT_MULTIPLIERS.length);
  const multiplier = revealed ? REVEAL_MULTIPLIER : attemptMultiplier(step);
  const value = earned ?? Math.round(base * multiplier);

  const label = revealed ? 'Solución vista' : settled ? 'Ganas' : 'En juego';
  const state = revealed ? 'revealed' : settled ? 'settled' : step > 1 ? 'reduced' : 'full';

  const caption = revealed
    ? `Solución vista: ${value} XP de ${base}, el ${percent(REVEAL_MULTIPLIER)} del nodo.`
    : `${label}: ${value} XP de ${base}. Intento ${step}, el ${percent(multiplier)} de la escala ${ATTEMPT_MULTIPLIERS.map(percent).join(' → ')}.`;

  return (
    <div className="xp-stake" data-state={state}>
      {/* Lo visible se lee mal en voz alta (tachados, flechas): se narra aparte,
          y en un `role="status"` para que la bajada de XP se anuncie sola. */}
      <span className="sr-only" role="status">
        {caption}
      </span>

      <span aria-hidden="true" className="xp-stake-label">
        {label}
      </span>
      {/* La `key` remonta el valor al cambiar de peldaño: así el descuento parpadea. */}
      <strong aria-hidden="true" className="xp-stake-value" key={`${step}-${state}`}>
        {value} XP
      </strong>
      {value < base && (
        <span aria-hidden="true" className="xp-stake-base">
          de {base}
        </span>
      )}

      <span aria-hidden="true" className="xp-ladder">
        {ATTEMPT_MULTIPLIERS.map((multiplierOfStep, index) => (
          <span
            key={index}
            className="xp-step"
            data-state={
              revealed || index + 1 < step ? 'spent' : index + 1 === step ? 'active' : 'ahead'
            }
          >
            {percent(multiplierOfStep)}
          </span>
        ))}
        {revealed && (
          <span className="xp-step" data-state="active">
            {percent(REVEAL_MULTIPLIER)}
          </span>
        )}
      </span>
    </div>
  );
}
