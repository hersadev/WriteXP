import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ACHIEVEMENTS } from '@/data/achievements';
import { LEVELS } from '@/data/levels';
import { levelCompletion } from '@/engine/progress';
import { useGame } from '@/state/GameContext';

export function AchievementsScreen() {
  const { progress, hero, resetAll } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);

  const unlockedCount = Object.keys(progress.achievements).length;
  const accuracy = progress.stats.answersTotal
    ? Math.round((progress.stats.answersPerfect / progress.stats.answersTotal) * 100)
    : 0;

  return (
    <div className="page stack" style={{ gap: 26 }}>
      <div className="stack" style={{ gap: 8 }}>
        <Link to="/levels" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginLeft: -14 }}>
          ← Todos los niveles
        </Link>
        <span className="eyebrow">Hoja de personaje</span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32 }}>
          Nivel {hero.level} · {hero.title}
        </h1>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <b>{progress.xp}</b>
          <span>XP total</span>
        </div>
        <div className="stat">
          <b>{progress.stats.wordsWritten}</b>
          <span>Palabras escritas</span>
        </div>
        <div className="stat">
          <b>{accuracy}%</b>
          <span>Precisión</span>
        </div>
        <div className="stat">
          <b>×{progress.stats.maxCombo}</b>
          <span>Mejor racha</span>
        </div>
        <div className="stat">
          <b>{progress.stats.streakDays}</b>
          <span>Días seguidos</span>
        </div>
        <div className="stat">
          <b>{progress.stats.chaptersCompleted}</b>
          <span>Capítulos</span>
        </div>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        <h2 style={{ fontSize: 19 }}>Progreso por nivel</h2>
        <div className="stack" style={{ gap: 10 }}>
          {LEVELS.map((level) => {
            const { done, total } = levelCompletion(progress, level.id);
            return (
              <div key={level.id} className="progress-line" style={{ ['--accent' as string]: level.accent }}>
                <strong style={{ width: 34, color: level.accent }}>{level.id}</strong>
                <div className="progress-track">
                  <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                </div>
                <span style={{ width: 42, textAlign: 'right' }}>
                  {done}/{total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        <h2 style={{ fontSize: 19 }}>
          Logros <span className="faint">({unlockedCount}/{ACHIEVEMENTS.length})</span>
        </h2>
        <div className="achievement-grid">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = Boolean(progress.achievements[achievement.id]);
            const secret = achievement.hidden && !unlocked;
            return (
              <div
                key={achievement.id}
                className={`card achievement ${unlocked ? 'is-unlocked' : 'is-locked'}`}
              >
                <span className="achievement-sigil">{secret ? '❔' : achievement.sigil}</span>
                <span className="stack" style={{ gap: 3 }}>
                  <strong style={{ fontSize: 15 }}>{secret ? 'Logro secreto' : achievement.title}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {secret ? 'Sigue jugando para descubrirlo.' : achievement.description}
                  </span>
                  <span className="faint" style={{ fontSize: 12 }}>
                    +{achievement.xp} XP
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span className="muted" style={{ fontSize: 13.5 }}>
            Borrar el progreso reinicia XP, capítulos y logros de esta cuenta.
          </span>
          {confirmReset ? (
            <span className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                }}
                style={{ borderColor: 'var(--bad)', color: 'var(--bad)' }}
              >
                Sí, borrar todo
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
            </span>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(true)}>
              Reiniciar progreso
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
