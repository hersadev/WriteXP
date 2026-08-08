/**
 * Simula meses de repaso espaciado sin abrir el navegador ni esperar 35 días.
 *
 * Comprueba lo que no se puede ver jugando una tarde: que fallar mete el nodo en
 * la cola, que acertarlo lo va alejando por los escalones previstos, que fallarlo
 * lo devuelve al principio y que, al final, sale de la cola y no vuelve.
 * Se ejecuta con `npm run verify`.
 */
import { CHAPTERS } from '../src/data/story';
import {
  createEmptyProgress,
  emptyRunStats,
  registerAnswer,
  registerReview,
} from '../src/engine/progress';
import {
  REVIEW_INTERVALS_DAYS,
  REVIEW_SESSION_MAX,
  dueReviews,
  nextReviewDate,
  reviewBase,
  reviewQueueSize,
  reviewSession,
} from '../src/engine/review';
import type { Progress } from '../src/types';

const failures: string[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

const DAY = 24 * 60 * 60 * 1000;
/** Un lunes cualquiera a las diez de la mañana, hora local. */
const START = new Date(2026, 0, 5, 10, 0, 0).getTime();

/** Nodos corregibles de la campaña, que son los únicos que se repasan. */
const SCORABLE = CHAPTERS.flatMap((chapter) => chapter.nodes).filter((node) =>
  ['readingCheck', 'writeWord', 'gapFill', 'writeSentence', 'writeFree'].includes(node.kind),
);

const [failed, hesitated, clean, ...rest] = SCORABLE;

console.log('WriteXP · simulación de repaso espaciado\n');

// ---------------------------------------------------------------- entrada
let progress: Progress = createEmptyProgress();
let run = emptyRunStats();

function answer(
  nodeId: string,
  grade: 'perfect' | 'close' | 'wrong',
  attempts: number,
  revealed = false,
  now = START,
): void {
  const applied = registerAnswer(
    progress,
    run,
    { nodeId, grade, attempts, revealed, usedHint: false, xp: 10, words: 5 },
    now,
  );
  progress = applied.progress;
  run = applied.run;
}

answer(clean.id, 'perfect', 1);
assert(reviewQueueSize(progress) === 0, 'Acertar a la primera no debería programar ningún repaso');

answer(failed.id, 'wrong', 3, true);
answer(hesitated.id, 'perfect', 2);
assert(reviewQueueSize(progress) === 2, 'Fallar y titubear deberían dejar dos nodos en la cola');
assert(
  dueReviews(progress, START).length === 0,
  'Un nodo fallado hoy no debería vencer hoy: el repaso es espaciado, no inmediato',
);
assert(
  dueReviews(progress, START + DAY).length === 2,
  'Los dos nodos deberían vencer al día siguiente',
);

console.log(`  Entrada    ${reviewQueueSize(progress)} nodos en la cola tras 3 respuestas`);

// ------------------------------------------------------- escalera completa
// Se acierta el nodo fallado una y otra vez, saltando al día en que vence.
let clock = START;
const seen: number[] = [];

for (let step = 0; step < REVIEW_INTERVALS_DAYS.length; step++) {
  const due = nextReviewDate(progress, clock);
  assert(due !== null, `Paso ${step + 1}: debería quedar un repaso pendiente`);
  if (!due) break;

  const waited = Math.round((due.getTime() - clock) / DAY);
  seen.push(waited);
  clock = due.getTime() + 10 * 60 * 60 * 1000; // se repasa por la mañana

  const pending = dueReviews(progress, clock).map((entry) => entry.item.nodeId);
  assert(pending.includes(failed.id), `Paso ${step + 1}: el nodo fallado debería estar vencido`);

  const applied = registerReview(
    progress,
    { nodeId: failed.id, grade: 'perfect', attempts: 1, revealed: false, xp: 4, words: 5 },
    clock,
  );
  progress = applied.progress;

  const last = step === REVIEW_INTERVALS_DAYS.length - 1;
  assert(
    applied.graduated === last,
    last
      ? 'El último acierto debería sacar el nodo de la cola'
      : `Paso ${step + 1}: el nodo no debería graduarse todavía`,
  );
}

console.log(`  Escalera   esperas de ${seen.join(', ')} días hasta salir de la cola`);
assert(
  seen.length === REVIEW_INTERVALS_DAYS.length,
  `Hacen falta ${REVIEW_INTERVALS_DAYS.length} aciertos para graduar un nodo, no ${seen.length}`,
);
assert(
  !progress.reviews[failed.id],
  'Un nodo graduado no debería seguir en la cola',
);
assert(progress.stats.reviewsGraduated === 1, 'El nodo graduado debería contarse en las stats');
assert(progress.stats.reviewsDone === REVIEW_INTERVALS_DAYS.length, 'Mal recuento de repasos hechos');
assert(progress.stats.reviewsPerfect === REVIEW_INTERVALS_DAYS.length, 'Mal recuento de aciertos');

// El repaso paga XP, y la paga aunque el nodo ya se hubiera cobrado en campaña.
assert(progress.xp > 30, 'Los repasos deberían sumar XP');
// Pero no contamina la precisión de la campaña: eso mide la primera lectura.
assert(progress.stats.answersTotal === 3, 'Los repasos no deben contar como respuestas de campaña');

// ------------------------------------------------------------ recaída
const before = progress.reviews[hesitated.id];
assert(before?.box === 0, 'El nodo titubeado debería seguir en el primer escalón');

let recaida = registerReview(
  progress,
  { nodeId: hesitated.id, grade: 'perfect', attempts: 1, revealed: false, xp: 4, words: 5 },
  clock,
);
progress = recaida.progress;
assert(recaida.box === 1, 'Acertar debería subir un escalón');

recaida = registerReview(
  progress,
  { nodeId: hesitated.id, grade: 'wrong', attempts: 2, revealed: true, xp: 0, words: 5 },
  clock,
);
progress = recaida.progress;
assert(recaida.box === 0, 'Fallar un repaso debería devolver el nodo al primer escalón');
assert(
  progress.reviews[hesitated.id].lapses === 2,
  'Una recaída debería sumar a las veces que el nodo se ha resistido',
);

// Acertar al segundo intento cuenta como «casi»: no sube, pero tampoco derrumba.
const casi = registerReview(
  progress,
  { nodeId: hesitated.id, grade: 'perfect', attempts: 2, revealed: false, xp: 2, words: 5 },
  clock,
);
assert(casi.grade === 'close', 'Recordarlo al segundo intento es recordarlo a medias');
assert(casi.box === 0, 'Un repaso «casi» deja el nodo donde estaba');
progress = casi.progress;

console.log(`  Recaída    el nodo titubeado lleva ${progress.reviews[hesitated.id].lapses} caídas`);

// ------------------------------------------------------------ tanda diaria
// Una cola grande no se sirve entera de golpe: nadie repasa cuarenta ejercicios.
for (const node of rest.slice(0, REVIEW_SESSION_MAX + 8)) {
  answer(node.id, 'wrong', 2, false, clock);
}
const tomorrow = clock + DAY;
assert(
  dueReviews(progress, tomorrow).length > REVIEW_SESSION_MAX,
  'La prueba necesita más vencimientos que el tope de sesión',
);
assert(
  reviewSession(progress, tomorrow).length === REVIEW_SESSION_MAX,
  `Una sesión no debería pasar de ${REVIEW_SESSION_MAX} ejercicios`,
);

// Y se sirve por antigüedad: primero lo que lleva más tiempo esperando.
const session = reviewSession(progress, tomorrow);
const ordered = session.every(
  (entry, index) =>
    index === 0 || Date.parse(session[index - 1].item.dueISO) <= Date.parse(entry.item.dueISO),
);
assert(ordered, 'La tanda debería empezar por lo más atrasado');

console.log(
  `  Tanda      ${reviewSession(progress, tomorrow).length} de ${dueReviews(progress, tomorrow).length} vencidos (tope ${REVIEW_SESSION_MAX})`,
);

// --------------------------------------------------------------- XP
const sample = SCORABLE.find((node) => node.xp >= 20)!;
assert(
  reviewBase(sample.xp) < sample.xp && reviewBase(sample.xp) > 0,
  'Un repaso debería pagar menos que la primera vez, pero no cero',
);
console.log(`  XP         un nodo de ${sample.xp} XP paga ${reviewBase(sample.xp)} al repasarlo`);

console.log(
  `\n  Cola final: ${reviewQueueSize(progress)} nodos · ${progress.stats.reviewsDone} repasos hechos · ` +
    `${progress.stats.reviewsGraduated} fuera de la cola`,
);

if (failures.length) {
  console.error(`\n✗ ${failures.length} fallo(s):\n`);
  for (const failure of failures) console.error(`  · ${failure}`);
  process.exit(1);
}

console.log('\n✓ El repaso espaciado programa, promociona y jubila los nodos como debe.');
