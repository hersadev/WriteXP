/**
 * Verificador de contenido. Se ejecuta con `npm run verify`.
 *
 * Comprueba que la campaña es jugable sin abrir el navegador:
 *  - ids únicos, capítulos ordenados y objetivos bien formados;
 *  - todo nodo de escritura tiene criterio de corrección y pista;
 *  - y, lo importante: la solución modelo de cada ejercicio APRUEBA su propio
 *    criterio. Si una rúbrica es imposible de cumplir, salta aquí.
 */
import { CHAPTERS, chapterMaxXp } from '../src/data/story';
import { LEVELS } from '../src/data/levels';
import { ACHIEVEMENTS } from '../src/data/achievements';
import { gradeWriting } from '../src/engine/grading';
import type { WritingNode } from '../src/types';

const problems: string[] = [];
const WRITING_KINDS = ['writeWord', 'gapFill', 'writeSentence', 'writeFree'];

const chapterIds = new Set<string>();
const nodeIds = new Set<string>();
const goalIds = new Set<string>();

for (const chapter of CHAPTERS) {
  if (chapterIds.has(chapter.id)) problems.push(`Capítulo duplicado: ${chapter.id}`);
  chapterIds.add(chapter.id);

  if (!LEVELS.some((level) => level.id === chapter.level)) {
    problems.push(`${chapter.id}: nivel desconocido ${chapter.level}`);
  }
  if (!chapter.nodes.length) problems.push(`${chapter.id}: no tiene nodos`);
  if (!chapter.goals.length) problems.push(`${chapter.id}: no tiene objetivos`);

  for (const goal of chapter.goals) {
    if (goalIds.has(goal.id)) problems.push(`Objetivo duplicado: ${goal.id}`);
    goalIds.add(goal.id);
    if (goal.xp <= 0) problems.push(`${goal.id}: XP debe ser positiva`);
  }

  /*
   * Los objetivos de palabras son metas ambiciosas, no requisitos: se admite
   * que estén por encima del mínimo exigido, pero no que sean inalcanzables.
   * `floor` = escribiendo lo mínimo en cada ejercicio.
   * `ceiling` = escribiendo con holgura, sin pasarse de ningún maxWords.
   */
  const wordsGoal = chapter.goals.find((goal) => goal.kind === 'words');
  const writingNodes = chapter.nodes.filter((node) => WRITING_KINDS.includes(node.kind)) as WritingNode[];
  const floorWords = writingNodes.reduce(
    (sum, node) => sum + (node.rubric?.minWords ?? node.answers?.[0]?.split(/\s+/).length ?? 1),
    0,
  );
  const ceilingWords = writingNodes.reduce((sum, node) => {
    if (!node.rubric?.minWords) return sum + (node.answers?.[0]?.split(/\s+/).length ?? 1);
    return sum + (node.rubric.maxWords ?? Math.round(node.rubric.minWords * 2));
  }, 0);

  if (wordsGoal?.value && wordsGoal.value > ceilingWords) {
    problems.push(
      `${chapter.id}: el objetivo "${wordsGoal.label}" pide ${wordsGoal.value} palabras y como mucho se llega a ~${ceilingWords}`,
    );
  }
  if (wordsGoal?.value && wordsGoal.value <= floorWords) {
    problems.push(
      `${chapter.id}: el objetivo "${wordsGoal.label}" (${wordsGoal.value}) se cumple solo escribiendo el mínimo (${floorWords}); no es un objetivo`,
    );
  }

  const perfectGoal = chapter.goals.find((goal) => goal.kind === 'perfect');
  const scorableNodes = chapter.nodes.filter(
    (node) => WRITING_KINDS.includes(node.kind) || node.kind === 'readingCheck',
  ).length;
  if (perfectGoal?.value && perfectGoal.value > scorableNodes) {
    problems.push(
      `${chapter.id}: el objetivo "${perfectGoal.label}" pide ${perfectGoal.value} aciertos y sólo hay ${scorableNodes} ejercicios`,
    );
  }

  for (const node of chapter.nodes) {
    if (nodeIds.has(node.id)) problems.push(`Nodo duplicado: ${node.id}`);
    nodeIds.add(node.id);
    if (node.xp <= 0) problems.push(`${node.id}: XP debe ser positiva`);

    if (!WRITING_KINDS.includes(node.kind)) {
      if (node.kind === 'readingCheck') {
        const correct = node.options.filter((option) => option.correct).length;
        if (correct !== 1) problems.push(`${node.id}: readingCheck debe tener exactamente 1 opción correcta (tiene ${correct})`);
      }
      if (node.kind === 'choice' && node.options.some((option) => option.correct)) {
        problems.push(`${node.id}: un 'choice' narrativo no debe marcar opciones como correctas`);
      }
      continue;
    }

    const writing = node as WritingNode;
    if (!writing.answers?.length && !writing.rubric) {
      problems.push(`${writing.id}: sin 'answers' ni 'rubric', no se puede corregir`);
      continue;
    }
    if (!writing.hint) problems.push(`${writing.id}: sin pista (el jugador se quedaría bloqueado)`);
    if (!writing.promptEs) problems.push(`${writing.id}: sin consigna en español`);

    // En redacciones largas la pista es un andamiaje, así que hace falta un texto ejemplar.
    if ((writing.rubric?.minWords ?? 0) >= 20 && !writing.model) {
      problems.push(`${writing.id}: redacción larga sin 'model' (al rendirse no habría solución que enseñar)`);
    }

    // La prueba de fuego: la solución modelo tiene que aprobar.
    const model = writing.model ?? writing.answers?.[0] ?? writing.hint;
    if (!model) continue;
    const result = gradeWriting(writing, model);
    if (result.grade !== 'perfect') {
      const failed = result.checklist?.filter((item) => !item.met).map((item) => item.label) ?? [];
      problems.push(
        `${writing.id}: la solución modelo saca "${result.grade}" en su propio criterio` +
          (failed.length ? ` → falla: ${failed.join(' | ')}` : '') +
          (result.notes.length ? ` → ${result.notes.join(' ')}` : ''),
      );
    }
  }
}

const achievementIds = new Set<string>();
for (const achievement of ACHIEVEMENTS) {
  if (achievementIds.has(achievement.id)) problems.push(`Logro duplicado: ${achievement.id}`);
  achievementIds.add(achievement.id);
}

console.log('WriteXP · verificación de contenido\n');
for (const level of LEVELS) {
  const chapters = CHAPTERS.filter((chapter) => chapter.level === level.id);
  const nodes = chapters.reduce((sum, chapter) => sum + chapter.nodes.length, 0);
  const xp = chapters.reduce((sum, chapter) => sum + chapterMaxXp(chapter), 0);
  console.log(
    `  ${level.id}  ${String(chapters.length).padStart(2)} capítulos · ${String(nodes).padStart(2)} nodos · ${String(xp).padStart(4)} XP máx.  ${level.title}`,
  );
}
console.log(`\n  Total: ${CHAPTERS.length} capítulos, ${nodeIds.size} nodos, ${ACHIEVEMENTS.length} logros.\n`);

if (problems.length) {
  console.error(`✗ ${problems.length} problema(s):\n`);
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

console.log('✓ Contenido correcto: todas las soluciones modelo aprueban su criterio.');
