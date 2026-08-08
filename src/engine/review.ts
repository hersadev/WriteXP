/**
 * Repaso espaciado.
 *
 * El problema que resuelve: en la campaña un nodo se ve una vez. Si lo fallas,
 * cobras menos XP y no vuelves a verlo nunca, así que el error se queda contigo.
 * Aquí todo lo que no sale limpio entra en una cola y vuelve días después, fuera
 * de su capítulo, cuando ya no lo tienes fresco —que es justo cuando recordarlo
 * enseña algo.
 *
 * El algoritmo es una caja de Leitner, no un SM-2: sin factor de facilidad ni
 * autoevaluación («¿qué tal lo recordabas?»). En WriteXP la nota no la pone el
 * jugador, la pone el corrector, y con eso basta para decidir si el nodo sube de
 * escalón, se queda o vuelve al principio.
 *
 * Como el resto de `engine/`, no importa React ni lee el reloj por su cuenta:
 * `now` entra por parámetro para poder simular meses de repasos en la terminal.
 */

import { nodeById } from '@/data/story';
import type { Chapter, Grade, Progress, ReviewItem, StoryNode } from '@/types';

/**
 * Días hasta el siguiente repaso según el escalón. Superar el último saca el
 * nodo de la cola: más de un mes acertándolo ya no es algo que estés fallando.
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 16, 35];

/**
 * Cuántos nodos entran como mucho en una sesión. Una cola de cuarenta ejercicios
 * no se repasa: se abandona.
 */
export const REVIEW_SESSION_MAX = 12;

/**
 * Lo que paga un repaso frente a ver el nodo por primera vez. Es menos porque la
 * XP del nodo ya se cobró en la campaña, pero no es cero: repasar es trabajo, y
 * un repaso que no da nada no lo hace nadie.
 */
export const REVIEW_MULTIPLIER = 0.35;

/** Sólo se repasa lo que se corrige: la narrativa y las decisiones no se fallan. */
const REVIEWABLE_KINDS = new Set(['readingCheck', 'writeWord', 'gapFill', 'writeSentence', 'writeFree']);

export function isReviewable(node: StoryNode): boolean {
  return REVIEWABLE_KINDS.has(node.kind);
}

/** Lo que hace falta saber de una respuesta para decidir si el nodo vuelve. */
export interface ReviewTrigger {
  grade: Grade;
  attempts: number;
  revealed: boolean;
}

/**
 * ¿Vuelve este nodo? Vuelve si no salió a la primera y limpio. Acertar en el
 * segundo intento cuenta como fallo a estos efectos: significa que la primera
 * forma que te salió era la equivocada, y eso es exactamente lo que hay que
 * desaprender.
 */
export function needsReview(trigger: ReviewTrigger): boolean {
  return trigger.revealed || trigger.grade !== 'perfect' || trigger.attempts > 1;
}

/**
 * Nota con la que un repaso mueve el nodo de escalón. Es más estricta que la del
 * corrector: en un repaso lo que se mide es si lo recordabas, y recordarlo al
 * segundo intento es recordarlo a medias.
 */
export function reviewGrade(trigger: ReviewTrigger): Grade {
  if (trigger.revealed || trigger.grade === 'wrong') return 'wrong';
  if (trigger.grade === 'perfect' && trigger.attempts === 1) return 'perfect';
  return 'close';
}

/**
 * Cuándo vence un nodo que acaba de quedarse en `box`.
 *
 * Vence al empezar el día, no a la hora exacta en que se respondió: quien falla
 * un martes por la noche y vuelve el miércoles después de comer tiene su repaso
 * esperándole, en vez de que le falten cuatro horas.
 */
function dueAfter(box: number, now: number): string {
  const days = REVIEW_INTERVALS_DAYS[Math.min(box, REVIEW_INTERVALS_DAYS.length - 1)];
  const date = new Date(now);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days).toISOString();
}

/** Mete el nodo en la cola (o lo devuelve al primer escalón) tras un fallo. */
export function scheduleReview(
  reviews: Record<string, ReviewItem>,
  nodeId: string,
  grade: Grade,
  now: number = Date.now(),
): Record<string, ReviewItem> {
  const existing = reviews[nodeId];
  return {
    ...reviews,
    [nodeId]: {
      nodeId,
      box: 0,
      dueISO: dueAfter(0, now),
      // Un nodo que ya había caído y vuelve a caer se cuenta dos veces: eso es
      // lo que lo distingue del que fallaste una tarde y nunca más.
      lapses: (existing?.lapses ?? 0) + 1,
      reviews: existing?.reviews ?? 0,
      lastGrade: grade,
    },
  };
}

