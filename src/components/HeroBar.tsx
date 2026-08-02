import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { useGame } from '@/state/GameContext';

export function HeroBar() {
  const { user, signOut } = useAuth();
  const { hero, progress } = useGame();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="herobar">
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
