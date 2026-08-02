import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { DEMO_CREDENTIALS } from '@/services/auth';
import { useAuth } from '@/state/AuthContext';

type Mode = 'signin' | 'signup';

export function LoginScreen() {
  const { user, ready, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Navigate to="/levels" replace />;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      navigate('/levels');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Algo ha ido mal. Inténtalo otra vez.');
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }
    void run(() => (mode === 'signin' ? signIn(email, password) : signUp(name, email, password)));
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card stack" style={{ gap: 22 }}>
        <div className="stack" style={{ gap: 6 }}>
          <span className="eyebrow">Aprende inglés escribiendo</span>
          <h1 className="auth-logo">WriteXP</h1>
          <p className="muted" style={{ fontSize: 14.5 }}>
            Una aventura por escrito del <strong>A1</strong> al <strong>B2</strong>. Aquí no se pulsan botones de
            opción múltiple: se escribe. Cada frase correcta te da XP y abre el siguiente capítulo.
          </p>
        </div>

        <div className="auth-tabs">
          <button type="button" data-active={mode === 'signin'} onClick={() => setMode('signin')}>
            Entrar
          </button>
          <button type="button" data-active={mode === 'signup'} onClick={() => setMode('signup')}>
            Crear cuenta
          </button>
        </div>

        <form className="stack" style={{ gap: 14 }} onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Nombre de héroe</label>
              <input
                id="name"
                className="input"
                value={name}
                placeholder="Cómo quieres que te llamen"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="tu@correo.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              placeholder="Mínimo 6 caracteres"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Un momento…' : mode === 'signin' ? 'Entrar en Aeloria' : 'Empezar la aventura'}
          </button>
        </form>

        <div className="stack" style={{ gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button
            type="button"
            className="btn btn-block btn-sm"
            disabled={busy}
            onClick={() => void run(() => signIn(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password))}
          >
            Entrar con la cuenta de prueba
          </button>
          <p className="faint" style={{ fontSize: 12, textAlign: 'center' }}>
            Prototipo: las cuentas y el progreso se guardan sólo en este navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