export interface ReviewOutcome {
  reviews: Record<string, ReviewItem>;
  /** El nodo ha superado el último escalón y sale de la cola. */
  graduated: boolean;
  /** Escalón en el que queda, o null si ha salido. */
  box: number | null;
}

/**
 * Aplica el resultado de un repaso: perfecto sube un escalón, «casi» lo deja
 * donde estaba y reprograma, y fallar lo devuelve al principio.
 */
export function applyReview(
  reviews: Record<string, ReviewItem>,
  nodeId: string,
  grade: Grade,
  now: number = Date.now(),
): ReviewOutcome {
  const item = reviews[nodeId];
  // Repasar algo que no estaba en la cola no es un error que deba romper nada:
  // simplemente no hay escalón que mover.
  if (!item) return { reviews, graduated: false, box: null };

  const next = { ...reviews };

  if (grade === 'perfect') {
    const box = item.box + 1;
    if (box >= REVIEW_INTERVALS_DAYS.length) {
      delete next[nodeId];
      return { reviews: next, graduated: true, box: null };
    }
    next[nodeId] = { ...item, box, dueISO: dueAfter(box, now), reviews: item.reviews + 1, lastGrade: grade };
    return { reviews: next, graduated: false, box };
  }

  if (grade === 'close') {
    next[nodeId] = {
      ...item,
      dueISO: dueAfter(item.box, now),
      reviews: item.reviews + 1,
      lastGrade: grade,
    };
    return { reviews: next, graduated: false, box: item.box };
  }

  next[nodeId] = {
    ...item,
    box: 0,
    dueISO: dueAfter(0, now),
    lapses: item.lapses + 1,
    reviews: item.reviews + 1,
    lastGrade: grade,
  };
  return { reviews: next, graduated: false, box: 0 };
}

export interface DueReview {
  item: ReviewItem;
  node: StoryNode;
  chapter: Chapter;
}

/**
 * Nodos que tocan hoy, del más atrasado al más reciente. Los ids que ya no
 * existen en la campaña (contenido retirado entre versiones) se descartan en vez
 * de reventar la pantalla.
 */
export function dueReviews(progress: Progress, now: number = Date.now()): DueReview[] {
  return Object.values(progress.reviews ?? {})
    .filter((item) => Date.parse(item.dueISO) <= now)
    .map((item): DueReview | null => {
      const found = nodeById(item.nodeId);
      if (!found || !isReviewable(found.node)) return null;
      return { item, node: found.node, chapter: found.chapter };
    })
    .filter((entry): entry is DueReview => entry !== null)
    .sort(
      (a, b) => Date.parse(a.item.dueISO) - Date.parse(b.item.dueISO) || a.item.box - b.item.box,
    );
}

/** La tanda de hoy: lo que vence, recortado a lo que se puede repasar de una sentada. */
export function reviewSession(progress: Progress, now: number = Date.now()): DueReview[] {
  return dueReviews(progress, now).slice(0, REVIEW_SESSION_MAX);
}

/** Cuántos nodos hay en la cola en total, venzan hoy o no. */
export function reviewQueueSize(progress: Progress): number {
  return Object.keys(progress.reviews ?? {}).length;
}

/** Cuándo toca el siguiente repaso, o null si la cola está vacía. */
export function nextReviewDate(progress: Progress, now: number = Date.now()): Date | null {
  const pending = Object.values(progress.reviews ?? {})
    .map((item) => Date.parse(item.dueISO))
    .filter((time) => time > now)
    .sort((a, b) => a - b);
  return pending.length ? new Date(pending[0]) : null;
}

/**
 * XP en juego al repasar un nodo. Se escala aquí, en la base, y no al final:
 * así el número que anuncia la tarjeta antes de responder es exactamente el que
 * se cobra después, con las mismas penalizaciones por intento de siempre.
 */
export function reviewBase(nodeXp: number): number {
  return Math.max(1, Math.round(nodeXp * REVIEW_MULTIPLIER));
}
