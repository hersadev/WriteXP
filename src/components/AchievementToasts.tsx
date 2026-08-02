import { useEffect, useRef } from 'react';
import { achievementById } from '@/data/achievements';
import { useGame } from '@/state/GameContext';

/** Como mucho tres a la vez: al cerrar un capítulo pueden caer cuatro o cinco de golpe. */
const MAX_VISIBLE = 3;

/** Avisos de logro desbloqueado; se van solos sin tapar los botones de la pantalla. */
export function AchievementToasts() {
  const { pendingAchievements, dismissAchievement } = useGame();
  // Cada logro se programa una sola vez; si no, al descartar uno se reiniciaría
  // la cuenta atrás de los demás y la pila tardaría un minuto en despejarse.
  const scheduled = useRef(new Set<string>());

  useEffect(() => {
    pendingAchievements.forEach((id, position) => {
      if (scheduled.current.has(id)) return;
      scheduled.current.add(id);
      setTimeout(() => dismissAchievement(id), 4500 + position * 600);
    });
  }, [pendingAchievements, dismissAchievement]);

  if (!pendingAchievements.length) return null;

  const visible = pendingAchievements.slice(0, MAX_VISIBLE);
  const queued = pendingAchievements.length - visible.length;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {visible.map((id) => {
        const achievement = achievementById(id);
        if (!achievement) return null;
        return (
          <button type="button" key={id} className="toast" onClick={() => dismissAchievement(id)}>
            <span className="achievement-sigil">{achievement.sigil}</span>
            <span className="stack" style={{ gap: 2, textAlign: 'left' }}>
              <span className="eyebrow">Logro desbloqueado</span>
              <strong>{achievement.title}</strong>
              <span className="muted" style={{ fontSize: 13 }}>
                {achievement.description} · +{achievement.xp} XP
              </span>
            </span>
          </button>
        );
      })}
      {queued > 0 && (
        <span className="faint" style={{ fontSize: 12, textAlign: 'right' }}>
          y {queued} logro{queued > 1 ? 's' : ''} más…
        </span>
      )}
    </div>
  );
}
