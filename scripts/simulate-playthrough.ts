/**
 * Simula una campaña entera respondiendo con la solución modelo.
 * Sirve para comprobar el bucle de juego sin abrir el navegador: XP, objetivos,
 * desbloqueo de niveles y logros. Se ejecuta con `npm run verify`.
 */
import { ACHIEVEMENTS } from '../src/data/achievements';
import { LEVELS } from '../src/data/levels';
import { CHAPTERS, chapterMaxXp } from '../src/data/story';
import { computeXp, gradeWriting } from '../src/engine/grading';
import {
  completeChapter,
  createEmptyProgress,
  emptyRunStats,
  isLevelUnlocked,
  registerAnswer,
  touchStreak,
} from '../src/engine/progress';
import { wordCount } from '../src/engine/text';
import { heroLevelInfo } from '../src/engine/xp';
import type { Progress, WritingNode } from '../src/types';

const failures: string[] = [];
const WRITING_KINDS = ['writeWord', 'gapFill', 'writeSentence', 'writeFree'];

function assert(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

let progress: Progress = touchStreak(createEmptyProgress());

assert(isLevelUnlocked(progress, 'A1'), 'A1 debería estar abierto desde el principio');
assert(!isLevelUnlocked(progress, 'A2'), 'A2 no debería estar abierto con 0 XP');
assert(!isLevelUnlocked(progress, 'B2'), 'B2 no debería estar abierto con 0 XP');

console.log('WriteXP · simulación de campaña (jugador perfecto)\n');

for (const chapter of CHAPTERS) {
  let run = emptyRunStats();

  for (const node of chapter.nodes) {
    if (WRITING_KINDS.includes(node.kind)) {
      const writing = node as WritingNode;
      // Nunca la pista: está en español y contarla como respuesta falsea las palabras escritas.
      const answer = writing.model ?? writing.answers?.[0] ?? '';
      assert(Boolean(answer), `${writing.id}: no hay respuesta modelo con la que jugar`);
      const graded = gradeWriting(writing, answer);

      assert(
        graded.grade === 'perfect',
        `${writing.id}: un jugador perfecto no debería sacar "${graded.grade}"`,
      );

      const applied = registerAnswer(progress, run, {
        nodeId: writing.id,
        grade: graded.grade,
        attempts: 1,
        revealed: false,
        usedHint: false,
        xp: computeXp(writing.xp, graded, 1, false),
        words: wordCount(answer),
      });
      progress = applied.progress;
      run = applied.run;
      continue;
    }

    const isQuiz = node.kind === 'readingCheck';
    const applied = registerAnswer(progress, run, {
      nodeId: node.id,
      grade: 'perfect',
      attempts: 1,
      revealed: false,
      usedHint: false,
      xp: node.xp,
      words: 0,
      scored: isQuiz,
    });
    progress = applied.progress;
    run = applied.run;
  }

  const outcome = completeChapter(progress, chapter, run);
  progress = outcome.progress;

  const missed = chapter.goals.filter((goal) => !outcome.goalsMet.some((met) => met.id === goal.id));
  assert(
    missed.length === 0,
    `${chapter.id}: un jugador perfecto no alcanza ${missed.map((goal) => `"${goal.label}"`).join(', ')}`,
  );

  const hero = heroLevelInfo(progress.xp);
  console.log(
    `  ${chapter.id.padEnd(6)} ${String(run.words).padStart(4)} palabras · racha ×${String(run.maxCombo).padStart(2)} · ` +
      `${String(run.xp + outcome.goalXp).padStart(4)} XP (máx ${chapterMaxXp(chapter)}) → total ${String(progress.xp).padStart(5)} XP, nivel ${hero.level}`,
  );

  // Terminar un acto debe abrir el siguiente, aunque la XP vaya justa.
  const index = LEVELS.findIndex((level) => level.id === chapter.level);
  const next = LEVELS[index + 1];
  if (next && progress.stats.levelsCompleted.includes(chapter.level)) {
    assert(isLevelUnlocked(progress, next.id), `Terminar ${chapter.level} debería abrir ${next.id}`);
  }
}

const hero = heroLevelInfo(progress.xp);
const unlocked = ACHIEVEMENTS.filter((achievement) => progress.achievements[achievement.id]);
const locked = ACHIEVEMENTS.filter((achievement) => !progress.achievements[achievement.id]);

console.log(`\n  Final: ${progress.xp} XP · nivel ${hero.level} (${hero.title})`);
console.log(`  Palabras escritas: ${progress.stats.wordsWritten} · mejor racha: ×${progress.stats.maxCombo}`);
console.log(`  Logros: ${unlocked.length}/${ACHIEVEMENTS.length}`);
if (locked.length) {
  console.log(`  Sin desbloquear en una partida perfecta: ${locked.map((a) => a.title).join(', ')}`);
}

assert(progress.stats.chaptersCompleted === CHAPTERS.length, 'No se han completado todos los capítulos');
assert(progress.stats.levelsCompleted.length === LEVELS.length, 'No se han completado todos los niveles');
assert(
  LEVELS.every((level) => isLevelUnlocked(progress, level.id)),
  'Al terminar la campaña deberían estar todos los niveles abiertos',
);

if (failures.length) {
  console.error(`\n✗ ${failures.length} fallo(s):\n`);
  for (const failure of failures) console.error(`  · ${failure}`);
  process.exit(1);
}

console.log('\n✓ La campaña se puede completar de principio a fin.');
