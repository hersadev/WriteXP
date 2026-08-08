import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlossText } from '@/components/GlossText';
import { WritingCard } from '@/components/nodes/WritingCard';
import { LEVELS } from '@/data/levels';
import {
  INTRO_GLOSSARY,
  INTRO_NODE,
  INTRO_PASSAGE,
  INTRO_TRANSLATION,
} from '@/data/onboarding';
import { ATTEMPT_MULTIPLIERS, REVEAL_MULTIPLIER } from '@/engine/grading';
import { REVIEW_INTERVALS_DAYS } from '@/engine/review';
import { useAuth } from '@/state/AuthContext';
import { useGame } from '@/state/GameContext';

/**
 * Introducción de primera partida.
 *
 * Quien llega de una app de botones espera tocar la respuesta, y aquí hay que
 * teclearla: si eso no se explica antes, la primera pantalla en blanco se lee
 * como una app rota. Así que la introducción no cuenta cómo se juega, se juega:
 * el segundo paso es un ejercicio de verdad, con su corrección, sus pistas y su
 * solución, sólo que sin XP en juego.
 */

interface Step {
  key: string;
  eyebrow: string;
  title: string;
  body: ReactNode;
  /** El paso se pasa solo al resolverse; no lleva botón de «Siguiente». */
  selfAdvancing?: boolean;
}

