import { ACHIEVEMENTS } from '@/data/achievements';
import { LEVELS } from '@/data/levels';
import { chaptersByLevel } from '@/data/story';
import type { CEFRLevel, Chapter, ChapterGoal, Grade, Progress } from '@/types';
import { heroLevelFor } from './xp';

/** Estadísticas de una partida a un capítulo, en memoria mientras se juega. */
export interface RunStats {
  answered: number;
  perfect: number;
  firstTry: number;
  reveals: number;
  hints: number;
  words: number;
  combo: number;
  maxCombo: number;
  xp: number;
}

export function emptyRunStats(): RunStats {
  return { answered: 0, perfect: 0, firstTry: 0, reveals: 0, hints: 0, words: 0, combo: 0, maxCombo: 0, xp: 0 };
}

export function createEmptyProgress(): Progress {
  return {
    currentLevel: null,
    xp: 0,
    overrideUnlocked: [],
    chapters: {},
    nodes: {},
    stats: {
      wordsWritten: 0,
      answersTotal: 0,
      answersPerfect: 0,
      answersFirstTry: 0,
      hintsUsed: 0,
      reveals: 0,
      chaptersCompleted: 0,
      currentCombo: 0,
      maxCombo: 0,
      streakDays: 0,
      lastPlayedISO: null,
      levelsCompleted: [],
    },
    achievements: {},
  };
}

