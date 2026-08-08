import { createEmptyProgress } from '@/engine/progress';
import type { Progress } from '@/types';

const PREFIX = 'writexp.progress.';
const VERSION = 1;

interface Envelope {
  version: number;
  progress: Progress;
}

/** El progreso se guarda por usuario, para que dos cuentas no se pisen. */
export function loadProgress(userId: string): Progress {
  try {
    const raw = localStorage.getItem(PREFIX + userId);
    if (!raw) return createEmptyProgress();

    const envelope = JSON.parse(raw) as Envelope;
    if (envelope.version !== VERSION) return createEmptyProgress();

    // Rellena campos que puedan faltar si el guardado viene de una build anterior.
    const base = createEmptyProgress();
    const progress: Progress = {
      ...base,
      ...envelope.progress,
      stats: { ...base.stats, ...envelope.progress.stats },
    };

    // Quien ya venía jugando antes de que existiera la introducción no necesita
    // que se la enseñen: lo que explica ya lo ha aprendido a base de jugarlo.
    if (!progress.onboardedAt && progress.stats.answersTotal > 0) {
      progress.onboardedAt = progress.stats.lastPlayedISO ?? new Date().toISOString();
    }

    return progress;
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(userId: string, progress: Progress): void {
  try {
    localStorage.setItem(PREFIX + userId, JSON.stringify({ version: VERSION, progress } satisfies Envelope));
  } catch {
    // Cuota llena o modo privado: el juego sigue, sólo se pierde el guardado.
  }
}

export function resetProgress(userId: string): void {
  localStorage.removeItem(PREFIX + userId);
}
