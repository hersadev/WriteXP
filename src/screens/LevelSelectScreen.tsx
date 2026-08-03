import { useNavigate } from 'react-router-dom';
import { LEVELS } from '@/data/levels';
import { chaptersByLevel } from '@/data/story';
import { isLevelUnlocked, levelCompletion } from '@/engine/progress';
import { useAuth } from '@/state/AuthContext';
import { useGame } from '@/state/GameContext';
import type { LevelDef } from '@/types';

export function LevelSelectScreen() {
  const { user } = useAuth();
  const { progress, hero, chooseLevel, forceUnlock } = useGame();
  const navigate = useNavigate();

  function enter(level: LevelDef) {
    chooseLevel(level.id);
    navigate(`/level/${level.id}`);
  }

  return (
    <div className="page stack" style={{ gap: 26 }}>
      <div className="stack" style={{ gap: 8 }}>
        <span className="eyebrow">Capítulo de tu historia</span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34 }}>
          ¿Qué quieres aprender hoy, {user?.name ?? 'viajero'}?
        </h1>
        <p className="muted" style={{ maxWidth: 620 }}>
          Cada nivel del MCER es un acto de la misma historia. Puedes seguir el orden o entrar directamente
          donde te corresponda: nadie te obliga a empezar por el principio si ya sabes escribir.
        </p>
      </div>

      <div className="level-grid">
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(progress, level.id);
          const { done, total } = levelCompletion(progress, level.id);
          const chapters = chaptersByLevel(level.id);
          const finished = done === total && total > 0;

          return (
            <div
              key={level.id}
              className={`card level-card${unlocked ? '' : ' is-locked'}`}
              style={{ ['--accent' as string]: level.accent }}
            >
              <div className="level-head">
                <div className="stack" style={{ gap: 2 }}>
                  <span className="eyebrow">{level.act}</span>
                  <span className="level-code">{level.id}</span>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 21 }}>{level.title}</h2>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {level.tagline}
                  </span>
                </div>
                <span className="level-sigil">{finished ? '♔' : level.sigil}</span>
              </div>

              <p className="muted" style={{ fontSize: 14 }}>
                {level.description}
              </p>

              <div className="chip-row">
                {level.grammarFocus.slice(0, 3).map((item) => (
                  <span className="chip" key={item}>
                    {item}
                  </span>
                ))}
                <span className="chip">{chapters.length} capítulos</span>
              </div>

              <div className="progress-line">
                <div className="progress-track">
                  <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                </div>
                <span>
                  {done}/{total}
                </span>
              </div>

              {unlocked ? (
                <button type="button" className="btn btn-primary btn-block" onClick={() => enter(level)}>
                  {done === 0 ? 'Empezar acto' : finished ? 'Repasar acto' : 'Continuar'}
                </button>
              ) : (
                <div className="lock-note">
                  <span>
                    🔒 Recomendado a partir del nivel {level.recommendedHeroLevel} (vas por el {hero.level}).
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => {
                      forceUnlock(level.id);
                      enter(level);
                    }}
                  >
                    Entrar igual
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
