import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { useGame } from '@/state/GameContext';

/** Cuánto sigue encendida la cadena de XP después de cerrarse el pregón. */
const AFTERGLOW_MS = 2600;

export function HeroBar() {
  const { user, signOut } = useAuth();
  const { hero, progress, levelUp, due } = useGame();
  const navigate = useNavigate();

  // La cadena se enciende al *cerrarse* el pregón, no mientras se muestra: el
  // velo del aviso tapa la barra, y encenderla debajo no la vería nadie.
  const [afterglow, setAfterglow] = useState(false);
  const announced = useRef(false);
  const eventId = levelUp?.id ?? null;

  useEffect(() => {
    if (eventId !== null) {
      announced.current = true;
      return;
    }
    if (!announced.current) return;
    announced.current = false;
    setAfterglow(true);
    const timer = window.setTimeout(() => setAfterglow(false), AFTERGLOW_MS);
    return () => window.clearTimeout(timer);
  }, [eventId]);

  if (!user) return null;

  return (
    <header className={afterglow ? 'herobar is-levelup' : 'herobar'}>
      <div className="herobar-inner">
        <Link to="/levels" className="brand">
          WriteXP
        </Link>

        <div className="hero-meta">
          <div className="hero-line">
            <span className="hero-title">
              Nv. {hero.level} · {hero.title}
            </span>
            <span className="faint">
              {hero.current}/{hero.needed} XP
            </span>
          </div>
          <div className="xpbar" role="progressbar" aria-valuenow={Math.round(hero.ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${Math.min(100, hero.ratio * 100)}%` }} />
          </div>
        </div>

        <div className="herobar-actions">
          {progress.stats.streakDays > 0 && (
            <span className="streak" title="Días seguidos escribiendo">
              🔥 {progress.stats.streakDays}
            </span>
          )}
          {due.length > 0 && (
            <Link
              to="/review"
              className="btn btn-ghost btn-sm review-pill"
              title={`${due.length} ${due.length === 1 ? 'repaso pendiente' : 'repasos pendientes'}`}
            >
              ↻ <span className="review-pill-count">{due.length}</span>
            </Link>
          )}
          <Link to="/achievements" className="btn btn-ghost btn-sm" title="Logros">
            🏅
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Cerrar sesión"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            ⎋
          </button>
        </div>
      </div>
    </header>
  );
}