export function IntroScreen() {
  const { user } = useAuth();
  const { finishIntro } = useGame();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  function close() {
    finishIntro();
    navigate('/levels', { replace: true });
  }

  function advance() {
    if (index >= steps.length - 1) close();
    else {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const steps: Step[] = [
    {
      key: 'welcome',
      eyebrow: 'Bienvenido a Aeloria',
      title: 'Aquí se aprende escribiendo',
      body: (
        <>
          <p className="muted">
            WriteXP no es un test de opción múltiple. Para que la historia avance hay que escribir la
            frase en inglés, con su ortografía y su orden. Es más lento que pulsar un botón y es
            justo por eso que funciona: al elegir entre cuatro opciones reconoces el inglés, al
            escribirlo lo produces.
          </p>
          <p className="muted">
            Cada frase correcta da XP, la XP sube tu nivel de héroe y el nivel abre el siguiente acto.
            Nada más. No hay vidas que perder ni cuenta atrás.
          </p>
          <div className="intro-note">
            No hace falta saber inglés para empezar: el Acto I arranca en palabras sueltas.
          </div>
        </>
      ),
    },
    {
      key: 'taster',
      eyebrow: 'Paso 2 · Pruébalo',
      title: 'Escribe tu primera frase',
      selfAdvancing: true,
      body: (
        <>
          <p className="muted">
            Este ejercicio es igual que los del juego, sólo que no cuenta para nada: equivocarse aquí
            no cuesta XP. Escribe en el recuadro y pulsa <strong>Comprobar</strong>.
          </p>
          <div className="intro-exercise">
            <WritingCard node={INTRO_NODE} combo={0} onComplete={advance} />
          </div>
        </>
      ),
    },
    {
      key: 'help',
      eyebrow: 'Paso 3 · Nunca te atascas',
      title: 'Cuatro ayudas, de menos a más',
      body: (
        <>
          <p className="muted">
            Si no te sale, el juego no te deja tirado: te va abriendo ayudas cada vez más explícitas.
            Sólo la última cuesta de verdad.
          </p>
          <ol className="intro-ladder">
            <li>
              <strong>Ejemplo</strong> — el mismo tipo de frase resuelta con otro contenido. Está a la
              vista desde el principio y es gratis.
            </li>
            <li>
              <strong>Pista</strong> — te dice qué estructura hace falta, tras el primer fallo.
            </li>
            <li>
              <strong>Segunda pista</strong> — casi el esqueleto de la frase, tras el segundo.
            </li>
            <li>
              <strong>Rendirse</strong> — te enseña la solución. Es la salida de emergencia y se nota
              en la XP.
            </li>
          </ol>
          <p className="muted">
            La XP baja con cada intento, para premiar acertar a la primera sin bloquear a nadie:
          </p>
          <div className="intro-xp-row">
            {ATTEMPT_MULTIPLIERS.map((multiplier, position) => (
              <span className="intro-xp-step" key={position}>
                <b>{Math.round(multiplier * 100)}%</b>
                <span>{position === 0 ? 'a la primera' : `${position + 1}.º intento`}</span>
              </span>
            ))}
            <span className="intro-xp-step" data-tone="low">
              <b>{Math.round(REVEAL_MULTIPLIER * 100)}%</b>
              <span>rindiéndote</span>
            </span>
          </div>
        </>
      ),
    },
    {
      key: 'reading',
      eyebrow: 'Paso 4 · Leer también cuenta',
      title: 'Toca cualquier palabra marcada',
      body: (
        <>
          <p className="muted">
            Buena parte del juego es leer. En los textos narrativos, las palabras{' '}
            <strong>subrayadas</strong> se tocan para ver su traducción, y siempre hay traducción
            completa a mano. Pruébalo aquí:
          </p>
          <div className="parchment">
            <p>
              <GlossText text={INTRO_PASSAGE} glossary={INTRO_GLOSSARY} />
            </p>
          </div>
          <p className="faint" style={{ fontSize: 13.5 }}>
            {INTRO_TRANSLATION}
          </p>
        </>
      ),
    },
    {
      key: 'review',
      eyebrow: 'Paso 5 · Lo que fallas vuelve',
      title: 'El repaso te busca a ti',
      body: (
        <>
          <p className="muted">
            Cuando un ejercicio no te sale a la primera, no se queda ahí: entra en una cola y vuelve
            a aparecer días después, ya fuera de su capítulo, cuando lo tienes menos fresco. Cada vez
            que lo aciertas tarda más en volver.
          </p>
          <div className="intro-boxes">
            {REVIEW_INTERVALS_DAYS.map((days, position) => (
              <span className="intro-box" key={days}>
                <b>{days}d</b>
                <span>escalón {position + 1}</span>
              </span>
            ))}
            <span className="intro-box" data-tone="done">
              <b>✓</b>
              <span>aprendido</span>
            </span>
          </div>
          <p className="muted">
            Fallarlo lo devuelve al primer escalón. Superar el último lo saca de la cola: eso ya te lo
            sabes. Tendrás el aviso de los repasos pendientes en la pantalla de niveles.
          </p>
        </>
      ),
    },
    {
      key: 'map',
      eyebrow: 'Paso 6 · El mapa',
      title: 'Cuatro actos, una sola historia',
      body: (
        <>
          <p className="muted">
            Cada nivel del MCER es un acto de la misma historia, con tres capítulos cada uno. Puedes
            empezar por el principio o entrar directamente donde te corresponda.
          </p>
          <div className="intro-acts">
            {LEVELS.map((level) => (
              <span className="intro-act" key={level.id} style={{ ['--accent' as string]: level.accent }}>
                <b>{level.id}</b>
                <span>{level.title}</span>
                <span className="faint">{level.tagline}</span>
              </span>
            ))}
          </div>
          <p className="muted">
            Cada capítulo trae objetivos —acertar a la primera, no revelar soluciones, escribir tantas
            palabras—. Son metas, no requisitos: los que dejes pendientes se pueden conseguir
            repitiendo el capítulo.
          </p>
        </>
      ),
    },
  ];

  const step = steps[index];

  return (
    <div className="page stack intro" style={{ gap: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
        <span className="faint" style={{ fontSize: 12.5 }}>
          {index + 1}/{steps.length}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
          Saltar la introducción
        </button>
      </div>

      <div className="scene-progress" aria-label={`Paso ${index + 1} de ${steps.length}`}>
        {steps.map((item, position) => (
          <span
            key={item.key}
            data-state={position < index ? 'done' : position === index ? 'current' : 'todo'}
          />
        ))}
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <span className="eyebrow">{step.eyebrow}</span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30 }}>
          {index === 0 ? `${step.title}, ${user?.name ?? 'viajero'}` : step.title}
        </h1>
      </div>

      <div className="card intro-card stack" style={{ gap: 14 }}>
        {step.body}
      </div>

      <div className="scene-nav">
        {index > 0 ? (
          <button type="button" className="btn btn-sm" onClick={() => setIndex(index - 1)}>
            ↩ Anterior
          </button>
        ) : (
          <span />
        )}
        {/* El paso jugable no lleva «Siguiente»: se pasa resolviéndolo, que es de
            lo que trata. Quien se atasque tiene el botón de rendirse dentro. */}
        {!step.selfAdvancing && (
          <button type="button" className="btn btn-primary" onClick={advance}>
            {index === steps.length - 1 ? 'Empezar a escribir' : 'Siguiente ↪'}
          </button>
        )}
      </div>
    </div>
  );
}