function clone(progress: Progress): Progress {
  return {
    ...progress,
    overrideUnlocked: [...progress.overrideUnlocked],
    chapters: { ...progress.chapters },
    nodes: { ...progress.nodes },
    stats: { ...progress.stats, levelsCompleted: [...progress.stats.levelsCompleted] },
    achievements: { ...progress.achievements },
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Actualiza la racha diaria. Se llama al entrar en la app. */
export function touchStreak(progress: Progress): Progress {
  const next = clone(progress);
  const today = startOfDay(new Date());
  const last = next.stats.lastPlayedISO ? startOfDay(new Date(next.stats.lastPlayedISO)) : null;

  if (!last) {
    next.stats.streakDays = 1;
  } else {
    const gap = Math.round((today.getTime() - last.getTime()) / DAY_MS);
    if (gap === 1) next.stats.streakDays += 1;
    else if (gap > 1) next.stats.streakDays = 1;
  }

  next.stats.lastPlayedISO = today.toISOString();
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export interface AnswerRecord {
  nodeId: string;
  grade: Grade;
  attempts: number;
  revealed: boolean;
  usedHint: boolean;
  xp: number;
  words: number;
  /**
   * false para nodos sin evaluación (narrativa, decisiones de historia):
   * dan XP pero no cuentan para precisión, racha ni objetivos.
   */
  scored?: boolean;
}

/** Registra la respuesta a un nodo y devuelve el progreso y las stats de la partida. */
export function registerAnswer(
  progress: Progress,
  run: RunStats,
  record: AnswerRecord,
): { progress: Progress; run: RunStats } {
  const next = clone(progress);
  const nextRun: RunStats = { ...run };
  const scored = record.scored ?? true;

  const previous = next.nodes[record.nodeId];
  // Sólo puntúa la primera vez que se resuelve el nodo: nada de granjear XP repitiendo.
  const isNew = !previous;
  const gained = isNew ? record.xp : 0;

  next.nodes[record.nodeId] = {
    grade: record.grade,
    attempts: record.attempts,
    revealed: record.revealed,
    xpEarned: Math.max(previous?.xpEarned ?? 0, record.xp),
  };

  next.xp += gained;
  nextRun.xp += gained;

  if (!scored) {
    // La narrativa y las decisiones de historia sólo suman XP.
    return { progress: next, run: nextRun };
  }

  next.stats.answersTotal += 1;
  next.stats.wordsWritten += record.words;
  if (record.grade === 'perfect') next.stats.answersPerfect += 1;
  if (record.grade === 'perfect' && record.attempts === 1 && !record.revealed) {
    next.stats.answersFirstTry += 1;
  }
  if (record.usedHint) next.stats.hintsUsed += 1;
  if (record.revealed) next.stats.reveals += 1;

  if (record.grade === 'perfect' && !record.revealed) {
    next.stats.currentCombo += 1;
    next.stats.maxCombo = Math.max(next.stats.maxCombo, next.stats.currentCombo);
  } else {
    next.stats.currentCombo = 0;
  }

  nextRun.answered += 1;
  nextRun.words += record.words;
  if (record.grade === 'perfect') nextRun.perfect += 1;
  if (record.grade === 'perfect' && record.attempts === 1 && !record.revealed) nextRun.firstTry += 1;
  if (record.revealed) nextRun.reveals += 1;
  if (record.usedHint) nextRun.hints += 1;

  if (record.grade === 'perfect' && !record.revealed) {
    nextRun.combo += 1;
    nextRun.maxCombo = Math.max(nextRun.maxCombo, nextRun.combo);
  } else {
    nextRun.combo = 0;
  }

  return { progress: next, run: nextRun };
}

/** Guarda en qué nodo se ha quedado el usuario para poder reanudar. */
export function saveCheckpoint(progress: Progress, chapterId: string, nodeIndex: number): Progress {
  const next = clone(progress);
  const existing = next.chapters[chapterId];
  next.chapters[chapterId] = {
    nodeIndex,
    completed: existing?.completed ?? false,
    goalsMet: existing?.goalsMet ?? [],
    bestAccuracy: existing?.bestAccuracy ?? 0,
    runs: existing?.runs ?? 0,
  };
  return next;
}

export function evaluateGoals(chapter: Chapter, run: RunStats): ChapterGoal[] {
  return chapter.goals.filter((goal) => {
    switch (goal.kind) {
      case 'complete':
        return true;
      case 'perfect':
        return run.firstTry >= (goal.value ?? 1);
      case 'noReveal':
        return run.reveals === 0;
      case 'words':
        return run.words >= (goal.value ?? 0);
      case 'combo':
        return run.maxCombo >= (goal.value ?? 0);
      default:
        return false;
    }
  });
}

export interface ChapterOutcome {
  progress: Progress;
  goalsMet: ChapterGoal[];
  goalXp: number;
  newAchievements: string[];
  leveledUpTo: number | null;
}

export function completeChapter(progress: Progress, chapter: Chapter, run: RunStats): ChapterOutcome {
  const levelBefore = heroLevelFor(progress.xp);
  let next = clone(progress);

  const goalsMet = evaluateGoals(chapter, run);
  const existing = next.chapters[chapter.id];
  const alreadyMet = new Set(existing?.goalsMet ?? []);
  const freshGoals = goalsMet.filter((goal) => !alreadyMet.has(goal.id));
  const goalXp = freshGoals.reduce((sum, goal) => sum + goal.xp, 0);

  next.xp += goalXp;
  next.chapters[chapter.id] = {
    nodeIndex: chapter.nodes.length,
    completed: true,
    goalsMet: [...new Set([...(existing?.goalsMet ?? []), ...goalsMet.map((g) => g.id)])],
    bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, run.answered ? run.perfect / run.answered : 1),
    runs: (existing?.runs ?? 0) + 1,
  };

  if (!existing?.completed) next.stats.chaptersCompleted += 1;

  // ¿Se ha cerrado el acto entero?
  const siblings = chaptersByLevel(chapter.level);
  const levelDone = siblings.every((c) => next.chapters[c.id]?.completed);
  if (levelDone && !next.stats.levelsCompleted.includes(chapter.level)) {
    next.stats.levelsCompleted.push(chapter.level);
  }

  const newAchievements = syncAchievements(next);
  next = newAchievements.progress;

  const levelAfter = heroLevelFor(next.xp);

  return {
    progress: next,
    goalsMet,
    goalXp,
    newAchievements: newAchievements.unlocked,
    leveledUpTo: levelAfter > levelBefore ? levelAfter : null,
  };
}

/** Comprueba todos los logros y desbloquea los que se cumplan (muta la copia recibida). */
export function syncAchievements(progress: Progress): { progress: Progress; unlocked: string[] } {
  const next = clone(progress);
  const unlocked: string[] = [];

  // Dos pasadas: los logros dan XP, que a su vez puede disparar logros de XP.
  for (let pass = 0; pass < 2; pass++) {
    for (const achievement of ACHIEVEMENTS) {
      if (next.achievements[achievement.id]) continue;
      if (!achievement.check(next)) continue;
      next.achievements[achievement.id] = new Date().toISOString();
      next.xp += achievement.xp;
      unlocked.push(achievement.id);
    }
  }

  return { progress: next, unlocked };
}

export function isLevelUnlocked(progress: Progress, level: CEFRLevel): boolean {
  const def = LEVELS.find((l) => l.id === level);
  if (!def) return false;
  if (def.recommendedHeroLevel <= 1) return true;
  if (progress.overrideUnlocked.includes(level)) return true;
  if (heroLevelFor(progress.xp) >= def.recommendedHeroLevel) return true;
  // También se abre si has terminado el acto anterior, aunque vayas justo de XP.
  const index = LEVELS.findIndex((l) => l.id === level);
  const previous = LEVELS[index - 1];
  return previous ? progress.stats.levelsCompleted.includes(previous.id) : false;
}

export function levelCompletion(progress: Progress, level: CEFRLevel): { done: number; total: number } {
  const chapters = chaptersByLevel(level);
  const done = chapters.filter((c) => progress.chapters[c.id]?.completed).length;
  return { done, total: chapters.length };
}

/** Primer capítulo sin terminar del nivel, o el último si ya está todo hecho. */
export function nextChapter(progress: Progress, level: CEFRLevel): Chapter | undefined {
  const chapters = chaptersByLevel(level);
  return chapters.find((c) => !progress.chapters[c.id]?.completed) ?? chapters[chapters.length - 1];
}

export function isChapterUnlocked(progress: Progress, chapter: Chapter): boolean {
  const chapters = chaptersByLevel(chapter.level);
  const index = chapters.findIndex((c) => c.id === chapter.id);
  if (index <= 0) return true;
  return Boolean(progress.chapters[chapters[index - 1].id]?.completed);
}
